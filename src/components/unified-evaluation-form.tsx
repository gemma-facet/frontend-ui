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

interface UnifiedEvaluationFormProps {
	job?: TrainingJob;
	modelSource?: string;
	modelType?: ModelType;
	baseModelId?: string; // This should be the original base model ID (e.g., "gemma-3-270m")
	useUnsloth?: boolean; // Whether Unsloth provider is used
	useQuantization?: boolean; // Whether quantization is enabled
	usePreTrained?: boolean; // Whether to use -pt instead of -it models
	initialDatasetId?: string;
	isComparison?: boolean;
	isComparisonMaster?: boolean;
	modelLabel?: string;
	sharedDatasetId?: string;
	evaluationMode: "metrics" | "batch_inference";
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
	isComparisonMaster,
	modelLabel,
	sharedDatasetId,
	evaluationMode,
	preSelectedSamples,
	onDatasetChange,
	onSamplesChange,
}: UnifiedEvaluationFormProps) {
	const originalBaseModelId = baseModelId || job?.base_model_id;
	const effectiveDatasetId =
		sharedDatasetId || initialDatasetId || job?.processed_dataset_id || "";

	// Reconstruct the full base_model_id based on user choices (unsloth/quantization/pretraining)
	const reconstructedBaseModelId = originalBaseModelId
		? (() => {
				// If it's a base model, construct the full model ID with user choices
				if (modelType === "base") {
					const provider = useUnsloth ? "unsloth" : "huggingface";
					const method = useQuantization ? "QLoRA" : "LoRA";
					const trainingType = usePreTrained ? "pt" : "it";
					return constructFullModelId(
						`${originalBaseModelId}-${trainingType}`,
						provider,
						method,
					);
				}
				// For trained models, use the original base model ID or the job's base model
				return originalBaseModelId;
			})()
		: "";

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

	async function runEvaluation() {
		setLoading(true);
		setError(null);
		setResults(null);

		try {
			if (provider === "huggingface" && !hfToken) {
				toast.error(
					"HuggingFace token is required for HuggingFace models",
				);
				setLoading(false);
				return;
			}

			if (!modelSource || !modelType || !reconstructedBaseModelId) {
				throw new Error(
					"Evaluation requires a model source, model type, and base model ID",
				);
			}

			// For base models, use the reconstructed base model ID as the model source
			const effectiveModelSource =
				modelType === "base" ? reconstructedBaseModelId : modelSource;

			const endpoint =
				evaluationMode === "metrics"
					? "/api/evaluation"
					: "/api/inference/batch";

			let requestBody: EvaluationRequest | BatchInferenceRequest;

			if (evaluationMode === "metrics") {
				if (evaluationType === "task") {
					requestBody = {
						model_source: effectiveModelSource,
						model_type: modelType,
						base_model_id: reconstructedBaseModelId,
						dataset_id: dataset,
						task_type: taskType,
						max_samples: maxSamples,
						num_sample_results: numSampleResults,
						hf_token: hfToken,
						use_vllm: useVllm,
					};
				} else {
					// metrics-based evaluation
					requestBody = {
						model_source: effectiveModelSource,
						model_type: modelType,
						base_model_id: reconstructedBaseModelId,
						dataset_id: dataset,
						metrics: Array.from(selectedMetrics),
						max_samples: maxSamples,
						num_sample_results: numSampleResults,
						hf_token: hfToken,
						use_vllm: useVllm,
					};
				}
			} else {
				// For batch inference, convert samples to message arrays
				requestBody = {
					model_source: effectiveModelSource,
					model_type: modelType,
					base_model_id: reconstructedBaseModelId,
					messages: selected.map(sample => {
						const messages = getInferenceMessages(sample);
						return messages;
					}),
					hf_token: hfToken,
					use_vllm: useVllm,
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

			const result = await response.json();
			setResults(result);
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : String(err));
		} finally {
			setLoading(false);
		}
	}

	function formatMetricValue(
		value: number | Record<string, number>,
	): ReactElement | string {
		if (typeof value === "number") {
			return value.toFixed(4);
		}

		// Handle nested metrics as a table
		return (
			<div className="space-y-1">
				{Object.entries(value).map(([key, val]) => (
					<div key={key} className="flex justify-between text-xs">
						<span className="text-muted-foreground capitalize">
							{key.replace(/_/g, " ")}:
						</span>
						<span className="font-medium">
							{typeof val === "number" ? val.toFixed(4) : val}
						</span>
					</div>
				))}
			</div>
		);
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
					{(modelSource ||
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
					)}

					{isComparison && modelLabel && (
						<div className="text-center">
							<div className="text-sm font-medium text-muted-foreground bg-muted/50 rounded px-3 py-1 inline-block">
								{modelLabel}
							</div>
						</div>
					)}

					{/* Dataset selection - only show in single mode or if no shared dataset */}
					{!isComparison || !sharedDatasetId ? (
						<div className="flex flex-col gap-2 space-y-4">
							<Label
								htmlFor={`dataset-${modelLabel || "single"}`}
								className="font-semibold"
							>
								Dataset ID
							</Label>
							{!isComparison && (
								<span className="text-sm text-muted-foreground">
									You can find dataset IDs in your dataset
									management dashboard.
								</span>
							)}
							<div className="flex gap-2">
								<Input
									id={`dataset-${modelLabel || "single"}`}
									value={dataset}
									onChange={e => setDataset(e.target.value)}
									placeholder="Enter dataset ID..."
									disabled={loading}
									className={`flex-1 ${isComparison ? "text-sm h-8" : ""}`}
								/>
								{evaluationMode === "batch_inference" &&
									(!isComparison || !!isComparisonMaster) && (
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
					) : (
						// Comparison mode with shared dataset
						<div className="text-sm text-muted-foreground bg-muted/50 rounded p-3">
							<div className="font-medium mb-1">
								Using shared dataset from comparison
							</div>
							<div>Dataset: {sharedDatasetId}</div>
						</div>
					)}

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
							className={`space-y-4 ${isComparison ? "space-y-3" : ""}`}
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
								<div className="flex flex-col gap-3">
									<Label
										className={`font-semibold ${isComparison ? "text-sm" : ""}`}
									>
										Select Metrics
									</Label>
									<div
										className={`grid gap-2 ${
											isComparison
												? "grid-cols-2"
												: "grid-cols-3"
										}`}
									>
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
								className={`grid gap-4 ${
									isComparison ? "grid-cols-1" : "grid-cols-2"
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
								{!isComparison && (
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
								)}
							</div>
						</div>
					) : (
						// Batch inference-specific fields
						<div className="space-y-4">
							{/* Show dataset samples for selection if not in comparison mode */}
							{(!isComparison || !!isComparisonMaster) &&
								splits.length > 0 && (
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

							{(!isComparison || !!isComparisonMaster) &&
								splits.length > 0 &&
								samples.length === 0 && (
									<div className="p-4 border border-gray-200 rounded text-sm">
										No valid samples found in this split.
										Please select a different split or
										ensure your dataset contains valid
										samples for inference.
									</div>
								)}

							{(!isComparison || !!isComparisonMaster) &&
								samples.length > 0 && (
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
																getSampleKey(
																	s,
																) ===
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
													aria-label={`Toggle selection for sample ${idx + 1}`}
												>
													<div className="text-sm">
														<strong>
															Sample {idx + 1}:
														</strong>
														<div className="mt-2 max-h-32 overflow-y-auto border rounded p-2 bg-muted/20">
															<MessageDisplay
																sample={sample}
																compact={true}
															/>
														</div>
													</div>
												</button>
											))}
										</div>
									</div>
								)}

							{isComparison &&
								!isComparisonMaster &&
								preSelectedSamples && (
									<div className="text-sm text-muted-foreground bg-muted/50 rounded p-3">
										Using {preSelectedSamples.length}{" "}
										pre-selected samples for comparison.
									</div>
								)}
						</div>
					)}

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
						className={`w-full ${isComparison ? "h-8 text-sm" : ""}`}
					>
						{loading ? (
							<>
								<Loader2
									className={`animate-spin mr-2 ${
										isComparison ? "w-3 h-3" : "w-4 h-4"
									}`}
								/>
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

					{/* Results display */}
					{results && (
						<div className="space-y-4">
							<div
								className={`font-semibold ${isComparison ? "text-sm" : ""}`}
							>
								{isComparison
									? `${modelLabel} Results`
									: evaluationMode === "metrics"
										? "Evaluation Results"
										: "Inference Results"}
							</div>

							{evaluationMode === "metrics" &&
								"metrics" in results &&
								results.metrics &&
								Object.keys(results.metrics).length > 0 && (
									<div className="space-y-3">
										<div
											className={`font-medium ${isComparison ? "text-sm" : ""}`}
										>
											Metrics
										</div>
										<div
											className={`grid gap-3 ${
												isComparison
													? "grid-cols-1"
													: "grid-cols-2 md:grid-cols-3"
											}`}
										>
											{Object.entries(
												results.metrics,
											).map(([metric, value]) => (
												<div
													key={metric}
													className="p-3 bg-muted/50 rounded border"
												>
													<div
														className={`font-medium capitalize mb-1 ${
															isComparison
																? "text-xs"
																: "text-sm"
														}`}
													>
														{metric.replace(
															/_/g,
															" ",
														)}
													</div>
													<div
														className={`${
															isComparison
																? "text-xs"
																: "text-sm"
														}`}
													>
														{formatMetricValue(
															value,
														)}
													</div>
												</div>
											))}
										</div>
									</div>
								)}

							{evaluationMode === "metrics" &&
								"samples" in results &&
								results.samples &&
								results.samples.length > 0 &&
								!isComparison && (
									<div className="space-y-3">
										<div className="font-medium">
											Sample Results
										</div>
										<div className="space-y-3">
											{results.samples.map(
												(
													sample: SampleResult,
													idx: number,
												) => (
													<div
														key={
															sample.sample_index
														}
														className="p-4 border border-border rounded space-y-2"
													>
														<div className="text-sm font-medium">
															Sample{" "}
															{sample.sample_index +
																1}
														</div>
														{sample.input && (
															<div>
																<div className="text-xs font-medium text-muted-foreground mb-1">
																	Input:
																</div>
																<div className="max-h-32 overflow-y-auto border rounded p-2 bg-muted/20">
																	<MessageDisplay
																		messages={
																			sample.input
																		}
																		compact={
																			true
																		}
																	/>
																</div>
															</div>
														)}
														<div className="grid grid-cols-2 gap-4">
															<div>
																<div className="text-xs font-medium text-muted-foreground mb-1">
																	Prediction:
																</div>
																<div className="text-sm p-3 border rounded max-h-32 overflow-y-auto whitespace-pre-wrap bg-muted/10">
																	{
																		sample.prediction
																	}
																</div>
															</div>
															<div>
																<div className="text-xs font-medium text-muted-foreground mb-1">
																	Reference:
																</div>
																<div className="text-sm p-3 border rounded max-h-32 overflow-y-auto whitespace-pre-wrap bg-muted/10">
																	{
																		sample.reference
																	}
																</div>
															</div>
														</div>
													</div>
												),
											)}
										</div>
									</div>
								)}

							{evaluationMode === "batch_inference" &&
								"results" in results &&
								results.results &&
								results.results.length > 0 && (
									<div className="space-y-4">
										{isComparison ? (
											// Compact results for comparison mode
											<div className="space-y-2">
												{results.results.map(
													(
														result: string,
														idx: number,
													) => (
														<div
															key={`result-${idx}-${result.slice(0, 20)}`}
															className="p-2 bg-muted/50 rounded text-xs"
														>
															<div className="font-medium mb-1">
																Response{" "}
																{idx + 1}:
															</div>
															<div className="whitespace-pre-wrap">
																{result}
															</div>
														</div>
													),
												)}
											</div>
										) : (
											// Full results for single mode
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
																	{idx + 1}
																</div>

																{sample && (
																	<div>
																		<div className="text-xs font-medium text-muted-foreground mb-1">
																			Input:
																		</div>
																		<div className="max-h-32 overflow-y-auto border rounded p-2 bg-muted/20">
																			<MessageDisplay
																				sample={
																					sample
																				}
																				compact={
																					true
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
																				{typeof groundTruth ===
																				"string"
																					? groundTruth
																					: typeof groundTruth.content ===
																							"string"
																						? groundTruth.content
																						: Array.isArray(
																									groundTruth.content,
																								)
																							? groundTruth.content
																									.filter(
																										(part: {
																											type: string;
																											text?: string;
																										}) =>
																											part.type ===
																											"text",
																									)
																									.map(
																										(part: {
																											type: string;
																											text?: string;
																										}) =>
																											part.text,
																									)
																									.join(
																										"",
																									)
																							: JSON.stringify(
																									groundTruth.content,
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
