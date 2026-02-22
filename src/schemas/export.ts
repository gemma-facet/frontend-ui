import { z } from "zod";

export const ExportTypeSchema = z.enum(["adapter", "merged", "gguf"]);
export const ExportDestinationSchema = z.enum(["gcs", "hf_hub"]);

export const ExportRequestSchema = z
	.object({
		job_id: z.string().min(1, "Job ID is required"),
		export_type: ExportTypeSchema,
		destination: z
			.array(ExportDestinationSchema)
			.min(1, "At least one destination is required"),
		hf_token: z.string().optional(),
		hf_repo_id: z.string().optional(),
	})
	.refine(
		data => {
			if (data.destination.includes("hf_hub")) {
				return !!(data.hf_token && data.hf_repo_id);
			}
			return true;
		},
		{
			message:
				"hf_token and hf_repo_id are required when destination includes 'hf_hub'",
			path: ["hf_repo_id"], // Highlighting hf_repo_id as the likely missing field
		},
	);

// --- Response Schemas ---

export const JobArtifactsFilesSchema = z.object({
	adapter: z.string().optional(),
	merged: z.string().optional(),
	gguf: z.string().optional(),
});

export const JobArtifactsRawSchema = z.object({
	adapter: z.string().optional(),
	merged: z.string().optional(),
});

export const JobArtifactsHFSchema = z.object({
	adapter: z.string().optional(),
	merged: z.string().optional(),
	gguf: z.string().optional(),
});

export const JobArtifactsResponseSchema = z.object({
	file: JobArtifactsFilesSchema,
	raw: JobArtifactsRawSchema,
	hf: JobArtifactsHFSchema,
});

export const ExportJobListEntrySchema = z.object({
	job_id: z.string(),
	job_name: z.string(),
	base_model_id: z.string(),
	artifacts: JobArtifactsResponseSchema.optional(),
});

export const ListExportsResponseSchema = z.object({
	jobs: z.array(ExportJobListEntrySchema),
});

export const ExportResponseSchema = z
	.object({
		success: z.boolean().optional(),
		message: z.string().optional(),
		job_id: z.string().optional(),
	})
	.passthrough();

// --- Type Exports ---

export type ExportRequest = z.infer<typeof ExportRequestSchema>;

export type ExportJobListEntryResponse = z.infer<
	typeof ExportJobListEntrySchema
>;
export type ListExportsResponseData = z.infer<typeof ListExportsResponseSchema>;

export type ExportResponse = z.infer<typeof ExportResponseSchema>;
