import type {
	AnyGraderConfig as AnyGraderConfigType,
	BuiltInRewardConfig as BuiltInRewardConfigType,
	EvaluationConfig as EvaluationConfigType,
	ExportConfig as ExportConfigType,
	HyperparameterConfig as HyperparameterConfigType,
	LabelModelRewardConfig as LabelModelRewardConfigType,
	PythonRewardConfig as PythonRewardConfigType,
	RulerRewardConfig as RulerRewardConfigType,
	ScoreModelRewardConfig as ScoreModelRewardConfigType,
	StringCheckRewardConfig as StringCheckRewardConfigType,
	TextSimilarityRewardConfig as TextSimilarityRewardConfigType,
	TrainRequest as TrainRequestType,
	TrainingConfig as TrainingConfigType,
	WandbConfig as WandbConfigType,
} from "@/schemas/training";
import type { JobArtifacts } from "./export";

// Re-export Zod inferred types
export type StringCheckRewardConfig = StringCheckRewardConfigType;
export type TextSimilarityRewardConfig = TextSimilarityRewardConfigType;
export type ScoreModelRewardConfig = ScoreModelRewardConfigType;
export type LabelModelRewardConfig = LabelModelRewardConfigType;
export type PythonRewardConfig = PythonRewardConfigType;
export type BuiltInRewardConfig = BuiltInRewardConfigType;
export type RulerRewardConfig = RulerRewardConfigType;
export type AnyGraderConfig = AnyGraderConfigType;
export type HyperparameterConfig = HyperparameterConfigType;
export type EvaluationConfig = EvaluationConfigType;
export type WandbConfig = WandbConfigType;
export type ExportConfig = ExportConfigType;
export type TrainingConfig = TrainingConfigType;
export type TrainRequest = TrainRequestType;

export interface EvaluationMetrics {
	accuracy?: number;
	perplexity?: number;
	eval_loss?: number;
	eval_runtime?: number;
}

export interface TrainingJob {
	job_id: string;
	job_name?: string;
	user_id?: string;
	status?:
		| "pending"
		| "queued"
		| "preparing"
		| "training"
		| "completed"
		| "failed";
	processed_dataset_id?: string;
	dataset_id?: string;
	base_model_id?: string;
	created_at?: string;
	updated_at?: string;
	wandb_url?: string;
	artifacts?: JobArtifacts;
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
