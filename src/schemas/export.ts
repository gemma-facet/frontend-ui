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

export type ExportRequest = z.infer<typeof ExportRequestSchema>;
