"use client";

import { validateData } from "@/lib/api-validation";
import { DeleteResponseSchema } from "@/schemas/common";
import { JobDeleteResponseSchema, TrainingJobSchema } from "@/schemas/training";
import type { TrainingJobResponse } from "@/schemas/training";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseTrainingJobState {
	job: TrainingJobResponse | null;
	loading: boolean;
	error: string | null;
	hasFetched: boolean;
}

export function useTrainingJob(jobId: string | null = null) {
	const [state, setState] = useState<UseTrainingJobState>({
		job: null,
		loading: false,
		error: null,
		hasFetched: false,
	});

	const isFetching = useRef(false);

	const fetchJob = useCallback(
		async (idOverride?: string, background = false) => {
			const targetId = idOverride || jobId;
			if (!targetId) return null;
			if (isFetching.current) return null;

			isFetching.current = true;
			if (!background) {
				setState(prev => ({ ...prev, loading: true, error: null }));
			}

			try {
				const res = await fetch(`/api/jobs/${targetId}`);
				if (!res.ok) {
					const errorData = await res.json().catch(() => ({}));
					throw new Error(errorData.error || "Failed to fetch job");
				}

				const data = await res.json();
				const validated = validateData(data, TrainingJobSchema);

				setState({
					job: validated,
					loading: false,
					error: null,
					hasFetched: true,
				});

				return validated;
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : "Unknown error";
				setState(prev => ({
					...prev,
					loading: false,
					error: errorMessage,
				}));
				throw error;
			} finally {
				isFetching.current = false;
			}
		},
		[jobId],
	);

	useEffect(() => {
		if (jobId && !state.hasFetched && !isFetching.current) {
			fetchJob();
		}
	}, [jobId, state.hasFetched, fetchJob]);

	const deleteJob = useCallback(async () => {
		if (!jobId) return;
		const res = await fetch(`/api/jobs/${jobId}`, {
			method: "DELETE",
		});
		const data = await res.json();

		if (!res.ok) {
			throw new Error(data.error || "Failed to delete job");
		}
		const validated = validateData(data, JobDeleteResponseSchema);
		return validated;
	}, [jobId]);

	return { ...state, refresh: fetchJob, deleteJob };
}
