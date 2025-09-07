"use client";

import {
	trainingConfigAtom,
	trainingDatasetIdAtom,
	trainingDatasetModalityAtom,
	trainingHfTokenAtom,
	trainingJobNameAtom,
	trainingModelAtom,
} from "@/atoms";
import { RewardConfigurator } from "@/components/reward-configurator";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { TrainingConfig } from "@/types/training";
import { useAtom } from "jotai";
import { InfoIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function TrainingConfigPage() {
	const [config, setConfig] = useAtom(trainingConfigAtom);
	const [model] = useAtom(trainingModelAtom);
	const [datasetId] = useAtom(trainingDatasetIdAtom);
	const [modality] = useAtom(trainingDatasetModalityAtom);
	const [jobName, setJobName] = useAtom(trainingJobNameAtom);
	const [hfToken, setHfToken] = useAtom(trainingHfTokenAtom);
	const router = useRouter();

	useEffect(() => {
		if (!model) {
			toast.error("Please select a model first.");
			router.replace("/dashboard/training/new/model");
		} else if (!datasetId) {
			toast.error("Please select a dataset first.");
			router.replace("/dashboard/training/new/dataset");
		}
	}, [model, datasetId, router]);

	// Initialize config and tokens
	useEffect(() => {
		if (!config && model && datasetId) {
			// Get stored tokens
			let storedWbToken = "";
			let storedHfToken = "";

			try {
				if (typeof window !== "undefined") {
					storedWbToken = localStorage.getItem("wbToken") || "";
					storedHfToken = localStorage.getItem("hfToken") || "";
					console.log("storedWbToken", storedWbToken);
				}
			} catch {
				// Ignore localStorage errors
			}

			setConfig({
				base_model_id: model?.modelId ?? "",
				provider: model?.provider ?? "huggingface",
				method: "QLoRA",
				trainer_type: "sft",
				modality: modality || "text",
				hyperparameters: {
					learning_rate: 2e-4,
					batch_size: 2,
					gradient_accumulation_steps: 4,
					epochs: 3,
					max_steps: -1,
					packing: false,
					use_fa2: false,
					max_seq_length: 2048,
					lr_scheduler_type: "linear",
					save_strategy: "epoch",
					logging_steps: 10,
					lora_rank: 16,
					lora_alpha: 16,
					lora_dropout: 0.05,
					num_generations: 4,
					max_prompt_length: undefined,
					max_grad_norm: 0.1,
					adam_beta1: 0.9,
					adam_beta2: 0.99,
					warmup_ratio: 0.1,
					beta: 0.1,
					max_length: 1024,
				},
				export_config: {
					format: "adapter",
					destination: "gcs",
					hf_repo_id: "",
					include_gguf: false,
					gguf_quantization: "none",
				},
				eval_config: {
					eval_strategy: "no",
					eval_steps: 50,
					compute_eval_metrics: false,
					batch_eval_metrics: false,
				},
				wandb_config: storedWbToken
					? { api_key: storedWbToken }
					: undefined,
				reward_config: undefined,
			});

			// Set HF token if available
			if (storedHfToken) {
				setHfToken(storedHfToken);
			}
		}
	}, [config, model, datasetId, modality, setConfig, setHfToken]);

	if (!config) {
		return null;
	}

	const handleHyperparameterChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		const { name, value, type } = e.target;
		let processedValue: unknown = value;

		if (type === "checkbox") {
			processedValue = (e.target as HTMLInputElement).checked;
		} else if (type === "number") {
			processedValue = Number.parseFloat(value) || 0;
		}

		setConfig(prev =>
			prev
				? {
						...prev,
						hyperparameters: {
							...prev.hyperparameters,
							[name]: processedValue,
						},
					}
				: null,
		);
	};

	const handleCoreConfigChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		const { name, value } = e.target;
		setConfig(prev => (prev ? { ...prev, [name]: value } : null));
	};

	const handleExportConfigChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		const { name, value, type } = e.target;
		let processedValue: unknown = value;

		if (type === "checkbox") {
			processedValue = (e.target as HTMLInputElement).checked;
		}

		setConfig(prev =>
			prev
				? {
						...prev,
						export_config: {
							...prev.export_config,
							[name]: processedValue,
						},
					}
				: null,
		);
	};

	const handleEvalConfigChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		const { name, value, type } = e.target;
		let processedValue: unknown = value;

		if (type === "checkbox") {
			processedValue = (e.target as HTMLInputElement).checked;
		} else if (type === "number") {
			processedValue = Number.parseFloat(value) || 0;
		}

		setConfig(prev =>
			prev
				? {
						...prev,
						eval_config: {
							...(prev.eval_config || {}),
							[name]: processedValue,
						},
					}
				: null,
		);
	};

	const handleWandbConfigChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		const { name, value } = e.target;

		setConfig(prev => {
			if (!prev) return null;
			const wandbConfig = prev.wandb_config || { api_key: "" };
			if (name === "api_key" && !value.trim()) {
				return { ...prev, wandb_config: undefined };
			}
			return {
				...prev,
				wandb_config: {
					...wandbConfig,
					[name]: value,
				},
			};
		});
	};

	const handleHfTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setHfToken(value); // Update the atom
		setConfig(prev => (prev ? { ...prev, hf_token: value } : null));
	};

	const handleNext = () => {
		if (!hfToken) {
			toast.error("HuggingFace API Key is required.");
			return;
		}
		router.push("/dashboard/training/new/review");
	};

	const HyperparameterNumberInput = ({
		field,
		label,
		step = 1,
	}: {
		field: keyof TrainingConfig["hyperparameters"];
		label: string;
		step?: number;
	}) => (
		<div className="space-y-1">
			<Label htmlFor={String(field)}>{label}</Label>
			<Input
				id={String(field)}
				name={String(field)}
				type="number"
				step={step}
				value={String(config?.hyperparameters[field] ?? "")}
				onChange={handleHyperparameterChange}
			/>
		</div>
	);

	const HyperparameterSelectInput = ({
		field,
		label,
		options,
	}: {
		field: keyof TrainingConfig["hyperparameters"];
		label: string;
		options: { value: string; label: string }[];
	}) => (
		<div className="space-y-1">
			<Label htmlFor={String(field)}>{label}</Label>
			<Select
				value={String(config?.hyperparameters[field] ?? "")}
				onValueChange={(value: string) =>
					setConfig(prev =>
						prev
							? {
									...prev,
									hyperparameters: {
										...prev.hyperparameters,
										[String(field)]: value,
									},
								}
							: null,
					)
				}
			>
				<SelectTrigger className="w-full">
					<SelectValue placeholder="Select an option" />
				</SelectTrigger>
				<SelectContent>
					{options.map(option => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);

	const HyperparameterCheckboxInput = ({
		field,
		label,
	}: { field: keyof TrainingConfig["hyperparameters"]; label: string }) => (
		<div className="flex items-center space-x-2">
			<input
				id={String(field)}
				name={String(field)}
				type="checkbox"
				checked={Boolean(config?.hyperparameters[field])}
				onChange={handleHyperparameterChange}
			/>
			<Label htmlFor={String(field)}>{label}</Label>
		</div>
	);

	const CoreSelectInput = ({
		field,
		label,
		options,
	}: {
		field: keyof TrainingConfig;
		label: string;
		options: { value: string; label: string }[];
	}) => (
		<div className="space-y-1">
			<Label htmlFor={String(field)}>{label}</Label>
			<Select
				value={String(config?.[field] ?? "")}
				onValueChange={(value: string) =>
					setConfig(prev =>
						prev ? { ...prev, [field]: value } : null,
					)
				}
			>
				<SelectTrigger className="w-full">
					<SelectValue placeholder="Select an option" />
				</SelectTrigger>
				<SelectContent>
					{options.map(option => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);

	const ExportSelectInput = ({
		field,
		label,
		options,
	}: {
		field: keyof TrainingConfig["export_config"];
		label: string;
		options: { value: string; label: string }[];
	}) => (
		<div className="space-y-1">
			<Label htmlFor={String(field)}>{label}</Label>
			<Select
				value={String(config?.export_config[field] ?? "")}
				onValueChange={(value: string) =>
					setConfig(prev =>
						prev
							? {
									...prev,
									export_config: {
										...prev.export_config,
										[String(field)]: value,
									},
								}
							: null,
					)
				}
			>
				<SelectTrigger className="w-full">
					<SelectValue placeholder="Select an option" />
				</SelectTrigger>
				<SelectContent>
					{options.map(option => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);

	const ExportCheckboxInput = ({
		field,
		label,
	}: { field: keyof TrainingConfig["export_config"]; label: string }) => (
		<div className="flex items-center space-x-2">
			<input
				id={String(field)}
				name={String(field)}
				type="checkbox"
				checked={Boolean(config?.export_config[field])}
				onChange={handleExportConfigChange}
			/>
			<Label htmlFor={String(field)}>{label}</Label>
		</div>
	);

	const EvalSelectInput = ({
		field,
		label,
		options,
	}: {
		field: keyof NonNullable<TrainingConfig["eval_config"]>;
		label: string;
		options: { value: string; label: string }[];
	}) => (
		<div className="space-y-1">
			<Label htmlFor={String(field)}>{label}</Label>
			<Select
				value={String(config?.eval_config?.[field] ?? "")}
				onValueChange={(value: string) =>
					setConfig(prev =>
						prev
							? {
									...prev,
									eval_config: {
										...(prev.eval_config || {}),
										[String(field)]: value,
									},
								}
							: null,
					)
				}
			>
				<SelectTrigger className="w-full">
					<SelectValue placeholder="Select an option" />
				</SelectTrigger>
				<SelectContent>
					{options.map(option => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);

	const EvalNumberInput = ({
		field,
		label,
	}: {
		field: keyof NonNullable<TrainingConfig["eval_config"]>;
		label: string;
	}) => (
		<div className="space-y-1">
			<Label htmlFor={String(field)}>{label}</Label>
			<Input
				id={String(field)}
				name={String(field)}
				type="number"
				value={String(config?.eval_config?.[field] ?? "")}
				onChange={handleEvalConfigChange}
			/>
		</div>
	);

	const EvalCheckboxInput = ({
		field,
		label,
	}: {
		field: keyof NonNullable<TrainingConfig["eval_config"]>;
		label: string;
	}) => (
		<div className="flex items-center space-x-2">
			<input
				id={String(field)}
				name={String(field)}
				type="checkbox"
				checked={Boolean(config?.eval_config?.[field])}
				onChange={handleEvalConfigChange}
			/>
			<Label htmlFor={String(field)}>{label}</Label>
		</div>
	);

	return (
		<div className="max-w-3xl mx-auto py-10">
			<Card>
				<CardHeader>
					<CardTitle>Training Configuration</CardTitle>
				</CardHeader>
				<CardContent>
					<Accordion type="single" collapsible defaultValue="basic">
						<AccordionItem value="basic">
							<AccordionTrigger>
								Basic Training Settings
							</AccordionTrigger>
							<AccordionContent className="grid md:grid-cols-2 gap-4 py-4">
								<div className="space-y-2">
									<Label>Job Name</Label>
									<Input
										name="job_name"
										value={jobName}
										onChange={e =>
											setJobName(e.target.value)
										}
									/>
								</div>
								<div className="space-y-2">
									<Label>
										HuggingFace API Key{" "}
										<Tooltip>
											<TooltipTrigger>
												<InfoIcon size={14} />
											</TooltipTrigger>
											<TooltipContent className="w-xs text-center">
												You can set this token in the{" "}
												<Link
													href="/dashboard/profile"
													className="underline hover:no-underline"
												>
													Profile
												</Link>{" "}
												page so it's saved in your
												browser for autofill or manually
												enter it here.
											</TooltipContent>
										</Tooltip>
									</Label>
									<Input
										type="password"
										name="hf_token"
										value={hfToken ?? ""}
										onChange={handleHfTokenChange}
									/>
								</div>
								{CoreSelectInput({
									field: "method",
									label: "Training Method",
									options: [
										{
											value: "Full",
											label: "Full Fine-tuning",
										},
										{ value: "LoRA", label: "LoRA" },
										{ value: "QLoRA", label: "QLoRA" },
									],
								})}
								{CoreSelectInput({
									field: "trainer_type",
									label: "Trainer Type",
									options: [
										{ value: "sft", label: "SFT Trainer" },
										{ value: "dpo", label: "DPO Trainer" },
										{
											value: "grpo",
											label: "GRPO Trainer",
										},
									],
								})}
								{CoreSelectInput({
									field: "modality",
									label: "Training Modality",
									options: [
										{ value: "text", label: "Text" },
										{ value: "vision", label: "Vision" },
									],
								})}
								{HyperparameterNumberInput({
									field: "batch_size",
									label: "Batch Size",
								})}
								{HyperparameterNumberInput({
									field: "epochs",
									label: "Epochs",
								})}
								{HyperparameterNumberInput({
									field: "learning_rate",
									label: "Learning Rate",
									step: 0.00001,
								})}
								{HyperparameterNumberInput({
									field: "gradient_accumulation_steps",
									label: "Gradient Accumulation Steps",
								})}
								{HyperparameterNumberInput({
									field: "max_steps",
									label: "Max Steps (-1 for no limit)",
								})}
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value="lora">
							<AccordionTrigger>LoRA Settings</AccordionTrigger>
							<AccordionContent className="grid md:grid-cols-2 gap-4 py-4">
								{HyperparameterNumberInput({
									field: "lora_rank",
									label: "LoRA Rank",
								})}
								{HyperparameterNumberInput({
									field: "lora_alpha",
									label: "LoRA Alpha",
								})}
								{HyperparameterNumberInput({
									field: "lora_dropout",
									label: "LoRA Dropout",
									step: 0.01,
								})}
							</AccordionContent>
						</AccordionItem>
						{config.trainer_type === "grpo" && (
							<AccordionItem value="grpo">
								<AccordionTrigger>
									GRPO Settings
								</AccordionTrigger>
								<AccordionContent className="grid md:grid-cols-2 gap-4 py-4">
									{HyperparameterNumberInput({
										field: "num_generations",
										label: "Number of Generations",
									})}
									{HyperparameterNumberInput({
										field: "max_prompt_length",
										label: "Max Prompt Length",
									})}
									{HyperparameterNumberInput({
										field: "max_grad_norm",
										label: "Max Gradient Norm",
										step: 0.01,
									})}
									{HyperparameterNumberInput({
										field: "adam_beta1",
										label: "Adam Beta1",
										step: 0.01,
									})}
									{HyperparameterNumberInput({
										field: "adam_beta2",
										label: "Adam Beta2",
										step: 0.001,
									})}
									{HyperparameterNumberInput({
										field: "warmup_ratio",
										label: "Warmup Ratio",
										step: 0.01,
									})}
								</AccordionContent>
							</AccordionItem>
						)}
						{config.trainer_type === "grpo" && (
							<AccordionItem value="reward">
								<AccordionTrigger>
									Reward Configuration
								</AccordionTrigger>
								<AccordionContent>
									<RewardConfigurator />
								</AccordionContent>
							</AccordionItem>
						)}
						{config.trainer_type === "dpo" && (
							<AccordionItem value="dpo">
								<AccordionTrigger>
									DPO Settings
								</AccordionTrigger>
								<AccordionContent className="grid md:grid-cols-2 gap-4 py-4">
									{HyperparameterNumberInput({
										field: "beta",
										label: "DPO Beta (Regularization)",
										step: 0.01,
									})}
									{HyperparameterNumberInput({
										field: "max_length",
										label: "Max Length",
									})}
								</AccordionContent>
							</AccordionItem>
						)}
						<AccordionItem value="evaluation">
							<AccordionTrigger>
								Evaluation Settings
							</AccordionTrigger>
							<AccordionContent className="grid md:grid-cols-2 gap-4 py-4">
								{EvalSelectInput({
									field: "eval_strategy",
									label: "Evaluation Strategy",
									options: [
										{ value: "no", label: "No Evaluation" },
										{
											value: "steps",
											label: "Evaluate Every N Steps",
										},
										{
											value: "epoch",
											label: "Evaluate Every Epoch",
										},
									],
								})}
								{EvalNumberInput({
									field: "eval_steps",
									label: "Evaluation Steps",
								})}
								{EvalCheckboxInput({
									field: "compute_eval_metrics",
									label: "Compute Eval Metrics (accuracy, perplexity)",
								})}
								{EvalCheckboxInput({
									field: "batch_eval_metrics",
									label: "Enable Batch Eval Mode",
								})}
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value="advanced">
							<AccordionTrigger>
								Advanced Settings
							</AccordionTrigger>
							<AccordionContent className="grid md:grid-cols-2 gap-4 py-4">
								{HyperparameterNumberInput({
									field: "max_seq_length",
									label: "Max Sequence Length",
								})}
								{HyperparameterSelectInput({
									field: "lr_scheduler_type",
									label: "Learning Rate Scheduler",
									options: [
										{ value: "linear", label: "Linear" },
										{ value: "cosine", label: "Cosine" },
										{
											value: "polynomial",
											label: "Polynomial",
										},
										{
											value: "constant",
											label: "Constant",
										},
									],
								})}
								{HyperparameterSelectInput({
									field: "save_strategy",
									label: "Save Strategy",
									options: [
										{
											value: "epoch",
											label: "Save Every Epoch",
										},
										{
											value: "steps",
											label: "Save Every N Steps",
										},
										{ value: "no", label: "No Saving" },
									],
								})}
								{HyperparameterNumberInput({
									field: "logging_steps",
									label: "Logging Steps",
								})}
								{HyperparameterCheckboxInput({
									field: "packing",
									label: "Enable Sequence Packing",
								})}
								{HyperparameterCheckboxInput({
									field: "use_fa2",
									label: "Use Flash Attention 2 (HuggingFace only)",
								})}
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value="export">
							<AccordionTrigger>
								Export Configuration
							</AccordionTrigger>
							<AccordionContent className="grid md:grid-cols-2 gap-4 py-4">
								{ExportSelectInput({
									field: "format",
									label: "Export Format",
									options: [
										{
											value: "adapter",
											label: "Adapter Only",
										},
										{
											value: "merged",
											label: "Merged Model",
										},
										{
											value: "full",
											label: "Full Fine Tuning",
										},
									],
								})}
								{ExportSelectInput({
									field: "destination",
									label: "Export Destination",
									options: [
										{
											value: "gcs",
											label: "Google Cloud Storage",
										},
										{
											value: "hfhub",
											label: "Hugging Face Hub",
										},
									],
								})}
								{ExportCheckboxInput({
									field: "include_gguf",
									label: "Include GGUF Export",
								})}
								{ExportSelectInput({
									field: "gguf_quantization",
									label: "GGUF Quantization (if enabled)",
									options: [
										{
											value: "none",
											label: "No Quantization",
										},
										{
											value: "f16",
											label: "FP16 (Half Precision)",
										},
										{
											value: "bf16",
											label: "BF16 (Brain Float 16)",
										},
										{
											value: "q8_0",
											label: "Q8_0 (8-bit)",
										},
										{
											value: "q4_k_m",
											label: "Q4_K_M (4-bit)",
										},
									],
								})}
								<div className="space-y-1 md:col-span-2">
									<Label>
										HuggingFace Repo ID (for HF Hub export)
									</Label>
									<Input
										name="hf_repo_id"
										value={
											config?.export_config.hf_repo_id ??
											""
										}
										onChange={handleExportConfigChange}
									/>
								</div>
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value="wandb">
							<AccordionTrigger>
								Weights & Biases
							</AccordionTrigger>
							<AccordionContent className="grid md:grid-cols-2 gap-4 py-4">
								<div className="space-y-1 md:col-span-2">
									<Label>
										WandB API Key{" "}
										<Tooltip>
											<TooltipTrigger>
												<InfoIcon size={18} />
											</TooltipTrigger>
											<TooltipContent className="w-xs text-center">
												You can set this API key in the{" "}
												<Link
													href="/dashboard/profile"
													className="underline hover:no-underline"
												>
													Profile
												</Link>{" "}
												page so it's saved in your
												browser for autofill or manually
												enter it here.
											</TooltipContent>
										</Tooltip>
									</Label>
									<Input
										name="api_key"
										type="password"
										value={
											config?.wandb_config?.api_key ?? ""
										}
										onChange={handleWandbConfigChange}
									/>
								</div>
								<div className="space-y-1">
									<Label>WandB Project</Label>
									<Input
										name="project"
										value={
											config?.wandb_config?.project ?? ""
										}
										onChange={handleWandbConfigChange}
									/>
								</div>
								<div className="space-y-1">
									<Label>Log Model to WandB</Label>
									<Select
										value={
											config?.wandb_config?.log_model ??
											"end"
										}
										onValueChange={(
											value:
												| "false"
												| "checkpoint"
												| "end",
										) =>
											setConfig(prev => {
												if (!prev) return null;
												const wandbConfig =
													prev.wandb_config || {
														api_key: "",
													};
												return {
													...prev,
													wandb_config: {
														...wandbConfig,
														log_model: value,
													},
												};
											})
										}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Select an option" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="false">
												Don't Log Model
											</SelectItem>
											<SelectItem value="checkpoint">
												Log Checkpoints
											</SelectItem>
											<SelectItem value="end">
												Log Final Model
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</CardContent>
				<CardFooter>
					<Button
						onClick={handleNext}
						className="w-full md:w-auto md:ml-auto"
					>
						Next
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
