import { DatasetDetailSchema } from "@/schemas/dataset";
import type { DatasetDetail, DatasetDetailState } from "@/types/dataset";
import { useEffect, useState } from "react";

export const useDatasetDetail = (processedDatasetId: string) => {
	const [state, setState] = useState<DatasetDetailState>({
		data: null,
		loading: true,
		error: null,
	});

	useEffect(() => {
		const fetchDatasetDetail = async () => {
			if (!processedDatasetId) {
				setState({
					data: null,
					loading: false,
					error: "Processed dataset ID is required",
				});
				return;
			}

			setState(prev => ({ ...prev, loading: true, error: null }));

			try {
				const response = await fetch(
					`/api/datasets/${encodeURIComponent(processedDatasetId)}`,
				);

				if (!response.ok) {
					throw new Error(
						`Failed to fetch dataset: ${response.status} ${response.statusText}`,
					);
				}

				const data = await response.json();
				const validated = DatasetDetailSchema.parse(data);
				setState({
					data: validated as DatasetDetail,
					loading: false,
					error: null,
				});
			} catch (error) {
				setState({
					data: null,
					loading: false,
					error:
						error instanceof Error
							? error.message
							: "Unknown error occurred",
				});
			}
		};

		fetchDatasetDetail();
	}, [processedDatasetId]);

	return state;
};
