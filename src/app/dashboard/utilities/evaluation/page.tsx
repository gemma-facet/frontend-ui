"use client";

import {
	comparisonModelsAtom,
	evaluationModeAtom,
	selectedModelAtom,
} from "@/atoms";
import EvaluationModeSelector from "@/components/evaluation-mode-selector";
import ModelSelector from "@/components/model-selector";
import { Button } from "@/components/ui/button";
import UnifiedEvaluationForm from "@/components/unified-evaluation-form";
import type { DatasetSample } from "@/types/dataset";
import type { ModelType } from "@/types/inference";
import type { TrainingJob } from "@/types/training";
import { useAtom } from "jotai";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function EvaluationsPage() {
	const router = useRouter();
	const [step, setStep] = useState<1 | 2 | 3>(1);

	const [selectedModel, setSelectedModel] = useAtom(selectedModelAtom);
	const [comparisonModels, setComparisonModels] =
		useAtom(comparisonModelsAtom);
	const [selectedMode, setSelectedMode] = useAtom(evaluationModeAtom);

	const [detailedJob, setDetailedJob] = useState<TrainingJob | null>(null);
	const [detailedJob1, setDetailedJob1] = useState<TrainingJob | null>(null);
	const [detailedJob2, setDetailedJob2] = useState<TrainingJob | null>(null);
	const [fetchingDetails, setFetchingDetails] = useState(false);
	const [sharedDatasetId, setSharedDatasetId] = useState<string>("");
	const [sharedSamples, setSharedSamples] = useState<DatasetSample[]>([]);

	const canProceedToStep2 = comparisonModels.isComparison
		? comparisonModels.model1 !== null && comparisonModels.model2 !== null
		: selectedModel !== null;
	const canProceedToStep3 = selectedMode !== null;

	const getModelConfig = (
		model: typeof selectedModel,
		jobDetails?: TrainingJob | null,
	) => {
		if (!model) return null;

		// Determine the model type based on the model selection
		let modelType: ModelType = "base";
		let modelSource: string;

		if (model.type === "base") {
			modelType = "base";
			modelSource = model.baseModelId || "";
		} else if (model.type === "trained" && jobDetails?.artifacts) {
			// Prefer merged model if it exists, otherwise use adapter
			if (jobDetails.artifacts.raw?.merged) {
				modelType = "merged";
				modelSource = jobDetails.artifacts.raw.merged;
			} else if (jobDetails.artifacts.raw?.adapter) {
				modelType = "adapter";
				modelSource = jobDetails.artifacts.raw.adapter;
			} else {
				// Fallback if no raw artifacts are found
				modelType = "adapter";
				modelSource = ""; // Or some other default
			}
		} else {
			// Fallback for trained models without detailed job info from a fetch
			const job = model.job;
			if (job?.artifacts?.raw?.merged) {
				modelType = "merged";
				modelSource = job.artifacts.raw.merged;
			} else if (job?.artifacts?.raw?.adapter) {
				modelType = "adapter";
				modelSource = job.artifacts.raw.adapter;
			} else {
				modelType = "adapter";
				modelSource = "";
			}
		}

		return {
			job: model.type === "trained" ? jobDetails || model.job : undefined,
			modelSource: modelSource,
			modelType: modelType,
			baseModelId: model.baseModelId, // Use the simple baseModelId from model selector
			useUnsloth: model.type === "base" ? model.useUnsloth : undefined,
			useQuantization:
				model.type === "base" ? model.useQuantization : undefined,
			usePreTrained:
				model.type === "base" ? model.usePreTrained : undefined,
			// Pre-fill the dataset ID from the training job for better UX
			initialDatasetId:
				model.type === "trained"
					? jobDetails?.processed_dataset_id ||
						model.job?.processed_dataset_id
					: undefined,
		};
	};

	const handleNext = async () => {
		if (step === 1 && canProceedToStep2) {
			const fetchJobDetails = async (model: typeof selectedModel) => {
				if (model?.type === "trained" && model.job?.job_id) {
					const res = await fetch(`/api/jobs/${model.job.job_id}`);
					if (res.ok) {
						return await res.json();
					}
					throw new Error(
						`Failed to fetch details for job ${model.job.job_id}`,
					);
				}
				return null;
			};

			setFetchingDetails(true);
			try {
				if (comparisonModels.isComparison) {
					const [model1Details, model2Details] = await Promise.all([
						comparisonModels.model1
							? fetchJobDetails(comparisonModels.model1)
							: Promise.resolve(null),
						comparisonModels.model2
							? fetchJobDetails(comparisonModels.model2)
							: Promise.resolve(null),
					]);
					if (model1Details) setDetailedJob1(model1Details);
					if (model2Details) setDetailedJob2(model2Details);
					if (model1Details) setDetailedJob(model1Details);

					const model1Config = getModelConfig(
						comparisonModels.model1,
						model1Details,
					);
					setSharedDatasetId(model1Config?.initialDatasetId || "");
				} else {
					if (
						selectedModel?.type === "trained" &&
						selectedModel.job?.job_id
					) {
						const jobDetails = await fetchJobDetails(selectedModel);
						if (jobDetails) setDetailedJob(jobDetails);
					}
				}
			} catch (error) {
				toast.error(
					error instanceof Error
						? error.message
						: "Error fetching job details",
				);
				setFetchingDetails(false);
				return;
			} finally {
				setFetchingDetails(false);
			}
			setStep(2);
		} else if (step === 2 && canProceedToStep3) {
			setStep(3);
		}
	};

	const handleBack = () => {
		if (step > 1) {
			setStep(prev => (prev - 1) as 1 | 2);
		} else {
			router.push("/dashboard");
		}
	};

	const steps = [
		{
			number: 1,
			title: comparisonModels.isComparison
				? "Select Models"
				: "Select Model",
			completed: canProceedToStep2,
		},
		{ number: 2, title: "Select Mode", completed: canProceedToStep3 },
		{ number: 3, title: "Run Evaluation", completed: false },
	];

	return (
		<div className="max-w-6xl mx-auto py-8 space-y-6">
			<div className="flex items-center justify-between">
				<div className="space-y-1">
					<h1 className="text-3xl font-bold">Model Evaluation</h1>
					<p className="text-muted-foreground">
						Evaluate model performance using metrics or batch
						inference
					</p>
				</div>
				<Button variant="outline" onClick={handleBack}>
					<ArrowLeft className="w-4 h-4 mr-2" />
					{step === 1 ? "Back to Dashboard" : "Back"}
				</Button>
			</div>

			<div className="flex items-center space-x-4 py-4">
				{steps.map((stepInfo, index) => (
					<div key={stepInfo.number} className="flex items-center">
						<div
							className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${step === stepInfo.number ? "bg-primary text-primary-foreground" : stepInfo.completed ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"}`}
						>
							{stepInfo.completed ? (
								<CheckCircle2 className="w-5 h-5" />
							) : (
								stepInfo.number
							)}
						</div>
						<span
							className={`ml-2 text-sm ${step === stepInfo.number ? "font-medium text-foreground" : stepInfo.completed ? "text-green-600" : "text-muted-foreground"}`}
						>
							{stepInfo.title}
						</span>
						{index < steps.length - 1 && (
							<div className="w-12 h-px bg-border mx-4" />
						)}
					</div>
				))}
			</div>

			<div className="space-y-6">
				{step === 1 && (
					<>
						<ModelSelector
							selectedModel={selectedModel}
							onModelSelect={setSelectedModel}
							comparisonModels={comparisonModels}
							onComparisonChange={setComparisonModels}
						/>
						<div className="flex justify-end">
							<Button
								onClick={handleNext}
								disabled={!canProceedToStep2 || fetchingDetails}
							>
								{fetchingDetails ? (
									<>
										<Loader2 className="w-4 h-4 mr-2 animate-spin" />
										Loading details...
									</>
								) : (
									"Next: Select Mode"
								)}
							</Button>
						</div>
					</>
				)}

				{step === 2 && (
					<>
						<EvaluationModeSelector
							selectedMode={selectedMode}
							onModeSelect={setSelectedMode}
						/>
						<div className="flex justify-between">
							<Button variant="outline" onClick={handleBack}>
								Back
							</Button>
							<Button
								onClick={handleNext}
								disabled={!canProceedToStep3}
							>
								Next: Configure Evaluation
							</Button>
						</div>
					</>
				)}

				{step === 3 &&
					selectedMode &&
					(comparisonModels.isComparison ? (
						<UnifiedEvaluationForm
							evaluationMode={selectedMode}
							isComparison
							model1Config={
								getModelConfig(
									comparisonModels.model1,
									detailedJob1,
								) || undefined
							}
							model2Config={
								getModelConfig(
									comparisonModels.model2,
									detailedJob2,
								) || undefined
							}
							// Pre-fill the dataset ID from the training job for better UX
							initialDatasetId={
								getModelConfig(
									comparisonModels.model1,
									detailedJob1,
								)?.initialDatasetId
							}
						/>
					) : (
						<UnifiedEvaluationForm
							{...getModelConfig(selectedModel, detailedJob)}
							evaluationMode={selectedMode}
						/>
					))}
			</div>
		</div>
	);
}
