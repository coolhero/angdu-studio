import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { chatDb } from "../databases/ChatDatabase";
import type { Message } from "../types/message";

// ── State Interface ──

export interface MessageStoreState {
	messagesByTopic: Record<string, string[]>;
	messages: Record<string, Message>;
	displayCount: Record<string, number>;

	addMessage: (message: Message) => void;
	updateMessage: (id: string, updates: Partial<Message>) => void;
	removeMessage: (id: string) => void;
	removeMessagesByAskId: (askId: string) => void;
	removeMessagesByTopicId: (topicId: string) => void;

	upsertBlockReference: (messageId: string, blockId: string) => void;

	getMessageIdsForTopic: (topicId: string) => string[];
	getMessagesForTopic: (topicId: string) => Message[];

	loadMessagesForTopic: (topicId: string, limit?: number) => Promise<void>;
	loadMoreMessages: (topicId: string, count: number) => Promise<void>;
	getDisplayCount: (topicId: string) => number;
	setDisplayCount: (topicId: string, count: number) => void;

	clearTopicMessages: (topicId: string) => Promise<void>;
}

// ── Default Page Size ──

const DEFAULT_PAGE_SIZE = 50;

// ── Store ──

export const useMessageStore = create<MessageStoreState>()(
	immer((set, get) => ({
		messagesByTopic: {} as Record<string, string[]>,
		messages: {} as Record<string, Message>,
		displayCount: {} as Record<string, number>,

		// ── Message CRUD ──

		addMessage: (message) => {
			set((state) => {
				state.messages[message.id] = message;
				if (!state.messagesByTopic[message.topicId]) {
					state.messagesByTopic[message.topicId] = [];
				}
				state.messagesByTopic[message.topicId].push(message.id);
			});
			chatDb.messages.put(message).catch(console.error);
		},

		updateMessage: (id, updates) => {
			set((state) => {
				const message = state.messages[id];
				if (message) {
					Object.assign(message, updates, {
						updatedAt: new Date().toISOString(),
					});
				}
			});
			const message = get().messages[id];
			if (message) {
				chatDb.messages.put({ ...message }).catch(console.error);
			}
		},

		removeMessage: (id) => {
			const message = get().messages[id];
			if (!message) return;

			set((state) => {
				const topicIds = state.messagesByTopic[message.topicId];
				if (topicIds) {
					state.messagesByTopic[message.topicId] = topicIds.filter(
						(mid) => mid !== id,
					);
				}
				delete state.messages[id];
			});

			chatDb.messages.delete(id).catch(console.error);
			chatDb.messageBlocks
				.where("messageId")
				.equals(id)
				.delete()
				.catch(console.error);
		},

		removeMessagesByAskId: (askId) => {
			const allMessages = Object.values(get().messages);
			const toRemove = allMessages.filter((m) => m.askId === askId);

			set((state) => {
				for (const msg of toRemove) {
					const topicIds = state.messagesByTopic[msg.topicId];
					if (topicIds) {
						state.messagesByTopic[msg.topicId] = topicIds.filter(
							(mid) => mid !== msg.id,
						);
					}
					delete state.messages[msg.id];
				}
			});

			for (const msg of toRemove) {
				chatDb.messages.delete(msg.id).catch(console.error);
				chatDb.messageBlocks
					.where("messageId")
					.equals(msg.id)
					.delete()
					.catch(console.error);
			}
		},

		removeMessagesByTopicId: (topicId) => {
			const messageIds = get().messagesByTopic[topicId] ?? [];

			set((state) => {
				for (const id of messageIds) {
					delete state.messages[id];
				}
				delete state.messagesByTopic[topicId];
				delete state.displayCount[topicId];
			});

			chatDb.messages
				.where("topicId")
				.equals(topicId)
				.delete()
				.catch(console.error);
		},

		// ── Block References ──

		upsertBlockReference: (messageId, blockId) =>
			set((state) => {
				const message = state.messages[messageId];
				if (message && !message.blocks.includes(blockId)) {
					message.blocks.push(blockId);
				}
			}),

		// ── Topic-Message Queries ──

		getMessageIdsForTopic: (topicId) => {
			return get().messagesByTopic[topicId] ?? [];
		},

		getMessagesForTopic: (topicId) => {
			const ids = get().messagesByTopic[topicId] ?? [];
			const messages = get().messages;
			return ids.map((id) => messages[id]).filter(Boolean);
		},

		// ── Pagination ──

		loadMessagesForTopic: async (topicId, limit = DEFAULT_PAGE_SIZE) => {
			const messages = await chatDb.messages
				.where("[topicId+createdAt]")
				.between([topicId, Dexie.minKey], [topicId, Dexie.maxKey])
				.reverse()
				.limit(limit)
				.toArray();

			messages.reverse();

			// Deduplicate by ID
			const seen = new Set<string>();
			const deduped = messages.filter((m) => {
				if (seen.has(m.id)) return false;
				seen.add(m.id);
				return true;
			});

			set((state) => {
				const messageIds: string[] = [];
				for (const msg of deduped) {
					state.messages[msg.id] = msg;
					messageIds.push(msg.id);
				}
				state.messagesByTopic[topicId] = messageIds;
				state.displayCount[topicId] = messageIds.length;
			});
		},

		loadMoreMessages: async (topicId, count) => {
			const currentIds = get().messagesByTopic[topicId] ?? [];
			const totalInDb = await chatDb.messages
				.where("topicId")
				.equals(topicId)
				.count();
			const offset = currentIds.length;

			if (offset >= totalInDb) return;

			const olderMessages = await chatDb.messages
				.where("[topicId+createdAt]")
				.between([topicId, Dexie.minKey], [topicId, Dexie.maxKey])
				.reverse()
				.offset(offset)
				.limit(count)
				.toArray();

			olderMessages.reverse();

			set((state) => {
				const newIds: string[] = [];
				for (const msg of olderMessages) {
					if (!state.messages[msg.id]) {
						state.messages[msg.id] = msg;
						newIds.push(msg.id);
					}
				}
				state.messagesByTopic[topicId] = [
					...newIds,
					...(state.messagesByTopic[topicId] ?? []),
				];
				state.displayCount[topicId] =
					(state.displayCount[topicId] ?? 0) + newIds.length;
			});
		},

		getDisplayCount: (topicId) => {
			return get().displayCount[topicId] ?? 0;
		},

		setDisplayCount: (topicId, count) =>
			set((state) => {
				state.displayCount[topicId] = count;
			}),

		// ── Bulk Operations ──

		clearTopicMessages: async (topicId) => {
			const messageIds = get().messagesByTopic[topicId] ?? [];

			set((state) => {
				for (const id of messageIds) {
					delete state.messages[id];
				}
				delete state.messagesByTopic[topicId];
				delete state.displayCount[topicId];
			});

			await chatDb.transaction(
				"rw",
				chatDb.messages,
				chatDb.messageBlocks,
				async () => {
					const msgIds = await chatDb.messages
						.where("topicId")
						.equals(topicId)
						.primaryKeys();
					await chatDb.messages.bulkDelete(msgIds);
					for (const msgId of msgIds) {
						await chatDb.messageBlocks
							.where("messageId")
							.equals(msgId)
							.delete();
					}
				},
			);
		},
	})),
);
