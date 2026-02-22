import type { ExportRequest as ExportRequestType } from "@/schemas/export";

export type ExportType = "adapter" | "merged" | "gguf";
export type ExportStatus = "running" | "completed" | "failed";
export type ExportVariant = "raw" | "file" | "hf";
export type Modality = "text" | "vision";
export type ExportDestination = "gcs" | "hf_hub";

export interface JobArtifactsFiles {
	adapter?: string;
	merged?: string;
	gguf?: string;
}

export interface JobArtifactsRaw {
	adapter?: string;
	merged?: string;
}

export interface JobArtifactsHF {
	adapter?: string;
	merged?: string;
	gguf?: string;
}

export interface JobArtifacts {
	file: JobArtifactsFiles;
	raw: JobArtifactsRaw;
	hf: JobArtifactsHF;
}

export interface JobSchema {
	job_id: string;
	job_name: string;
	user_id: string;
	base_model_id: string;
	modality?: Modality;
	artifacts?: JobArtifacts;
}

export interface ExportArtifact {
	type: ExportType;
	path: string;
	variant: ExportVariant;
}

export interface ExportSchema {
	export_id: string;
	job_id: string;
	type: ExportType;
	status: ExportStatus;
	message?: string;
	artifacts: ExportArtifact[];
	started_at: string;
	finished_at?: string;
	updated_at?: string;
}

export interface GetExportResponse extends JobSchema {
	latest_export?: ExportSchema;
}

// Re-export from Zod Schema
export type ExportRequest = ExportRequestType;

export interface ExportResponse {
	success: boolean;
	message: string;
	export_id: string;
}

export interface ExportJobListEntry {
	job_id: string;
	job_name: string;
	base_model_id: string;
	artifacts?: JobArtifacts;
}

export interface ListExportsResponse {
	jobs: ExportJobListEntry[];
}
