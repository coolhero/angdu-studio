import { nanoid } from "nanoid";
import { useMessageBlockStore } from "../stores/useMessageBlockStore";
import { useMessageStore } from "../stores/useMessageStore";
import type { Chunk } from "../types/conversation";
import { ChunkType } from "../types/conversation";
import type {
	CitationMessageBlock,
	ErrorMessageBlock,
	ImageMessageBlock,
	MainTextMessageBlock,
	MessageBlock,
	ThinkingMessageBlock,
	ToolMessageBlock,
	VideoMessageBlock,
} from "../types/message-block";
import { MessageBlockStatus, MessageBlockType } from "../types/message-block";

// ── Block Manager ──
// Owns the mapping from chunk context to active blocks.
// Creates new blocks on START events, updates on DELTA, finalizes on COMPLETE.

class BlockManager {
	private activeBlocks = new Map<string, string>(); // chunkKey → blockId
	private messageId: string;

	constructor(messageId: string) {
		this.messageId = messageId;
	}

	getOrCreateBlock(key: string, type: MessageBlockType): string {
		const existing = this.activeBlocks.get(key);
		if (existing) return existing;

		const block = this.createBlock(type);
		this.activeBlocks.set(key, block.id);
		return block.id;
	}

	private createBlock(type: MessageBlockType): MessageBlock {
		const now = new Date().toISOString();
		const blockBase = {
			id: nanoid(),
			messageId: this.messageId,
			type,
			createdAt: now,
			status: MessageBlockStatus.PENDING,
		};

		let block: MessageBlock;
		switch (type) {
			case MessageBlockType.MAIN_TEXT:
				block = {
					...blockBase,
					type: MessageBlockType.MAIN_TEXT,
					content: "",
				} as MainTextMessageBlock;
				break;
			case MessageBlockType.THINKING:
				block = {
					...blockBase,
					type: MessageBlockType.THINKING,
					content: "",
					thinking_millsec: 0,
				} as ThinkingMessageBlock;
				break;
			case MessageBlockType.TOOL:
				block = {
					...blockBase,
					type: MessageBlockType.TOOL,
					toolId: "",
				} as ToolMessageBlock;
				break;
			case MessageBlockType.IMAGE:
				block = {
					...blockBase,
					type: MessageBlockType.IMAGE,
				} as ImageMessageBlock;
				break;
			case MessageBlockType.CITATION:
				block = {
					...blockBase,
					type: MessageBlockType.CITATION,
				} as CitationMessageBlock;
				break;
			case MessageBlockType.VIDEO:
				block = {
					...blockBase,
					type: MessageBlockType.VIDEO,
				} as VideoMessageBlock;
				break;
			case MessageBlockType.ERROR:
				block = {
					...blockBase,
					type: MessageBlockType.ERROR,
				} as ErrorMessageBlock;
				break;
			default:
				block = { ...blockBase, type, content: "" } as MainTextMessageBlock;
		}

		useMessageBlockStore.getState().addBlock(block);
		useMessageStore.getState().upsertBlockReference(this.messageId, block.id);

		return block;
	}

	finalizeBlock(key: string): void {
		const blockId = this.activeBlocks.get(key);
		if (blockId) {
			useMessageBlockStore
				.getState()
				.transitionStatus(blockId, MessageBlockStatus.SUCCESS);
			this.activeBlocks.delete(key);
		}
	}

	errorBlock(key: string, error: { name: string; message: string }): void {
		const blockId = this.activeBlocks.get(key);
		if (blockId) {
			useMessageBlockStore.getState().updateBlock(blockId, { error });
			useMessageBlockStore
				.getState()
				.transitionStatus(blockId, MessageBlockStatus.ERROR);
			this.activeBlocks.delete(key);
		}
	}

	finalizeAll(): void {
		for (const [key, blockId] of this.activeBlocks) {
			const block = useMessageBlockStore.getState().getBlock(blockId);
			if (
				block &&
				block.status !== MessageBlockStatus.SUCCESS &&
				block.status !== MessageBlockStatus.ERROR
			) {
				useMessageBlockStore
					.getState()
					.transitionStatus(blockId, MessageBlockStatus.SUCCESS);
			}
			this.activeBlocks.delete(key);
		}
	}
}

// ── Stream Processing Service (Singleton) ──
// Implements BL-014: Stream Processing State Machine

class StreamProcessingServiceClass {
	/**
	 * Process a stream of chunks, creating/updating blocks via BlockManager.
	 */
	async processStream(
		stream: AsyncIterable<Chunk>,
		messageId: string,
		abortSignal: AbortSignal,
	): Promise<void> {
		const manager = new BlockManager(messageId);

		try {
			for await (const chunk of stream) {
				if (abortSignal.aborted) {
					manager.finalizeAll();
					return;
				}

				this.dispatchChunk(chunk, manager);
			}

			manager.finalizeAll();
		} catch (error) {
			if (abortSignal.aborted) {
				manager.finalizeAll();
				return;
			}

			const errorMsg = error instanceof Error ? error.message : String(error);
			const blockId = manager.getOrCreateBlock("error", MessageBlockType.ERROR);
			useMessageBlockStore.getState().updateBlock(blockId, {
				error: { name: "StreamError", message: errorMsg },
			});
			useMessageBlockStore
				.getState()
				.transitionStatus(blockId, MessageBlockStatus.PROCESSING);
			useMessageBlockStore
				.getState()
				.transitionStatus(blockId, MessageBlockStatus.ERROR);
			throw error;
		}
	}

	private dispatchChunk(chunk: Chunk, manager: BlockManager): void {
		const blockStore = useMessageBlockStore.getState();

		switch (chunk.type) {
			// ── Text ──
			case ChunkType.TEXT_START: {
				const blockId = manager.getOrCreateBlock(
					"text",
					MessageBlockType.MAIN_TEXT,
				);
				blockStore.transitionStatus(blockId, MessageBlockStatus.PROCESSING);
				blockStore.transitionStatus(blockId, MessageBlockStatus.STREAMING);
				break;
			}
			case ChunkType.TEXT_DELTA: {
				const blockId = manager.getOrCreateBlock(
					"text",
					MessageBlockType.MAIN_TEXT,
				);
				const block = blockStore.getBlock(blockId) as
					| MainTextMessageBlock
					| undefined;
				if (block) {
					// Auto-transition to STREAMING if still PENDING (no TEXT_START received)
					if (block.status === MessageBlockStatus.PENDING) {
						blockStore.transitionStatus(blockId, MessageBlockStatus.PROCESSING);
						blockStore.transitionStatus(blockId, MessageBlockStatus.STREAMING);
					}
					blockStore.updateBlock(blockId, {
						content: block.content + String(chunk.data ?? ""),
					});
				}
				break;
			}
			case ChunkType.TEXT_COMPLETE: {
				manager.finalizeBlock("text");
				break;
			}

			// ── Thinking ──
			case ChunkType.THINKING_START: {
				const blockId = manager.getOrCreateBlock(
					"thinking",
					MessageBlockType.THINKING,
				);
				blockStore.transitionStatus(blockId, MessageBlockStatus.PROCESSING);
				blockStore.transitionStatus(blockId, MessageBlockStatus.STREAMING);
				break;
			}
			case ChunkType.THINKING_DELTA: {
				const blockId = manager.getOrCreateBlock(
					"thinking",
					MessageBlockType.THINKING,
				);
				const block = blockStore.getBlock(blockId) as
					| ThinkingMessageBlock
					| undefined;
				if (block) {
					blockStore.updateBlock(blockId, {
						content: block.content + String(chunk.data ?? ""),
					});
				}
				break;
			}
			case ChunkType.THINKING_COMPLETE: {
				const blockId = manager.getOrCreateBlock(
					"thinking",
					MessageBlockType.THINKING,
				);
				const data = chunk.data as { thinking_millsec?: number } | undefined;
				if (data?.thinking_millsec) {
					blockStore.updateBlock(blockId, {
						thinking_millsec: data.thinking_millsec,
					});
				}
				manager.finalizeBlock("thinking");
				break;
			}

			// ── Tool Calls ──
			case ChunkType.TOOL_CALL_PENDING: {
				const data = chunk.data as
					| { toolId?: string; toolName?: string }
					| undefined;
				const key = `tool_${data?.toolId ?? nanoid()}`;
				const blockId = manager.getOrCreateBlock(key, MessageBlockType.TOOL);
				blockStore.updateBlock(blockId, {
					toolId: data?.toolId ?? "",
					toolName: data?.toolName,
				});
				blockStore.transitionStatus(blockId, MessageBlockStatus.PROCESSING);
				break;
			}
			case ChunkType.TOOL_CALL_IN_PROGRESS: {
				const data = chunk.data as { toolId?: string } | undefined;
				const key = `tool_${data?.toolId ?? ""}`;
				const blockId = manager.getOrCreateBlock(key, MessageBlockType.TOOL);
				blockStore.transitionStatus(blockId, MessageBlockStatus.STREAMING);
				break;
			}
			case ChunkType.TOOL_ARGUMENT_STREAMING: {
				const data = chunk.data as
					| { toolId?: string; args?: string }
					| undefined;
				const key = `tool_${data?.toolId ?? ""}`;
				const blockId = manager.getOrCreateBlock(key, MessageBlockType.TOOL);
				const block = blockStore.getBlock(blockId) as
					| ToolMessageBlock
					| undefined;
				if (block && data?.args) {
					const currentArgs =
						typeof block.arguments === "object"
							? JSON.stringify(block.arguments)
							: "";
					try {
						blockStore.updateBlock(blockId, {
							arguments: JSON.parse(currentArgs + data.args),
						});
					} catch {
						// Partial JSON — accumulate as string in metadata
						blockStore.updateBlock(blockId, {
							metadata: {
								...block.metadata,
								partialArgs: (block.metadata?.partialArgs ?? "") + data.args,
							},
						});
					}
				}
				break;
			}
			case ChunkType.TOOL_CALL_COMPLETE: {
				const data = chunk.data as
					| { toolId?: string; content?: unknown }
					| undefined;
				const key = `tool_${data?.toolId ?? ""}`;
				const blockId = manager.getOrCreateBlock(key, MessageBlockType.TOOL);
				if (data?.content) {
					blockStore.updateBlock(blockId, {
						content: data.content as string | object,
					});
				}
				manager.finalizeBlock(key);
				break;
			}

			// ── External Tool ──
			case ChunkType.EXTERNAL_TOOL_IN_PROGRESS: {
				const data = chunk.data as
					| { toolId?: string; toolName?: string }
					| undefined;
				const key = `ext_tool_${data?.toolId ?? nanoid()}`;
				const blockId = manager.getOrCreateBlock(key, MessageBlockType.TOOL);
				blockStore.updateBlock(blockId, {
					toolId: data?.toolId ?? "",
					toolName: data?.toolName,
				});
				blockStore.transitionStatus(blockId, MessageBlockStatus.PROCESSING);
				blockStore.transitionStatus(blockId, MessageBlockStatus.STREAMING);
				break;
			}
			case ChunkType.EXTERNAL_TOOL_COMPLETE: {
				const data = chunk.data as
					| { toolId?: string; content?: unknown }
					| undefined;
				const key = `ext_tool_${data?.toolId ?? ""}`;
				if (data?.content) {
					const blockId = manager.getOrCreateBlock(key, MessageBlockType.TOOL);
					blockStore.updateBlock(blockId, {
						content: data.content as string | object,
					});
				}
				manager.finalizeBlock(key);
				break;
			}

			// ── Web Search ──
			case ChunkType.LLM_WEB_SEARCH_START: {
				const blockId = manager.getOrCreateBlock(
					"citation",
					MessageBlockType.CITATION,
				);
				blockStore.transitionStatus(blockId, MessageBlockStatus.PROCESSING);
				blockStore.transitionStatus(blockId, MessageBlockStatus.STREAMING);
				break;
			}
			case ChunkType.LLM_WEB_SEARCH_COMPLETE: {
				const data = chunk.data as { response?: unknown } | undefined;
				const blockId = manager.getOrCreateBlock(
					"citation",
					MessageBlockType.CITATION,
				);
				if (data?.response) {
					blockStore.updateBlock(blockId, { response: data.response });
				}
				manager.finalizeBlock("citation");
				break;
			}

			// ── Image ──
			case ChunkType.IMAGE_CREATED: {
				const blockId = manager.getOrCreateBlock(
					"image",
					MessageBlockType.IMAGE,
				);
				blockStore.transitionStatus(blockId, MessageBlockStatus.PROCESSING);
				blockStore.transitionStatus(blockId, MessageBlockStatus.STREAMING);
				break;
			}
			case ChunkType.IMAGE_DELTA: {
				// Progressive image data — update URL or data
				const data = chunk.data as { url?: string } | undefined;
				if (data?.url) {
					const blockId = manager.getOrCreateBlock(
						"image",
						MessageBlockType.IMAGE,
					);
					blockStore.updateBlock(blockId, { url: data.url });
				}
				break;
			}
			case ChunkType.IMAGE_GENERATED: {
				const data = chunk.data as { url?: string } | undefined;
				if (data?.url) {
					const blockId = manager.getOrCreateBlock(
						"image",
						MessageBlockType.IMAGE,
					);
					blockStore.updateBlock(blockId, { url: data.url });
				}
				manager.finalizeBlock("image");
				break;
			}

			// ── Video ──
			case ChunkType.VIDEO_SEARCHED: {
				const data = chunk.data as
					| { url?: string; filePath?: string }
					| undefined;
				const blockId = manager.getOrCreateBlock(
					"video",
					MessageBlockType.VIDEO,
				);
				blockStore.updateBlock(blockId, {
					url: data?.url,
					filePath: data?.filePath,
				});
				blockStore.transitionStatus(blockId, MessageBlockStatus.PROCESSING);
				manager.finalizeBlock("video");
				break;
			}

			// ── Error ──
			case ChunkType.ERROR: {
				const data = chunk.data as
					| { message?: string; name?: string }
					| undefined;
				manager.errorBlock("text", {
					name: data?.name ?? "StreamError",
					message: data?.message ?? "Unknown error",
				});
				break;
			}

			// ── Block Complete ──
			case ChunkType.BLOCK_COMPLETE: {
				const data = chunk.data as { key?: string } | undefined;
				if (data?.key) {
					manager.finalizeBlock(data.key);
				}
				break;
			}

			// ── LLM Response Created / Raw Data ──
			case ChunkType.LLM_RESPONSE_CREATED:
			case ChunkType.RAW_DATA:
				// No-op — metadata events
				break;
		}
	}
}

export const StreamProcessingService = new StreamProcessingServiceClass();
