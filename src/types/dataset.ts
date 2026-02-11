import type {
	DatasetMessage as DatasetMessageType,
	DatasetSample as DatasetSampleType,
	DatasetSynthesisRequest,
	ImageContentPart as ImageContentPartType,
	MessageContent as MessageContentType,
	TextContentPart as TextContentPartType,
} from "@/schemas/dataset";

// Dataset Types
export type Dataset = {
	datasetName: string;
	datasetId: string;
	processed_dataset_id: string;
	datasetSource: "huggingface" | "local";
	datasetSubset: string;
	numExamples: number;
	createdAt: string;
	splits: string[];
	modality: "text" | "vision";
};

export type DatasetsState = {
	datasets: Dataset[];
	loading: boolean;
	error: string | null;
	hasFetched: boolean;
};

// Re-export types from Zod schemas
export type TextContentPart = TextContentPartType;
export type ImageContentPart = ImageContentPartType;
export type MessageContent = MessageContentType;
export type DatasetMessage = DatasetMessageType;
export type DatasetSample = DatasetSampleType;

export interface DatasetSplit {
	split_name: string;
	num_rows: number;
	path: string;
	samples: DatasetSample[];
}

export interface DatasetDetail {
	dataset_name: string;
	dataset_subset: string;
	processed_dataset_id: string;
	dataset_source: "upload" | "huggingface";
	dataset_id: string;
	created_at: string;
	modality: "text" | "vision";
	splits: DatasetSplit[];
}

export interface DatasetDetailState {
	data: DatasetDetail | null;
	loading: boolean;
	error: string | null;
}

export interface FieldMapping {
	type: "template" | "column" | "image";
	value: string;
}

export interface UserFieldMapping extends FieldMapping {
	type: "template" | "column" | "image";
	value: string;
}

export interface FieldMappings {
	[key: string]: FieldMapping;
}

export interface VisionConfig {
	vision_enabled: boolean;
	field_mappings: FieldMappings;
}

export interface DatasetDeleteResponse {
	dataset_name: string;
	deleted: boolean;
	message: string;
	deleted_files_count?: number;
	deleted_resources?: string[];
}

export interface RawDatasetInfo {
	dataset_id: string;
	filename: string;
}

export interface RawDatasetsResponse {
	datasets: RawDatasetInfo[];
}

// Re-export Synthesis Config from Schema
// Note: The schema name is DatasetSynthesisRequest (which matches the body payload)
// but the UI type was SynthesisConfig. We alias it for compatibility.
export type SynthesisConfig = DatasetSynthesisRequest;
