"use client";

import { selectedModelAtom } from "@/atoms";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { JobDeleteResponse, TrainingJob } from "@/types/training";
import { useSetAtom } from "jotai";
import { Download, InfoIcon, Loader2, RefreshCw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function JobDetailPage() {
	const params = useParams();
	const router = useRouter();
	const jobId = params.jobId as string;

	const [job, setJob] = useState<TrainingJob | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [refreshing, setRefreshing] = useState(false);
	const setSelectedModel = useSetAtom(selectedModelAtom);
	const [downloadLoading, setDownloadLoading] = useState(false);
	const [downloadError, setDownloadError] = useState<string | null>(null);
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [deleteError, setDeleteError] = useState<string | null>(null);
	const [deleteSuccess, setDeleteSuccess] =
		useState<JobDeleteResponse | null>(null);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [hfToken, setHfToken] = useState<string>("");

	const cancelled = useRef(false);
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

	const fetchStatus = useCallback(
		async (manual = false) => {
			if (manual) setRefreshing(true);
			setLoading(true);
			setError(null);
			try {
				const res = await fetch(`/api/jobs/${jobId}`);
				const data = await res.json();
				if (res.ok) {
					setJob(data);
					if (
						!manual &&
						!cancelled.current &&
						data.status &&
						!["completed", "failed"].includes(data.status)
					) {
						polling.current = setTimeout(() => fetchStatus(), 5000);
					}
				} else {
					setError(data.error || "Failed to fetch job status");
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

	useEffect(() => {
		cancelled.current = false;
		fetchStatus();
		return () => {
			cancelled.current = true;
			if (polling.current) clearTimeout(polling.current);
		};
	}, [fetchStatus]);

	useEffect(() => {
		// stop polling once job is completed or failed
		if (job && ["completed", "failed"].includes(job.status ?? "")) {
			if (polling.current) {
				clearTimeout(polling.current);
				polling.current = null;
			}
		}
	}, [job]);

	async function handleDownload() {
		if (!job?.gguf_path) return;

		setDownloadLoading(true);
		setDownloadError(null);
		try {
			if (job.gguf_path.startsWith("gs://")) {
				// Convert gs:// URL to public GCS URL
				// Format: gs://bucket/path -> https://storage.googleapis.com/bucket/path
				const publicUrl = job.gguf_path.replace(
					"gs://",
					"https://storage.googleapis.com/",
				);

				// Download the file using the public GCS URL
				window.open(publicUrl, "_blank");
			} else {
				// Not a GCS path, treat as HuggingFace repo ID and redirect to HF
				window.open(
					`https://huggingface.co/${job.gguf_path}`,
					"_blank",
				);
			}
		} catch (err: unknown) {
			setDownloadError(err instanceof Error ? err.message : String(err));
		} finally {
			setDownloadLoading(false);
		}
	}

	async function handleDelete() {
		if (
			!confirm(
				"Are you sure you want to delete this job? This action cannot be undone.",
			)
		) {
			return;
		}

		setDeleteLoading(true);
		setDeleteError(null);
		setDeleteSuccess(null);
		try {
			const res = await fetch(`/api/jobs/${jobId}`, {
				method: "DELETE",
			});
			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || "Failed to delete job");
			}

			// Show success popup with deletion details
			setDeleteSuccess(data);
			setShowDeleteDialog(true);

			// Redirect to training dashboard after 5 seconds
			setTimeout(() => {
				window.location.href = "/dashboard/training";
			}, 5000);
		} catch (err: unknown) {
			setDeleteError(err instanceof Error ? err.message : String(err));
		} finally {
			setDeleteLoading(false);
		}
	}

	if (loading)
		return (
			<div className="flex flex-col items-center gap-4 p-8">
				<Loader2 className="w-8 h-8 animate-spin text-blue-500" />
				<span className="text-muted-foreground">
					Polling job status...
				</span>
			</div>
		);
	if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
	if (!job) return <div className="p-8">Job not found.</div>;

	return (
		<div className="max-w-4xl mx-auto py-8 space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						Training Job
					</h1>
					<p className="text-muted-foreground mt-1">
						Monitor and manage your training job
					</p>
				</div>
				<div className="flex gap-3">
					<Button
						variant="outline"
						size="sm"
						onClick={() => fetchStatus(true)}
						disabled={refreshing}
						className="flex items-center gap-2"
					>
						<RefreshCw
							className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
						/>
						Refresh
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={handleDelete}
						disabled={deleteLoading}
						className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
					>
						{deleteLoading ? (
							<Loader2 className="w-4 h-4 animate-spin" />
						) : (
							<Trash2 className="w-4 h-4" />
						)}
						{deleteLoading ? "Deleting..." : "Delete Job"}
					</Button>
					{job.status === "completed" && job.adapter_path && (
						<Button
							variant="default"
							size="sm"
							onClick={() => {
								setSelectedModel({ type: "trained", job });
								router.push("/dashboard/utilities/evaluation");
							}}
							className="flex items-center gap-2"
						>
							Evaluate Model
						</Button>
					)}
				</div>
			</div>

			{/* Status Banner */}
			<div
				className={`p-4 rounded-lg border ${
					job.status === "completed"
						? "bg-green-50 border-green-200"
						: job.status === "failed"
							? "bg-red-50 border-red-200"
							: job.status === "training"
								? "bg-blue-50 border-blue-200"
								: "bg-yellow-50 border-yellow-200"
				}`}
			>
				<div className="flex items-center gap-3">
					<div
						className={`w-3 h-3 rounded-full ${
							job.status === "completed"
								? "bg-green-500"
								: job.status === "failed"
									? "bg-red-500"
									: job.status === "training"
										? "bg-blue-500 animate-pulse"
										: "bg-yellow-500 animate-pulse"
						}`}
					/>
					<div>
						<p className="font-medium capitalize text-gray-900">
							{job.status || "Unknown"}
						</p>
						<p className="text-sm text-muted-foreground">
							{job.status === "completed" &&
								"Training completed successfully"}
							{job.status === "failed" && "Training failed"}
							{job.status === "training" &&
								"Training in progress..."}
							{job.status === "preparing" &&
								"Preparing training environment..."}
							{job.status === "queued" &&
								"Job queued for processing"}
						</p>
					</div>
				</div>
			</div>

			{/* Delete Error */}
			{deleteError && (
				<div className="p-4 rounded-lg border bg-red-50 border-red-200">
					<div className="flex items-center gap-3">
						<div className="w-3 h-3 rounded-full bg-red-500" />
						<div>
							<p className="font-medium text-red-900">
								Delete Failed
							</p>
							<p className="text-sm text-red-700">
								{deleteError}
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Job Information Cards */}
			<div className="grid md:grid-cols-2 gap-6">
				{/* Basic Information */}
				<Card>
					<CardHeader>
						<h3 className="text-lg font-semibold">
							Job Information
						</h3>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-3">
							<div>
								<span className="text-sm font-medium text-muted-foreground">
									Job ID
								</span>
								<p className="text-sm font-mono break-all bg-muted px-2 py-1 rounded mt-1">
									{jobId}
								</p>
							</div>
							{job.job_name && (
								<div>
									<span className="text-sm font-medium text-muted-foreground">
										Job Name
									</span>
									<p className="mt-1">{job.job_name}</p>
								</div>
							)}
							{job.modality && (
								<div>
									<span className="text-sm font-medium text-muted-foreground">
										Modality
									</span>
									<p className="mt-1 capitalize">
										{job.modality}
									</p>
								</div>
							)}
							{job.base_model_id && (
								<div>
									<span className="text-sm font-medium text-muted-foreground">
										Base Model
									</span>
									<p className="text-sm font-mono bg-muted px-2 py-1 rounded mt-1">
										{job.base_model_id}
									</p>
								</div>
							)}
							{job.processed_dataset_id && (
								<div>
									<span className="text-sm font-medium text-muted-foreground">
										Dataset
									</span>
									<p className="text-sm font-mono bg-muted px-2 py-1 rounded mt-1">
										{job.processed_dataset_id}
									</p>
								</div>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Output Information */}
				<Card>
					<CardHeader>
						<h3 className="text-lg font-semibold">
							Output & Resources
						</h3>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-3">
							{job.adapter_path && (
								<div>
									<span className="text-sm font-medium text-muted-foreground">
										Adapter Path
									</span>
									<p className="text-sm font-mono bg-muted px-2 py-1 rounded mt-1 break-all">
										{job.adapter_path}
									</p>
								</div>
							)}
							{job.gguf_path && (
								<div>
									<span className="text-sm font-medium text-muted-foreground">
										GGUF Model
									</span>
									<div className="flex items-center gap-2 mt-1">
										<p className="text-sm font-mono bg-muted px-2 py-1 rounded break-all flex-1">
											{job.gguf_path}
										</p>
										<Button
											size="sm"
											variant="outline"
											onClick={handleDownload}
											disabled={downloadLoading}
											className="flex items-center gap-2 shrink-0"
										>
											{downloadLoading ? (
												<Loader2 className="w-4 h-4 animate-spin" />
											) : (
												<Download className="w-4 h-4" />
											)}
											{downloadLoading
												? "Getting..."
												: job.gguf_path.startsWith(
															"gs://",
														)
													? "Download"
													: "View on HF"}
										</Button>
									</div>
									{downloadError && (
										<div className="text-red-600 text-xs mt-1 p-2 bg-red-50 rounded border border-red-200">
											{downloadError}
										</div>
									)}
								</div>
							)}
							{job.wandb_url && (
								<div>
									<span className="text-sm font-medium text-muted-foreground">
										Weights & Biases
									</span>
									<a
										href={job.wandb_url}
										target="_blank"
										rel="noopener noreferrer"
										className="text-blue-600 hover:text-blue-800 underline text-sm mt-1 block"
									>
										View Training Logs →
									</a>
								</div>
							)}
							{job.error && (
								<div>
									<span className="text-sm font-medium text-red-600">
										Error
									</span>
									<div className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded mt-1 border border-red-200">
										{job.error}
									</div>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Evaluation Metrics */}
			{job.metrics && (
				<Card>
					<CardHeader>
						<h3 className="text-lg font-semibold">
							Evaluation Metrics
						</h3>
						<p className="text-sm text-muted-foreground">
							Performance metrics from training evaluation
						</p>
					</CardHeader>
					<CardContent>
						<div className="grid md:grid-cols-3 gap-4">
							{job.metrics.accuracy !== undefined &&
								job.metrics.accuracy !== null && (
									<div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border">
										<div className="text-2xl font-bold text-blue-700">
											{(
												job.metrics.accuracy * 100
											).toFixed(2)}
											%
										</div>
										<div className="text-sm text-blue-600 font-medium">
											Accuracy
										</div>
									</div>
								)}
							{job.metrics.perplexity !== undefined &&
								job.metrics.perplexity !== null && (
									<div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border">
										<div className="text-2xl font-bold text-green-700">
											{job.metrics.perplexity.toFixed(3)}
										</div>
										<div className="text-sm text-green-600 font-medium">
											Perplexity
										</div>
									</div>
								)}
							{job.metrics.eval_loss !== undefined &&
								job.metrics.eval_loss !== null && (
									<div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border">
										<div className="text-2xl font-bold text-purple-700">
											{job.metrics.eval_loss.toFixed(4)}
										</div>
										<div className="text-sm text-purple-600 font-medium">
											Evaluation Loss
										</div>
									</div>
								)}
							{job.metrics.eval_runtime !== undefined &&
								job.metrics.eval_runtime !== null && (
									<div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border">
										<div className="text-2xl font-bold text-orange-700">
											{job.metrics.eval_runtime.toFixed(
												2,
											)}
											s
										</div>
										<div className="text-sm text-orange-600 font-medium">
											Evaluation Runtime
										</div>
									</div>
								)}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Delete Success Dialog */}
			<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-green-900">
							<div className="w-4 h-4 rounded-full bg-green-500" />
							Job Deleted Successfully
						</DialogTitle>
						<DialogDescription>
							{deleteSuccess?.message}
						</DialogDescription>
					</DialogHeader>

					{deleteSuccess?.deleted_resources &&
						deleteSuccess.deleted_resources.length > 0 && (
							<div className="mt-4">
								<p className="text-sm font-medium text-gray-900 mb-2">
									Deleted Resources:
								</p>
								<div className="max-h-40 overflow-y-auto space-y-1">
									{deleteSuccess.deleted_resources.map(
										(resource: string) => (
											<div
												key={resource}
												className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-700"
											>
												{resource}
											</div>
										),
									)}
								</div>
							</div>
						)}

					<div className="mt-4 flex items-center justify-between">
						<p className="text-xs text-gray-600">
							Redirecting to training dashboard in 5 seconds...
						</p>
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								window.location.href = "/dashboard/training";
							}}
						>
							Go Now
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
