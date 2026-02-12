"use client";

import { validateData } from "@/lib/api-validation";
import { DatasetProcessSchema, DatasetSchema } from "@/schemas/dataset"; // Assuming response matches DatasetSchema
import type { DatasetProcessRequest } from "@/types/dataset";
import { useCallback, useState } from "react";
import type { z } from "zod";

interface UseDatasetProcessingState {
	loading: boolean;
	error: string | null;
	success: boolean;
	data: z.infer<typeof DatasetSchema> | null;
}

export function useDatasetProcessing() {
	const [state, setState] = useState<UseDatasetProcessingState>({
		loading: false,
		error: null,
		success: false,
		data: null,
	});

	const processDataset = useCallback(
		async (payload: DatasetProcessRequest) => {
			setState(prev => ({
				...prev,
				loading: true,
				error: null,
				success: false,
			}));

			try {
				const response = await fetch("/api/datasets/process", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(payload),
				});

				if (!response.ok) {
					const errorData = await response.json().catch(() => ({}));
					throw new Error(
						errorData.error ||
							errorData.detail ||
							"Failed to process dataset",
					);
				}

				const data = await response.json();
				// Validate response - assume it returns the processed dataset object
				const validated = validateData(data, DatasetSchema);

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
				throw error; // Re-throw so component can handle if needed (e.g. toast)
			}
		},
		[],
	);

	const resetState = useCallback(() => {
		setState({
			loading: false,
			error: null,
			success: false,
			data: null,
		});
	}, []);

	return {
		...state,
		processDataset,
		resetState,
	};
}
