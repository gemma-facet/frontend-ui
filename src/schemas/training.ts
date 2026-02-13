import { z } from "zod";
import { ExportTypeSchema, JobArtifactsResponseSchema } from "./export";

// --- Enums ---

export const TrainingProviderSchema = z.enum(["unsloth", "huggingface"]);
export const TrainingMethodSchema = z.enum(["Full", "LoRA", "QLoRA"]);
export const TrainerTypeSchema = z.enum(["sft", "dpo", "grpo", "orpo"]);
export const ModalitySchema = z.enum(["text", "vision"]);
export const EvalStrategySchema = z.enum(["no", "steps", "epoch"]);
export const ExportFormatSchema = z.enum(["adapter", "merged", "full"]);
export const ExportDestinationSchema = z.enum(["gcs", "hfhub"]);
export const QuantizationSchema = z.enum([
	"none",
	"f16",
	"bf16",
	"q8_0",
	"q4_k_m",
]);
export const WandbLogModelSchema = z.enum(["false", "checkpoint", "end"]);

// --- Reward Config Schemas ---

export const StringCheckRewardSchema = z.object({
	name: z.string(),
	type: z.literal("string_check"),
	reference_field: z.string(),
	operation: z.enum(["eq", "ne", "like", "ilike"]),
});

export const TextSimilarityRewardSchema = z.object({
	name: z.string(),
	type: z.literal("text_similarity"),
	gemini_api_key: z.string().optional(),
	reference_field: z.string(),
	evaluation_metric: z.enum([
		"fuzzy_match",
		"bleu",
		"gleu",
		"meteor",
		"cosine",
		"rouge_1",
		"rouge_2",
		"rouge_3",
		"rouge_4",
		"rouge_5",
		"rouge_l",
	]),
	embedding_model: z.string().optional(),
});

export const ScoreModelRewardSchema = z.object({
	name: z.string(),
	type: z.literal("score_model"),
	gemini_api_key: z.string().optional(),
	model: z.string(),
	prompt: z.string(),
	range: z.tuple([z.number(), z.number()]).optional(),
});

export const LabelModelRewardSchema = z.object({
	name: z.string(),
	type: z.literal("label_model"),
	gemini_api_key: z.string().optional(),
	model: z.string(),
	prompt: z.string(),
	labels: z.array(z.string()),
	passing_labels: z.array(z.string()),
});

export const PythonRewardSchema = z.object({
	name: z.string(),
	type: z.literal("python"),
	source: z.string(),
});

export const BuiltInRewardSchema = z.object({
	name: z.string(),
	type: z.literal("built_in"),
	function_name: z.enum([
		"format_reward",
		"count_xml",
		"expression_accuracy",
		"numerical_accuracy",
	]),
	parameters: z
		.object({
			think_tag: z.string().optional(),
			answer_tag: z.string().optional(),
		})
		.optional(),
});

export const RulerRewardSchema = z.object({
	name: z.string(),
	type: z.literal("ruler"),
	gemini_api_key: z.string().optional(),
	model: z.string(),
	rules: z.array(z.string()),
});

export const AnyGraderConfigSchema = z.discriminatedUnion("type", [
	StringCheckRewardSchema,
	TextSimilarityRewardSchema,
	ScoreModelRewardSchema,
	LabelModelRewardSchema,
	PythonRewardSchema,
	BuiltInRewardSchema,
	RulerRewardSchema,
]);

// --- Configuration Objects ---

export const HyperparameterConfigSchema = z.object({
	learning_rate: z.number(),
	batch_size: z.number().int().positive(),
	gradient_accumulation_steps: z.number().int().positive(),
	epochs: z.number().positive(),
	max_steps: z.number().int().optional(),

	packing: z.boolean(),
	padding_free: z.boolean(),
	use_fa2: z.boolean(),
	lr_scheduler_type: z.string().optional(),
	save_strategy: z.string().optional(),
	logging_steps: z.number().int().optional(),
	max_length: z.number().int().optional(),

	// PEFT
	lora_rank: z.number().int().optional(),
	lora_alpha: z.number().optional(),
	lora_dropout: z.number().optional(),

	// GRPO
	num_generations: z.number().int().optional(),
	max_prompt_length: z.number().int().optional(),
	max_grad_norm: z.number().optional(),
	adam_beta1: z.number().optional(),
	adam_beta2: z.number().optional(),
	warmup_ratio: z.number().optional(),

	// DPO/ORPO
	beta: z.number().optional(),
});

export const EvaluationConfigSchema = z.object({
	eval_strategy: EvalStrategySchema.optional(),
	eval_steps: z.number().int().optional(),
	compute_eval_metrics: z.boolean().optional(),
	batch_eval_metrics: z.boolean().optional(),
});

export const WandbConfigSchema = z.object({
	api_key: z.string(),
	project: z.string().optional(),
	log_model: WandbLogModelSchema.optional(),
});

export const ExportConfigSchema = z
	.object({
		format: ExportFormatSchema,
		destination: ExportDestinationSchema,
		hf_repo_id: z.string().optional(),
		include_gguf: z.boolean().optional(),
		gguf_quantization: QuantizationSchema.optional(),
	})
	.refine(
		data => {
			if (data.destination === "hfhub" && !data.hf_repo_id) {
				return false;
			}
			return true;
		},
		{
			message: "hf_repo_id is required when destination is 'hfhub'",
			path: ["hf_repo_id"],
		},
	);

export const TrainingConfigSchema = z.object({
	base_model_id: z.string().min(1, "Base model ID is required"),
	provider: TrainingProviderSchema,
	method: TrainingMethodSchema,
	trainer_type: TrainerTypeSchema,
	modality: ModalitySchema,

	hyperparameters: HyperparameterConfigSchema,
	export_config: ExportConfigSchema,
	eval_config: EvaluationConfigSchema.optional(),
	wandb_config: WandbConfigSchema.optional(),
	reward_config: z.array(AnyGraderConfigSchema).optional(),
});

// --- Main Request Schema ---

export const TrainRequestSchema = z.object({
	processed_dataset_id: z.string().min(1, "Processed dataset ID is required"),
	hf_token: z.string().min(1, "HF Token is required"), // Always required per current types/routes
	job_name: z.string().min(1, "Job name is required"),
	training_config: TrainingConfigSchema,
});

// --- Type Exports ---

export type StringCheckRewardConfig = z.infer<typeof StringCheckRewardSchema>;
export type TextSimilarityRewardConfig = z.infer<
	typeof TextSimilarityRewardSchema
>;
export type ScoreModelRewardConfig = z.infer<typeof ScoreModelRewardSchema>;
export type LabelModelRewardConfig = z.infer<typeof LabelModelRewardSchema>;
export type PythonRewardConfig = z.infer<typeof PythonRewardSchema>;
export type BuiltInRewardConfig = z.infer<typeof BuiltInRewardSchema>;
export type RulerRewardConfig = z.infer<typeof RulerRewardSchema>;

export type TrainRequest = z.infer<typeof TrainRequestSchema>;
export type TrainingConfig = z.infer<typeof TrainingConfigSchema>;
export type HyperparameterConfig = z.infer<typeof HyperparameterConfigSchema>;
export type EvaluationConfig = z.infer<typeof EvaluationConfigSchema>;
export type WandbConfig = z.infer<typeof WandbConfigSchema>;
export type ExportConfig = z.infer<typeof ExportConfigSchema>;
export type AnyGraderConfig = z.infer<typeof AnyGraderConfigSchema>;

// --- Response Schemas ---

export const EvaluationMetricsSchema = z.object({
	accuracy: z.number().optional(),
	perplexity: z.number().optional(),
	eval_loss: z.number().optional(),
	eval_runtime: z.number().optional(),
});

export const JobDeleteResponseSchema = z.object({
	job_id: z.string(),
	deleted: z.boolean(),
	message: z.string(),
	deleted_resources: z.array(z.string()).optional(),
});

export const TrainingJobSchema = z.object({
	job_id: z.string(),
	job_name: z.string().optional(),
	user_id: z.string().optional(),
	status: z
		.enum([
			"pending",
			"queued",
			"preparing",
			"training",
			"completed",
			"failed",
		])
		.optional(),
	processed_dataset_id: z.string().optional(),
	dataset_id: z.string().optional(),
	base_model_id: z.string().optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	wandb_url: z.string().optional(),
	artifacts: JobArtifactsResponseSchema.optional(),
	error: z.string().optional(),
	modality: z.enum(["text", "vision"]).optional(),
	// ... existing fields
	latest_export: z
		.object({
			status: z.enum(["pending", "running", "completed", "failed"]),
			type: ExportTypeSchema,
			message: z.string().optional(),
			created_at: z.string().optional(),
		})
		.optional(),
	metrics: EvaluationMetricsSchema.optional(),
});

export type TrainingJobResponse = z.infer<typeof TrainingJobSchema>;
export type JobDeleteResponse = z.infer<typeof JobDeleteResponseSchema>;
