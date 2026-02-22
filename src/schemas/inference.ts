import { z } from "zod";
import { DatasetMessageSchema } from "./dataset";

// --- Inference Schemas ---

export const ModelTypeSchema = z.enum(["adapter", "merged", "base"]);

// Base schema for common fields
const BaseInferenceSchema = z.object({
	model_source: z.string(),
	model_type: ModelTypeSchema,
	base_model_id: z.string().min(1, "Base model ID is required"),
	hf_token: z.string().optional(),
	use_vllm: z.boolean().optional(),
});

// Refinement to enforce hf_token when source is huggingface
const InferenceRefinement = (data: {
	model_source: string;
	hf_token?: string;
}) => {
	if (data.model_source === "huggingface" && !data.hf_token) {
		return false;
	}
	return true;
};

const InferenceRefinementMessage = {
	message: "hf_token is required for Hugging Face models",
	path: ["hf_token"],
};

export const InferenceRequestSchema = BaseInferenceSchema.extend({
	prompt: z.string().min(1, "Prompt is required"),
}).refine(InferenceRefinement, InferenceRefinementMessage);

export const BatchInferenceRequestSchema = BaseInferenceSchema.extend({
	messages: z
		.array(z.array(DatasetMessageSchema))
		.min(1, "At least one conversation is required"),
}).refine(InferenceRefinement, InferenceRefinementMessage);

// --- Evaluation Schemas ---

export const TaskTypeSchema = z.enum([
	"conversation",
	"qa",
	"summarization",
	"translation",
	"classification",
	"general",
]);

export const MetricTypeSchema = z.enum([
	"rouge",
	"bertscore",
	"accuracy",
	"exact_match",
	"bleu",
	"meteor",
	"recall",
	"precision",
	"f1",
]);

export const EvaluationRequestSchema = BaseInferenceSchema.extend({
	dataset_id: z.string().min(1, "Dataset ID is required"),
	task_type: TaskTypeSchema.optional(),
	metrics: z.array(MetricTypeSchema).optional(),
	max_samples: z.number().int().positive().optional(),
	num_sample_results: z.number().int().nonnegative().optional(),
})
	.refine(InferenceRefinement, InferenceRefinementMessage)
	.refine(data => !(data.task_type && data.metrics), {
		message:
			"Cannot specify both task_type and metrics. Choose one evaluation method.",
		path: ["task_type"], // Highlight task_type as the conflicting field
	});

// --- Type Exports (Inferred) ---

export type InferenceRequest = z.infer<typeof InferenceRequestSchema>;
export type BatchInferenceRequest = z.infer<typeof BatchInferenceRequestSchema>;
export type EvaluationRequest = z.infer<typeof EvaluationRequestSchema>;
// DatasetMessage is imported from dataset.ts schema, but we can re-export the type if needed,
// or let consumers import it from types/dataset.ts or schemas/dataset.ts
