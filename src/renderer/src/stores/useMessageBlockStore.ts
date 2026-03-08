import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { chatDb } from "../databases/ChatDatabase";
import type { MessageBlock } from "../types/message-block";
import {
	type MessageBlockStatus,
	VALID_TRANSITIONS,
} from "../types/message-block";

// ── State Interface ──

export interface MessageBlockStoreState {
	blocks: Record<string, MessageBlock>;

	addBlock: (block: MessageBlock) => void;
	updateBlock: (id: string, updates: Partial<MessageBlock>) => void;
	removeBlock: (id: string) => void;
	removeBlocksByMessageId: (messageId: string) => void;

	transitionStatus: (id: string, newStatus: MessageBlockStatus) => boolean;

	getBlock: (id: string) => MessageBlock | undefined;
	getBlocksForMessage: (messageId: string) => MessageBlock[];

	loadBlocksForMessages: (messageIds: string[]) => Promise<void>;
}

// ── Store ──

export const useMessageBlockStore = create<MessageBlockStoreState>()(
	immer((set, get) => ({
		blocks: {} as Record<string, MessageBlock>,

		// ── Block CRUD ──

		addBlock: (block) => {
			set((state) => {
				state.blocks[block.id] = block;
			});
			chatDb.messageBlocks.put(block).catch(console.error);
		},

		updateBlock: (id, updates) => {
			set((state) => {
				const block = state.blocks[id];
				if (block) {
					Object.assign(block, updates, {
						updatedAt: new Date().toISOString(),
					});
				}
			});
			const block = get().blocks[id];
			if (block) {
				chatDb.messageBlocks.put({ ...block }).catch(console.error);
			}
		},

		removeBlock: (id) => {
			set((state) => {
				delete state.blocks[id];
			});
			chatDb.messageBlocks.delete(id).catch(console.error);
		},

		removeBlocksByMessageId: (messageId) => {
			const blocksToRemove = Object.values(get().blocks).filter(
				(b) => b.messageId === messageId,
			);

			set((state) => {
				for (const block of blocksToRemove) {
					delete state.blocks[block.id];
				}
			});

			chatDb.messageBlocks
				.where("messageId")
				.equals(messageId)
				.delete()
				.catch(console.error);
		},

		// ── Status Management ──

		transitionStatus: (id, newStatus) => {
			const block = get().blocks[id];
			if (!block) {
				console.error(`[MessageBlockStore] Block not found: ${id}`);
				return false;
			}

			const validTargets = VALID_TRANSITIONS[block.status];
			if (!validTargets.includes(newStatus)) {
				console.error(
					`[MessageBlockStore] Invalid status transition: ${block.status} → ${newStatus} for block ${id}`,
				);
				return false;
			}

			set((state) => {
				const b = state.blocks[id];
				if (b) {
					b.status = newStatus;
					b.updatedAt = new Date().toISOString();
				}
			});

			const updated = get().blocks[id];
			if (updated) {
				chatDb.messageBlocks.put({ ...updated }).catch(console.error);
			}

			return true;
		},

		// ── Queries ──

		getBlock: (id) => {
			return get().blocks[id];
		},

		getBlocksForMessage: (messageId) => {
			return Object.values(get().blocks).filter(
				(b) => b.messageId === messageId,
			);
		},

		// ── Bulk Operations ──

		loadBlocksForMessages: async (messageIds) => {
			if (messageIds.length === 0) return;

			const blocks = await chatDb.messageBlocks
				.where("messageId")
				.anyOf(messageIds)
				.toArray();

			set((state) => {
				for (const block of blocks) {
					state.blocks[block.id] = block;
				}
			});
		},
	})),
);
