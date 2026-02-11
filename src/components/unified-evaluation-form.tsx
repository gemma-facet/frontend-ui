"use client";

import { useVllmAtom } from "@/atoms";
import { MessageDisplay } from "@/components/message-display";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	getDatasetAdapter,
	getGroundTruth,
	getInferenceMessages,
} from "@/lib/dataset-adapters";
import { constructFullModelId } from "@/lib/models";
import type {
	DatasetDetail,
	DatasetMessage,
	DatasetSample,
	DatasetSplit,
} from "@/types/dataset";
import type {
	BatchInferenceRequest,
	BatchInferenceResponse,
	EvaluationRequest,
	EvaluationResponse,
	MetricType,
	ModelType,
	SampleResult,
	TaskType,
} from "@/types/inference";
import type { TrainingJob } from "@/types/training";
import { useAtom } from "jotai";
import { InfoIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { type ReactElement, useEffect, useState } from "react";
import { toast } from "sonner";

export interface ModelConfig {
	modelSource?: string;
	modelType?: ModelType;
	baseModelId?: string;
	job?: TrainingJob;
	useUnsloth?: boolean;
	useQuantization?: boolean;
	usePreTrained?: boolean;
	initialDatasetId?: string;
}

interface UnifiedEvaluationFormProps extends ModelConfig {
	isComparison?: boolean;
	// Comparison configs
	model1Config?: ModelConfig;
	model2Config?: ModelConfig;

	// Common props
	evaluationMode: "metrics" | "batch_inference";

	// Deprecated props (kept temporarily to avoid breaking build before parent update)
	isComparisonMaster?: boolean;
	modelLabel?: string;
	sharedDatasetId?: string;
	preSelectedSamples?: DatasetSample[];
	onDatasetChange?: (id: string) => void;
	onSamplesChange?: (samples: DatasetSample[]) => void;
}

const TASK_TYPES: { value: TaskType; label: string }[] = [
	{ value: "conversation", label: "Conversation" },
	{ value: "qa", label: "Question Answering" },
	{ value: "summarization", label: "Summarization" },
	{ value: "translation", label: "Translation" },
	{ value: "classification", label: "Classification" },
	{ value: "general", label: "General" },
];

const METRIC_TYPES: { value: MetricType; label: string }[] = [
	{ value: "bleu", label: "BLEU" },
	{ value: "rouge", label: "ROUGE" },
	{ value: "bertscore", label: "BERTScore" },
	{ value: "meteor", label: "METEOR" },
	{ value: "accuracy", label: "Accuracy" },
	{ value: "exact_match", label: "Exact Match" },
	{ value: "f1", label: "F1 Score" },
	{ value: "precision", label: "Precision" },
	{ value: "recall", label: "Recall" },
];

function getSampleKey(sample: DatasetSample): string {
	try {
		return JSON.stringify(sample.messages || sample.prompt || sample);
	} catch {
		return String(Math.random());
	}
}

// Helper to safely format content (reference/ground truth) that might be a string or a DatasetMessage object.
// This handles runtime type differences between metrics evaluation and batch inference modes.
function formatContent(
	val:
		| string
		| DatasetMessage
		| null
		| undefined
		| { content?: string | unknown },
): string {
	if (val === null || val === undefined) return "";
	if (typeof val === "string") return val;
	const content = val.content;
	if (typeof content === "string") return content;
	if (content) return JSON.stringify(content);
	return JSON.stringify(val);
}

export default function UnifiedEvaluationForm({
	job,
	modelSource,
	modelType,
	baseModelId,
	useUnsloth,
	useQuantization,
	usePreTrained,
	initialDatasetId,
	isComparison,
	model1Config,
	model2Config,
	// Deprecated props
	isComparisonMaster,
	modelLabel,
	sharedDatasetId,
	evaluationMode,
	preSelectedSamples,
	onDatasetChange,
	onSamplesChange,
}: UnifiedEvaluationFormProps) {
	// Helper to reconstruct model ID
	const getReconstructedId = (
		c: ModelConfig | UnifiedEvaluationFormProps,
	) => {
		const originalBase = c.baseModelId || c.job?.base_model_id;
		if (!originalBase) return "";

		if (c.modelType === "base") {
			const provider = c.useUnsloth ? "unsloth" : "huggingface";
			const method = c.useQuantization ? "QLoRA" : "LoRA";
			const trainingType = c.usePreTrained ? "pt" : "it";
			return constructFullModelId(
				`${originalBase}-${trainingType}`,
				provider,
				method,
			);
		}
		return originalBase;
	};

	const singleModelId = getReconstructedId({
		baseModelId,
		job,
		modelType,
		useUnsloth,
		useQuantization,
		usePreTrained,
	});

	const model1Id = model1Config ? getReconstructedId(model1Config) : "";
	const model2Id = model2Config ? getReconstructedId(model2Config) : "";

	// Use single model ID or override if in legacy slave mode
	const reconstructedBaseModelId = singleModelId;

	const effectiveDatasetId =
		sharedDatasetId || initialDatasetId || job?.processed_dataset_id || "";

	const [dataset, setDataset] = useState<string>(effectiveDatasetId);
	const [evaluationType, setEvaluationType] = useState<string>("task");
	const [taskType, setTaskType] = useState<TaskType>("general");
	const [selectedMetrics, setSelectedMetrics] = useState<Set<MetricType>>(
		new Set(["rouge", "bleu"]),
	);
	const [maxSamples, setMaxSamples] = useState<number>(100);
	const [numSampleResults, setNumSampleResults] = useState<number>(3);
	const [loading, setLoading] = useState(false);
	const [results, setResults] = useState<
		EvaluationResponse | BatchInferenceResponse | null
	>(null);

	// Comparison state
	const [comparisonResults, setComparisonResults] = useState<{
		model1: EvaluationResponse | BatchInferenceResponse | null;
		model2: EvaluationResponse | BatchInferenceResponse | null;
	} | null>(null);

	const [comparisonLoading, setComparisonLoading] = useState<{
		model1: boolean;
		model2: boolean;
	}>({ model1: false, model2: false });

	const [error, setError] = useState<string | null>(null);
	const [hfToken, setHfToken] = useState<string>("");
	const [useVllm, setUseVllm] = useAtom(useVllmAtom);

	// Batch inference specific state
	const [detail, setDetail] = useState<DatasetDetail | null>(null);
	const [splits, setSplits] = useState<DatasetSplit[]>([]);
	const [selectedSplit, setSelectedSplit] = useState<string>("");
	const [samples, setSamples] = useState<DatasetSample[]>([]);
	const [selected, setSelected] = useState<DatasetSample[]>(
		preSelectedSamples || [],
	);

	useEffect(() => {
		onDatasetChange?.(dataset);
	}, [dataset, onDatasetChange]);

	useEffect(() => {
		onSamplesChange?.(selected);
	}, [selected, onSamplesChange]);

	function handleMetricToggle(metric: MetricType) {
		setSelectedMetrics(prev => {
			const newSet = new Set(prev);
			if (newSet.has(metric)) {
				newSet.delete(metric);
			} else {
				newSet.add(metric);
			}
			return newSet;
		});
	}

	const provider =
		reconstructedBaseModelId?.split("/")[0] === "unsloth"
			? "unsloth"
			: "huggingface";

	useEffect(() => {
		const storedHfToken =
			typeof window !== "undefined"
				? localStorage.getItem("hfToken")
				: null;
		if (storedHfToken) {
			setHfToken(storedHfToken);
		}
	}, []);

	useEffect(() => {
		if (preSelectedSamples) {
			setSelected(preSelectedSamples);
		}
	}, [preSelectedSamples]);

	// Load dataset samples for batch inference mode
	async function fetchSamples() {
		if (evaluationMode !== "batch_inference") return;

		setLoading(true);
		setError(null);
		try {
			const res = await fetch(
				`/api/datasets/${encodeURIComponent(dataset)}`,
			);
			const data = await res.json();
			if (!res.ok)
				throw new Error(data.error || "Failed to fetch dataset");

			const detailData = data as DatasetDetail;
			setDetail(detailData);
			setSplits(detailData.splits);
			if (detailData.splits.length > 0) {
				const first = detailData.splits[0];
				setSelectedSplit(first.split_name);
				// Filter samples that have any valid input messages (any dataset type)
				const validSamples = first.samples.filter(sample => {
					const adapter = getDatasetAdapter(sample);
					return adapter.getInputMessages(sample).length > 0;
				});
				setSamples(validSamples.slice(0, 5));
				setSelected([]);
				setResults(null);
			}
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : String(err));
		} finally {
			setLoading(false);
		}
	}

	function handleSplitChange(splitName: string) {
		setSelectedSplit(splitName);
		const split = splits.find(s => s.split_name === splitName);
		// Filter samples that have any valid input messages (any dataset type)
		const validSamples =
			split?.samples.filter(sample => {
				const adapter = getDatasetAdapter(sample);
				return adapter.getInputMessages(sample).length > 0;
			}) || [];
		setSamples(validSamples.slice(0, 5));
		setSelected([]);
		setResults(null);
	}

	function toggleSampleSelection(sample: DatasetSample) {
		setSelected(prev => {
			const exists = prev.some(
				s => getSampleKey(s) === getSampleKey(sample),
			);
			if (exists) {
				return prev.filter(
					s => getSampleKey(s) !== getSampleKey(sample),
				);
			}
			return [...prev, sample];
		});
	}

	async function performEvaluation(
		config: ModelConfig | UnifiedEvaluationFormProps,
		id: string,
	) {
		const effectiveModelSource =
			config.modelType === "base" ? id : config.modelSource;

		if (!effectiveModelSource || !config.modelType || !id) {
			throw new Error("Incomplete model configuration");
		}

		const endpoint =
			evaluationMode === "metrics"
				? "/api/evaluation"
				: "/api/inference/batch";

		const commonBody = {
			model_source: effectiveModelSource,
			model_type: config.modelType,
			base_model_id: id,
			dataset_id: dataset,
			hf_token: hfToken,
			use_vllm: useVllm,
		};

		let requestBody: EvaluationRequest | BatchInferenceRequest;

		if (evaluationMode === "metrics") {
			const metricsBody: EvaluationRequest = {
				...commonBody,
				max_samples: maxSamples,
				num_sample_results: numSampleResults,
			};
			if (evaluationType === "task") {
				metricsBody.task_type = taskType;
			} else {
				metricsBody.metrics = Array.from(selectedMetrics);
			}
			requestBody = metricsBody;
		} else {
			requestBody = {
				...commonBody,
				messages: selected.map(sample => getInferenceMessages(sample)),
			};
		}

		const response = await fetch(endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(requestBody),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(
				errorData.error ||
					`Request failed with status ${response.status}`,
			);
		}

		return await response.json();
	}

	async function runEvaluation() {
		setLoading(true);
		setComparisonLoading({ model1: true, model2: true });
		setError(null);
		setResults(null);
		setComparisonResults(null);

		try {
			if (isComparison && model1Config && model2Config) {
				const [p1, p2] = await Promise.allSettled([
					performEvaluation(model1Config, model1Id),
					performEvaluation(model2Config, model2Id),
				]);

				const errors: string[] = [];
				if (p1.status === "rejected") {
					const reason =
						p1.reason instanceof Error
							? p1.reason.message
							: String(p1.reason);
					errors.push(`Model 1: ${reason}`);
				}
				if (p2.status === "rejected") {
					const reason =
						p2.reason instanceof Error
							? p2.reason.message
							: String(p2.reason);
					errors.push(`Model 2: ${reason}`);
				}

				if (errors.length > 0) throw new Error(errors.join("\n"));

				setComparisonResults({
					model1: p1.status === "fulfilled" ? p1.value : null,
					model2: p2.status === "fulfilled" ? p2.value : null,
				});
			} else {
				const currentConfig: ModelConfig = {
					modelSource,
					modelType,
					baseModelId,
					job,
					useUnsloth,
					useQuantization,
					usePreTrained,
				};
				const res = await performEvaluation(
					currentConfig,
					singleModelId,
				);
				setResults(res);
			}
		} catch (err: unknown) {
			console.error("Evaluation failed:", err);
			setError(err instanceof Error ? err.message : String(err));
		} finally {
			setLoading(false);
			setComparisonLoading({ model1: false, model2: false });
		}
	}

	function getNumericValue(
		val: number | string | Record<string, number> | undefined | null,
	): number {
		if (typeof val === "number") return val;
		if (typeof val === "object" && val !== null) {
			const values = Object.values(val).filter(
				(v): v is number => typeof v === "number",
			);
			if (values.length === 0) return 0;
			return values.reduce((a, b) => a + b, 0) / values.length;
		}
		return 0;
	}

	function formatMetricValue(
		val: number | string | Record<string, number> | undefined | null,
	) {
		if (val === null || val === undefined) return "-";
		if (typeof val === "number") return val.toFixed(4);
		if (typeof val === "object") {
			return (
				<div className="grid grid-cols-[auto_auto] gap-x-4 gap-y-1 w-full text-xs justify-start">
					{Object.entries(val).map(([key, v]) => (
						<div key={key} className="contents">
							<span className="text-muted-foreground capitalize truncate">
								{key.replace(/_/g, " ")}:
							</span>
							<span className="font-medium">
								{typeof v === "number" ? v.toFixed(4) : v}
							</span>
						</div>
					))}
				</div>
			);
		}
		return String(val);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>
					{evaluationMode === "metrics"
						? "Configure Metric-Based Evaluation"
						: "Configure Batch Inference"}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col gap-6">
					{/* Model Information Display */}
					{isComparison && model1Config && model2Config ? (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
							<div className="p-3 bg-muted/30 rounded border">
								<div className="text-sm font-semibold mb-2 text-muted-foreground">
									Model 1
								</div>
								<div className="text-xs font-mono break-all">
									{model1Id}
								</div>
								<div className="text-xs text-muted-foreground mt-1 capitalize">
									{model1Config.modelType}
								</div>
							</div>
							<div className="p-3 bg-muted/30 rounded border">
								<div className="text-sm font-semibold mb-2 text-muted-foreground">
									Model 2
								</div>
								<div className="text-xs font-mono break-all">
									{model2Id}
								</div>
								<div className="text-xs text-muted-foreground mt-1 capitalize">
									{model2Config.modelType}
								</div>
							</div>
						</div>
					) : (
						(modelSource ||
							modelType ||
							reconstructedBaseModelId ||
							job) && (
							<div className="p-4 bg-muted/30 rounded-lg border">
								<div className="text-sm font-semibold mb-3 text-muted-foreground">
									Model Information
								</div>
								<div className="grid gap-3 text-sm">
									{modelType && (
										<div>
											<span className="font-medium">
												Type:
											</span>{" "}
											<span className="text-muted-foreground capitalize">
												{modelType === "base"
													? "Base Model"
													: modelType === "adapter"
														? "LoRA Adapter"
														: modelType === "merged"
															? "Merged Model"
															: modelType}
											</span>
										</div>
									)}
									{reconstructedBaseModelId && (
										<div>
											<span className="font-medium">
												Model ID:
											</span>{" "}
											<span className="text-muted-foreground font-mono text-xs">
												{reconstructedBaseModelId}
											</span>
										</div>
									)}
									{(modelType === "base"
										? reconstructedBaseModelId
										: modelSource) && (
										<div>
											<span className="font-medium">
												Source:
											</span>{" "}
											<span className="text-muted-foreground font-mono text-xs">
												{modelType === "base"
													? reconstructedBaseModelId
													: modelSource}
											</span>
										</div>
									)}
								</div>
							</div>
						)
					)}

					{/* Dataset selection */}
					<div className="flex flex-col gap-2 space-y-4">
						<Label
							htmlFor={`dataset-${modelLabel || "single"}`}
							className="font-semibold"
						>
							Dataset ID
						</Label>
						<span className="text-sm text-muted-foreground">
							You can find dataset IDs in your dataset management
							dashboard.
						</span>
						<div className="flex gap-2">
							<Input
								id={`dataset-${modelLabel || "single"}`}
								value={dataset}
								onChange={e => setDataset(e.target.value)}
								placeholder="Enter dataset ID..."
								disabled={loading}
								className={`flex-1 ${isComparison ? "text-sm h-10" : ""}`}
							/>
							{evaluationMode === "batch_inference" && (
								<Button
									onClick={fetchSamples}
									disabled={loading || !dataset}
									variant="outline"
								>
									Load Samples
								</Button>
							)}
						</div>
					</div>

					<div className="flex flex-col gap-2">
						<Label htmlFor="hfToken" className="font-semibold">
							HuggingFace Token{" "}
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
							id="hfToken"
							type="password"
							value={hfToken}
							onChange={e => setHfToken(e.target.value)}
							disabled={loading}
							className="mt-2"
						/>
					</div>

					<div className="flex items-center space-x-2">
						<Switch
							id="use-vllm"
							checked={useVllm}
							onCheckedChange={setUseVllm}
						/>
						<Label htmlFor="use-vllm">
							Use vLLM for faster inference
						</Label>
					</div>

					{error && (
						<div className="text-red-600 text-sm">{error}</div>
					)}

					{evaluationMode === "metrics" ? (
						// Metrics-specific fields
						<div
							className={`gap-4  ${isComparison ? "grid grid-cols-2 p-1" : "grid grid-cols-1 md:grid-cols-2"}`}
						>
							<div className="flex flex-col gap-2">
								<Label
									className={`font-semibold ${isComparison ? "text-sm" : ""}`}
								>
									Evaluation Type
								</Label>
								<Select
									value={evaluationType}
									onValueChange={value =>
										setEvaluationType(value)
									}
									disabled={loading}
								>
									<SelectTrigger
										className={
											isComparison ? "h-8 text-sm" : ""
										}
									>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="task">
											Task-based
										</SelectItem>
										<SelectItem value="metrics">
											Metrics-based
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{evaluationType === "task" && (
								<div className="flex flex-col gap-2">
									<Label
										className={`font-semibold ${isComparison ? "text-sm" : ""}`}
									>
										Task Type
									</Label>
									<Select
										value={taskType}
										onValueChange={value =>
											setTaskType(value as TaskType)
										}
										disabled={loading}
									>
										<SelectTrigger
											className={
												isComparison
													? "h-8 text-sm"
													: ""
											}
										>
											<SelectValue placeholder="Select task type" />
										</SelectTrigger>
										<SelectContent>
											{TASK_TYPES.map(task => (
												<SelectItem
													key={task.value}
													value={task.value}
												>
													{task.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							)}

							{evaluationType === "metrics" && (
								<div
									className={`flex flex-col gap-3 ${isComparison ? "col-span-2" : "md:col-span-2"}`}
								>
									<Label
										className={`font-semibold ${isComparison ? "text-sm" : ""}`}
									>
										Select Metrics
									</Label>
									<div className="grid gap-2 grid-cols-2 md:grid-cols-3">
										{METRIC_TYPES.map(metric => (
											<div
												key={metric.value}
												className="flex items-center space-x-2"
											>
												<Checkbox
													id={`metric-${metric.value}`}
													checked={selectedMetrics.has(
														metric.value,
													)}
													onCheckedChange={() =>
														handleMetricToggle(
															metric.value,
														)
													}
													disabled={loading}
												/>
												<Label
													htmlFor={`metric-${metric.value}`}
													className={`${isComparison ? "text-xs" : "text-sm"}`}
												>
													{metric.label}
												</Label>
											</div>
										))}
									</div>
								</div>
							)}

							<div
								className={`grid gap-4 md:col-span-2 ${
									isComparison
										? "grid-cols-1 mt-4"
										: "grid-cols-2"
								}`}
							>
								<div className="flex flex-col gap-2">
									<Label
										className={`font-semibold ${isComparison ? "text-sm" : ""}`}
									>
										Max Samples
									</Label>
									<Input
										value={maxSamples.toString()}
										onChange={e =>
											setMaxSamples(
												Number.parseInt(
													e.target.value,
												) || 0,
											)
										}
										placeholder="Leave empty for all"
										type="number"
										min="1"
										disabled={loading}
										className={
											isComparison ? "h-8 text-sm" : ""
										}
									/>
								</div>
								<div className="flex flex-col gap-2">
									<Label className="font-semibold">
										Sample Results to Show
									</Label>
									<Input
										value={numSampleResults.toString()}
										onChange={e =>
											setNumSampleResults(
												Number.parseInt(
													e.target.value,
												) || 0,
											)
										}
										type="number"
										min="0"
										disabled={loading}
									/>
								</div>
							</div>
						</div>
					) : (
						// Batch inference-specific fields
						<div className="space-y-4">
							{/* Show dataset samples for selection */}
							{splits.length > 0 && (
								<div className="flex items-center gap-2">
									<Label
										htmlFor={`split-${modelLabel || "single"}`}
										className="font-semibold"
									>
										Split:
									</Label>
									<Select
										value={selectedSplit}
										onValueChange={handleSplitChange}
										disabled={loading}
									>
										<SelectTrigger className="w-48">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{splits.map(split => (
												<SelectItem
													key={split.split_name}
													value={split.split_name}
												>
													{split.split_name} (
													{split.num_rows} rows)
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							)}

							{splits.length > 0 && samples.length === 0 && (
								<div className="p-4 border border-gray-200 rounded text-sm">
									No valid samples found in this split. Please
									select a different split or ensure your
									dataset contains valid samples for
									inference.
								</div>
							)}

							{samples.length > 0 && (
								<div className="space-y-4">
									<div className="flex justify-between items-center">
										<Label className="font-semibold">
											Select Samples for Inference
										</Label>
										<span className="text-sm text-muted-foreground">
											{selected.length} selected
										</span>
									</div>

									<div className="grid gap-3">
										{samples.map((sample, idx) => (
											<button
												type="button"
												key={getSampleKey(sample)}
												className={`p-3 border rounded cursor-pointer transition-colors text-left w-full ${
													selected.some(
														s =>
															getSampleKey(s) ===
															getSampleKey(
																sample,
															),
													)
														? "border-primary bg-primary/5"
														: "border-border hover:border-primary/50"
												}`}
												onClick={() =>
													toggleSampleSelection(
														sample,
													)
												}
											>
												<MessageDisplay
													sample={sample}
													compact={false}
												/>
											</button>
										))}
									</div>
								</div>
							)}
						</div>
					)}

					<div className="flex gap-2">
						<Button
							onClick={runEvaluation}
							disabled={
								loading ||
								!dataset ||
								(evaluationMode === "metrics" &&
									evaluationType === "metrics" &&
									selectedMetrics.size === 0) ||
								(evaluationMode === "batch_inference" &&
									selected.length === 0) ||
								(provider === "huggingface" && !hfToken.trim())
							}
							className={`w-full ${isComparison ? "h-10 text-base" : ""}`}
						>
							{loading ? (
								<>
									<Loader2 className="animate-spin mr-2 w-4 h-4" />
									Running...
								</>
							) : (
								`Run ${
									evaluationMode === "metrics"
										? "Evaluation"
										: "Batch Inference"
								}`
							)}
						</Button>
					</div>

					{/* Results display */}
					{/* Results display */}
					{(results || comparisonResults) && (
						<div className="space-y-6 mt-6 border-t pt-6">
							<div className="font-semibold text-lg">
								{isComparison
									? "Comparison Results"
									: evaluationMode === "metrics"
										? "Evaluation Results"
										: "Inference Results"}
							</div>

							{/* Comparison Mode Results */}
							{isComparison && comparisonResults && (
								<div className="space-y-6">
									{/* 1. Comparison Metrics */}
									{evaluationMode === "metrics" &&
										comparisonResults.model1 &&
										"metrics" in comparisonResults.model1 &&
										comparisonResults.model2 &&
										"metrics" in
											comparisonResults.model2 && (
											<div className="space-y-3">
												<div className="font-medium">
													Metrics Comparison
												</div>
												<div className="rounded-md border">
													<div className="grid grid-cols-[minmax(120px,1fr)_1.5fr_1.5fr] bg-muted/50 font-medium text-sm rounded-t-md">
														<div className="p-3 px-4">
															Metric
														</div>
														<div className="p-3 px-4 border-l border-border">
															Model 1
														</div>
														<div className="p-3 px-4 border-l border-border">
															Model 2
														</div>
													</div>
													{Object.keys(
														(
															comparisonResults.model1 as EvaluationResponse
														).metrics,
													).map(metric => {
														const val1 = (
															comparisonResults.model1 as EvaluationResponse
														).metrics[metric];
														const val2 = (
															comparisonResults.model2 as EvaluationResponse
														).metrics[metric];
														const num1 =
															getNumericValue(
																val1,
															);
														const num2 =
															getNumericValue(
																val2,
															);
														const better1 =
															num1 > num2;
														const better2 =
															num2 > num1;

														return (
															<div
																key={metric}
																className="grid grid-cols-[minmax(120px,1fr)_1.5fr_1.5fr] border-t text-sm items-start"
															>
																<div className="p-3 px-4 capitalize">
																	{metric.replace(
																		/_/g,
																		" ",
																	)}
																</div>
																<div
																	className={`p-3 px-4 border-l border-border ${
																		better1
																			? "text-green-600 font-semibold"
																			: ""
																	}`}
																>
																	{formatMetricValue(
																		val1,
																	)}
																</div>
																<div
																	className={`p-3 px-4 border-l border-border ${
																		better2
																			? "text-green-600 font-semibold"
																			: ""
																	}`}
																>
																	{formatMetricValue(
																		val2,
																	)}
																</div>
															</div>
														);
													})}
												</div>
											</div>
										)}

									{/* 2. Comparison Samples */}
									<div className="space-y-3">
										<div className="font-medium">
											{evaluationMode === "metrics"
												? "Sample Comparison"
												: "Response Comparison"}
										</div>
										<div className="space-y-4">
											{(evaluationMode === "metrics"
												? (
														comparisonResults.model1 as EvaluationResponse
													).samples
												: (
														comparisonResults.model1 as BatchInferenceResponse
													).results
											).map((item, idx) => {
												// Extract data depending on mode
												const sampleIndex =
													evaluationMode === "metrics"
														? (item as SampleResult)
																.sample_index
														: idx;

												// For input display
												const inputSample =
													evaluationMode === "metrics"
														? (item as SampleResult)
																.input
														: selected[idx]
															? getInferenceMessages(
																	selected[
																		idx
																	],
																)
															: null;

												const ref =
													evaluationMode === "metrics"
														? (item as SampleResult)
																.reference
														: selected[idx]
															? getGroundTruth(
																	selected[
																		idx
																	],
																)
															: null;

												// Model predictions
												const pred1 =
													evaluationMode === "metrics"
														? (item as SampleResult)
																.prediction
														: (
																comparisonResults.model1 as BatchInferenceResponse
															).results[idx];

												const pred2 =
													evaluationMode === "metrics"
														? ((
																comparisonResults.model2 as EvaluationResponse
															).samples?.[idx]
																?.prediction ??
															"missing")
														: ((
																comparisonResults.model2 as BatchInferenceResponse
															).results?.[idx] ??
															"no result");

												return (
													<div
														// biome-ignore lint/suspicious/noArrayIndexKey: idx is stable here as it maps 1:1 to selected samples
														key={idx}
														className="border rounded-lg p-4 space-y-3"
													>
														<div className="text-sm font-medium text-muted-foreground">
															Sample{" "}
															{sampleIndex + 1}
														</div>

														{/* Shared Input */}
														{inputSample && (
															<div className="bg-background border border-input p-3 rounded-md shadow-sm">
																<div className="text-xs font-semibold text-muted-foreground mb-1">
																	Input
																</div>
																<div className="max-h-60 overflow-y-auto">
																	<MessageDisplay
																		messages={
																			inputSample
																		}
																		compact={
																			false
																		}
																	/>
																</div>
															</div>
														)}

														{/* Reference/Ground Truth */}
														{ref && (
															<div className="bg-muted/20 p-3 rounded-md">
																<div className="text-xs font-semibold text-muted-foreground mb-1">
																	{evaluationMode ===
																	"metrics"
																		? "Reference"
																		: "Ground Truth"}
																</div>
																<div className="text-sm whitespace-pre-wrap max-h-24 overflow-y-auto">
																	{formatContent(
																		ref,
																	)}
																</div>
															</div>
														)}

														{/* Side-by-Side Predictions */}
														<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
															<div className="border rounded-md p-3">
																<div className="text-xs font-semibold text-muted-foreground mb-2 flex justify-between">
																	<span>
																		Model 1
																		Response
																	</span>
																</div>
																<div className="text-sm whitespace-pre-wrap">
																	{pred1}
																</div>
															</div>
															<div className="border rounded-md p-3">
																<div className="text-xs font-semibold text-muted-foreground mb-2 flex justify-between">
																	<span>
																		Model 2
																		Response
																	</span>
																</div>
																<div className="text-sm whitespace-pre-wrap">
																	{pred2}
																</div>
															</div>
														</div>
													</div>
												);
											})}
										</div>
									</div>
								</div>
							)}

							{/* Single Mode Results (Legacy View) */}
							{!isComparison && results && (
								<div className="space-y-4">
									{evaluationMode === "metrics" &&
										"metrics" in results &&
										results.metrics &&
										Object.keys(results.metrics).length >
											0 && (
											<div className="space-y-3">
												<div className="font-medium">
													Metrics
												</div>
												<div className="grid gap-3 grid-cols-2 md:grid-cols-3">
													{Object.entries(
														results.metrics,
													).map(([metric, value]) => (
														<div
															key={metric}
															className="p-3 bg-muted/50 rounded border"
														>
															<div className="font-medium capitalize mb-1 text-sm">
																{metric.replace(
																	/_/g,
																	" ",
																)}
															</div>
															<div className="text-sm">
																{formatMetricValue(
																	value,
																)}
															</div>
														</div>
													))}
												</div>
											</div>
										)}

									{/* Single Mode Samples */}
									{evaluationMode === "metrics" &&
										"samples" in results &&
										results.samples &&
										results.samples.length > 0 && (
											<div className="space-y-3">
												<div className="font-medium">
													Sample Results
												</div>
												<div className="space-y-3">
													{results.samples.map(
														(
															sample: SampleResult,
														) => (
															<div
																key={
																	sample.sample_index
																}
																className="border rounded-lg p-4 space-y-3"
															>
																<div className="text-sm font-medium text-muted-foreground">
																	Sample{" "}
																	{sample.sample_index +
																		1}
																</div>

																{/* Input - Matching Comparison Mode */}
																{sample.input && (
																	<div className="bg-background border border-input p-3 rounded-md shadow-sm">
																		<div className="text-xs font-semibold text-muted-foreground mb-1">
																			Input
																		</div>
																		<div className="max-h-60 overflow-y-auto">
																			<MessageDisplay
																				messages={
																					sample.input
																				}
																				compact={
																					false
																				}
																			/>
																		</div>
																	</div>
																)}

																{/* Reference - Matching Comparison Mode */}
																<div className="bg-muted/20 p-3 rounded-md">
																	<div className="text-xs font-semibold text-muted-foreground mb-1">
																		Reference
																	</div>
																	<div className="text-sm whitespace-pre-wrap max-h-24 overflow-y-auto">
																		{formatContent(
																			sample.reference,
																		)}
																	</div>
																</div>

																{/* Prediction - Matching Comparison Mode Response Card */}
																<div className="border rounded-md p-3">
																	<div className="text-xs font-semibold text-muted-foreground mb-2">
																		Model
																		Response
																	</div>
																	<div className="text-sm whitespace-pre-wrap">
																		{
																			sample.prediction
																		}
																	</div>
																</div>
															</div>
														),
													)}
												</div>
											</div>
										)}

									{/* Batch Inference Single Results */}
									{evaluationMode === "batch_inference" &&
										"results" in results &&
										results.results &&
										results.results.length > 0 && (
											<div className="space-y-4">
												<div className="grid gap-4">
													{results.results.map(
														(
															result: string,
															idx: number,
														) => {
															const sample =
																selected[idx];
															const groundTruth =
																sample
																	? getGroundTruth(
																			sample,
																		)
																	: null;

															return (
																<div
																	key={`full-result-${idx}-${result.slice(0, 20)}`}
																	className="p-4 border border-border rounded space-y-3"
																>
																	<div className="text-sm font-medium">
																		Sample{" "}
																		{idx +
																			1}
																	</div>
																	{sample && (
																		<div>
																			<div className="text-xs font-medium text-muted-foreground mb-1">
																				Input:
																			</div>
																			<div className="max-h-60 overflow-y-auto border border-input rounded-md p-3 bg-background shadow-sm">
																				<MessageDisplay
																					sample={
																						sample
																					}
																					compact={
																						false
																					}
																				/>
																			</div>
																		</div>
																	)}
																	<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
																		<div>
																			<div className="text-xs font-medium text-muted-foreground mb-1">
																				Model
																				Response:
																			</div>
																			<div className="text-sm p-3 border rounded whitespace-pre-wrap max-h-40 overflow-y-auto bg-muted/10">
																				{
																					result
																				}
																			</div>
																		</div>
																		{groundTruth && (
																			<div>
																				<div className="text-xs font-medium text-muted-foreground mb-1">
																					Expected
																					Response:
																				</div>
																				<div className="text-sm p-3 border rounded whitespace-pre-wrap max-h-40 overflow-y-auto bg-muted/10">
																					{formatContent(
																						groundTruth,
																					)}
																				</div>
																			</div>
																		)}
																	</div>
																</div>
															);
														},
													)}
												</div>
											</div>
										)}
								</div>
							)}
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
