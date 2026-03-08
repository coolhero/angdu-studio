import { nanoid } from "nanoid";
import { useMessageBlockStore } from "../stores/useMessageBlockStore";
import { useMessageStore } from "../stores/useMessageStore";
import type { Assistant } from "../types/assistant";
import type { Chunk, Topic } from "../types/conversation";
import type { Message } from "../types/message";
import type { FileMetadata, MessageBlock } from "../types/message-block";
import { MessageBlockStatus, MessageBlockType } from "../types/message-block";
import type { Provider } from "../types/provider";
import { ConversationService } from "./ConversationService";
import { MessageConverter } from "./MessageConverter";
import { ParameterBuilder } from "./ParameterBuilder";
import { StreamProcessingService } from "./StreamProcessingService";

// ── Messages Service (Singleton) ──
// Implements BL-015 (User Message Construction), BL-016 (Rate Limiting), and the complete send pipeline

class MessagesServiceClass {
	private lastSendTimestamps = new Map<string, number>(); // providerId → timestamp

	/**
	 * Create user message with blocks atomically.
	 * Always creates a MainTextBlock. Adds Image/FileBlocks for attachments.
	 */
	createUserMessage(
		content: string,
		topicId: string,
		assistantId: string,
		attachments?: FileMetadata[],
	): { message: Message; blocks: MessageBlock[] } {
		const now = new Date().toISOString();
		const askId = nanoid();
		const blocks: MessageBlock[] = [];

		// Main text block (always created)
		const mainBlock: MessageBlock = {
			id: nanoid(),
			messageId: "", // Will be set after message creation
			type: MessageBlockType.MAIN_TEXT,
			createdAt: now,
			status: MessageBlockStatus.SUCCESS,
			content,
		} as MessageBlock;

		blocks.push(mainBlock);

		// Image blocks for image attachments
		if (attachments) {
			for (const attachment of attachments) {
				if (attachment.mimeType?.startsWith("image/")) {
					const imageBlock: MessageBlock = {
						id: nanoid(),
						messageId: "",
						type: MessageBlockType.IMAGE,
						createdAt: now,
						status: MessageBlockStatus.SUCCESS,
						url: attachment.url,
						file: attachment,
					} as MessageBlock;
					blocks.push(imageBlock);
				} else {
					const fileBlock: MessageBlock = {
						id: nanoid(),
						messageId: "",
						type: MessageBlockType.FILE,
						createdAt: now,
						status: MessageBlockStatus.SUCCESS,
						file: attachment,
					} as MessageBlock;
					blocks.push(fileBlock);
				}
			}
		}

		// Create the message
		const message: Message = {
			id: nanoid(),
			role: "user",
			assistantId,
			topicId,
			createdAt: now,
			status: "success",
			askId,
			blocks: blocks.map((b) => b.id),
		};

		// Set messageId on all blocks
		for (const block of blocks) {
			(block as { messageId: string }).messageId = message.id;
		}

		// Add to stores atomically
		const messageStore = useMessageStore.getState();
		const blockStore = useMessageBlockStore.getState();

		messageStore.addMessage(message);
		for (const block of blocks) {
			blockStore.addBlock(block);
		}

		return { message, blocks };
	}

	/**
	 * Rate limit check — returns remaining wait time in ms, or 0 if allowed.
	 */
	checkRateLimit(provider: Provider): number {
		if (!provider.rateLimit || provider.rateLimit <= 0) return 0;

		const lastSend = this.lastSendTimestamps.get(provider.id);
		if (!lastSend) return 0;

		const elapsed = Date.now() - lastSend;
		const limitMs = provider.rateLimit * 1000;
		const remaining = limitMs - elapsed;

		return remaining > 0 ? remaining : 0;
	}

	/**
	 * Send message: construct → filter → convert → assemble → stream → process
	 */
	async sendMessage(
		assistant: Assistant,
		topic: Topic,
		content: string,
		provider: Provider,
		streamFn: (params: unknown) => AsyncIterable<Chunk>,
		attachments?: FileMetadata[],
	): Promise<void> {
		// Rate limit check
		const waitTime = this.checkRateLimit(provider);
		if (waitTime > 0) {
			const waitSeconds = Math.ceil(waitTime / 1000);
			throw new Error(`Rate limited. Please wait ${waitSeconds} seconds.`);
		}

		// Create user message
		const { message: userMessage } = this.createUserMessage(
			content,
			topic.id,
			assistant.id,
			attachments,
		);

		// Create assistant message placeholder
		const now = new Date().toISOString();
		const assistantMessage: Message = {
			id: nanoid(),
			role: "assistant",
			assistantId: assistant.id,
			topicId: topic.id,
			createdAt: now,
			status: "processing",
			askId: userMessage.askId,
			modelId: (assistant.model ?? assistant.defaultModel)?.id,
			model: assistant.model ?? assistant.defaultModel,
			blocks: [],
		};
		useMessageStore.getState().addMessage(assistantMessage);

		// Record send timestamp for rate limiting
		this.lastSendTimestamps.set(provider.id, Date.now());

		// Abort controller for this streaming session
		const abortController = new AbortController();

		try {
			// Get all messages for context
			const allMessages = useMessageStore
				.getState()
				.getMessagesForTopic(topic.id);

			// Filter messages through the 9-stage pipeline
			const { max } = ConversationService.getContextCount(
				assistant,
				allMessages,
			);
			const filteredMessages = ConversationService.filterMessagesPipeline(
				allMessages,
				max,
			);

			// Get blocks for conversion
			const blocks = useMessageBlockStore.getState().blocks;
			const model = assistant.model ?? assistant.defaultModel;
			if (!model) throw new Error("No model configured");

			// Convert to SDK format
			const sdkMessages = MessageConverter.convertMessagesToSdkMessages(
				filteredMessages,
				model,
				blocks,
			);

			// Build stream parameters
			const { params } = ParameterBuilder.buildStreamTextParams(
				sdkMessages,
				assistant,
				provider,
				{ abortSignal: abortController.signal },
			);

			// Start streaming
			const stream = streamFn(params);

			// Track timing
			const startTime = Date.now();
			let ttft = 0;

			// Wrap stream to capture metrics
			const metricsStream = (async function* () {
				for await (const chunk of stream) {
					if (ttft === 0) {
						ttft = Date.now() - startTime;
					}
					yield chunk;
				}
			})();

			// Process the stream
			await StreamProcessingService.processStream(
				metricsStream,
				assistantMessage.id,
				abortController.signal,
			);

			// Update assistant message with metrics
			const completionTime = Date.now() - startTime;
			useMessageStore.getState().updateMessage(assistantMessage.id, {
				status: "success",
				metrics: { ttft, completionTime },
			});
		} catch (error) {
			if (!abortController.signal.aborted) {
				useMessageStore.getState().updateMessage(assistantMessage.id, {
					status: "error",
				});
			}
			throw error;
		}
	}

	/**
	 * Retry: remove old response, re-send.
	 */
	async retryMessage(
		assistant: Assistant,
		topic: Topic,
		askId: string,
		content: string,
		provider: Provider,
		streamFn: (params: unknown) => AsyncIterable<Chunk>,
	): Promise<void> {
		// Remove old messages by askId
		useMessageStore.getState().removeMessagesByAskId(askId);

		// Re-send
		await this.sendMessage(assistant, topic, content, provider, streamFn);
	}
}

export const MessagesService = new MessagesServiceClass();
