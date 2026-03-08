import { nanoid } from "nanoid";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { chatDb, createDexieStorageAdapter } from "../databases/ChatDatabase";
import { AssistantService } from "../services/AssistantService";
import type {
	Assistant,
	AssistantPreset,
	AssistantSettings,
} from "../types/assistant";
import type { Topic } from "../types/conversation";

// ── State Interface ──

export interface AssistantsStoreState {
	assistants: Assistant[];
	tags: { order: string[]; collapsed: Record<string, boolean> };
	presets: AssistantPreset[];
	unifiedOrder: string[];

	// Assistant CRUD
	addAssistant: (assistant: Omit<Assistant, "id" | "topics">) => Assistant;
	insertAssistant: (
		index: number,
		assistant: Omit<Assistant, "id" | "topics">,
	) => Assistant;
	updateAssistant: (id: string, updates: Partial<Assistant>) => void;
	updateAssistantSettings: (
		id: string,
		settings: Partial<AssistantSettings>,
	) => void;
	removeAssistant: (id: string) => void;
	reorderAssistants: (ids: string[]) => void;
	getAssistant: (id: string) => Assistant | undefined;

	// Topic Management
	addTopic: (assistantId: string, topic?: Partial<Topic>) => Topic;
	updateTopic: (
		assistantId: string,
		topicId: string,
		updates: Partial<Topic>,
	) => void;
	removeTopic: (assistantId: string, topicId: string) => void;
	pinTopic: (assistantId: string, topicId: string, pinned: boolean) => void;

	// Tags
	setTagOrder: (order: string[]) => void;
	setTagCollapsed: (tag: string, collapsed: boolean) => void;

	// Presets
	addPreset: (preset: Omit<AssistantPreset, "id">) => AssistantPreset;
	applyPreset: (presetId: string, assistantId: string) => void;
	removePreset: (id: string) => void;

	// Unified Order
	setUnifiedOrder: (ids: string[]) => void;

	// Hydration
	hydrate: () => Promise<void>;
}

// ── Store ──

export const useAssistantsStore = create<AssistantsStoreState>()(
	persist(
		immer((set, get) => ({
			assistants: [] as Assistant[],
			tags: { order: [] as string[], collapsed: {} as Record<string, boolean> },
			presets: [] as AssistantPreset[],
			unifiedOrder: [] as string[],

			// ── Assistant CRUD ──

			addAssistant: (data) => {
				const defaultTopic = AssistantService.createDefaultTopic("");
				const assistant: Assistant = {
					...data,
					id: nanoid(),
					topics: [defaultTopic],
				};
				assistant.topics[0].assistantId = assistant.id;

				set((state) => {
					state.assistants.unshift(assistant);
				});
				return assistant;
			},

			insertAssistant: (index, data) => {
				const defaultTopic = AssistantService.createDefaultTopic("");
				const assistant: Assistant = {
					...data,
					id: nanoid(),
					topics: [defaultTopic],
				};
				assistant.topics[0].assistantId = assistant.id;

				set((state) => {
					const safeIndex = Math.max(
						0,
						Math.min(index, state.assistants.length),
					);
					state.assistants.splice(safeIndex, 0, assistant);
				});
				return assistant;
			},

			updateAssistant: (id, updates) =>
				set((state) => {
					const index = state.assistants.findIndex((a) => a.id === id);
					if (index !== -1) {
						Object.assign(state.assistants[index], updates);
					}
				}),

			updateAssistantSettings: (id, settings) =>
				set((state) => {
					const assistant = state.assistants.find((a) => a.id === id);
					if (assistant) {
						assistant.settings = { ...assistant.settings, ...settings };
					}
				}),

			removeAssistant: (id) =>
				set((state) => {
					state.assistants = state.assistants.filter((a) => a.id !== id);
					state.unifiedOrder = state.unifiedOrder.filter((uid) => uid !== id);
				}),

			reorderAssistants: (ids) =>
				set((state) => {
					const ordered: Assistant[] = [];
					for (const id of ids) {
						const assistant = state.assistants.find((a) => a.id === id);
						if (assistant) ordered.push(assistant);
					}
					for (const assistant of state.assistants) {
						if (!ids.includes(assistant.id)) ordered.push(assistant);
					}
					state.assistants = ordered;
				}),

			getAssistant: (id) => {
				return get().assistants.find((a) => a.id === id);
			},

			// ── Topic Management ──

			addTopic: (assistantId, partial) => {
				const now = new Date().toISOString();
				const topic: Topic = {
					id: nanoid(),
					type: "chat",
					assistantId,
					name: partial?.name ?? "New Topic",
					createdAt: now,
					updatedAt: now,
					messages: [],
					...partial,
					// Ensure ID and assistantId are always set correctly
				};
				topic.id = topic.id || nanoid();
				topic.assistantId = assistantId;

				set((state) => {
					const assistant = state.assistants.find((a) => a.id === assistantId);
					if (assistant) {
						if (!Array.isArray(assistant.topics)) {
							assistant.topics = [];
						}
						assistant.topics.unshift(topic);
					}
				});
				return topic;
			},

			updateTopic: (assistantId, topicId, updates) =>
				set((state) => {
					const assistant = state.assistants.find((a) => a.id === assistantId);
					if (!assistant) return;
					const topic = assistant.topics.find((t) => t.id === topicId);
					if (topic) {
						Object.assign(topic, updates, {
							updatedAt: new Date().toISOString(),
						});
					}
				}),

			removeTopic: (assistantId, topicId) =>
				set((state) => {
					const assistant = state.assistants.find((a) => a.id === assistantId);
					if (assistant) {
						assistant.topics = assistant.topics.filter((t) => t.id !== topicId);
					}
				}),

			pinTopic: (assistantId, topicId, pinned) =>
				set((state) => {
					const assistant = state.assistants.find((a) => a.id === assistantId);
					if (!assistant) return;
					const topic = assistant.topics.find((t) => t.id === topicId);
					if (topic) {
						topic.pinned = pinned;
					}
				}),

			// ── Tags ──

			setTagOrder: (order) =>
				set((state) => {
					state.tags.order = order;
				}),

			setTagCollapsed: (tag, collapsed) =>
				set((state) => {
					state.tags.collapsed[tag] = collapsed;
				}),

			// ── Presets ──

			addPreset: (data) => {
				const preset: AssistantPreset = { ...data, id: nanoid() };
				set((state) => {
					state.presets.push(preset);
				});
				return preset;
			},

			applyPreset: (presetId, assistantId) =>
				set((state) => {
					const preset = state.presets.find((p) => p.id === presetId);
					const assistant = state.assistants.find((a) => a.id === assistantId);
					if (!preset || !assistant) return;
					const updates = AssistantService.applyPresetToAssistant(
						assistant,
						preset,
					);
					Object.assign(assistant, updates);
				}),

			removePreset: (id) =>
				set((state) => {
					state.presets = state.presets.filter((p) => p.id !== id);
				}),

			// ── Unified Order ──

			setUnifiedOrder: (ids) =>
				set((state) => {
					state.unifiedOrder = ids;
				}),

			// ── Hydration ──

			hydrate: async () => {
				const assistants = await chatDb.assistants.toArray();

				if (assistants.length === 0) {
					const defaultAssistant = AssistantService.createDefaultAssistant();
					await chatDb.assistants.put(defaultAssistant);
					set((state) => {
						state.assistants = [defaultAssistant];
					});
					return;
				}

				const normalized = assistants.map((a) =>
					AssistantService.normalizeTopics(a),
				);
				set((state) => {
					state.assistants = normalized;
				});
			},
		})),
		{
			name: "assistants-store",
			storage: createDexieStorageAdapter(),
			partialize: (state) => ({
				assistants: state.assistants,
				tags: state.tags,
				presets: state.presets,
				unifiedOrder: state.unifiedOrder,
			}),
		},
	),
);
