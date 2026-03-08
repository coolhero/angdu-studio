import { nanoid } from "nanoid";

import type { Assistant, AssistantPreset } from "../types/assistant";
import { DEFAULT_ASSISTANT_SETTINGS } from "../types/assistant";
import type { Topic } from "../types/conversation";

// ── Assistant Service (Singleton) ──

class AssistantServiceClass {
	createDefaultAssistant(defaultModel?: {
		id: string;
		provider: string;
		name: string;
		group: string;
	}): Assistant {
		const defaultTopic = this.createDefaultTopic("");

		return {
			id: nanoid(),
			name: "Default Assistant",
			prompt: "You are a helpful assistant.",
			type: "default",
			emoji: "🤖",
			model: defaultModel,
			settings: { ...DEFAULT_ASSISTANT_SETTINGS },
			topics: [defaultTopic],
			tags: [],
		};
	}

	createDefaultTopic(assistantId: string): Topic {
		const now = new Date().toISOString();
		return {
			id: nanoid(),
			type: "chat",
			assistantId,
			name: "New Topic",
			createdAt: now,
			updatedAt: now,
			messages: [],
		};
	}

	normalizeTopics(assistant: Assistant): Assistant {
		if (!Array.isArray(assistant.topics)) {
			return { ...assistant, topics: [] };
		}
		return assistant;
	}

	getEffectivePrompt(
		assistant: Assistant,
		topic?: { prompt?: string },
	): string {
		if (topic?.prompt) {
			return topic.prompt;
		}
		return assistant.prompt;
	}

	applyPresetToAssistant(
		assistant: Assistant,
		preset: AssistantPreset,
	): Partial<Assistant> {
		return {
			prompt: preset.prompt,
			settings: { ...assistant.settings, ...preset.settings },
			model: preset.model ?? assistant.model,
			emoji: preset.emoji ?? assistant.emoji,
			description: preset.description ?? assistant.description,
		};
	}
}

export const AssistantService = new AssistantServiceClass();
