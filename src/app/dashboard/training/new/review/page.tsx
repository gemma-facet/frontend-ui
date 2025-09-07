"use client";

import {
	trainingConfigAtom,
	trainingDatasetIdAtom,
	trainingDatasetModalityAtom,
	trainingHfTokenAtom,
	trainingJobNameAtom,
	trainingModelAtom,
} from "@/atoms";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { constructFullModelId } from "@/lib/models";
import { useAtom } from "jotai";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function TrainingReviewPage() {
	const [model] = useAtom(trainingModelAtom);
	const [datasetId] = useAtom(trainingDatasetIdAtom);
	const [modality] = useAtom(trainingDatasetModalityAtom);
	const [config] = useAtom(trainingConfigAtom);
	const [jobName] = useAtom(trainingJobNameAtom);
	const [hfToken] = useAtom(trainingHfTokenAtom);
	const router = useRouter();
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!model) {
			toast.error("Please select a model first.");
			router.replace("/dashboard/training/new/model");
		} else if (!datasetId) {
			toast.error("Please select a dataset first.");
			router.replace("/dashboard/training/new/dataset");
		} else if (!config) {
			toast.error("Please complete configuration first.");
			router.replace("/dashboard/training/new/configuration");
		} else if (config.export_config.destination === "hfhub" && !hfToken) {
			toast.error("HuggingFace API Key is required.");
			router.replace("/dashboard/training/new/configuration");
		}
	}, [model, datasetId, config, router, hfToken]);
	if (!model || !datasetId || !config) return null;

	const exportDestination = config.export_config.destination || "gcs";

	const handleSubmit = async () => {
		setSubmitting(true);

		if (!hfToken) {
			toast.error("HuggingFace API Key is required.");
			throw new Error("HuggingFace API Key is required.");
		}

		setError(null);
		try {
			// Construct the full model ID with training type suffix and proper provider/quantization
			const baseModelWithType = `${model.modelId}-${model.trainingType}`;
			config.base_model_id = constructFullModelId(
				baseModelWithType,
				model.provider,
				config.method,
			);

			const payload = {
				processed_dataset_id: datasetId,
				job_name: jobName,
				hf_token: hfToken,
				training_config: config,
			};

			const res = await fetch("/api/train", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			if (!res.ok) throw new Error("Failed to submit job");
			router.push("/dashboard/training");
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : String(err));
		} finally {
			setSubmitting(false);
		}
	};

	const SummaryRow = ({
		label,
		value,
		editLink,
	}: {
		label: string;
		value: React.ReactNode;
		editLink: string;
	}) => (
		<div className="flex items-start justify-between gap-2 border-b last:border-b-0 py-3">
			<div>
				<span className="font-medium">{label}:</span> {value}
			</div>
			<Link
				href={editLink}
				className="text-muted-foreground hover:text-foreground"
			>
				<Pencil size={16} />
			</Link>
		</div>
	);

	return (
		<div className="max-w-2xl mx-auto py-10">
			<Card>
				<CardHeader>
					<CardTitle>Review & Submit</CardTitle>
					<CardDescription className="text-muted-foreground">
						Please review your selections before starting the
						training job.
					</CardDescription>
				</CardHeader>
				<CardContent className="divide-y">
					{SummaryRow({
						label: "Model",
						value: model.modelId,
						editLink: "/dashboard/training/new/model",
					})}
					{SummaryRow({
						label: "Provider",
						value: model.provider,
						editLink: "/dashboard/training/new/model",
					})}
					{SummaryRow({
						label: "Model Type",
						value:
							model.trainingType === "it"
								? "Instruction-tuned (IT)"
								: "Pre-trained (PT)",
						editLink: "/dashboard/training/new/model",
					})}
					{SummaryRow({
						label: "Job Name",
						value: jobName || "-",
						editLink: "/dashboard/training/new/configuration",
					})}
					{SummaryRow({
						label: "Modality",
						value: config.modality || "text",
						editLink: "/dashboard/training/new/configuration",
					})}
					{SummaryRow({
						label: "Dataset",
						value: datasetId,
						editLink: "/dashboard/training/new/dataset",
					})}
					{SummaryRow({
						label: "Method",
						value: config.method,
						editLink: "/dashboard/training/new/configuration",
					})}
					{SummaryRow({
						label: "Trainer Type",
						value: config.trainer_type.toUpperCase(),
						editLink: "/dashboard/training/new/configuration",
					})}
					{SummaryRow({
						label: "Export Destination",
						value: exportDestination,
						editLink: "/dashboard/training/new/configuration",
					})}
					{SummaryRow({
						label: "Export Format",
						value: config.export_config.format || "adapter",
						editLink: "/dashboard/training/new/configuration",
					})}
					{config.export_config.include_gguf &&
						SummaryRow({
							label: "Include GGUF Export",
							value: "Yes",
							editLink: "/dashboard/training/new/configuration",
						})}
					{config.export_config.include_gguf &&
						config.export_config.gguf_quantization &&
						SummaryRow({
							label: "GGUF Quantization",
							value: config.export_config.gguf_quantization,
							editLink: "/dashboard/training/new/configuration",
						})}
					{SummaryRow({
						label: "Batch Size",
						value: String(config.hyperparameters.batch_size),
						editLink: "/dashboard/training/new/configuration",
					})}
					{SummaryRow({
						label: "Epochs",
						value: String(config.hyperparameters.epochs),
						editLink: "/dashboard/training/new/configuration",
					})}
					{SummaryRow({
						label: "Learning Rate",
						value: String(config.hyperparameters.learning_rate),
						editLink: "/dashboard/training/new/configuration",
					})}
					{config.eval_config?.eval_strategy &&
						config.eval_config.eval_strategy !== "no" &&
						SummaryRow({
							label: "Evaluation Strategy",
							value: config.eval_config.eval_strategy,
							editLink: "/dashboard/training/new/configuration",
						})}
					{config.eval_config?.compute_eval_metrics &&
						SummaryRow({
							label: "Compute Evaluation Metrics",
							value: "Yes (accuracy, perplexity)",
							editLink: "/dashboard/training/new/configuration",
						})}
					{/* Add more key fields if needed */}
				</CardContent>
				{error && (
					<p className="text-destructive text-sm px-6 py-2">
						{error}
					</p>
				)}
				<CardFooter className="flex flex-col md:flex-row gap-4 justify-end">
					<Button variant="outline" asChild disabled={submitting}>
						<Link href="/dashboard/training/new/configuration">
							Back
						</Link>
					</Button>
					<Button onClick={handleSubmit} disabled={submitting}>
						{submitting ? "Submitting..." : "Submit Training Job"}
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
