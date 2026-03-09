import Dexie, { type Table } from "dexie";

import type { Assistant } from "../types/assistant";
import type { Topic } from "../types/conversation";
import type { Message } from "../types/message";
import type { MessageBlock } from "../types/message-block";

// ── File Types (F004-settings-data) ──

export type FileType = "image" | "document" | "video" | "audio" | "other";

export interface FileRecord {
	id: string;
	name: string;
	origin_name: string;
	path: string;
	size: number;
	ext: string;
	type: FileType;
	created_at: string;
	count: number;
	tokens?: number;
	purpose?: string;
}

// ── Chat Database ──

class ChatDatabase extends Dexie {
	assistants!: Table<Assistant, string>;
	topics!: Table<Topic, string>;
	messages!: Table<Message, string>;
	messageBlocks!: Table<MessageBlock, string>;
	files!: Table<FileRecord, string>;

	constructor() {
		super("angdu-chat");

		this.version(1).stores({
			assistants: "id, name",
			topics: "id, assistantId, [assistantId+updatedAt]",
			messages: "id, topicId, askId, [topicId+createdAt]",
			messageBlocks: "id, messageId, [messageId+createdAt]",
		});

		this.version(2).stores({
			files: "id, type, created_at",
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
			const parsed = typeof value === "string" ? JSON.parse(value) : value;
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
