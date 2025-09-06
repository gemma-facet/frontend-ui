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

export type ExportType = "adapter" | "merged" | "gguf";

export interface ExportRequest {
	job_id: string;
	export_type: ExportType;
	hf_token?: string;
}

export interface ExportInfo {
	type: ExportType;
	path: string;
}

export interface ExportResponse {
	export_info: ExportInfo;
}
