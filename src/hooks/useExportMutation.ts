"use client";

import { validateData } from "@/lib/api-validation";
import { ExportRequestSchema, ExportResponseSchema } from "@/schemas/export";
import type { ExportRequest, ExportResponse } from "@/schemas/export";
import { useCallback, useState } from "react";

interface UseExportMutationState {
	loading: boolean;
	error: string | null;
	success: boolean;
	data: ExportResponse | null; // We can refine this type based on the response schema later
}

export function useExportMutation() {
	const [state, setState] = useState<UseExportMutationState>({
		loading: false,
		error: null,
		success: false,
		data: null,
	});

	const triggerExport = useCallback(
		async (jobId: string, payload: Omit<ExportRequest, "job_id">) => {
			setState(prev => ({
				...prev,
				loading: true,
				error: null,
				success: false,
			}));

			try {
				const res = await fetch(`/api/jobs/${jobId}/export`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				});

				if (!res.ok) {
					const errorData = await res.json().catch(() => ({}));
					throw new Error(
						errorData.error || "Failed to trigger export",
					);
				}

				const data = await res.json();
				// Optionally validate response if we have a schema for ExportResponse
				const validated = validateData(data, ExportResponseSchema);

				setState({
					loading: false,
					error: null,
					success: true,
					data: validated,
				});

				return data;
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: "An unknown error occurred";
				setState({
					loading: false,
					error: errorMessage,
					success: false,
					data: null,
				});
				throw error;
			}
		},
		[],
	);

	return {
		...state,
		triggerExport,
	};
}
