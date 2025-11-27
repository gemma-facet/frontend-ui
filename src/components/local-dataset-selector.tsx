import {
	datasetSelectionAtom,
	localDatasetAtom,
	localDatasetColumnsAtom,
	localDatasetIdAtom,
	localDatasetPreviewLoadingAtom,
	localDatasetPreviewRowsAtom,
	localDatasetSizeAtom,
} from "@/atoms";
import type { RawDatasetInfo } from "@/types/dataset";
import { useAtom } from "jotai";
import { Loader2, Settings, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import DatasetPreview from "./dataset-preview";
import { Button } from "./ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

const LocalDatasetSelector = () => {
	const [localDataset, setLocalDataset] = useAtom(localDatasetAtom);
	const [localDatasetPreviewLoading, setLocalDatasetPreviewLoading] = useAtom(
		localDatasetPreviewLoadingAtom,
	);
	const [localDatasetId, setLocalDatasetId] = useAtom(localDatasetIdAtom);
	const [localDatasetPreviewRows, setLocalDatasetPreviewRows] = useAtom(
		localDatasetPreviewRowsAtom,
	);
	const [localDatasetColumns, setLocalDatasetColumns] = useAtom(
		localDatasetColumnsAtom,
	);
	const [localDatasetSize, setLocalDatasetSize] =
		useAtom(localDatasetSizeAtom);
	const [datasetSelection, setDatasetSelection] =
		useAtom(datasetSelectionAtom);
	const router = useRouter();

	// State for raw datasets
	const [rawDatasets, setRawDatasets] = useState<RawDatasetInfo[]>([]);
	const [selectedRawDatasetId, setSelectedRawDatasetId] =
		useState<string>("");
	const [loadingRawDatasets, setLoadingRawDatasets] = useState(false);

	// Fetch raw datasets when component mounts
	useEffect(() => {
		const fetchRawDatasets = async () => {
			setLoadingRawDatasets(true);
			try {
				const response = await fetch("/api/datasets/raw");
				const data = await response.json();
				if (response.ok) {
					setRawDatasets(data.datasets || []);
				} else {
					toast.error("Failed to fetch raw datasets");
				}
			} catch (error) {
				console.error("Error fetching raw datasets:", error);
				toast.error("Failed to fetch raw datasets");
			} finally {
				setLoadingRawDatasets(false);
			}
		};

		fetchRawDatasets();
	}, []);

	const handleLocalDatasetUpload = async () => {
		if (!localDataset) {
			toast.error("Please upload a dataset first");
			return;
		}

		setLocalDatasetPreviewLoading(true);
		setLocalDatasetId("");
		setLocalDatasetPreviewRows([]);
		try {
			const formData = new FormData();
			formData.append("file", localDataset);

			const response = await fetch("/api/datasets/upload", {
				method: "POST",
				body: formData,
			});
			const data = await response.json();

			setLocalDatasetId(data.dataset_id);
			setLocalDatasetPreviewRows(
				data.sample.map((item: Record<string, string>) => ({
					row: item,
				})),
			);
			setLocalDatasetColumns(data.columns);
			setLocalDatasetSize(data.num_examples);
		} catch (error) {
			console.error("Error uploading file:", error);
			toast.error("Failed to upload dataset");
		} finally {
			setLocalDatasetPreviewLoading(false);
		}
	};

	const handleSelectRawDataset = () => {
		if (!selectedRawDatasetId) {
			toast.error("Please select a raw dataset first");
			return;
		}

		// Set the dataset selection and redirect to configuration
		// The process endpoint will handle everything with dataset_id and dataset_source: "upload"
		setDatasetSelection({
			type: "local",
			datasetId: selectedRawDatasetId,
			rows: [],
			columns: [],
			availableSplits: [
				{
					name: "train",
					num_examples: 0,
				},
			],
			modality: "text",
		});

		router.push("/dashboard/datasets/configuration");
	};

	return (
		<div className="space-y-6 mt-6">
			<Tabs defaultValue="upload" className="">
				<TabsList className="w-full grid w-full grid-cols-2">
					<TabsTrigger value="upload">Upload New File</TabsTrigger>
					<TabsTrigger value="existing">
						Select Existing Raw Dataset
					</TabsTrigger>
				</TabsList>

				<TabsContent value="upload">
					<Card>
						<CardHeader>
							<CardTitle>Upload Local Dataset</CardTitle>
							<CardDescription>
								Upload a new local dataset to preprocess it for
								finetuning.
							</CardDescription>
						</CardHeader>
						<CardContent className="flex gap-2 items-end">
							<div className="space-y-3 w-full">
								<Label htmlFor="localDataset">
									Local Dataset
								</Label>
								<Input
									type="file"
									accept=".csv, .json, .jsonl, .parquet, .xlsx, .xls"
									onChange={e => {
										const file = e.target.files?.[0];
										if (file) {
											setLocalDataset(file);
										}
									}}
								/>
							</div>
							<Button
								className="cursor-pointer"
								onClick={handleLocalDatasetUpload}
								disabled={!localDataset}
							>
								{localDatasetPreviewLoading ? (
									<Loader2 className="animate-spin" />
								) : (
									<UploadCloud />
								)}
								Upload Dataset
							</Button>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="existing">
					<Card>
						<CardHeader>
							<CardTitle>Select Existing Raw Dataset</CardTitle>
							<CardDescription>
								Select from previously uploaded raw datasets to
								process for finetuning.
							</CardDescription>
						</CardHeader>
						<CardContent className="flex gap-2 items-end">
							<div className="space-y-3 w-full">
								<Label htmlFor="rawDataset">Raw Dataset</Label>
								{loadingRawDatasets ? (
									<div className="flex items-center gap-2 p-3">
										<Loader2 className="h-4 w-4 animate-spin" />
										<span>Loading raw datasets...</span>
									</div>
								) : rawDatasets.length === 0 ? (
									<div className="p-3 text-sm text-muted-foreground">
										No raw datasets available. Please upload
										a new dataset first.
									</div>
								) : (
									<Select
										value={selectedRawDatasetId}
										onValueChange={setSelectedRawDatasetId}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select a raw dataset" />
										</SelectTrigger>
										<SelectContent>
											{rawDatasets.map(dataset => (
												<SelectItem
													key={dataset.dataset_id}
													value={dataset.dataset_id}
												>
													{dataset.filename}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							</div>
							<Button
								className="cursor-pointer"
								onClick={handleSelectRawDataset}
								disabled={
									!selectedRawDatasetId || loadingRawDatasets
								}
							>
								<Settings />
								Continue to Configuration
							</Button>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{localDatasetPreviewLoading && (
				<div className="flex items-center gap-2 mt-10 justify-center">
					<Loader2 className="h-4 w-4 animate-spin" />
					<span>
						{selectedRawDatasetId
							? "Loading dataset..."
							: "Uploading dataset..."}
					</span>
				</div>
			)}

			{localDatasetPreviewRows.length > 0 &&
				!localDatasetPreviewLoading && (
					<DatasetPreview rows={localDatasetPreviewRows} />
				)}

			{localDatasetPreviewRows.length > 0 &&
				!localDatasetPreviewLoading && (
					<Button
						className="cursor-pointer w-full"
						onClick={() => {
							setDatasetSelection({
								type: "local",
								datasetId: localDatasetId,
								rows: localDatasetPreviewRows,
								columns: localDatasetColumns,
								availableSplits: [
									{
										name: "train",
										num_examples: localDatasetSize,
									},
								],
								// TODO: We do not support local uploaded vision datasets yet!!
								modality: "text",
							});

							router.push("/dashboard/datasets/configuration");
						}}
						disabled={
							!localDatasetId ||
							localDatasetPreviewRows.length === 0
						}
					>
						<Settings /> Finalize dataset and proceed to
						configuration
					</Button>
				)}
		</div>
	);
};

export default LocalDatasetSelector;
