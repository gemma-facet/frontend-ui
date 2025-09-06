export interface ExportPaths {
	adapter?: string;
	merged?: string;
	gguf?: string;
}

export interface ExportJob {
	base_model_id: string;
	created_at: string;
	job_id: string;
	job_name: string;
	modality: "text" | "vision";
	processed_dataset_id: string;
	status: "completed";
	updated_at: string;
	export_status: null | "adapter" | "merged" | "gguf";
	export?: ExportPaths;
}

export type ExportStatus = "adapter" | "merged" | "gguf";
