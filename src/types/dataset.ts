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

export interface TextContentPart {
	type: "text";
	text: string;
}

export interface ImageContentPart {
	type: "image";
	image: string;
}

export type MessageContent = string | (TextContentPart | ImageContentPart)[];

export interface DatasetMessage {
	content: MessageContent;
	role: "system" | "user" | "assistant";
}

export interface DatasetSample {
	// Conversation format (existing)
	messages?: DatasetMessage[];

	// Prompt-only format (inference only, no ground truth)
	prompt?: DatasetMessage[];

	// Preference format
	chosen?: DatasetMessage[];
	rejected?: DatasetMessage[];

	// Additional dynamic fields based on user field mappings
	[key: string]: unknown;
}
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
