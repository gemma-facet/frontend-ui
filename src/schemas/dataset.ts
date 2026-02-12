import { z } from "zod";

// --- Base Content & Message Types ---

export const TextContentPartSchema = z.object({
	type: z.literal("text"),
	text: z.string(),
});

export const ImageContentPartSchema = z.object({
	type: z.literal("image"),
	image: z.string(), // Assuming base64 or URL
});

export const ContentPartSchema = z.union([
	TextContentPartSchema,
	ImageContentPartSchema,
]);

export const MessageContentSchema = z.union([
	z.string(),
	z.array(ContentPartSchema),
]);

export const DatasetMessageSchema = z.object({
	role: z.enum(["system", "user", "assistant"]),
	content: MessageContentSchema,
});

export const DatasetSampleSchema = z
	.object({
		messages: z.array(DatasetMessageSchema).optional(),
		prompt: z.array(DatasetMessageSchema).optional(),
		chosen: z.array(DatasetMessageSchema).optional(),
		rejected: z.array(DatasetMessageSchema).optional(),
	})
	.passthrough(); // Allow additional dynamic fields

// --- HuggingFace Proxy Schemas ---

export const HFConfigSchema = z.object({
	dataset_id: z.string().min(1, "Dataset ID is required"),
	token: z.string().min(1, "Token is required"),
});

export const HFInfoSchema = z.object({
	dataset_id: z.string().min(1, "Dataset ID is required"),
	config: z.string().min(1, "Config is required"),
	token: z.string().min(1, "Token is required"),
});

export const HFPreviewSchema = z.object({
	dataset_id: z.string().min(1, "Dataset ID is required"),
	config: z.string().min(1, "Config is required"),
	split: z.string().min(1, "Split is required"),
	token: z.string().min(1, "Token is required"),
});

// --- Dataset Processing Schemas ---

export const FieldMappingTypeSchema = z.enum(["template", "column", "image"]);

export const FieldMappingSchema = z.object({
	type: FieldMappingTypeSchema,
	value: z.string(),
});

export const DatasetProcessSchema = z
	.object({
		dataset_id: z.string().min(1, "Dataset ID is required"),
		field_mappings: z.record(z.string(), FieldMappingSchema).optional(),
		vision_enabled: z.boolean().optional(),
	})
	.passthrough(); // Allow other configuration fields passed to backend

// --- Dataset Synthesis Schema ---

export const DatasetSynthesisSchema = z.object({
	dataset_name: z.string().min(1, "Dataset name is required"),
	gemini_api_key: z.string().min(1, "Gemini API Key is required"),
	multimodal: z.boolean().optional(),
	num_pairs: z.number().int().positive().optional(),
	temperature: z.number().min(0).max(1).optional(),
	chunk_size: z.number().int().positive().optional(),
	chunk_overlap: z.number().int().nonnegative().optional(),
	threshold: z.number().positive().optional(),
	batch_size: z.number().int().positive().optional(),
});

// --- Type Exports ---

export type TextContentPart = z.infer<typeof TextContentPartSchema>;
export type ImageContentPart = z.infer<typeof ImageContentPartSchema>;
export type ContentPart = z.infer<typeof ContentPartSchema>;
export type MessageContent = z.infer<typeof MessageContentSchema>;
export type DatasetMessage = z.infer<typeof DatasetMessageSchema>;
export type DatasetSample = z.infer<typeof DatasetSampleSchema>;

export type HFConfigRequest = z.infer<typeof HFConfigSchema>;
export type HFInfoRequest = z.infer<typeof HFInfoSchema>;
export type HFPreviewRequest = z.infer<typeof HFPreviewSchema>;
export type DatasetProcessRequest = z.infer<typeof DatasetProcessSchema>;
export type DatasetSynthesisRequest = z.infer<typeof DatasetSynthesisSchema>;

// --- Response Schemas ---

export const DatasetSchema = z.object({
	dataset_name: z.string(),
	dataset_id: z.string(),
	processed_dataset_id: z.string(),
	dataset_source: z.enum(["upload", "huggingface"]),
	dataset_subset: z.string(),
	num_examples: z.number(),
	created_at: z.string(),
	splits: z.array(z.string()).optional(),
	modality: z.enum(["text", "vision"]),
});

// Helper for DatasetDetail splits
export const DatasetSplitSchema = z.object({
	split_name: z.string(),
	num_rows: z.number(),
	path: z.string(),
	// PERFORMANCE: Use z.any() or minimal validation for samples to avoid parsing overhead on large datasets
	samples: z.array(z.any()),
});

export const DatasetDetailSchema = z.object({
	dataset_name: z.string(),
	dataset_subset: z.string(),
	processed_dataset_id: z.string(),
	dataset_source: z.enum(["upload", "huggingface"]),
	dataset_id: z.string(),
	created_at: z.string(),
	modality: z.enum(["text", "vision"]),
	splits: z.array(DatasetSplitSchema),
});

export type DatasetResponse = z.infer<typeof DatasetSchema>;
export type DatasetDetailResponse = z.infer<typeof DatasetDetailSchema>;
