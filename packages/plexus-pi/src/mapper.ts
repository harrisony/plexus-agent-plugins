import type { OpenAICompletionsCompat } from "@earendil-works/pi-ai";
import {
	convertDescriptors,
	detectOpenAICompletionsCompat,
	type PlexusApiModel,
	type PlexusModelDescriptor,
} from "../../plexus-models/src/index.ts";

/**
 * Maps a PlexusModelDescriptor to a pi ProviderModelConfig entry suitable for
 * use in pi.registerProvider({ models: [...] }).
 *
 * Cost scaling: Plexus API returns cost per-token; pi uses $/million tokens.
 *
 * Compat resolution (openai-completions only):
 *   1. Start with heuristically-detected flags from detectOpenAICompletionsCompat
 *   2. Merge in pi_options from the Plexus server (server wins on any overlap)
 * Other API dialects leave compat undefined so the host auto-detects.
 *
 * thinkingLevelMap is left undefined — no registry lookup is performed here.
 */
export function descriptorToPiModel(descriptor: PlexusModelDescriptor) {
	const cost = {
		input: descriptor.cost.input * 1_000_000,
		output: descriptor.cost.output * 1_000_000,
		cacheRead: descriptor.cost.cacheRead * 1_000_000,
		cacheWrite: descriptor.cost.cacheWrite * 1_000_000,
	};

	// Assert the openai-completions compat contract locally. Other dialects
	// still auto-detect or pass through server-supplied pi_options unchanged.
	let compat: OpenAICompletionsCompat | Record<string, unknown> | undefined;
	if (descriptor.preferredApi === "openai-completions") {
		const heuristic = detectOpenAICompletionsCompat(descriptor.provider, descriptor.baseUrl);
		// pi_options override heuristics — the Plexus server knows best
		compat = (descriptor.piOptions
			? { ...heuristic, ...descriptor.piOptions }
			: heuristic) as OpenAICompletionsCompat;
	} else if (descriptor.piOptions) {
		// For non-openai-completions dialects that still carry pi_options, pass them through
		compat = descriptor.piOptions;
	}

	return {
		id: descriptor.id,
		name: descriptor.name,
		api: descriptor.preferredApi,
		baseUrl: descriptor.baseUrl,
		reasoning: descriptor.reasoning,
		input: descriptor.input,
		cost,
		contextWindow: descriptor.contextWindow,
		maxTokens: descriptor.maxTokens,
		...(compat !== undefined ? { compat } : {}),
	} as const;
}

/**
 * Converts a raw Plexus API model array into pi-compatible model entries.
 * Convenience wrapper over convertDescriptors + descriptorToPiModel.
 */
export function convertToPiModels(
	rawModels: PlexusApiModel[],
	baseUrl: string,
): ReturnType<typeof descriptorToPiModel>[] {
	const descriptors = convertDescriptors(rawModels, baseUrl);
	return descriptors.map(descriptorToPiModel);
}
