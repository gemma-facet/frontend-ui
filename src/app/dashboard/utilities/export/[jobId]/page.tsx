"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { GetExportResponse } from "@/types/export";
import {
	CheckCircleIcon,
	ClockIcon,
	Download,
	FileTextIcon,
	ImageIcon,
	Loader2,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function ExportJobDetailPage() {
	const { jobId } = useParams<{ jobId: string }>();
	const [job, setJob] = useState<GetExportResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [exportingType, setExportingType] = useState<
		"adapter" | "merged" | "gguf" | null
	>(null);

	const polling = useRef<NodeJS.Timeout | null>(null);

	// Fetch job data
	useEffect(() => {
		const fetchJob = async () => {
			setLoading(true);
			setError(null);

			try {
				const response = await fetch(`/api/exports/${jobId}`);
				if (!response.ok) {
					throw new Error("Failed to fetch export job");
				}

				const data: GetExportResponse = await response.json();
				setJob(data);
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : "Unknown error");
			} finally {
				setLoading(false);
			}
		};

		fetchJob();
	}, [jobId]);

	const fetchJobStatus = useCallback(async () => {
		try {
			const response = await fetch(`/api/exports/${jobId}`);
			if (!response.ok) {
				throw new Error("Failed to fetch export job");
			}

			const data: GetExportResponse = await response.json();
			setJob(data);
			console.log(data);

			// If latest_export status is running, schedule next poll in 10 seconds
			if (data.latest_export?.status === "running") {
				polling.current = setTimeout(() => fetchJobStatus(), 10000);
			}
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : String(err));
		}
	}, [jobId]);

	// Start polling if latest_export status is running
	useEffect(() => {
		if (job?.latest_export?.status === "running") {
			polling.current = setTimeout(() => fetchJobStatus(), 10000);
		}

		return () => {
			if (polling.current) {
				clearTimeout(polling.current);
				polling.current = null;
			}
		};
	}, [job?.latest_export?.status, fetchJobStatus]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (polling.current) clearTimeout(polling.current);
		};
	}, []);

	const handleExportRequest = async (
		exportType: "adapter" | "merged" | "gguf",
	) => {
		if (!job || exportingType) return;

		setExportingType(exportType);

		try {
			const response = await fetch("/api/exports", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					job_id: job.job_id,
					export_type: exportType,
					hf_token: undefined, // Add HF token if needed
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Export request failed");
			}

			// After successful request, fetch updated status
			await fetchJobStatus();
			toast.success(`${exportType.toUpperCase()} export started`);
		} catch (err: unknown) {
			toast.error(`Failed to start ${exportType.toUpperCase()} export`);
		} finally {
			setExportingType(null);
		}
	};

	const handleDownload = (
		exportType: "adapter" | "merged" | "gguf",
		path: string,
	) => {
		// Simulate download
		window.open(path, "_blank");
		toast.success(`${exportType.toUpperCase()} download started`);
	};

	if (loading) {
		return (
			<div className="flex flex-col items-center gap-4 p-8">
				<Loader2 className="w-8 h-8 animate-spin text-blue-500" />
				<span className="text-muted-foreground">
					Loading export job...
				</span>
			</div>
		);
	}

	if (error) {
		return <div className="p-8 text-red-600">Error: {error}</div>;
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
			};
		}

		if (status === "failed") {
			return {
				show: true,
				color: "border-red-300",
				bgColor: "bg-red-500",
				title: `Error occurred when exporting ${type}`,
				message: message || "",
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

	// Disable export buttons if any export is running or we're waiting for response
	const shouldDisableExportButtons =
		!!exportingType || job.latest_export?.status === "running";

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
						{job.job_id}
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
						<p className="text-xs font-mono bg-muted px-2 py-1 rounded">
							{job.job_id}
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

			{/* Export Types */}
			<Card>
				<CardHeader>
					<CardTitle>Export Types</CardTitle>
					<p className="text-sm text-muted-foreground">
						Download or request exports for your trained model
					</p>
				</CardHeader>
				<CardContent>
					<div className="grid md:grid-cols-3 gap-4">
						{/* Adapter Export */}
						<div className="border rounded-lg p-4 space-y-3">
							<div className="flex items-center justify-between">
								<h3 className="font-medium">Adapter</h3>
								{job.artifacts?.file?.adapter ? (
									<Badge
										variant="default"
										className="bg-white"
									>
										<CheckCircleIcon className="w-3 h-3 mr-1" />
										Available
									</Badge>
								) : (
									<Badge variant="outline">
										<ClockIcon className="w-3 h-3 mr-1" />
										Not available
									</Badge>
								)}
							</div>
							<p className="text-sm text-muted-foreground">
								LoRA adapter weights for fine-tuning
							</p>
							{job.artifacts?.file?.adapter ? (
								<Button
									onClick={() =>
										handleDownload(
											"adapter",
											job.artifacts?.file?.adapter || "",
										)
									}
									className="w-full"
									size="sm"
								>
									<Download />
									Download
								</Button>
							) : (
								<Button
									onClick={() =>
										handleExportRequest("adapter")
									}
									disabled={shouldDisableExportButtons}
									className="w-full"
									size="sm"
									variant="outline"
								>
									{exportingType === "adapter" ? (
										<>
											<Loader2 className="animate-spin" />
											Export
										</>
									) : (
										"Create Export"
									)}
								</Button>
							)}
						</div>

						{/* Merged Export */}
						<div className="border rounded-lg p-4 space-y-3">
							<div className="flex items-center justify-between">
								<h3 className="font-medium">Merged Model</h3>
								{job.artifacts?.file?.merged ? (
									<Badge
										variant="default"
										className="bg-white"
									>
										<CheckCircleIcon className="w-3 h-3 mr-1" />
										Available
									</Badge>
								) : (
									<Badge variant="outline">
										<ClockIcon className="w-3 h-3 mr-1" />
										Not available
									</Badge>
								)}
							</div>
							<p className="text-sm text-muted-foreground">
								Complete merged model ready for inference
							</p>
							{job.artifacts?.file?.merged ? (
								<Button
									onClick={() =>
										handleDownload(
											"merged",
											job.artifacts?.file?.merged || "",
										)
									}
									className="w-full"
									size="sm"
								>
									<Download />
									Download
								</Button>
							) : (
								<Button
									onClick={() =>
										handleExportRequest("merged")
									}
									disabled={shouldDisableExportButtons}
									className="w-full"
									size="sm"
									variant="outline"
								>
									{exportingType === "merged" ? (
										<>
											<Loader2 className="animate-spin" />
											Export
										</>
									) : (
										"Create Export"
									)}
								</Button>
							)}
						</div>

						{/* GGUF Export */}
						<div className="border rounded-lg p-4 space-y-3">
							<div className="flex items-center justify-between">
								<h3 className="font-medium">GGUF</h3>
								{job.artifacts?.file?.gguf ? (
									<Badge
										variant="default"
										className="bg-white"
									>
										<CheckCircleIcon className="w-3 h-3 mr-1" />
										Available
									</Badge>
								) : (
									<Badge variant="outline">
										<ClockIcon className="w-3 h-3 mr-1" />
										Not available
									</Badge>
								)}
							</div>
							<p className="text-sm text-muted-foreground">
								Quantized model for efficient inference
							</p>
							{job.artifacts?.file?.gguf ? (
								<Button
									onClick={() =>
										handleDownload(
											"gguf",
											job.artifacts?.file?.gguf || "",
										)
									}
									className="w-full"
									size="sm"
								>
									<Download />
									Download
								</Button>
							) : (
								<Button
									onClick={() => handleExportRequest("gguf")}
									disabled={shouldDisableExportButtons}
									className="w-full"
									size="sm"
									variant="outline"
								>
									{exportingType === "gguf" ? (
										<>
											<Loader2 className="animate-spin" />
											Export
										</>
									) : (
										"Create Export"
									)}
								</Button>
							)}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
