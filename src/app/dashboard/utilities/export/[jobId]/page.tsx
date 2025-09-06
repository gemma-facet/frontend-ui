"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ExportJob } from "@/types/export";
import {
	CheckCircleIcon,
	ClockIcon,
	Download,
	FileTextIcon,
	ImageIcon,
	Loader2,
	RefreshCw,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function ExportJobDetailPage() {
	const { jobId } = useParams<{ jobId: string }>();
	const [job, setJob] = useState<ExportJob | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [refreshing, setRefreshing] = useState(false);
	const [exportLoading, setExportLoading] = useState<string | null>(null);

	const cancelled = useRef(false);
	const polling = useRef<NodeJS.Timeout | null>(null);

	// Fetch job data
	useEffect(() => {
		const fetchJob = async () => {
			setLoading(true);
			setError(null);

			try {
				const response = await fetch("/api/export/jobs");
				if (!response.ok) {
					throw new Error("Failed to fetch export jobs");
				}

				const data = await response.json();
				const foundJob = data.jobs.find(
					(j: ExportJob) => j.job_id === jobId,
				);

				if (foundJob) {
					setJob(foundJob);
				} else {
					setError("Export job not found");
				}
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : "Unknown error");
			} finally {
				setLoading(false);
			}
		};

		fetchJob();
	}, [jobId]);

	const fetchJobStatus = useCallback(
		async (manual = false) => {
			if (manual) setRefreshing(true);
			setLoading(true);
			setError(null);

			try {
				const response = await fetch("/api/export/jobs");
				if (!response.ok) {
					throw new Error("Failed to fetch export jobs");
				}

				const data = await response.json();
				const foundJob = data.jobs.find(
					(j: ExportJob) => j.job_id === jobId,
				);

				if (foundJob) {
					setJob(foundJob);

					// If export_status is not null, start polling
					if (foundJob.export_status && !manual) {
						polling.current = setTimeout(
							() => fetchJobStatus(),
							10000,
						);
					}
				} else {
					setError("Export job not found");
				}
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : String(err));
			} finally {
				setLoading(false);
				if (manual) setRefreshing(false);
			}
		},
		[jobId],
	);

	// Start polling if export_status is not null
	useEffect(() => {
		if (job?.export_status && !cancelled.current) {
			polling.current = setTimeout(() => fetchJobStatus(), 10000);
		}

		return () => {
			if (polling.current) {
				clearTimeout(polling.current);
				polling.current = null;
			}
		};
	}, [job?.export_status, fetchJobStatus]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			cancelled.current = true;
			if (polling.current) clearTimeout(polling.current);
		};
	}, []);

	const handleExportRequest = async (
		exportType: "adapter" | "merged" | "gguf",
	) => {
		if (!job || job.export_status) return;

		setExportLoading(exportType);

		try {
			// Simulate API call
			await new Promise(resolve => setTimeout(resolve, 2000));

			// Update job status to show export in progress
			setJob(prev =>
				prev
					? {
							...prev,
							export_status: exportType,
						}
					: null,
			);

			toast.success(`${exportType} export started`);

			// Simulate export completion after 5 seconds
			setTimeout(() => {
				setJob(prev =>
					prev
						? {
								...prev,
								export_status: null,
								export: {
									...prev.export,
									[exportType]: `gs://bucket/models/${exportType}_${prev.job_id}`,
								},
							}
						: null,
				);
				toast.success(`${exportType} export completed`);
			}, 5000);
		} catch (err: unknown) {
			toast.error(`Failed to start ${exportType} export`);
		} finally {
			setExportLoading(null);
		}
	};

	const handleDownload = (
		exportType: "adapter" | "merged" | "gguf",
		path: string,
	) => {
		// Simulate download
		window.open(path, "_blank");
		toast.success(`${exportType} download started`);
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
	const isExporting = !!job.export_status;
	const isProcessing = isExporting || !!exportLoading;

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
				{isProcessing && (
					<Button
						variant="outline"
						size="sm"
						onClick={() => fetchJobStatus(true)}
						disabled={refreshing || isExporting}
						className="flex items-center gap-2"
					>
						<RefreshCw
							className={cn(
								"w-4 h-4",
								(refreshing || isExporting) && "animate-spin",
							)}
						/>
						{refreshing ? "Refreshing..." : "Refresh"}
					</Button>
				)}
			</div>

			{/* Status Banner */}
			<div
				className={cn(
					"p-4 rounded-lg border",
					isExporting
						? "bg-amber-50 border-amber-200"
						: "bg-emerald-50 border-emerald-200",
				)}
			>
				<div className="flex items-center gap-3">
					<div
						className={cn(
							"w-3 h-3 rounded-full",
							isExporting
								? "bg-amber-500 animate-pulse"
								: "bg-emerald-500",
						)}
					/>
					<div>
						<p className="font-medium text-gray-900">
							{isExporting
								? `Exporting ${job.export_status}...`
								: "Ready for export"}
						</p>
						<p className="text-sm text-muted-foreground">
							{isExporting
								? "Export in progress, please wait..."
								: "All export types are available"}
						</p>
					</div>
				</div>
			</div>

			{/* Job Information */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<ModalityIcon className="w-5 h-5 text-muted-foreground" />
						{job.job_name ?? job.job_id}
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
								{job.export?.adapter ? (
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
							{job.export?.adapter ? (
								<Button
									onClick={() =>
										handleDownload(
											"adapter",
											job.export?.adapter || "",
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
									onClick={() =>
										handleExportRequest("adapter")
									}
									disabled={isProcessing}
									className="w-full"
									size="sm"
									variant="outline"
								>
									{exportLoading === "adapter" ? (
										<>
											<Loader2 className="w-4 h-4 mr-2 animate-spin" />
											Creating...
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
								{job.export?.merged ? (
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
							{job.export?.merged ? (
								<Button
									onClick={() =>
										handleDownload(
											"merged",
											job.export?.merged || "",
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
									onClick={() =>
										handleExportRequest("merged")
									}
									disabled={isProcessing}
									className="w-full"
									size="sm"
									variant="outline"
								>
									{exportLoading === "merged" ? (
										<>
											<Loader2 className="w-4 h-4 mr-2 animate-spin" />
											Creating...
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
								{job.export?.gguf ? (
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
							{job.export?.gguf ? (
								<Button
									onClick={() =>
										handleDownload(
											"gguf",
											job.export?.gguf || "",
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
									onClick={() => handleExportRequest("gguf")}
									disabled={isProcessing}
									className="w-full"
									size="sm"
									variant="outline"
								>
									{exportLoading === "gguf" ? (
										<>
											<Loader2 className="w-4 h-4 mr-2 animate-spin" />
											Creating...
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
