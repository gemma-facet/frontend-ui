"use client";

import { geminiApiKeyAtom, trainingConfigAtom } from "@/atoms";
import type {
	AnyGraderConfig,
	BuiltInRewardConfig,
	ScoreModelRewardConfig,
	StringCheckRewardConfig,
	TextSimilarityRewardConfig,
} from "@/types/training";
import { useAtom } from "jotai";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";

const Field = ({
	id,
	label,
	children,
}: {
	id: string;
	label: string;
	children: React.ReactNode;
}) => (
	<div className="space-y-1">
		<Label htmlFor={id}>{label}</Label>
		{children}
	</div>
);

const GraderConfigCard = ({
	grader,
	index,
	onUpdate,
	onRemove,
	defaultGeminiApiKey,
}: {
	grader: AnyGraderConfig;
	index: number;
	onUpdate: (
		index: number,
		updateFn: (g: AnyGraderConfig) => AnyGraderConfig,
	) => void;
	onRemove: (index: number) => void;
	defaultGeminiApiKey: string | null;
}) => {
	const handleUpdate = (
		updateFn: (g: AnyGraderConfig) => AnyGraderConfig,
	) => {
		onUpdate(index, updateFn);
	};

	const renderGraderForm = () => {
		const idPrefix = `${grader.type}-${index}`;

		switch (grader.type) {
			case "string_check": {
				const referenceFieldId = `${idPrefix}-reference_field`;
				const operationId = `${idPrefix}-operation`;
				return (
					<>
						<Field id={referenceFieldId} label="Reference Field">
							<Input
								id={referenceFieldId}
								value={grader.reference_field}
								onChange={e =>
									handleUpdate(g => ({
										...g,
										reference_field: e.target.value,
									}))
								}
							/>
						</Field>
						<Field id={operationId} label="Operation">
							<Select
								value={grader.operation}
								onValueChange={(
									value: StringCheckRewardConfig["operation"],
								) =>
									handleUpdate(g => {
										const scg =
											g as StringCheckRewardConfig;
										return { ...scg, operation: value };
									})
								}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select operation" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="eq">Equals</SelectItem>
									<SelectItem value="ne">
										Not Equals
									</SelectItem>
									<SelectItem value="like">Like</SelectItem>
									<SelectItem value="ilike">iLike</SelectItem>
								</SelectContent>
							</Select>
						</Field>
					</>
				);
			}
			case "text_similarity": {
				const geminiApiKeyId = `${idPrefix}-gemini_api_key`;
				const referenceFieldId = `${idPrefix}-reference_field`;
				const evaluationMetricId = `${idPrefix}-evaluation_metric`;
				const embeddingModelId = `${idPrefix}-embedding_model`;
				return (
					<>
						<Field
							id={geminiApiKeyId}
							label="Gemini API Key (Optional)"
						>
							<Input
								id={geminiApiKeyId}
								type="password"
								placeholder={
									defaultGeminiApiKey
										? "Using saved API key (leave empty to use default)"
										: "Enter your Gemini API key"
								}
								value={grader.gemini_api_key || ""}
								onChange={e =>
									handleUpdate(g => ({
										...g,
										gemini_api_key: e.target.value,
									}))
								}
							/>
						</Field>
						<Field id={referenceFieldId} label="Reference Field">
							<Input
								id={referenceFieldId}
								value={grader.reference_field}
								onChange={e =>
									handleUpdate(g => ({
										...g,
										reference_field: e.target.value,
									}))
								}
							/>
						</Field>
						<Field
							id={evaluationMetricId}
							label="Evaluation Metric"
						>
							<Select
								value={grader.evaluation_metric}
								onValueChange={(
									value: TextSimilarityRewardConfig["evaluation_metric"],
								) =>
									handleUpdate(g => {
										const tsg =
											g as TextSimilarityRewardConfig;
										return {
											...tsg,
											evaluation_metric: value,
										};
									})
								}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select metric" />
								</SelectTrigger>
								<SelectContent>
									{[
										"fuzzy_match",
										"bleu",
										"gleu",
										"meteor",
										"cosine",
										"rouge_1",
										"rouge_2",
										"rouge_3",
										"rouge_4",
										"rouge_5",
										"rouge_l",
									].map(m => (
										<SelectItem key={m} value={m}>
											{m}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</Field>
						<Field id={embeddingModelId} label="Embedding Model">
							<Input
								id={embeddingModelId}
								value={grader.embedding_model || ""}
								onChange={e =>
									handleUpdate(g => ({
										...g,

										embedding_model: e.target.value,
									}))
								}
							/>
						</Field>
					</>
				);
			}
			case "score_model": {
				const geminiApiKeyId = `${idPrefix}-gemini_api_key`;
				const modelId = `${idPrefix}-model`;
				const promptId = `${idPrefix}-prompt`;
				const rangeId = `${idPrefix}-range`;
				return (
					<>
						<Field
							id={geminiApiKeyId}
							label="Gemini API Key (Optional)"
						>
							<Input
								id={geminiApiKeyId}
								type="password"
								placeholder={
									defaultGeminiApiKey
										? "Using saved API key (leave empty to use default)"
										: "Enter your Gemini API key"
								}
								value={grader.gemini_api_key || ""}
								onChange={e =>
									handleUpdate(g => ({
										...g,
										gemini_api_key: e.target.value,
									}))
								}
							/>
						</Field>
						<Field id={modelId} label="Model">
							<Input
								id={modelId}
								value={grader.model}
								onChange={e =>
									handleUpdate(g => ({
										...g,
										model: e.target.value,
									}))
								}
							/>
						</Field>
						<Field id={promptId} label="Prompt">
							<Textarea
								id={promptId}
								value={grader.prompt}
								onChange={e =>
									handleUpdate(g => ({
										...g,
										prompt: e.target.value,
									}))
								}
							/>
						</Field>
						<Field id={rangeId} label="Score Range">
							<div className="flex gap-2">
								<Input
									type="number"
									placeholder="Min"
									value={grader.range?.[0] ?? ""}
									onChange={e =>
										handleUpdate(g => {
											const smg =
												g as ScoreModelRewardConfig;
											return {
												...smg,
												range: [
													Number(e.target.value),
													smg.range?.[1] ?? 1,
												],
											};
										})
									}
								/>
								<Input
									type="number"
									placeholder="Max"
									value={grader.range?.[1] ?? ""}
									onChange={e =>
										handleUpdate(g => {
											const smg =
												g as ScoreModelRewardConfig;
											return {
												...smg,
												range: [
													smg.range?.[0] ?? 0,
													Number(e.target.value),
												],
											};
										})
									}
								/>
							</div>
						</Field>
					</>
				);
			}
			case "label_model": {
				const geminiApiKeyId = `${idPrefix}-gemini_api_key`;
				const modelId = `${idPrefix}-model`;
				const promptId = `${idPrefix}-prompt`;
				const labelsId = `${idPrefix}-labels`;
				const passingLabelsId = `${idPrefix}-passing_labels`;
				return (
					<>
						<Field
							id={geminiApiKeyId}
							label="Gemini API Key (Optional)"
						>
							<Input
								id={geminiApiKeyId}
								type="password"
								placeholder={
									defaultGeminiApiKey
										? "Using saved API key (leave empty to use default)"
										: "Enter your Gemini API key"
								}
								value={grader.gemini_api_key || ""}
								onChange={e =>
									handleUpdate(g => ({
										...g,
										gemini_api_key: e.target.value,
									}))
								}
							/>
						</Field>
						<Field id={modelId} label="Model">
							<Input
								id={modelId}
								value={grader.model}
								onChange={e =>
									handleUpdate(g => ({
										...g,
										model: e.target.value,
									}))
								}
							/>
						</Field>
						<Field id={promptId} label="Prompt">
							<Textarea
								id={promptId}
								value={grader.prompt}
								onChange={e =>
									handleUpdate(g => ({
										...g,
										prompt: e.target.value,
									}))
								}
							/>
						</Field>
						<Field id={labelsId} label="Labels (comma-separated)">
							<Input
								id={labelsId}
								value={grader.labels.join(",")}
								onChange={e =>
									handleUpdate(g => ({
										...g,
										labels: e.target.value
											.split(",")
											.map(s => s.trim()),
									}))
								}
							/>
						</Field>
						<Field
							id={passingLabelsId}
							label="Passing Labels (comma-separated)"
						>
							<Input
								id={passingLabelsId}
								value={grader.passing_labels.join(",")}
								onChange={e =>
									handleUpdate(g => ({
										...g,
										passing_labels: e.target.value
											.split(",")
											.map(s => s.trim()),
									}))
								}
							/>
						</Field>
					</>
				);
			}
			case "python": {
				const sourceId = `${idPrefix}-source`;
				return (
					<Field id={sourceId} label="Python Source Code">
						<Textarea
							id={sourceId}
							value={grader.source}
							onChange={e =>
								handleUpdate(g => ({
									...g,
									source: e.target.value,
								}))
							}
							rows={10}
							className="font-mono"
						/>
					</Field>
				);
			}
			case "built_in": {
				const builtInGrader = grader as BuiltInRewardConfig;
				const functionNameId = `${idPrefix}-function_name`;
				const thinkTagId = `${idPrefix}-think_tag`;
				const answerTagId = `${idPrefix}-answer_tag`;
				return (
					<>
						<Field id={functionNameId} label="Function Name">
							<Select
								value={builtInGrader.function_name}
								onValueChange={(
									value: BuiltInRewardConfig["function_name"],
								) =>
									handleUpdate(g => {
										const big = g as BuiltInRewardConfig;
										return { ...big, function_name: value };
									})
								}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select function" />
								</SelectTrigger>
								<SelectContent>
									{[
										"format_reward",
										"count_xml",
										"expression_accuracy",
										"numerical_accuracy",
									].map(f => (
										<SelectItem key={f} value={f}>
											{f}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</Field>
						<Field id={thinkTagId} label="Think Tag">
							<Input
								id={thinkTagId}
								value={
									builtInGrader.parameters?.think_tag || ""
								}
								onChange={e =>
									handleUpdate(g => {
										const big = g as BuiltInRewardConfig;
										return {
											...big,
											parameters: {
												...big.parameters,
												think_tag: e.target.value,
											},
										};
									})
								}
							/>
						</Field>
						<Field id={answerTagId} label="Answer Tag">
							<Input
								id={answerTagId}
								value={
									builtInGrader.parameters?.answer_tag || ""
								}
								onChange={e =>
									handleUpdate(g => {
										const big = g as BuiltInRewardConfig;
										return {
											...big,
											parameters: {
												...big.parameters,
												answer_tag: e.target.value,
											},
										};
									})
								}
							/>
						</Field>
					</>
				);
			}
			case "ruler": {
				const geminiApiKeyId = `${idPrefix}-gemini_api_key`;
				const modelId = `${idPrefix}-model`;
				const rulesId = `${idPrefix}-rules`;
				return (
					<>
						<Field
							id={geminiApiKeyId}
							label="Gemini API Key (Optional)"
						>
							<Input
								id={geminiApiKeyId}
								type="password"
								placeholder={
									defaultGeminiApiKey
										? "Using saved API key (leave empty to use default)"
										: "Enter your Gemini API key"
								}
								value={grader.gemini_api_key || ""}
								onChange={e =>
									handleUpdate(g => ({
										...g,
										gemini_api_key: e.target.value,
									}))
								}
							/>
						</Field>
						<Field id={modelId} label="Model">
							<Input
								id={modelId}
								value={grader.model}
								onChange={e =>
									handleUpdate(g => ({
										...g,
										model: e.target.value,
									}))
								}
							/>
						</Field>
						<Field id={rulesId} label="Rules (one per line)">
							<Textarea
								id={rulesId}
								value={grader.rules.join("\n")}
								onChange={e =>
									handleUpdate(g => ({
										...g,
										rules: e.target.value.split("\n"),
									}))
								}
								rows={5}
							/>
						</Field>
					</>
				);
			}
			default:
				return <p>Unknown grader type</p>;
		}
	};

	return (
		<div className="p-4 border rounded-md space-y-4 bg-muted/20">
			<div className="flex justify-between items-center">
				<h4 className="font-semibold capitalize">
					{grader.type.replace(/_/g, " ")} Grader
				</h4>
				<Button
					variant="destructive"
					size="sm"
					onClick={() => onRemove(index)}
				>
					Remove
				</Button>
			</div>
			<div className="grid md:grid-cols-2 gap-4">
				<Field id={`${grader.type}-${index}-name`} label="Unique Name">
					<Input
						id={`${grader.type}-${index}-name`}
						value={grader.name}
						onChange={e =>
							handleUpdate(g => ({ ...g, name: e.target.value }))
						}
					/>
				</Field>
				{renderGraderForm()}
			</div>
		</div>
	);
};

export function RewardConfigurator() {
	const [config, setConfig] = useAtom(trainingConfigAtom);
	const [geminiApiKey] = useAtom(geminiApiKeyAtom);
	const [selectedGraderType, setSelectedGraderType] = useState<
		AnyGraderConfig["type"] | ""
	>("");

	if (!config) return null;

	const createDefaultGrader = (
		type: AnyGraderConfig["type"],
	): AnyGraderConfig => {
		const base = {
			name: `${type}_${(config.reward_config?.length || 0) + 1}`,
		};
		switch (type) {
			case "string_check":
				return {
					...base,
					type: "string_check",
					reference_field: "",
					operation: "eq",
				};
			case "text_similarity":
				return {
					...base,
					type: "text_similarity",
					reference_field: "",
					evaluation_metric: "fuzzy_match",
					embedding_model: "models/embedding-001",
				};
			case "score_model":
				return {
					...base,
					type: "score_model",
					model: "gemini-2.0-flash",
					prompt: "",
					range: [0, 1],
				};
			case "label_model":
				return {
					...base,
					type: "label_model",
					model: "gemini-2.0-flash",
					prompt: "",
					labels: [],
					passing_labels: [],
				};
			case "python":
				return {
					...base,
					type: "python",
					source: "def grade(output, **kwargs):\n    return 1.0",
				};
			case "built_in":
				return {
					...base,
					type: "built_in",
					function_name: "format_reward",
					parameters: {
						think_tag: "reasoning",
						answer_tag: "answer",
					},
				};
			case "ruler":
				return {
					...base,
					type: "ruler",
					model: "gemini-2.0-flash",
					rules: [],
				};
			default:
				throw new Error("Invalid grader type");
		}
	};

	const handleAddGrader = () => {
		if (!selectedGraderType) {
			toast.warning("Please select a grader type to add.");
			return;
		}
		const newGrader = createDefaultGrader(selectedGraderType);
		setConfig(prev => {
			if (!prev) return null;
			const existingNames = prev.reward_config?.map(g => g.name) || [];
			let newName = newGrader.name;
			let i = 1;
			while (existingNames.includes(newName)) {
				newName = `${selectedGraderType}_${
					(prev.reward_config?.length || 0) + i
				}`;
				i++;
			}
			newGrader.name = newName;
			return {
				...prev,
				reward_config: [...(prev.reward_config || []), newGrader],
			};
		});
		setSelectedGraderType("");
	};

	const handleRemoveGrader = (index: number) => {
		setConfig(prev => {
			if (!prev || !prev.reward_config) return prev;
			const newRewards = prev.reward_config.filter((_, i) => i !== index);
			return {
				...prev,
				reward_config: newRewards.length > 0 ? newRewards : undefined,
			};
		});
	};

	const updateGrader = (
		index: number,
		updateFn: (grader: AnyGraderConfig) => AnyGraderConfig,
	) => {
		setConfig(prev => {
			if (!prev || !prev.reward_config) return prev;
			const newRewards = prev.reward_config.map((grader, i) =>
				i === index ? updateFn(grader) : grader,
			);
			return { ...prev, reward_config: newRewards };
		});
	};

	return (
		<div className="space-y-4 py-4">
			<p className="text-sm text-muted-foreground">
				Configure one or more reward functions (graders) for GRPO
				training.
			</p>
			<div className="space-y-4">
				{config.reward_config?.map((grader, index) => (
					<GraderConfigCard
						key={grader.name}
						grader={grader}
						index={index}
						onUpdate={updateGrader}
						onRemove={handleRemoveGrader}
						defaultGeminiApiKey={geminiApiKey}
					/>
				))}
			</div>
			<div className="flex items-center gap-2 pt-4">
				<Select
					value={selectedGraderType}
					onValueChange={(value: AnyGraderConfig["type"] | "") =>
						setSelectedGraderType(value)
					}
				>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Select Grader Type to Add" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectLabel>Select Grader Type to Add</SelectLabel>
							<SelectItem value="built_in">
								Built-in Reward Functions
							</SelectItem>
							<SelectItem value="string_check">
								String Check
							</SelectItem>
							<SelectItem value="text_similarity">
								Text Similarity
							</SelectItem>
							<SelectItem value="score_model">
								Score Model
							</SelectItem>
							<SelectItem value="label_model">
								Label Model
							</SelectItem>
							<SelectItem value="python">
								Custom Python Reward Functions
							</SelectItem>
							<SelectItem value="ruler">Ruler</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
				<Button onClick={handleAddGrader}>Add Grader</Button>
			</div>
		</div>
	);
}
