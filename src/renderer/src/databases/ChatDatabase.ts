import Dexie, { type Table } from "dexie";

import type { Assistant } from "../types/assistant";
import type { Topic } from "../types/conversation";
import type { Message } from "../types/message";
import type { MessageBlock } from "../types/message-block";

// ── Chat Database ──

class ChatDatabase extends Dexie {
	assistants!: Table<Assistant, string>;
	topics!: Table<Topic, string>;
	messages!: Table<Message, string>;
	messageBlocks!: Table<MessageBlock, string>;

	constructor() {
		super("angdu-chat");

		this.version(1).stores({
			assistants: "id, name",
			topics: "id, assistantId, [assistantId+updatedAt]",
			messages: "id, topicId, askId, [topicId+createdAt]",
			messageBlocks: "id, messageId, [messageId+createdAt]",
		});
	}
}

export const chatDb = new ChatDatabase();

// ── Zustand Persist Storage Adapter (for useAssistantsStore) ──

export interface DexieStorageAdapter {
	getItem: (name: string) => Promise<string | null>;
	setItem: (name: string, value: string) => Promise<void>;
	removeItem: (name: string) => Promise<void>;
}

export function createDexieStorageAdapter(): DexieStorageAdapter {
	return {
		getItem: async (_name: string) => {
			const assistants = await chatDb.assistants.toArray();
			if (assistants.length === 0) return null;
			return JSON.stringify({ state: { assistants }, version: 0 });
		},
		setItem: async (_name: string, value: string) => {
			const parsed = JSON.parse(value);
			const assistants: Assistant[] = parsed?.state?.assistants ?? [];
			await chatDb.transaction("rw", chatDb.assistants, async () => {
				await chatDb.assistants.clear();
				if (assistants.length > 0) {
					await chatDb.assistants.bulkPut(assistants);
				}
			});
		},
		removeItem: async (_name: string) => {
			await chatDb.assistants.clear();
		},
	};
}
