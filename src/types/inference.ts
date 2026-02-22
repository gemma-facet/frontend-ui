import type { DatasetMessage as DatasetMessageType } from "@/schemas/dataset";
import type {
	BatchInferenceRequest as BatchInferenceRequestType,
	EvaluationRequest as EvaluationRequestType,
	InferenceRequest as InferenceRequestType,
} from "@/schemas/inference";

export type ModelType = "adapter" | "merged" | "base";

// Re-exporting Zod-inferred types
export type InferenceRequest = InferenceRequestType;
export type BatchInferenceRequest = BatchInferenceRequestType;
export type EvaluationRequest = EvaluationRequestType;

export interface InferenceResponse {
	result: string;
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

// DatasetMessage is needed here for SampleResult
export type DatasetMessage = DatasetMessageType;

export interface SampleResult {
	prediction: string;
	reference: string;
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
