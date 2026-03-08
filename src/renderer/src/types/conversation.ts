import type { Message } from "./message";

// ── Topic Type ──

export type TopicType = "chat" | "session";

// ── Topic ──

export interface Topic {
	id: string;
	type?: TopicType;
	assistantId: string;
	name: string;
	createdAt: string;
	updatedAt: string;
	messages: Message[];
	pinned?: boolean;
	prompt?: string;
	isNameManuallyEdited?: boolean;
}

// ── Chunk Type Enum ──

export enum ChunkType {
	LLM_RESPONSE_CREATED = "llm_response_created",
	TEXT_START = "text_start",
	TEXT_DELTA = "text_delta",
	TEXT_COMPLETE = "text_complete",
	THINKING_START = "thinking_start",
	THINKING_DELTA = "thinking_delta",
	THINKING_COMPLETE = "thinking_complete",
	TOOL_CALL_PENDING = "tool_call_pending",
	TOOL_CALL_IN_PROGRESS = "tool_call_in_progress",
	TOOL_CALL_COMPLETE = "tool_call_complete",
	TOOL_ARGUMENT_STREAMING = "tool_argument_streaming",
	EXTERNAL_TOOL_IN_PROGRESS = "external_tool_in_progress",
	EXTERNAL_TOOL_COMPLETE = "external_tool_complete",
	LLM_WEB_SEARCH_START = "llm_web_search_start",
	LLM_WEB_SEARCH_COMPLETE = "llm_web_search_complete",
	IMAGE_CREATED = "image_created",
	IMAGE_DELTA = "image_delta",
	IMAGE_GENERATED = "image_generated",
	VIDEO_SEARCHED = "video_searched",
	ERROR = "error",
	BLOCK_COMPLETE = "block_complete",
	RAW_DATA = "raw_data",
}

// ── Chunk ──

export interface Chunk {
	type: ChunkType;
	data: unknown;
}

// ── Stream Options ──

export interface StreamOptions {
	abortSignal?: AbortSignal;
}
