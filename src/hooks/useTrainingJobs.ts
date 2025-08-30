import { jobsAtom } from "@/atoms";
import { useAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";

export function useTrainingJobs() {
	const [state, setState] = useAtom(jobsAtom);
	const isFetching = useRef(false);

	const fetchTrainingJobs = useCallback(async () => {
		if (isFetching.current) return; // Prevent concurrent calls

		try {
			isFetching.current = true;
			setState({
				jobs: [],
				loading: true,
				error: null,
				hasFetched: true,
			});

			const res = await fetch("/api/jobs");
			if (!res.ok) throw new Error("Failed to fetch training jobs.");

			const data = await res.json();
			setState({
				jobs: data.jobs,
				loading: false,
				error: null,
				hasFetched: true,
			});
		} catch (error) {
			setState({
				jobs: [],
				loading: false,
				error: error instanceof Error ? error.message : "Unknown error",
				hasFetched: true,
			});
		} finally {
			isFetching.current = false;
		}
	}, [setState]);

	useEffect(() => {
		// Only fetch once if we haven't fetched before
		if (!state.hasFetched) {
			fetchTrainingJobs();
		}
	}, [state.hasFetched, fetchTrainingJobs]);

	return { ...state, refresh: fetchTrainingJobs };
}
