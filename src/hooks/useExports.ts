"use client";

import { validateData } from "@/lib/api-validation";
import { ListExportsResponseSchema } from "@/schemas/export";
import type { ExportJobListEntry } from "@/types/export";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseExportsState {
	jobs: ExportJobListEntry[];
	loading: boolean;
	error: string | null;
	hasFetched: boolean;
}

export function useExports() {
	const [state, setState] = useState<UseExportsState>({
		jobs: [],
		loading: false,
		error: null,
		hasFetched: false,
	});

	// Use a ref to track if we're currently fetching to prevent double-firing
	const isFetchingRef = useRef(false);

	const fetchExports = useCallback(async () => {
		if (isFetchingRef.current) return;

		isFetchingRef.current = true;
		setState(prev => ({ ...prev, loading: true, error: null }));

		try {
			const res = await fetch("/api/exports");
			if (!res.ok) {
				const errorData = await res.json().catch(() => ({}));
				throw new Error(
					errorData.error ||
						`Failed to fetch export jobs: ${res.statusText}`,
				);
			}

			const data = await res.json();
			// Validate the response
			// Assuming the backend returns { jobs: [...] }
			const validated = validateData(data, ListExportsResponseSchema);

			setState({
				jobs: validated.jobs,
				loading: false,
				error: null,
				hasFetched: true,
			});
		} catch (error) {
			console.error("Error fetching export jobs:", error);
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
	}, []);

	useEffect(() => {
		if (!state.hasFetched && !isFetchingRef.current) {
			fetchExports();
		}
	}, [state.hasFetched, fetchExports]);

	return { ...state, refresh: fetchExports };
}
