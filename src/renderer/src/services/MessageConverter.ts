import type { Message } from "../types/message";
import type {
	FileMessageBlock,
	ImageMessageBlock,
	MainTextMessageBlock,
	MessageBlock,
	ThinkingMessageBlock,
} from "../types/message-block";
import { MessageBlockType } from "../types/message-block";
import type { Model } from "../types/provider";

// ── AI SDK Message Types ──

export interface TextPart {
	type: "text";
	text: string;
}

export interface ImagePart {
	type: "image";
	image: string | URL;
	mimeType?: string;
}

export interface FilePart {
	type: "file";
	data: string | URL;
	mimeType?: string;
}

export interface ReasoningPart {
	type: "reasoning";
	text: string;
}

export type UserContentPart = TextPart | ImagePart | FilePart;
export type AssistantContentPart = TextPart | ReasoningPart | FilePart;

export interface ModelMessage {
	role: "user" | "assistant" | "system";
	content: string | UserContentPart[] | AssistantContentPart[];
}

// ── Message Converter Service (Singleton) ──
// Implements BL-013: Message-to-SDK Conversion

class MessageConverterClass {
	/**
	 * Convert AS Messages to AI SDK ModelMessage format.
	 * Handles text, image, file, and reasoning parts based on model capabilities.
	 */
	convertMessagesToSdkMessages(
		messages: Message[],
		model: Model,
		blocks: Record<string, MessageBlock>,
	): ModelMessage[] {
		return messages
			.map((msg) => this.convertMessage(msg, model, blocks))
			.filter(Boolean) as ModelMessage[];
	}

	private convertMessage(
		message: Message,
		model: Model,
		blocks: Record<string, MessageBlock>,
	): ModelMessage | null {
		if (message.role === "system") {
			return {
				role: "system",
				content: this.getSystemContent(message, blocks),
			};
		}

		if (message.role === "user") {
			return this.convertUserMessage(message, model, blocks);
		}

		if (message.role === "assistant") {
			return this.convertAssistantMessage(message, model, blocks);
		}

		return null;
	}

	private convertUserMessage(
		message: Message,
		model: Model,
		blocks: Record<string, MessageBlock>,
	): ModelMessage {
		const messageBlocks = message.blocks
			.map((id) => blocks[id])
			.filter(Boolean);
		const parts: UserContentPart[] = [];

		for (const block of messageBlocks) {
			switch (block.type) {
				case MessageBlockType.MAIN_TEXT: {
					const textBlock = block as MainTextMessageBlock;
					if (textBlock.content) {
						parts.push({ type: "text", text: textBlock.content });
					}
					break;
				}
				case MessageBlockType.IMAGE: {
					const imageBlock = block as ImageMessageBlock;
					const hasVision = model.capabilities?.includes("vision");
					if (imageBlock.url && hasVision) {
						parts.push({
							type: "image",
							image: this.resolveUrl(imageBlock.url),
						});
					} else if (imageBlock.url && !hasVision) {
						// Gemini [Image] placeholder for non-vision models
						parts.push({ type: "text", text: "[Image]" });
					}
					break;
				}
				case MessageBlockType.FILE: {
					const fileBlock = block as FileMessageBlock;
					if (fileBlock.file?.url) {
						parts.push({
							type: "file",
							data: this.resolveUrl(fileBlock.file.url),
							mimeType: fileBlock.file.mimeType,
						});
					}
					break;
				}
			}
		}

		if (parts.length === 0) {
			parts.push({ type: "text", text: "" });
		}

		return { role: "user", content: parts };
	}

	private convertAssistantMessage(
		message: Message,
		_model: Model,
		blocks: Record<string, MessageBlock>,
	): ModelMessage {
		const messageBlocks = message.blocks
			.map((id) => blocks[id])
			.filter(Boolean);
		const parts: AssistantContentPart[] = [];

		for (const block of messageBlocks) {
			switch (block.type) {
				case MessageBlockType.MAIN_TEXT: {
					const textBlock = block as MainTextMessageBlock;
					if (textBlock.content) {
						parts.push({ type: "text", text: textBlock.content });
					}
					break;
				}
				case MessageBlockType.THINKING: {
					const thinkingBlock = block as ThinkingMessageBlock;
					if (thinkingBlock.content) {
						parts.push({ type: "reasoning", text: thinkingBlock.content });
					}
					break;
				}
				case MessageBlockType.FILE: {
					const fileBlock = block as FileMessageBlock;
					if (fileBlock.file?.url) {
						parts.push({
							type: "file",
							data: this.resolveUrl(fileBlock.file.url),
							mimeType: fileBlock.file.mimeType,
						});
					}
					break;
				}
			}
		}

		if (parts.length === 0) {
			parts.push({ type: "text", text: "" });
		}

		return { role: "assistant", content: parts };
	}

	private getSystemContent(
		message: Message,
		blocks: Record<string, MessageBlock>,
	): string {
		const messageBlocks = message.blocks
			.map((id) => blocks[id])
			.filter(Boolean);
		const textBlocks = messageBlocks.filter(
			(b) => b.type === MessageBlockType.MAIN_TEXT,
		) as MainTextMessageBlock[];
		return textBlocks.map((b) => b.content).join("\n");
	}

	/**
	 * Resolve fileid:// protocol URLs to actual paths.
	 */
	private resolveUrl(url: string): string | URL {
		if (url.startsWith("fileid://")) {
			// fileid:// protocol — return as-is for now, will be resolved by the file system service
			return url;
		}
		return url;
	}
}

export const MessageConverter = new MessageConverterClass();
