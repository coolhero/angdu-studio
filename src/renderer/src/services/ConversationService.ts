import {
	DEFAULT_CONTEXTCOUNT,
	MAX_CONTEXT_COUNT,
	UNLIMITED_CONTEXT_COUNT,
} from "../config/defaults";
import type { Assistant } from "../types/assistant";
import type { Message } from "../types/message";

// ── Conversation Service (Singleton) ──
// Implements the 9-stage message filtering pipeline (BL-012)
// and context count calculation (BL-017)

class ConversationServiceClass {
	/**
	 * 9-stage message filtering pipeline.
	 * Transforms raw conversation history into model-ready messages.
	 * Fallback: at least the last user message is included.
	 */
	filterMessagesPipeline(messages: Message[], contextCount: number): Message[] {
		if (messages.length === 0) return [];

		let filtered = [...messages];

		// Stage 1: Filter after context clear messages
		filtered = this.filterAfterContextClearMessages(filtered);

		// Stage 2: Filter useful messages (exclude explicitly marked non-useful)
		filtered = this.filterUsefulMessages(filtered);

		// Stage 3: Filter error-only messages with their related pairs
		filtered = this.filterErrorOnlyMessagesWithRelated(filtered);

		// Stage 4: Filter trailing assistant messages (last message should be user)
		filtered = this.filterLastAssistantMessage(filtered);

		// Stage 5: Filter adjacent user messages (keep only the last consecutive user message)
		filtered = this.filterAdjacentUserMessages(filtered);

		// Stage 6: Take right N+2 messages (context window)
		filtered = this.takeRight(filtered, contextCount + 2);

		// Stage 7: Re-apply context clear filter (in case takeRight crossed a clear boundary)
		filtered = this.filterAfterContextClearMessages(filtered);

		// Stage 8: Filter empty messages
		filtered = this.filterEmptyMessages(filtered);

		// Stage 9: Filter user-role-start (ensure first message is from user)
		filtered = this.filterUserRoleStartMessages(filtered);

		// Fallback: guarantee at least the last user message
		if (filtered.length === 0) {
			const lastUserMessage = [...messages]
				.reverse()
				.find((m) => m.role === "user");
			if (lastUserMessage) {
				filtered = [lastUserMessage];
			}
		}

		return filtered;
	}

	/**
	 * Calculate context count from assistant settings.
	 * MAX_CONTEXT_COUNT maps to UNLIMITED.
	 */
	getContextCount(
		assistant: Assistant,
		messages: Message[],
	): { current: number; max: number } {
		const settingsCount =
			assistant.settings?.contextCount ?? DEFAULT_CONTEXTCOUNT;

		const max =
			settingsCount >= MAX_CONTEXT_COUNT ? messages.length : settingsCount;
		const current = Math.min(messages.length, max);

		return { current, max };
	}

	// ── Pipeline Stages ──

	/** Stage 1: Keep only messages after the last 'clear' type message */
	filterAfterContextClearMessages(messages: Message[]): Message[] {
		const lastClearIndex = messages.findLastIndex((m) => m.type === "clear");
		if (lastClearIndex === -1) return messages;
		return messages.slice(lastClearIndex + 1);
	}

	/** Stage 2: Remove messages explicitly marked as not useful */
	filterUsefulMessages(messages: Message[]): Message[] {
		return messages.filter((m) => m.useful !== false);
	}

	/** Stage 3: Remove error-only assistant messages and their paired user messages */
	filterErrorOnlyMessagesWithRelated(messages: Message[]): Message[] {
		const errorAskIds = new Set<string>();

		for (const msg of messages) {
			if (msg.role === "assistant" && msg.status === "error" && msg.askId) {
				errorAskIds.add(msg.askId);
			}
		}

		if (errorAskIds.size === 0) return messages;

		return messages.filter((m) => {
			if (m.askId && errorAskIds.has(m.askId)) return false;
			return true;
		});
	}

	/** Stage 4: Remove trailing assistant message if it's the last message */
	filterLastAssistantMessage(messages: Message[]): Message[] {
		if (messages.length === 0) return messages;
		const last = messages[messages.length - 1];
		if (last.role === "assistant") {
			return messages.slice(0, -1);
		}
		return messages;
	}

	/** Stage 5: Collapse consecutive user messages, keeping only the last one in each run */
	filterAdjacentUserMessages(messages: Message[]): Message[] {
		const result: Message[] = [];

		for (let i = 0; i < messages.length; i++) {
			const current = messages[i];
			const next = messages[i + 1];

			// Skip if current is user AND next is also user (keep the later one)
			if (current.role === "user" && next?.role === "user") {
				continue;
			}

			result.push(current);
		}

		return result;
	}

	/** Stage 6: Take the last N messages */
	takeRight(messages: Message[], n: number): Message[] {
		if (n <= 0 || n === UNLIMITED_CONTEXT_COUNT) return messages;
		if (messages.length <= n) return messages;
		return messages.slice(-n);
	}

	/** Stage 8: Remove messages with empty blocks */
	filterEmptyMessages(messages: Message[]): Message[] {
		return messages.filter((m) => {
			// System messages are always kept
			if (m.role === "system") return true;
			// User messages are always kept (they have content via blocks)
			if (m.role === "user") return true;
			// Assistant messages need at least one block
			return m.blocks.length > 0;
		});
	}

	/** Stage 9: Ensure the conversation starts with a user message */
	filterUserRoleStartMessages(messages: Message[]): Message[] {
		const firstUserIndex = messages.findIndex((m) => m.role === "user");
		if (firstUserIndex <= 0) return messages;
		return messages.slice(firstUserIndex);
	}
}

export const ConversationService = new ConversationServiceClass();
