"use client";

import { DatasetSchema } from "@/schemas/dataset";
import { useAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import { z } from "zod";
import { datasetsAtom } from "../atoms";

export function useDatasets() {
	const [state, setState] = useAtom(datasetsAtom);
	// Use a ref to track if we're currently fetching to prevent double-firing in Strict Mode
	const isFetchingRef = useRef(false);

	const fetchDatasets = useCallback(async () => {
		// If already fetching, don't start another request
		if (isFetchingRef.current) return;

		isFetchingRef.current = true;
		setState(prev => ({ ...prev, loading: true, error: null }));

		try {
			const res = await fetch("/api/datasets");
			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(
					errorData.error ||
						`Failed to fetch datasets: ${res.statusText}`,
				);
			}

			const data = await res.json();
			const validatedDatasets = z
				.array(DatasetSchema)
				.parse(data.datasets);

			const formattedData = validatedDatasets.map(dataset => ({
				datasetName: dataset.dataset_name,
				datasetId: dataset.dataset_id,
				processed_dataset_id: dataset.processed_dataset_id,
				datasetSource: (dataset.dataset_source === "upload"
					? "local"
					: "huggingface") as "local" | "huggingface",
				datasetSubset: dataset.dataset_subset,
				numExamples: dataset.num_examples,
				createdAt: dataset.created_at,
				splits: dataset.splits || [], // Ensure splits is always an array
				modality: dataset.modality,
			}));

			setState({
				datasets: formattedData,
				loading: false,
				error: null,
				hasFetched: true,
			});
		} catch (error) {
			console.error("Error fetching datasets:", error);
			setState(prev => ({
				...prev,
				loading: false,
				error:
					error instanceof Error
						? error.message
						: "An unknown error occurred",
			}));
		} finally {
			isFetchingRef.current = false;
		}
	}, [setState]);

	useEffect(() => {
		// Only fetch if we haven't fetched yet and aren't currently fetching
		if (!state.hasFetched && !isFetchingRef.current) {
			fetchDatasets();
		}
	}, [state.hasFetched, fetchDatasets]);

	return { ...state, refresh: fetchDatasets };
}
