import type { Model } from "./provider";

// ── Message Block Type Enum ──

export enum MessageBlockType {
	UNKNOWN = "unknown",
	MAIN_TEXT = "main_text",
	THINKING = "thinking",
	TRANSLATION = "translation",
	IMAGE = "image",
	CODE = "code",
	TOOL = "tool",
	FILE = "file",
	ERROR = "error",
	CITATION = "citation",
	VIDEO = "video",
	COMPACT = "compact",
}

// ── Message Block Status Enum ──

export enum MessageBlockStatus {
	PENDING = "pending",
	PROCESSING = "processing",
	STREAMING = "streaming",
	SUCCESS = "success",
	ERROR = "error",
	PAUSED = "paused",
}

// ── Valid Status Transitions ──

export const VALID_TRANSITIONS: Record<
	MessageBlockStatus,
	MessageBlockStatus[]
> = {
	[MessageBlockStatus.PENDING]: [MessageBlockStatus.PROCESSING],
	[MessageBlockStatus.PROCESSING]: [
		MessageBlockStatus.STREAMING,
		MessageBlockStatus.ERROR,
	],
	[MessageBlockStatus.STREAMING]: [
		MessageBlockStatus.SUCCESS,
		MessageBlockStatus.ERROR,
		MessageBlockStatus.PAUSED,
	],
	[MessageBlockStatus.PAUSED]: [
		MessageBlockStatus.STREAMING,
		MessageBlockStatus.ERROR,
	],
	[MessageBlockStatus.SUCCESS]: [],
	[MessageBlockStatus.ERROR]: [],
};

// ── Serialized Error ──

export interface SerializedError {
	name: string;
	message: string;
	stack?: string;
	code?: string;
}

// ── File Metadata (F004 reference) ──

export interface FileMetadata {
	id: string;
	name: string;
	path?: string;
	mimeType?: string;
	size?: number;
	url?: string;
}

// ── Citation Reference ──

export interface CitationReference {
	url: string;
	title?: string;
	snippet?: string;
}

// ── Web Search Response ──

export interface WebSearchResponse {
	results: Array<{
		url: string;
		title: string;
		snippet: string;
	}>;
}

// ── Knowledge Reference ──

export interface KnowledgeReference {
	id: string;
	name: string;
	content?: string;
}

// ── Memory Item (F008 reference) ──

export interface MemoryItem {
	id: string;
	content: string;
}

// ── Base Block ──

export interface MessageBlockBase {
	id: string;
	messageId: string;
	type: MessageBlockType;
	createdAt: string;
	updatedAt?: string;
	status: MessageBlockStatus;
	model?: Model;
	metadata?: Record<string, unknown>;
	error?: SerializedError;
}

// ── Block Variants ──

export interface MainTextMessageBlock extends MessageBlockBase {
	type: MessageBlockType.MAIN_TEXT;
	content: string;
	knowledgeBaseIds?: string[];
	citationReferences?: CitationReference[];
}

export interface ThinkingMessageBlock extends MessageBlockBase {
	type: MessageBlockType.THINKING;
	content: string;
	thinking_millsec: number;
}

export interface TranslationMessageBlock extends MessageBlockBase {
	type: MessageBlockType.TRANSLATION;
	content: string;
	sourceBlockId?: string;
	targetLanguage: string;
}

export interface CodeMessageBlock extends MessageBlockBase {
	type: MessageBlockType.CODE;
	content: string;
	language: string;
}

export interface ImageMessageBlock extends MessageBlockBase {
	type: MessageBlockType.IMAGE;
	url?: string;
	file?: FileMetadata;
}

export interface ToolMessageBlock extends MessageBlockBase {
	type: MessageBlockType.TOOL;
	toolId: string;
	toolName?: string;
	arguments?: Record<string, unknown>;
	content?: string | object;
}

export interface CitationMessageBlock extends MessageBlockBase {
	type: MessageBlockType.CITATION;
	response?: WebSearchResponse;
	knowledge?: KnowledgeReference[];
	memories?: MemoryItem[];
}

export interface FileMessageBlock extends MessageBlockBase {
	type: MessageBlockType.FILE;
	file: FileMetadata;
}

export interface VideoMessageBlock extends MessageBlockBase {
	type: MessageBlockType.VIDEO;
	url?: string;
	filePath?: string;
}

export interface CompactMessageBlock extends MessageBlockBase {
	type: MessageBlockType.COMPACT;
	content: string;
	compactedContent: string;
}

export interface ErrorMessageBlock extends MessageBlockBase {
	type: MessageBlockType.ERROR;
	content?: string;
}

export interface UnknownMessageBlock extends MessageBlockBase {
	type: MessageBlockType.UNKNOWN;
	content?: string;
}

// ── Union Type ──

export type MessageBlock =
	| MainTextMessageBlock
	| ThinkingMessageBlock
	| TranslationMessageBlock
	| CodeMessageBlock
	| ImageMessageBlock
	| ToolMessageBlock
	| CitationMessageBlock
	| FileMessageBlock
	| VideoMessageBlock
	| CompactMessageBlock
	| ErrorMessageBlock
	| UnknownMessageBlock;
