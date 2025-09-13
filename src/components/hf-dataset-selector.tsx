import { InfoIcon, Loader2, Search, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./ui/card";
import { Label } from "./ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

import {
	datasetSelectionAtom,
	hfDatasetColumnsAtom,
	hfDatasetConfigsAtom,
	hfDatasetConfigsLoadingAtom,
	hfDatasetIdAtom,
	hfDatasetPreviewLoadingAtom,
	hfDatasetPreviewRowsAtom,
	hfDatasetSelectedConfigAtom,
	hfDatasetSelectedSplitAtom,
	hfDatasetSplitsAtom,
	hfDatasetSplitsLoadingAtom,
	hfDatasetTokenAtom,
} from "@/atoms";

import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import DatasetPreview from "./dataset-preview";
import DatasetSplits from "./dataset-splits";
import DatasetSubsets from "./dataset-subsets";
import { Input } from "./ui/input";

const HFDatasetSelector = () => {
	const [hfDatasetId, setHfDatasetId] = useAtom(hfDatasetIdAtom);
	const [hfDatasetToken, setHfDatasetToken] = useAtom(hfDatasetTokenAtom);
	const [hfDatasetConfigs, setHfDatasetConfigs] =
		useAtom(hfDatasetConfigsAtom);
	const [hfDatasetConfigsLoading, setHfDatasetConfigsLoading] = useAtom(
		hfDatasetConfigsLoadingAtom,
	);
	const [hfDatasetSelectedConfig, setHfDatasetSelectedConfig] = useAtom(
		hfDatasetSelectedConfigAtom,
	);
	const [hfDatasetSplitsLoading, setHfDatasetSplitsLoading] = useAtom(
		hfDatasetSplitsLoadingAtom,
	);
	const [hfDatasetSplits, setHfDatasetSplits] = useAtom(hfDatasetSplitsAtom);
	const [hfDatasetSelectedSplit, setHfDatasetSelectedSplit] = useAtom(
		hfDatasetSelectedSplitAtom,
	);
	const [hfDatasetPreviewLoading, setHfDatasetPreviewLoading] = useAtom(
		hfDatasetPreviewLoadingAtom,
	);
	const [hfDatasetPreviewRows, setHfDatasetPreviewRows] = useAtom(
		hfDatasetPreviewRowsAtom,
	);
	const [datasetSelection, setDatasetSelection] =
		useAtom(datasetSelectionAtom);
	const [hfDatasetColumns, setHfDatasetColumns] =
		useAtom(hfDatasetColumnsAtom);
	const router = useRouter();

	useEffect(() => {
		const storedHfToken =
			typeof window !== "undefined"
				? localStorage.getItem("hfToken")
				: null;
		if (storedHfToken) {
			setHfDatasetToken(storedHfToken);
		}
	}, [setHfDatasetToken]);

	const handleHfAvailableConfigs = async () => {
		if (!hfDatasetId) {
			toast.error("Please enter a Hugging Face dataset ID", {
				duration: 6000,
			});
			return;
		}

		if (!hfDatasetToken) {
			toast.error("Please enter a Hugging Face dataset token", {
				duration: 6000,
			});
			return;
		}

		setHfDatasetConfigsLoading(true);
		setHfDatasetConfigs([]);
		setHfDatasetSelectedConfig("");
		setHfDatasetSplits([]);
		setHfDatasetSelectedSplit("");

		try {
			const response = await fetch("/api/datasets/hf/config", {
				method: "POST",
				body: JSON.stringify({
					dataset_id: hfDatasetId,
					token: hfDatasetToken,
				}),
			});

			const data = await response.json();

			if (data.error) {
				toast.error(data.error, { duration: 6000 });
				return;
			}

			if (data.configs) {
				setHfDatasetConfigs(data.configs);
				if (data.configs.length > 0) {
					setHfDatasetSelectedConfig(data.configs[0]);
				}
			}
		} catch (error) {
			console.error("Error fetching dataset configs:", error);
			toast.error("Error fetching dataset configs", { duration: 6000 });
		} finally {
			setHfDatasetConfigsLoading(false);
		}
	};

	const handleHfDatasetSplits = async () => {
		if (!hfDatasetId) {
			toast.error("Please enter a Hugging Face dataset ID", {
				duration: 6000,
			});
			return;
		}

		if (!hfDatasetToken) {
			toast.error("Please enter a Hugging Face dataset token", {
				duration: 6000,
			});
			return;
		}

		if (!hfDatasetSelectedConfig) {
			toast.error("Please select a dataset subset", {
				duration: 6000,
			});
			return;
		}

		setHfDatasetSplitsLoading(true);
		setHfDatasetSplits([]);
		setHfDatasetSelectedSplit("");
		setHfDatasetPreviewRows([]);

		try {
			const response = await fetch("/api/datasets/hf/information", {
				method: "POST",
				body: JSON.stringify({
					dataset_id: hfDatasetId,
					config: hfDatasetSelectedConfig,
					token: hfDatasetToken,
				}),
			});

			const data = await response.json();

			if (data.error) {
				toast.error(data.error, { duration: 6000 });
				return;
			}
			if (data.splits) {
				const splitsArray = Object.keys(data.splits).map(split => ({
					name: split,
					num_examples: data.splits[split].num_examples,
				}));

				setHfDatasetSplits(splitsArray);

				if (splitsArray.length > 0) {
					setHfDatasetSelectedSplit(splitsArray[0].name);
				}
			}
		} catch (error) {
			console.error("Error fetching dataset preview:", error);
			toast.error("Error fetching dataset preview", { duration: 6000 });
		} finally {
			setHfDatasetSplitsLoading(false);
		}
	};

	const handleHfDatasetPreview = async () => {
		if (!hfDatasetId) {
			toast.error("Please enter a Hugging Face dataset ID", {
				duration: 6000,
			});
			return;
		}

		if (!hfDatasetSelectedSplit) {
			toast.error("Please select a dataset split", {
				duration: 6000,
			});
			return;
		}

		if (!hfDatasetSelectedConfig) {
			toast.error("Please select a dataset subset", {
				duration: 6000,
			});
			return;
		}

		if (!hfDatasetToken) {
			toast.error("Please enter a Hugging Face dataset token", {
				duration: 6000,
			});
			return;
		}

		setHfDatasetPreviewLoading(true);
		setHfDatasetPreviewRows([]);

		try {
			const datasetPreview = await fetch("/api/datasets/hf/preview", {
				method: "POST",
				body: JSON.stringify({
					dataset_id: hfDatasetId,
					config: hfDatasetSelectedConfig,
					split: hfDatasetSelectedSplit,
					token: hfDatasetToken,
				}),
			});

			const datasetPreviewData = await datasetPreview.json();

			if (datasetPreviewData.error) {
				toast.error(datasetPreviewData.error, { duration: 6000 });
				return;
			}

			if (datasetPreviewData.rows) {
				const rows = datasetPreviewData.rows.map(
					(rowObj: { row: Record<string, unknown> }) => {
						const row: Record<string, unknown> = {};
						for (const [key, value] of Object.entries(
							rowObj.row as Record<string, unknown>,
						)) {
							if (
								typeof value === "object" &&
								value !== null &&
								"src" in value
							) {
								row[key] = value;
							} else if (Array.isArray(value)) {
								row[key] = JSON.stringify(value);
							} else {
								row[key] = String(value);
							}
						}
						return { row };
					},
				);
				setHfDatasetPreviewRows(rows);
				setHfDatasetColumns(datasetPreviewData.columns);
			}
		} catch (error) {
			console.error("Error fetching dataset preview:", error);
			toast.error("Error fetching dataset preview", { duration: 6000 });
		} finally {
			setHfDatasetPreviewLoading(false);
		}
	};
	return (
		<div className="space-y-6">
			<Card className="mt-6">
				<CardHeader>
					<CardTitle>Hugging Face Dataset</CardTitle>
					<CardDescription>
						Enter the ID of the Hugging Face dataset to preprocess
						it for finetuning.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="hfDatasetId">
								Hugging Face Dataset ID
							</Label>
							<Input
								type="text"
								placeholder="Enter a Hugging Face dataset ID"
								value={hfDatasetId || ""}
								onChange={e => setHfDatasetId(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="hfDatasetToken">
								Hugging Face Dataset Token{" "}
								<Tooltip>
									<TooltipTrigger>
										<InfoIcon size={18} />
									</TooltipTrigger>
									<TooltipContent className="w-xs text-center">
										You can set this token in the{" "}
										<Link
											href="/dashboard/profile"
											className="underline hover:no-underline"
										>
											Profile
										</Link>{" "}
										page so it's saved in your browser for
										autofill or manually enter it here.
									</TooltipContent>
								</Tooltip>
							</Label>
							<Input
								type="password"
								placeholder="Enter a Hugging Face dataset token"
								value={hfDatasetToken || ""}
								onChange={e =>
									setHfDatasetToken(e.target.value)
								}
							/>
						</div>
					</div>
					<Button
						className="cursor-pointer"
						onClick={handleHfAvailableConfigs}
						disabled={hfDatasetConfigsLoading || !hfDatasetId}
					>
						{hfDatasetConfigsLoading ? (
							<Loader2 className="animate-spin" />
						) : (
							<Search />
						)}
						Check Available Subsets
					</Button>
				</CardContent>
			</Card>
			{hfDatasetConfigsLoading && (
				<div className="flex items-center gap-2 mt-10 justify-center">
					<Loader2 className="h-4 w-4 animate-spin" />
					<span>Loading dataset subsets...</span>
				</div>
			)}

			{hfDatasetConfigs.length > 0 && !hfDatasetConfigsLoading && (
				<DatasetSubsets
					configs={hfDatasetConfigs}
					selectedConfig={hfDatasetSelectedConfig}
					setSelectedConfig={setHfDatasetSelectedConfig}
					handleDatasetSplits={handleHfDatasetSplits}
				/>
			)}

			{hfDatasetSplitsLoading && (
				<div className="flex items-center gap-2 mt-10 justify-center">
					<Loader2 className="h-4 w-4 animate-spin" />
					<span>Loading dataset splits...</span>
				</div>
			)}

			{hfDatasetSplits.length > 0 && !hfDatasetSplitsLoading && (
				<DatasetSplits
					splits={hfDatasetSplits}
					selectedSplit={hfDatasetSelectedSplit}
					setSelectedSplit={setHfDatasetSelectedSplit}
					handleDatasetPreview={handleHfDatasetPreview}
				/>
			)}

			{hfDatasetPreviewLoading && (
				<div className="flex items-center gap-2 mt-10 justify-center">
					<Loader2 className="h-4 w-4 animate-spin" />
					<span>Loading dataset preview...</span>
				</div>
			)}

			{hfDatasetPreviewRows.length > 0 && !hfDatasetPreviewLoading && (
				<DatasetPreview rows={hfDatasetPreviewRows} />
			)}

			{hfDatasetPreviewRows.length > 0 && !hfDatasetPreviewLoading && (
				<Button
					className="cursor-pointer w-full"
					onClick={() => {
						// Check if any row contains image data (objects with 'src' property)
						const hasImageFeature = hfDatasetPreviewRows.some(
							rowObj =>
								Object.values(rowObj.row).some(
									value =>
										typeof value === "object" &&
										value !== null &&
										"src" in value,
								),
						);
						const modality = hasImageFeature ? "vision" : "text";

						setDatasetSelection({
							type: "huggingface",
							datasetId: hfDatasetId,
							split: hfDatasetSelectedSplit,
							config: hfDatasetSelectedConfig,
							rows: hfDatasetPreviewRows,
							columns: hfDatasetColumns,
							availableSplits: hfDatasetSplits,
							modality: modality,
						});

						router.push("/dashboard/datasets/configuration");
					}}
					disabled={
						!hfDatasetId ||
						!hfDatasetSelectedSplit ||
						!hfDatasetSelectedConfig ||
						hfDatasetPreviewRows.length === 0
					}
				>
					<Settings /> Finalize dataset and proceed to configuration
				</Button>
			)}
		</div>
	);
};

export default HFDatasetSelector;
