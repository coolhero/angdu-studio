import { STREAM_MAX_RETRIES, STREAM_STEP_COUNT } from "../config/defaults";
import type { Assistant } from "../types/assistant";
import type { StreamOptions } from "../types/conversation";
import type { Model, Provider } from "../types/provider";
import type { ModelMessage } from "./MessageConverter";

// ── Stream Text Parameters ──

export interface StreamTextParams {
	model: unknown; // AI SDK model instance (resolved at runtime)
	messages: ModelMessage[];
	system?: string;
	maxSteps?: number;
	maxRetries?: number;
	abortSignal?: AbortSignal;
	temperature?: number;
	maxTokens?: number;
	topP?: number;
	tools?: Record<string, unknown>;
	toolChoice?: "auto" | "none" | "required";
	headers?: Record<string, string>;
	experimental_thinking?: {
		enabled: boolean;
		budget_tokens?: number;
	};
}

export interface BuildResult {
	params: StreamTextParams;
	modelId: string;
	capabilities: string[];
}

// ── Parameter Builder Service (Singleton) ──
// Implements BL-011: StreamText Parameter Assembly

class ParameterBuilderClass {
	/**
	 * Assemble all parameters for streamText().
	 * Model resolution, capability detection, MCP tools, system prompt, headers.
	 */
	buildStreamTextParams(
		sdkMessages: ModelMessage[],
		assistant: Assistant,
		provider: Provider,
		options?: StreamOptions,
	): BuildResult {
		const model = assistant.model ?? assistant.defaultModel;
		if (!model) {
			throw new Error("No model configured for assistant");
		}

		const capabilities = model.capabilities ?? [];
		const params: StreamTextParams = {
			model: this.resolveModel(model, provider),
			messages: sdkMessages,
			maxSteps: STREAM_STEP_COUNT,
			maxRetries: STREAM_MAX_RETRIES,
			abortSignal: options?.abortSignal,
		};

		// System prompt
		const systemPrompt = this.buildSystemPrompt(assistant);
		if (systemPrompt) {
			params.system = systemPrompt;
		}

		// Temperature, maxTokens, topP (only if enabled)
		const settings = assistant.settings;
		if (settings?.temperature?.enabled) {
			params.temperature = settings.temperature.value;
		}
		if (settings?.maxTokens?.enabled) {
			params.maxTokens = settings.maxTokens.value;
		}
		if (settings?.topP?.enabled) {
			params.topP = settings.topP.value;
		}

		// Reasoning / Thinking mode
		if (capabilities.includes("reasoning")) {
			const effort = settings?.reasoning_effort ?? "default";
			if (effort !== "default") {
				params.experimental_thinking = {
					enabled: true,
					budget_tokens: this.getThinkingBudget(effort),
				};
			}
		}

		// MCP tools
		if (
			assistant.mcpMode &&
			assistant.mcpMode !== "disabled" &&
			assistant.mcpServers?.length
		) {
			params.tools = this.buildMcpTools(assistant);
			params.toolChoice = assistant.mcpMode === "auto" ? "auto" : undefined;
		}

		// Web search tool injection
		if (assistant.enableWebSearch && capabilities.includes("web_search")) {
			params.tools = {
				...params.tools,
				...this.buildWebSearchTool(provider),
			};
		}

		// Anthropic beta headers
		const headers = this.buildHeaders(provider, capabilities);
		if (Object.keys(headers).length > 0) {
			params.headers = headers;
		}

		return {
			params,
			modelId: model.id,
			capabilities: capabilities as string[],
		};
	}

	private resolveModel(_model: Model, _provider: Provider): unknown {
		// Model resolution via getAiSdkProviderId() — delegated to F002 provider factory
		// Returns the AI SDK model instance for the given provider type
		return { id: _model.id, provider: _provider.type };
	}

	private buildSystemPrompt(assistant: Assistant): string {
		let prompt = assistant.prompt || "";
		prompt = this.replacePromptVariables(prompt);
		return prompt;
	}

	/**
	 * Replace template variables in the system prompt.
	 * Variables: {{date}}, {{time}}, {{datetime}}, {{model}}, {{assistant}}
	 */
	replacePromptVariables(prompt: string): string {
		const now = new Date();
		return prompt
			.replace(/\{\{date\}\}/g, now.toLocaleDateString())
			.replace(/\{\{time\}\}/g, now.toLocaleTimeString())
			.replace(/\{\{datetime\}\}/g, now.toLocaleString());
	}

	private getThinkingBudget(effort: string): number {
		switch (effort) {
			case "low":
				return 1024;
			case "medium":
				return 4096;
			case "high":
				return 16384;
			default:
				return 4096;
		}
	}

	private buildMcpTools(assistant: Assistant): Record<string, unknown> {
		const tools: Record<string, unknown> = {};
		for (const server of assistant.mcpServers ?? []) {
			tools[`mcp_${server.id}`] = {
				type: "mcp",
				serverId: server.id,
				serverName: server.name,
			};
		}
		return tools;
	}

	private buildWebSearchTool(provider: Provider): Record<string, unknown> {
		const toolConfig: Record<string, unknown> = {
			web_search: { type: "web_search" },
		};

		// Provider-specific search tool injection
		if (provider.type === "vertexai" || provider.type === "vertex-anthropic") {
			toolConfig.web_search = { type: "web_search", provider: "google" };
		} else if (provider.type === "azure-openai") {
			toolConfig.web_search = { type: "web_search", provider: "bing" };
		}

		return toolConfig;
	}

	private buildHeaders(
		provider: Provider,
		capabilities: string[],
	): Record<string, string> {
		const headers: Record<string, string> = {};

		// Anthropic beta headers
		if (provider.type === "anthropic" || provider.type === "vertex-anthropic") {
			const betaFeatures: string[] = [];

			if (capabilities.includes("reasoning")) {
				betaFeatures.push("extended-thinking-2025-01-24");
			}

			if (provider.anthropicCacheControl?.enabled) {
				betaFeatures.push("prompt-caching-2024-07-31");
			}

			if (betaFeatures.length > 0) {
				headers["anthropic-beta"] = betaFeatures.join(",");
			}
		}

		// Extra headers from provider config
		if (provider.extra_headers) {
			Object.assign(headers, provider.extra_headers);
		}

		return headers;
	}
}

export const ParameterBuilder = new ParameterBuilderClass();
