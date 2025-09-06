export interface ExportPaths {
	adapter?: string;
	merged?: string;
	gguf?: string;
}

export interface ExportJob {
	base_model_id: string;
	created_at: string;
	export: ExportPaths;
	export_status: string | null;
	job_id: string;
	job_name: string;
	modality: "text" | "vision";
}

export interface ExportJobsResponse {
	jobs: ExportJob[];
}

export type ExportStatus = "adapter" | "merged" | "gguf";
