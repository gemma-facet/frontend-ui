export interface GemmaModel {
	id: string;
	name: string;
	description: string;
}

export const gemmaModels: GemmaModel[] = [
	{
		id: "gemma-3-270m",
		name: "Gemma 3 270M",
		description: "Ultra-lightweight model, perfect for experimentation",
	},
	{
		id: "gemma-3-1b",
		name: "Gemma 3 1B",
		description:
			"Compact with good performance and low resource requirements",
	},
	{
		id: "gemma-3-4b",
		name: "Gemma 3 4B",
		description:
			"Balanced model providing excellent performance for most tasks",
	},
	{
		id: "gemma-3-12b",
		name: "Gemma 3 12B",
		description:
			"Large model delivering superior performance for complex tasks",
	},
	{
		id: "gemma-3n-E2B",
		name: "Gemma 3 E2B",
		description: "Efficient model optimized for edge deployment",
	},
	{
		id: "gemma-3n-E4B",
		name: "Gemma 3 E4B",
		description: "Enhanced efficient model with improved capabilities",
	},
];

export const trainingTypes = [
	{
		id: "it",
		name: "Instruction Tuning (IT)",
		description:
			"Fine-tune for chat, question-answering, and instruction-following tasks",
	},
	{
		id: "pt",
		name: "Pre-training (PT)",
		description:
			"General fine-tuning for custom tasks and domain adaptation",
	},
] as const;

export const providers = [
	{
		id: "huggingface",
		name: "Hugging Face",
		description: "Standard models from Google/Hugging Face",
	},
	{
		id: "unsloth",
		name: "Unsloth",
		description: "Optimized models for faster training (recommended)",
	},
] as const;

export type ModelProvider = (typeof providers)[number]["id"];
export type TrainingType = (typeof trainingTypes)[number]["id"];

// Supported model IDs for evaluation and other components
export const supportedModelIds = gemmaModels.map(model => model.id);

/**
 * Construct the full model ID based on base model, provider, and quantization method.
 * NOTE: This is backward compatible, i.e. if you provide google/gemma-3-1b-it it will still work.
 *
 * @param baseModelId - Base model name (e.g., "gemma-3-1b-it")
 * @param provider - Training provider ("unsloth" or "huggingface")
 * @param method - Training method ("Full", "LoRA", "QLoRA")
 * @returns Full model ID with proper namespace and quantization suffix
 */
export function constructFullModelId(
	baseModelId: string,
	provider: "unsloth" | "huggingface",
	method = "LoRA",
): string {
	if (baseModelId.includes("/")) {
		// Already a full model ID
		return baseModelId;
	}

	if (provider === "huggingface") {
		// For HuggingFace, always use google/ namespace
		return `google/${baseModelId}`;
	}
	if (provider === "unsloth") {
		// For Unsloth, use unsloth/ namespace
		if (method === "QLoRA") {
			// Default to unsloth dynamic quants
			return `unsloth/${baseModelId}-unsloth-bnb-4bit`;
		}
		return `unsloth/${baseModelId}`;
	}
	throw new Error(`Unsupported provider: ${provider}`);
}
