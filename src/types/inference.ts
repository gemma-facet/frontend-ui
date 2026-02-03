import type { DatasetMessage } from "./dataset";

export type ModelType = "adapter" | "merged" | "base";

export interface InferenceRequest {
	hf_token: string;
	model_source: string;
	model_type: ModelType;
	base_model_id: string;
	prompt: string;
	use_vllm?: boolean;
}

export interface InferenceResponse {
	result: string;
}

export interface BatchInferenceRequest {
	hf_token: string;
	model_source: string;
	model_type: ModelType;
	base_model_id: string;
	messages: DatasetMessage[][]; // Array of conversations, where each conversation is a list of messages
	use_vllm?: boolean;
}

export interface BatchInferenceResponse {
	results: string[];
}

export type TaskType =
	| "conversation"
	| "qa"
	| "summarization"
	| "translation"
	| "classification"
	| "general";

export type MetricType =
	| "rouge"
	| "bertscore"
	| "accuracy"
	| "exact_match"
	| "bleu"
	| "meteor"
	| "recall"
	| "precision"
	| "f1";

export interface EvaluationRequest {
	hf_token: string;
	model_source: string;
	model_type: ModelType;
	base_model_id: string;
	dataset_id: string;
	task_type?: TaskType;
	metrics?: MetricType[];
	max_samples?: number;
	num_sample_results?: number;
	use_vllm?: boolean;
}

export interface SampleResult {
	prediction: string;
	reference: string | DatasetMessage;
	sample_index: number;
	input?: Array<DatasetMessage>;
}

export interface EvaluationResponse {
	metrics: Record<string, number | Record<string, number>>;
	num_samples: number;
	dataset_id: string;
	samples: SampleResult[];
}

export interface ApiErrorResponse {
	error: string;
}
