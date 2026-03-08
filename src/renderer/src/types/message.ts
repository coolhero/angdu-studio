import type { Model } from "./provider";

// ── Message Role ──

export type MessageRole = "user" | "assistant" | "system";

// ── Message Status ──

export type UserMessageStatus = "success";

export type AssistantMessageStatus =
	| "processing"
	| "pending"
	| "searching"
	| "success"
	| "paused"
	| "error";

export type MessageStatus = UserMessageStatus | AssistantMessageStatus;

// ── Multi-Model Style ──

export type MultiModelStyle = "horizontal" | "vertical" | "fold" | "grid";

// ── Token Usage ──

export interface TokenUsage {
	inputTokens: number;
	outputTokens: number;
}

// ── Message Metrics ──

export interface MessageMetrics {
	ttft: number;
	completionTime: number;
}

// ── Provider Metadata ──

export type ProviderMetadata = Record<string, unknown>;

// ── Message ──

export interface Message {
	id: string;
	role: MessageRole;
	assistantId: string;
	topicId: string;
	createdAt: string;
	updatedAt?: string;
	status: MessageStatus;
	modelId?: string;
	model?: Model;
	type?: "clear";
	useful?: boolean;
	askId?: string;
	mentions?: Model[];
	usage?: TokenUsage;
	metrics?: MessageMetrics;
	multiModelMessageStyle?: MultiModelStyle;
	foldSelected?: boolean;
	blocks: string[];
	traceId?: string;
	agentSessionId?: string;
	providerMetadata?: ProviderMetadata;
}
