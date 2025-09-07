export interface EvaluationMetrics {
	accuracy?: number;
	perplexity?: number;
	eval_loss?: number;
	eval_runtime?: number;
}

// New structured config types based on backend schema
export interface StringCheckRewardConfig {
	name: string;
	type: "string_check";
	reference_field: string;
	operation: "eq" | "ne" | "like" | "ilike";
}

export interface TextSimilarityRewardConfig {
	name: string;
	type: "text_similarity";
	gemini_api_key?: string;
	reference_field: string;
	evaluation_metric:
		| "fuzzy_match"
		| "bleu"
		| "gleu"
		| "meteor"
		| "cosine"
		| "rouge_1"
		| "rouge_2"
		| "rouge_3"
		| "rouge_4"
		| "rouge_5"
		| "rouge_l";
	embedding_model?: string;
}

export interface ScoreModelRewardConfig {
	name: string;
	type: "score_model";
	gemini_api_key?: string;
	model: string;
	prompt: string;
	range?: [number, number];
}

export interface LabelModelRewardConfig {
	name: string;
	type: "label_model";
	gemini_api_key?: string;
	model: string;
	prompt: string;
	labels: string[];
	passing_labels: string[];
}

export interface PythonRewardConfig {
	name: string;
	type: "python";
	source: string;
}

export interface BuiltInRewardParameters {
	think_tag?: string;
	answer_tag?: string;
}

export interface BuiltInRewardConfig {
	name: string;
	type: "built_in";
	function_name:
		| "format_reward"
		| "count_xml"
		| "expression_accuracy"
		| "numerical_accuracy";
	parameters?: BuiltInRewardParameters;
}

export interface RulerRewardConfig {
	name: string;
	type: "ruler";
	gemini_api_key?: string;
	model: string;
	rules: string[];
}

export type AnyGraderConfig =
	| StringCheckRewardConfig
	| TextSimilarityRewardConfig
	| ScoreModelRewardConfig
	| LabelModelRewardConfig
	| PythonRewardConfig
	| BuiltInRewardConfig
	| RulerRewardConfig;

export interface HyperparameterConfig {
	// Basic hyperparameters
	learning_rate: number;
	batch_size: number;
	gradient_accumulation_steps: number;
	epochs: number;
	max_steps?: number;

	// Technical and optimization settings
	packing: boolean;
	use_fa2: boolean;
	max_seq_length?: number;
	lr_scheduler_type?: string;
	save_strategy?: string;
	logging_steps?: number;

	// PEFT Config
	lora_rank?: number;
	lora_alpha?: number;
	lora_dropout?: number;

	// GRPO-specific hyperparameters
	num_generations?: number;
	max_prompt_length?: number;
	max_grad_norm?: number;
	adam_beta1?: number;
	adam_beta2?: number;
	warmup_ratio?: number;

	// DPO-specific hyperparameters
	beta?: number;
	max_length?: number;
}

export interface EvaluationConfig {
	eval_strategy?: "no" | "steps" | "epoch";
	eval_steps?: number;
	compute_eval_metrics?: boolean;
	batch_eval_metrics?: boolean;
}

export interface WandbConfig {
	api_key: string;
	project?: string;
	log_model?: "false" | "checkpoint" | "end";
}

export interface ExportConfig {
	format: "adapter" | "merged" | "full";
	destination: "gcs" | "hfhub";
	hf_repo_id?: string;
	include_gguf?: boolean;
	gguf_quantization?: "none" | "f16" | "bf16" | "q8_0" | "q4_k_m";
}

export interface TrainingConfig {
	base_model_id: string;
	provider: "unsloth" | "huggingface";
	method: "Full" | "LoRA" | "QLoRA";
	trainer_type: "sft" | "dpo" | "grpo";
	modality: "text" | "vision";

	hyperparameters: HyperparameterConfig;
	export_config: ExportConfig;
	eval_config?: EvaluationConfig;
	wandb_config?: WandbConfig;
	reward_config?: AnyGraderConfig[];
}

export interface TrainRequest {
	processed_dataset_id: string;
	hf_token: string;
	job_name: string;
	training_config: TrainingConfig;
}

export interface TrainingJob {
	job_id: string;
	job_name?: string;
	status?: "queued" | "preparing" | "training" | "completed" | "failed";
	processed_dataset_id?: string;
	base_model_id?: string;
	created_at?: string;
	wandb_url?: string;
	adapter_path?: string;
	gguf_path?: string;
	error?: string;
	modality?: "text" | "vision";
	metrics?: EvaluationMetrics;
}

export type TrainingJobsState = {
	jobs: TrainingJob[];
	loading: boolean;
	error: string | null;
	hasFetched: boolean;
};

export interface BatchInferenceResult {
	results: string[];
}

export interface InferenceResult {
	result: string;
}

export interface JobDeleteResponse {
	job_id: string;
	deleted: boolean;
	message: string;
	deleted_resources?: string[];
}
