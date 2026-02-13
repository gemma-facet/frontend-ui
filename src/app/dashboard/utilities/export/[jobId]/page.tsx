"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioCardGroup, RadioCardGroupItem } from "@/components/ui/radio-card";
import { useExportMutation } from "@/hooks/useExportMutation";
import { useTrainingJob } from "@/hooks/useTrainingJob";
import { cn } from "@/lib/utils";
import {
	type ExportDestination,
	type ExportType,
	GetExportResponse,
} from "@/types/export";
import {
	CheckCircleIcon,
	ClockIcon,
	Download,
	ExternalLink,
	FileTextIcon,
	ImageIcon,
	Loader2,
	XCircleIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function ExportJobDetailPage() {
	const { jobId } = useParams<{ jobId: string }>();
	const {
		job,
		loading: jobLoading,
		error: jobError,
		refresh: refreshJob,
	} = useTrainingJob(jobId);

	const {
		triggerExport,
		loading: exportLoading,
		error: exportError,
	} = useExportMutation();

	const [exportingType, setExportingType] = useState<ExportType | null>(null);
	const [hfToken, setHfToken] = useState<string>("");

	// Export modal state
	const [selectedExportType, setSelectedExportType] =
		useState<ExportType | null>(null);
	// Explicit destination selections
	const [destGcsSelected, setDestGcsSelected] = useState<boolean>(false);
	const [destHfSelected, setDestHfSelected] = useState<boolean>(false);
	const [hfRepoId, setHfRepoId] = useState<string>("");

	const polling = useRef<NodeJS.Timeout | null>(null);

	// Detect provider from base model ID
	const baseModelParts = job?.base_model_id?.split("/");
	const provider =
		baseModelParts?.[0] === "unsloth" ? "unsloth" : "huggingface";

	// Load HF token from localStorage
	useEffect(() => {
		const storedHfToken =
			typeof window !== "undefined"
				? localStorage.getItem("hfToken")
				: null;
		if (storedHfToken) {
			setHfToken(storedHfToken);
		}
	}, []);

	// Polling logic
	useEffect(() => {
		if (job?.latest_export?.status === "running") {
			polling.current = setTimeout(
				() => refreshJob(undefined, true),
				10000,
			);
		}

		return () => {
			if (polling.current) {
				clearTimeout(polling.current);
				polling.current = null;
			}
		};
	}, [job?.latest_export?.status, refreshJob]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (polling.current) clearTimeout(polling.current);
		};
	}, []);

	const handleExportRequest = async () => {
		if (!jobId || !selectedExportType) return;

		const destination: ExportDestination[] = [];
		if (destGcsSelected) destination.push("gcs");
		if (destHfSelected) destination.push("hf_hub");

		if (destination.length === 0) return;

		setExportingType(selectedExportType);

		try {
			const payload = {
				export_type: selectedExportType,
				destination,
				hf_token: hfToken,
				hf_repo_id: hfRepoId,
			};

			await triggerExport(jobId, payload);

			// After successful request, fetch updated status
			await refreshJob();
			toast.success(`${selectedExportType.toUpperCase()} export started`);

			// Reset state
			setSelectedExportType(null);
			setDestGcsSelected(false);
			setDestHfSelected(false);
			setHfRepoId("");
		} catch (err: unknown) {
			toast.error(
				`Failed to start ${selectedExportType?.toUpperCase()} export`,
			);
		} finally {
			setExportingType(null);
		}
	};

	const handleDownload = (path: string) => {
		// Simulate download
		window.open(path, "_blank");
		toast.success("Download started");
	};

	const handleViewHFRepo = (repoId: string) => {
		window.open(`https://huggingface.co/${repoId}`, "_blank");
	};

	// Helper functions to check if exports are available
	const isExportAvailable = (
		exportType: ExportType,
		destination: ExportDestination,
	) => {
		if (!job?.artifacts) return false;

		if (destination === "gcs") {
			return !!job.artifacts.file?.[exportType];
		}
		if (destination === "hf_hub") {
			return !!job.artifacts.hf?.[exportType];
		}
		return false;
	};

	const getExportPath = (
		exportType: ExportType,
		destination: ExportDestination,
	) => {
		if (!job?.artifacts) return "";

		if (destination === "gcs") {
			return job.artifacts.file?.[exportType] || "";
		}
		if (destination === "hf_hub") {
			return job.artifacts.hf?.[exportType] || "";
		}
		return "";
	};

	const canExport = () => {
		// Can export if not currently exporting and HF token is available when needed
		return !exportingType && (!!hfToken || !destHfSelected);
	};

	if (jobLoading && !job) {
		return (
			<div className="flex flex-col items-center gap-4 p-8">
				<Loader2 className="w-8 h-8 animate-spin text-blue-500" />
				<span className="text-muted-foreground">
					Loading export job...
				</span>
			</div>
		);
	}

	if (jobError) {
		return <div className="p-8 text-red-600">Error: {jobError}</div>;
	}

	if (!job) {
		return <div className="p-8">Export job not found.</div>;
	}

	const ModalityIcon = job.modality === "vision" ? ImageIcon : FileTextIcon;

	// Determine if we should show banner and what type
	const getBannerInfo = () => {
		// If currently exporting (waiting for response), show pending banner
		if (exportingType) {
			return {
				show: true,
				color: "border-yellow-300",
				bgColor: "bg-yellow-500",
				title: "Pending",
				message: `Exporting ${exportingType}`,
				showSpinner: true,
			};
		}

		// If no latest_export, don't show banner
		if (!job.latest_export) {
			return { show: false };
		}

		const { status, type, message } = job.latest_export;

		if (status === "completed") {
			return {
				show: true,
				color: "border-emerald-300",
				bgColor: "bg-emerald-500",
				title: `${type.toUpperCase()} was exported in the most recent export job`,
				message: message || "",
				iconType: "success",
			};
		}

		if (status === "failed") {
			return {
				show: true,
				color: "border-red-300",
				bgColor: "bg-red-500",
				title: `Error occurred when exporting ${type}`,
				message: message || "",
				iconType: "error",
			};
		}

		if (status === "running") {
			return {
				show: true,
				color: "border-blue-300",
				bgColor: "bg-blue-500",
				title: `Exporting ${type}`,
				message: message || "",
				showSpinner: true,
			};
		}

		return { show: false };
	};

	const bannerInfo = getBannerInfo();

	return (
		<div className="max-w-4xl mx-auto py-8 space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						Export Job
					</h1>
					<p className="text-muted-foreground mt-1">
						Manage and download your model exports
					</p>
				</div>
			</div>

			{/* Job Information */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<ModalityIcon className="w-5 h-5 text-muted-foreground" />
						{job.job_name}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<p className="text-sm font-medium text-muted-foreground mb-1">
							Base model
						</p>
						<p className="text-sm font-mono bg-muted px-2 py-1 rounded">
							{job.base_model_id}
						</p>
					</div>
					<div>
						<p className="text-sm font-medium text-muted-foreground mb-1">
							Job ID
						</p>
						<p className="text-sm font-mono bg-muted px-2 py-1 rounded">
							{jobId}
						</p>
					</div>
				</CardContent>
			</Card>

			{/* Status Banner - Only show when needed */}
			{bannerInfo.show && (
				<div
					className={cn("p-4 rounded-lg border-2", bannerInfo.color)}
				>
					<div className="flex items-center gap-4">
						{bannerInfo.showSpinner ? (
							<Loader2 className="w-4 h-4 animate-spin text-current" />
						) : bannerInfo.iconType === "success" ? (
							<CheckCircleIcon className="w-5 h-5 text-emerald-500" />
						) : bannerInfo.iconType === "error" ? (
							<XCircleIcon className="w-5 h-5 text-red-500" />
						) : (
							<div
								className={cn(
									"w-3 h-3 rounded-full min-w-3",
									bannerInfo.bgColor,
								)}
							/>
						)}
						<div>
							<p className="font-medium">{bannerInfo.title}</p>
							{bannerInfo.message && (
								<p className="text-sm text-muted-foreground">
									{bannerInfo.message}
								</p>
							)}
						</div>
					</div>
				</div>
			)}

			{/* HF Token Required Notice - Show when token is missing */}
			{!hfToken && (
				<Card className="border-amber-200 bg-amber-50">
					<CardContent className="pt-6">
						<div className="flex items-center gap-3">
							<XCircleIcon className="w-5 h-5 text-amber-600" />
							<div>
								<p className="font-medium text-amber-800">
									HuggingFace API Key Required
								</p>
								<p className="text-sm text-amber-700 mt-1">
									Please set up your HuggingFace API key in
									your{" "}
									<Link
										href="/dashboard/profile"
										className="underline hover:no-underline font-medium"
									>
										Profile
									</Link>{" "}
									to continue with exports.
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Create Export Card - visible only if no running export */}
			{(!job.latest_export ||
				job.latest_export.status === "completed" ||
				job.latest_export.status === "failed") && (
				<Card>
					<CardHeader>
						<CardTitle>Create Export</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<Label className="text-sm font-medium mb-3 block">
								Select what to export
							</Label>
							<RadioCardGroup
								value={selectedExportType || ""}
								onValueChange={value =>
									setSelectedExportType(value as ExportType)
								}
								className="grid grid-cols-3 gap-2"
							>
								<RadioCardGroupItem
									value="adapter"
									id="export-adapter"
								>
									Adapter
								</RadioCardGroupItem>
								<RadioCardGroupItem
									value="merged"
									id="export-merged"
								>
									Merged
								</RadioCardGroupItem>
								<RadioCardGroupItem
									value="gguf"
									id="export-gguf"
								>
									GGUF
								</RadioCardGroupItem>
							</RadioCardGroup>
						</div>

						<div>
							<Label className="text-sm font-medium mb-3 block">
								Select destination(s)
							</Label>
							<div className="space-y-3">
								<div className="flex items-center space-x-2">
									<Checkbox
										id="dest-gcs"
										checked={destGcsSelected}
										onCheckedChange={checked =>
											setDestGcsSelected(Boolean(checked))
										}
										disabled={
											!!selectedExportType &&
											isExportAvailable(
												selectedExportType,
												"gcs",
											)
										}
									/>
									<Label
										htmlFor="dest-gcs"
										className="text-sm"
									>
										Direct Download (GCS)
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<Checkbox
										id="dest-hf"
										checked={destHfSelected}
										onCheckedChange={checked =>
											setDestHfSelected(Boolean(checked))
										}
									/>
									<Label
										htmlFor="dest-hf"
										className="text-sm"
									>
										Hugging Face Hub
									</Label>
								</div>
							</div>
						</div>

						{destHfSelected && (
							<div>
								<Label
									htmlFor="hf_repo_id"
									className="text-sm font-medium"
								>
									HF Repository ID
								</Label>
								<Input
									id="hf_repo_id"
									placeholder="username/model-name"
									value={hfRepoId}
									onChange={e => setHfRepoId(e.target.value)}
									className="mt-1"
								/>
							</div>
						)}

						<div className="flex justify-end gap-2 pt-2">
							<Button
								onClick={handleExportRequest}
								disabled={
									!selectedExportType ||
									(!destGcsSelected && !destHfSelected) ||
									(destHfSelected && !hfRepoId.trim()) ||
									(destHfSelected && !hfToken) ||
									!!exportingType
								}
							>
								{exportingType ? (
									<>
										<Loader2 className="w-4 h-4 mr-2 animate-spin" />
										Starting export...
									</>
								) : (
									"Start Export"
								)}
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Export Types */}
			<Card>
				<CardHeader>
					<CardTitle>Export Types</CardTitle>
					<p className="text-sm text-muted-foreground">
						Download or request exports for your trained model
					</p>
				</CardHeader>
				<CardContent>
					<div className="grid md:grid-cols-3 gap-6">
						{/* Adapter Export */}
						<div className="border rounded-lg p-6 space-y-4">
							<div className="flex items-center justify-between">
								<h3 className="font-medium text-lg">Adapter</h3>
							</div>
							<p className="text-sm text-muted-foreground">
								LoRA adapter weights for fine-tuning
							</p>

							{/* GCS Export */}
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium">
										Direct Download (GCS)
									</span>
								</div>
								{isExportAvailable("adapter", "gcs") ? (
									<Button
										onClick={() =>
											handleDownload(
												getExportPath("adapter", "gcs"),
											)
										}
										className="w-full"
										size="sm"
									>
										<Download className="w-4 h-4 mr-2" />
										Download
									</Button>
								) : (
									<Button
										disabled
										className="w-full"
										size="sm"
										variant="outline"
									>
										Not available
									</Button>
								)}
							</div>

							{/* HF Hub Export */}
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium">
										Hugging Face Hub
									</span>
								</div>
								{isExportAvailable("adapter", "hf_hub") ? (
									<Button
										onClick={() =>
											handleViewHFRepo(
												getExportPath(
													"adapter",
													"hf_hub",
												),
											)
										}
										className="w-full"
										size="sm"
										variant="outline"
									>
										<ExternalLink className="w-4 h-4 mr-2" />
										View on HF
									</Button>
								) : (
									<Button
										disabled
										className="w-full"
										size="sm"
										variant="outline"
									>
										Not available
									</Button>
								)}
							</div>
						</div>

						{/* Merged Export */}
						<div className="border rounded-lg p-6 space-y-4">
							<div className="flex items-center justify-between">
								<h3 className="font-medium text-lg">
									Merged Model
								</h3>
							</div>
							<p className="text-sm text-muted-foreground">
								Complete merged model ready for inference
							</p>

							{/* GCS Export */}
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium">
										Direct Download (GCS)
									</span>
								</div>
								{isExportAvailable("merged", "gcs") ? (
									<Button
										onClick={() =>
											handleDownload(
												getExportPath("merged", "gcs"),
											)
										}
										className="w-full"
										size="sm"
									>
										<Download className="w-4 h-4 mr-2" />
										Download
									</Button>
								) : (
									<Button
										disabled
										className="w-full"
										size="sm"
										variant="outline"
									>
										Not available
									</Button>
								)}
							</div>

							{/* HF Hub Export */}
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium">
										Hugging Face Hub
									</span>
								</div>
								{isExportAvailable("merged", "hf_hub") ? (
									<Button
										onClick={() =>
											handleViewHFRepo(
												getExportPath(
													"merged",
													"hf_hub",
												),
											)
										}
										className="w-full"
										size="sm"
										variant="outline"
									>
										<ExternalLink className="w-4 h-4 mr-2" />
										View on HF
									</Button>
								) : (
									<Button
										disabled
										className="w-full"
										size="sm"
										variant="outline"
									>
										Not available
									</Button>
								)}
							</div>
						</div>

						{/* GGUF Export */}
						<div className="border rounded-lg p-6 space-y-4">
							<div className="flex items-center justify-between">
								<h3 className="font-medium text-lg">GGUF</h3>
							</div>
							<p className="text-sm text-muted-foreground">
								Quantized model for efficient inference
							</p>

							{/* GCS Export */}
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium">
										Direct Download (GCS)
									</span>
								</div>
								{isExportAvailable("gguf", "gcs") ? (
									<Button
										onClick={() =>
											handleDownload(
												getExportPath("gguf", "gcs"),
											)
										}
										className="w-full"
										size="sm"
									>
										<Download className="w-4 h-4 mr-2" />
										Download
									</Button>
								) : (
									<Button
										disabled
										className="w-full"
										size="sm"
										variant="outline"
									>
										Not available
									</Button>
								)}
							</div>

							{/* HF Hub Export */}
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium">
										Hugging Face Hub
									</span>
								</div>
								{isExportAvailable("gguf", "hf_hub") ? (
									<Button
										onClick={() =>
											handleViewHFRepo(
												getExportPath("gguf", "hf_hub"),
											)
										}
										className="w-full"
										size="sm"
										variant="outline"
									>
										<ExternalLink className="w-4 h-4 mr-2" />
										View on HF
									</Button>
								) : (
									<Button
										disabled
										className="w-full"
										size="sm"
										variant="outline"
									>
										Not available
									</Button>
								)}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
