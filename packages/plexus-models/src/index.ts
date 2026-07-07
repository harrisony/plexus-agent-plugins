// Types
export type {
	ModelCache,
	PlexusApiModel,
	PlexusApiResponse,
	PlexusModelArchitecture,
	PlexusModelDescriptor,
	PlexusModelPricing,
	PlexusTopProvider,
} from "./types.ts";

// Model fetching and conversion
export {
	adjustBaseUrl,
	convertDescriptors,
	convertToDescriptor,
	DEFAULT_MODELS_FETCH_TIMEOUT_MS,
	detectOpenAICompletionsCompat,
	fetchPlexusModels,
	inferReasoning,
	mapInputModalities,
	mapPreferredApi,
} from "./convert.ts";

export { PLEXUS_SESSION_ID_HEADER } from "./constants.ts";
