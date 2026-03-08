import type { Topic } from "./conversation";
import type { Model } from "./provider";

// ── Assistant Settings ──

export interface AssistantSettings {
	temperature: { value: number; enabled: boolean };
	maxTokens: { value: number; enabled: boolean };
	topP: { value: number; enabled: boolean };
	contextCount: number;
	streamOutput: boolean;
	toolUseMode: "function" | "auto";
	reasoning_effort: "default" | "low" | "medium" | "high";
	customParameters?: Record<string, unknown>;
}

export const DEFAULT_ASSISTANT_SETTINGS: AssistantSettings = {
	temperature: { value: 0.7, enabled: false },
	maxTokens: { value: 4096, enabled: false },
	topP: { value: 1.0, enabled: false },
	contextCount: 5,
	streamOutput: true,
	toolUseMode: "function",
	reasoning_effort: "default",
};

// ── Assistant Message (preset messages) ──

export interface AssistantMessage {
	role: "user" | "assistant" | "system";
	content: string;
}

// ── Quick Phrase ──

export interface QuickPhrase {
	id: string;
	content: string;
}

// ── Translate Language ──

export interface TranslateLanguage {
	code: string;
	name: string;
}

// ── Knowledge Base Reference (F007 placeholder) ──

export interface KnowledgeBase {
	id: string;
	name: string;
}

// ── MCP Server Reference (F006 placeholder) ──

export interface MCPServer {
	id: string;
	name: string;
	url?: string;
}

// ── Assistant ──

export interface Assistant {
	id: string;
	name: string;
	prompt: string;
	type: string;
	emoji?: string;
	description?: string;

	model?: Model;
	defaultModel?: Model;

	settings?: Partial<AssistantSettings>;
	messages?: AssistantMessage[];

	topics: Topic[];

	knowledge_bases?: KnowledgeBase[];
	enableWebSearch?: boolean;
	webSearchProviderId?: string;
	enableUrlContext?: boolean;
	enableGenerateImage?: boolean;
	mcpMode?: "disabled" | "auto" | "manual";
	mcpServers?: MCPServer[];
	knowledgeRecognition?: "off" | "on";

	regularPhrases?: QuickPhrase[];
	tags?: string[];
	enableMemory?: boolean;

	content?: string;
	targetLanguage?: TranslateLanguage;
}

// ── Assistant Preset ──

export interface AssistantPreset {
	id: string;
	name: string;
	prompt: string;
	settings: Partial<AssistantSettings>;
	model?: Model;
	emoji?: string;
	description?: string;
}
