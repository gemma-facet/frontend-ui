"use client";

import { validateData } from "@/lib/api-validation";
import { type TrainRequest, TrainingJobSchema } from "@/schemas/training";
import { useCallback, useState } from "react";
import type { z } from "zod";

interface UseTrainingMutationState {
	loading: boolean;
	error: string | null;
	success: boolean;
	data: z.infer<typeof TrainingJobSchema> | null;
}

export function useTrainingMutation() {
	const [state, setState] = useState<UseTrainingMutationState>({
		loading: false,
		error: null,
		success: false,
		data: null,
	});

	const submitTrainingJob = useCallback(async (payload: TrainRequest) => {
		// Ideally payload should be TrainRequest, but we cast it or validate it before calling if needed.
		// For flexible usage, we accept any and let the API/Backend handle request validation (or we could validate here).

		setState(prev => ({
			...prev,
			loading: true,
			error: null,
			success: false,
		}));

		try {
			const res = await fetch("/api/train", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!res.ok) {
				const errorData = await res.json().catch(() => ({}));
				throw new Error(errorData.error || "Failed to submit job");
			}

			const data = await res.json();
			// Validate response - expect a TrainingJob object
			const validated = validateData(data, TrainingJobSchema);

			setState({
				loading: false,
				error: null,
				success: true,
				data: validated,
			});

			return validated;
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
	}, []);

	return {
		...state,
		submitTrainingJob,
	};
}
