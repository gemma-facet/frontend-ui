"use client";

import {
	assistantMessageColumnAtom,
	assistantMessageMappingAtom,
	assistantMessageTabAtom,
	assistantMessageTemplateAtom,
	augmentationBackTranslationAtom,
	augmentationCustomPromptAtom,
	augmentationEDAAtom,
	augmentationFactorAtom,
	augmentationGeminiApiKeyAtom,
	augmentationParaphrasingAtom,
	augmentationSynthesisAtom,
	augmentationSynthesisRatioAtom,
	// Augmentation atoms
	datasetAugmentationAtom,
	datasetNameAtom,
	datasetProcessingLoadingAtom,
	datasetSelectionAtom,
	datasetsAtom,
	splitHFSplitsAtom,
	splitSampleSizeAtom,
	splitSelectedSplitAtom,
	splitTestSizeAtom,
	splitTypeAtom,
	systemMessageColumnAtom,
	systemMessageMappingAtom,
	systemMessageTabAtom,
	systemMessageTemplateAtom,
	userMessageColumnAtom,
	userMessageMappingAtom,
	userMessageTabAtom,
	userMessageTemplateAtom,
	visionEnabledAtom,
	visionFieldMappingAtom,
} from "@/atoms";
import DatasetPreview from "@/components/dataset-preview";
import FieldMapping from "@/components/field-mapping";
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
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioCardGroup, RadioCardGroupItem } from "@/components/ui/radio-card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import VisionFieldMapping from "@/components/vision-field-mapping";
import { cn } from "@/lib/utils";
import { useAtom, useAtomValue } from "jotai";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const DatasetConfiguration = () => {
	const router = useRouter();
	const datasetSelection = useAtomValue(datasetSelectionAtom);
	const [datasetProcessingLoading, setDatasetProcessingLoading] = useAtom(
		datasetProcessingLoadingAtom,
	);
	const [datasetName, setDatasetName] = useAtom(datasetNameAtom);
	const [datasets, setDatasets] = useAtom(datasetsAtom);

	// System Message Mapping
	const [systemMessageColumn, setSystemMessageColumn] = useAtom(
		systemMessageColumnAtom,
	);
	const [systemMessageTemplate, setSystemMessageTemplate] = useAtom(
		systemMessageTemplateAtom,
	);
	const [systemMessageTab, setSystemMessageTab] =
		useAtom(systemMessageTabAtom);
	const [systemMessageMapping, setSystemMessageMapping] = useAtom(
		systemMessageMappingAtom,
	);

	// User Message Mapping
	const [userMessageColumn, setUserMessageColumn] = useAtom(
		userMessageColumnAtom,
	);
	const [userMessageTemplate, setUserMessageTemplate] = useAtom(
		userMessageTemplateAtom,
	);
	const [userMessageTab, setUserMessageTab] = useAtom(userMessageTabAtom);
	const [userMessageMapping, setUserMessageMapping] = useAtom(
		userMessageMappingAtom,
	);

	// Assistant Message Mapping
	const [assistantMessageColumn, setAssistantMessageColumn] = useAtom(
		assistantMessageColumnAtom,
	);
	const [assistantMessageTemplate, setAssistantMessageTemplate] = useAtom(
		assistantMessageTemplateAtom,
	);
	const [assistantMessageTab, setAssistantMessageTab] = useAtom(
		assistantMessageTabAtom,
	);
	const [assistantMessageMapping, setAssistantMessageMapping] = useAtom(
		assistantMessageMappingAtom,
	);

	// Vision Field Mapping
	const [visionEnabled, setVisionEnabled] = useAtom(visionEnabledAtom);
	const [visionFieldMapping, setVisionFieldMapping] = useAtom(
		visionFieldMappingAtom,
	);

	// Split Settings
	const [splitType, setSplitType] = useAtom(splitTypeAtom);
	const [splitTestSize, setSplitTestSize] = useAtom(splitTestSizeAtom);
	const [splitSampleSize, setSplitSampleSize] = useAtom(splitSampleSizeAtom);
	const [splitHFSplits, setSplitHFSplits] = useAtom(splitHFSplitsAtom);
	const [splitSelectedSplit, setSplitSelectedSplit] = useAtom(
		splitSelectedSplitAtom,
	);

	// Augmentation Settings
	const [datasetAugmentation, setDatasetAugmentation] = useAtom(
		datasetAugmentationAtom,
	);
	const [augmentationFactor, setAugmentationFactor] = useAtom(
		augmentationFactorAtom,
	);
	const [augmentationEDA, setAugmentationEDA] = useAtom(augmentationEDAAtom);
	const [augmentationBackTranslation, setAugmentationBackTranslation] =
		useAtom(augmentationBackTranslationAtom);
	const [augmentationParaphrasing, setAugmentationParaphrasing] = useAtom(
		augmentationParaphrasingAtom,
	);
	const [augmentationSynthesis, setAugmentationSynthesis] = useAtom(
		augmentationSynthesisAtom,
	);
	const [augmentationGeminiApiKey, setAugmentationGeminiApiKey] = useAtom(
		augmentationGeminiApiKeyAtom,
	);
	const [augmentationSynthesisRatio, setAugmentationSynthesisRatio] = useAtom(
		augmentationSynthesisRatioAtom,
	);
	const [augmentationCustomPrompt, setAugmentationCustomPrompt] = useAtom(
		augmentationCustomPromptAtom,
	);

	const handleProcessDataset = async () => {
		if (!datasetSelection) {
			toast.error("Please select a dataset first.");
			return;
		}

		// System Message Mapping
		if (systemMessageTab === "template") {
			if (!systemMessageTemplate) {
				toast.error(
					"You have selected a template for the system message, but no template has been provided.",
				);
				return;
			}

			setSystemMessageMapping({
				type: "template",
				value: systemMessageTemplate,
			});
		} else {
			if (!systemMessageColumn) {
				toast.error(
					"You have selected a column for the system message, but no column has been provided.",
				);
				return;
			}

			setSystemMessageMapping({
				type: "column",
				value: systemMessageColumn,
			});
		}

		// User Message Mapping
		if (userMessageTab === "template") {
			if (!userMessageTemplate) {
				toast.error(
					"You have selected a template for the user message, but no template has been provided.",
				);
				return;
			}

			setUserMessageMapping({
				type: "template",
				value: userMessageTemplate,
			});
		} else {
			if (!userMessageColumn) {
				toast.error(
					"You have selected a column for the user message, but no column has been provided.",
				);
				return;
			}

			setUserMessageMapping({
				type: "column",
				value: userMessageColumn,
			});
		}

		// Assistant Message Mapping
		if (assistantMessageTab === "template") {
			if (!assistantMessageTemplate) {
				toast.error(
					"You have selected a template for the assistant message, but no template has been provided.",
				);
				return;
			}

			setAssistantMessageMapping({
				type: "template",
				value: assistantMessageTemplate,
			});
		} else {
			if (!assistantMessageColumn) {
				toast.error(
					"You have selected a column for the assistant message, but no column has been provided.",
				);
				return;
			}

			setAssistantMessageMapping({
				type: "column",
				value: assistantMessageColumn,
			});
		}

		// Split Settings
		if (datasetSelection.type === "local" && splitType === "hf_split") {
			toast.error(
				"You have selected a local dataset, but Hugging Face splits are not supported for local datasets. Please select some other split type.",
			);
			return;
		}

		if (splitType === "hf_split") {
			if (!splitHFSplits.train || !splitHFSplits.test) {
				toast.error(
					"You have selected a Hugging Face split, but no train or test split has been provided.",
				);
				return;
			}
		}

		if (splitType === "manual_split") {
			if (!splitSelectedSplit) {
				toast.error(
					"You have selected a manual split, but no split has been provided.",
				);
				return;
			}
		}

		if (splitType === "no_split") {
			if (!splitSelectedSplit) {
				toast.error(
					"You have selected a no split, but no split has been provided.",
				);
				return;
			}
		}

		// Augmentation Settings Validation
		if (datasetAugmentation) {
			if (
				!augmentationEDA &&
				!augmentationBackTranslation &&
				!augmentationParaphrasing &&
				!augmentationSynthesis
			) {
				toast.error(
					"You have enabled dataset augmentation, but no augmentation method has been selected. Please select at least one augmentation method.",
				);
				return;
			}

			if (augmentationSynthesis) {
				if (!augmentationGeminiApiKey) {
					toast.error(
						"You have selected synthesis augmentation, but no Gemini API key has been provided. Please provide a Gemini API key.",
					);
					return;
				}

				if (!augmentationSynthesisRatio) {
					toast.error(
						"You have selected synthesis augmentation, but no synthesis ratio has been provided. Please provide a synthesis ratio.",
					);
					return;
				}
			}
		}

		// Process Dataset
		setDatasetProcessingLoading(true);

		try {
			let splitConfig = {};

			if (splitType === "hf_split") {
				splitConfig = {
					type: "hf_split",
					train_split: splitHFSplits.train,
					test_split: splitHFSplits.test,
				};
			} else if (splitType === "manual_split") {
				if (datasetSelection.type === "huggingface") {
					splitConfig = {
						type: "manual_split",
						sample_size: splitSampleSize,
						test_size: splitTestSize,
						split: splitSelectedSplit?.name,
					};
				} else {
					splitConfig = {
						type: "manual_split",
						sample_size: splitSampleSize,
						test_size: splitTestSize,
					};
				}
			} else if (splitType === "no_split") {
				if (datasetSelection.type === "huggingface") {
					splitConfig = {
						type: "no_split",
						sample_size: splitSampleSize,
						split: splitSelectedSplit?.name,
					};
				} else {
					splitConfig = {
						type: "no_split",
						sample_size: splitSampleSize,
					};
				}
			}

			// Build augmentation config if enabled
			let augmentationConfig = null;
			if (datasetAugmentation) {
				augmentationConfig = {
					augmentation_factor: augmentationFactor,
					use_eda: augmentationEDA || null,
					use_back_translation: augmentationBackTranslation || null,
					use_paraphrasing: augmentationParaphrasing || null,
					use_synthesis: augmentationSynthesis || null,
					gemini_api_key: augmentationGeminiApiKey || null,
					synthesis_ratio: augmentationSynthesisRatio || null,
					custom_prompt: augmentationCustomPrompt || null,
				};

				// Remove null values
				for (const key of Object.keys(augmentationConfig)) {
					if (augmentationConfig[key] === null) {
						delete augmentationConfig[key];
					}
				}
			}

			const requestBody = {
				dataset_name: datasetName,
				dataset_source:
					datasetSelection.type === "huggingface"
						? "huggingface"
						: "upload",
				dataset_id: datasetSelection.datasetId,
				dataset_subset: datasetSelection.config,
				config: {
					field_mappings: {
						system_field: {
							type: systemMessageTab,
							value:
								systemMessageTab === "template"
									? systemMessageTemplate
									: systemMessageColumn,
						},
						user_field: {
							type: userMessageTab,
							value:
								userMessageTab === "template"
									? userMessageTemplate
									: userMessageColumn,
						},
						assistant_field: {
							type: assistantMessageTab,
							value:
								assistantMessageTab === "template"
									? assistantMessageTemplate
									: assistantMessageColumn,
						},
						...visionFieldMapping,
					},
					vision_enabled: visionEnabled,
					normalize_whitespace: true,
					split_config: splitConfig,
					augmentation_config: augmentationConfig,
				},
			};

			const response = await fetch("/api/datasets/process", {
				method: "POST",
				body: JSON.stringify(requestBody),
				headers: {
					"Content-Type": "application/json",
				},
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(
					`Failed to process dataset: ${data.detail || "Unknown error"}`,
				);
			}

			console.log(data);

			// Update the datasets list in the sidebar with the new dataset info
			if (data.dataset_name) {
				const newDataset = {
					datasetName: data.dataset_name,
					datasetId: data.dataset_id,
					processed_dataset_id: data.processed_dataset_id,
					datasetSource:
						data.dataset_source === "upload"
							? "local"
							: ("huggingface" as "huggingface" | "local"),
					datasetSubset: data.dataset_subset,
					numExamples: data.num_examples,
					createdAt: data.created_at,
					splits: data.splits,
					modality: data.modality || "text", // Default to text if not provided
				};

				// Add the new dataset to the existing list
				setDatasets(prevDatasets => [...prevDatasets, newDataset]);
			}

			toast.success("Dataset processed successfully.");

			// Redirect to the dataset detail page using processed_dataset_id
			router.push(`/dashboard/datasets/${data.processed_dataset_id}`);
		} catch (error) {
			toast.error("Error preprocessing dataset.", {
				description:
					error instanceof Error ? error.message : "Unknown error",
			});
		} finally {
			setDatasetProcessingLoading(false);
		}
	};

	if (!datasetSelection) {
		return <div>Please select a dataset first.</div>;
	}

	return (
		<div className="space-y-4">
			<h1 className="text-2xl font-bold">Dataset Configuration</h1>

			<Accordion
				type="single"
				collapsible
				className="w-full border border-input/30 rounded-md px-4 bg-card"
			>
				<AccordionItem value="dataset-preview">
					<AccordionTrigger className="cursor-pointer">
						Dataset Preview
					</AccordionTrigger>
					<AccordionContent>
						<DatasetPreview rows={datasetSelection.rows} />
					</AccordionContent>
				</AccordionItem>
			</Accordion>

			<Card>
				<CardHeader>
					<CardTitle>Datast Name</CardTitle>
					<CardDescription>
						Enter a unique name for the dataset. It will be used to
						idenify your dataset.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Input
						value={datasetName}
						onChange={e => setDatasetName(e.target.value)}
						placeholder="my-dataset"
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="border-b border-input">
					<CardTitle>Fields Mapping</CardTitle>
					<CardDescription>
						Map the required fields with the dataset columns.
					</CardDescription>
				</CardHeader>
				<CardContent className="border-b border-input">
					<h2 className="font-semibold mb-2">System Message</h2>
					<p className="text-sm text-muted-foreground mb-4">
						Map the system message with the dataset columns.
					</p>
					<FieldMapping
						columnValue={systemMessageColumn}
						setColumnValue={setSystemMessageColumn}
						templateValue={systemMessageTemplate}
						setTemplateValue={setSystemMessageTemplate}
						tabValue={systemMessageTab}
						setTabValue={setSystemMessageTab}
						columns={datasetSelection.columns}
						forMessage="system"
					/>
				</CardContent>
				<CardContent className="border-b">
					<h2 className="font-semibold mb-2">User Message</h2>
					<p className="text-sm text-muted-foreground mb-4">
						Map the user message with the dataset columns.
					</p>
					<FieldMapping
						columnValue={userMessageColumn}
						setColumnValue={setUserMessageColumn}
						templateValue={userMessageTemplate}
						setTemplateValue={setUserMessageTemplate}
						tabValue={userMessageTab}
						setTabValue={setUserMessageTab}
						columns={datasetSelection.columns}
						forMessage="user"
					/>
				</CardContent>
				<CardContent className="border-b-0">
					<h2 className="font-semibold mb-2">Assistant Message</h2>
					<p className="text-sm text-muted-foreground mb-4">
						Map the assistant message with the dataset columns.
					</p>
					<FieldMapping
						columnValue={assistantMessageColumn}
						setColumnValue={setAssistantMessageColumn}
						templateValue={assistantMessageTemplate}
						setTemplateValue={setAssistantMessageTemplate}
						tabValue={assistantMessageTab}
						setTabValue={setAssistantMessageTab}
						columns={datasetSelection.columns}
						forMessage="assistant"
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="border-b border-input">
					<CardTitle>Vision Settings</CardTitle>
					<CardDescription>
						Configure the vision settings for the dataset.
					</CardDescription>
				</CardHeader>
				<CardContent
					className={cn(
						"border-input",
						visionEnabled && "border-b",
						!visionEnabled && "border-b-0",
					)}
				>
					<div className="flex items-center space-x-2">
						<Checkbox
							id="vision-enabled"
							checked={visionEnabled}
							onCheckedChange={checked =>
								setVisionEnabled(checked as boolean)
							}
						/>
						<Label htmlFor="vision-enabled">Enable Vision</Label>
					</div>
					<p className="text-sm text-muted-foreground mt-2">
						Enable this to apply vision settings to your dataset.
					</p>
				</CardContent>
				{visionEnabled && (
					<CardContent className="border-b-0">
						<h2 className="font-semibold mb-2">
							Image Field Mapping
						</h2>
						<p className="text-sm text-muted-foreground mb-4">
							Map the image fields with the dataset columns.
						</p>
						<VisionFieldMapping
							columns={datasetSelection.columns}
							value={visionFieldMapping}
							onChange={setVisionFieldMapping}
						/>
					</CardContent>
				)}
			</Card>

			<Card>
				<CardHeader className="border-b border-input">
					<CardTitle>Split Settings</CardTitle>
					<CardDescription>
						Configure the split settings for the dataset.
					</CardDescription>
				</CardHeader>
				<CardContent className="border-b border-input">
					<h2 className="font-semibold mb-2">Split Type</h2>
					<p className="text-sm text-muted-foreground mb-4">
						Select the type of split to be applied to the dataset.
					</p>
					<RadioCardGroup
						value={splitType}
						onValueChange={value =>
							setSplitType(
								value as
									| "hf_split"
									| "manual_split"
									| "no_split",
							)
						}
						className="flex gap-2 flex-wrap"
					>
						{datasetSelection.type === "huggingface" && (
							<RadioCardGroupItem
								value="hf_split"
								id="hf_split"
								className="grow min-w-[300px] max-w-1/2"
							>
								Hugging Face Splits
							</RadioCardGroupItem>
						)}
						<RadioCardGroupItem
							value="manual_split"
							id="manual_split"
							className="grow min-w-[300px] max-w-1/2"
						>
							Manual Split
						</RadioCardGroupItem>
						<RadioCardGroupItem
							value="no_split"
							id="no_split"
							className="grow min-w-[300px] max-w-1/2"
						>
							No Split
						</RadioCardGroupItem>
					</RadioCardGroup>
				</CardContent>

				{splitType === "hf_split" && (
					<CardContent className="border-b-0">
						<h2 className="font-semibold mb-2">
							Hugging Face Splits
						</h2>
						<p className="text-sm text-muted-foreground mb-4">
							Select the splits to process and use for training
							and testing.
						</p>
						<div className="flex gap-4">
							<div className="flex gap-2 flex-col w-full min-w-[300px]">
								<Label>Train split</Label>
								<Select
									value={splitHFSplits.train}
									onValueChange={value =>
										setSplitHFSplits({
											...splitHFSplits,
											train: value,
										})
									}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select a split" />
									</SelectTrigger>
									<SelectContent>
										{datasetSelection.availableSplits?.map(
											split => (
												<SelectItem
													key={split.name}
													value={split.name}
												>
													{split.name}
												</SelectItem>
											),
										)}
									</SelectContent>
								</Select>
							</div>
							<div className="flex gap-2 flex-col w-full min-w-[300px]">
								<Label>Test split</Label>
								<Select
									value={splitHFSplits.test}
									onValueChange={value =>
										setSplitHFSplits({
											...splitHFSplits,
											test: value,
										})
									}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select a split" />
									</SelectTrigger>
									<SelectContent>
										{datasetSelection.availableSplits?.map(
											split => (
												<SelectItem
													key={split.name}
													value={split.name}
												>
													{split.name}
												</SelectItem>
											),
										)}
									</SelectContent>
								</Select>
							</div>
						</div>
					</CardContent>
				)}

				{splitType === "manual_split" && (
					<CardContent className="border-b-0">
						<h2 className="font-semibold mb-2">Manual Split</h2>
						<p className="text-sm text-muted-foreground mb-4">
							Select the size of train and test sets.
						</p>
						<div className="flex gap-4">
							<div className="flex flex-col gap-2 w-full min-w-[300px]">
								<Label>Hugging Face split to use</Label>
								<Select
									value={splitSelectedSplit?.name || ""}
									onValueChange={value => {
										setSplitSelectedSplit(
											datasetSelection.availableSplits?.find(
												split => split.name === value,
											) || null,
										);
										setSplitSampleSize(
											datasetSelection.availableSplits?.find(
												split => split.name === value,
											)?.num_examples || 0,
										);
									}}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select a split" />
									</SelectTrigger>
									<SelectContent>
										{datasetSelection.availableSplits?.map(
											split => (
												<SelectItem
													key={split.name}
													value={split.name}
												>
													{split.name}
												</SelectItem>
											),
										)}
									</SelectContent>
								</Select>
							</div>
							<div className="flex flex-col gap-2 w-full min-w-[300px]">
								<Label htmlFor="split-sample-size">
									Total sample size
								</Label>
								<div className="mt-1">
									<Slider
										className="w-full"
										min={1}
										max={
											datasetSelection.availableSplits?.find(
												split =>
													split.name ===
													splitSelectedSplit?.name,
											)?.num_examples || 0
										}
										id="split-sample-size"
										value={[splitSampleSize]}
										onValueChange={value =>
											setSplitSampleSize(value[0])
										}
									/>
									<div className="flex justify-between text-sm text-muted-foreground mt-1">
										<span>{splitSampleSize}</span>
										<span>
											{datasetSelection.availableSplits?.find(
												split =>
													split.name ===
													splitSelectedSplit?.name,
											)?.num_examples || 0}
										</span>
									</div>
								</div>
							</div>
							<div className="flex flex-col gap-2 w-full min-w-[300px]">
								<Label htmlFor="split-test-size">
									Test size
								</Label>
								<div className="mt-1">
									<Slider
										className="w-full"
										min={0}
										max={1}
										step={0.01}
										value={[splitTestSize]}
										onValueChange={value =>
											setSplitTestSize(value[0])
										}
									/>
									<div className="flex justify-between text-sm text-muted-foreground mt-1">
										<span>{splitTestSize}</span>
										<span>1</span>
									</div>
								</div>
							</div>
						</div>
						<p className="text-sm text-muted-foreground flex gap-4 justify-center mt-3">
							<span>
								Train size:{" "}
								{Math.round(
									splitSampleSize * (1 - splitTestSize),
								)}{" "}
								samples
							</span>
							<br />
							<span>
								Test size:{" "}
								{Math.round(splitSampleSize * splitTestSize)}{" "}
								samples
							</span>
						</p>
					</CardContent>
				)}

				{splitType === "no_split" && (
					<CardContent className="border-b-0">
						<h2 className="font-semibold mb-2">No Split</h2>
						<p className="text-sm text-muted-foreground mb-4">
							Select the split to use for training and testing.
						</p>
						<div className="flex gap-4">
							<div className="flex flex-col gap-2 w-full min-w-[300px]">
								<Label>
									Split to use for training and testing
								</Label>
								<Select
									value={splitSelectedSplit?.name || ""}
									onValueChange={value => {
										setSplitSelectedSplit(
											datasetSelection.availableSplits?.find(
												split => split.name === value,
											) || null,
										);
										setSplitSampleSize(
											datasetSelection.availableSplits?.find(
												split => split.name === value,
											)?.num_examples || 0,
										);
									}}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select a split" />
									</SelectTrigger>
									<SelectContent>
										{datasetSelection.availableSplits?.map(
											split => (
												<SelectItem
													key={split.name}
													value={split.name}
												>
													{split.name}
												</SelectItem>
											),
										)}
									</SelectContent>
								</Select>
							</div>
							<div className="flex flex-col gap-2 w-full min-w-[300px]">
								<Label htmlFor="split-sample-size">
									Total sample size
								</Label>
								<div className="mt-1">
									<Slider
										className="w-full"
										min={1}
										max={
											datasetSelection.availableSplits?.find(
												split =>
													split.name ===
													splitSelectedSplit?.name,
											)?.num_examples || 0
										}
										id="split-sample-size"
										value={[splitSampleSize]}
										onValueChange={value =>
											setSplitSampleSize(value[0])
										}
									/>
									<div className="flex justify-between text-sm text-muted-foreground mt-1">
										<span>{splitSampleSize}</span>
										<span>
											{datasetSelection.availableSplits?.find(
												split =>
													split.name ===
													splitSelectedSplit?.name,
											)?.num_examples || 0}
										</span>
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				)}
			</Card>

			<Card>
				<CardHeader className="border-b border-input">
					<CardTitle>Augmentation Settings</CardTitle>
					<CardDescription>
						Configure dataset augmentation to increase the size of
						your training data.
					</CardDescription>
				</CardHeader>
				<CardContent
					className={cn(
						"border-input",
						datasetAugmentation && "border-b",
						!datasetAugmentation && "border-b-0",
					)}
				>
					<div className="flex items-center space-x-2">
						<Checkbox
							id="dataset-augmentation"
							checked={datasetAugmentation}
							onCheckedChange={checked =>
								setDatasetAugmentation(checked as boolean)
							}
						/>
						<Label htmlFor="dataset-augmentation">
							Enable Dataset Augmentation
						</Label>
					</div>
					<p className="text-sm text-muted-foreground mt-2">
						Enable this to apply augmentation techniques to increase
						your dataset size.
					</p>
				</CardContent>

				{datasetAugmentation && (
					<>
						<CardContent className="border-b border-input">
							<h2 className="font-semibold mb-2">
								Augmentation Factor
							</h2>
							<p className="text-sm text-muted-foreground mb-4">
								Set the factor by which to increase your dataset
								size.
							</p>
							<div className="flex flex-col gap-2 w-full min-w-[300px]">
								<Label htmlFor="augmentation-factor">
									Augmentation Factor
								</Label>
								<div className="mt-1">
									<Slider
										className="w-full"
										min={1.0}
										max={5.0}
										step={0.1}
										value={[augmentationFactor]}
										onValueChange={value =>
											setAugmentationFactor(value[0])
										}
										disabled={!datasetAugmentation}
									/>
									<div className="flex justify-between text-sm text-muted-foreground mt-1">
										<span>{augmentationFactor}</span>
										<span>5.0</span>
									</div>
								</div>
							</div>
						</CardContent>

						<CardContent
							className={cn(
								"border-input",
								augmentationSynthesis && "border-b",
								!augmentationSynthesis && "border-b-0",
							)}
						>
							<h2 className="font-semibold mb-2">
								Augmentation Methods
							</h2>
							<p className="text-sm text-muted-foreground mb-4">
								Select the augmentation methods to apply to your
								dataset.
							</p>
							<div className="space-y-3">
								<div className="flex items-center space-x-2">
									<Checkbox
										id="augmentation-eda"
										checked={augmentationEDA}
										onCheckedChange={checked =>
											setAugmentationEDA(
												checked as boolean,
											)
										}
										disabled={!datasetAugmentation}
									/>
									<Label htmlFor="augmentation-eda">
										EDA (Easy Data Augmentation)
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<Checkbox
										id="augmentation-back-translation"
										checked={augmentationBackTranslation}
										onCheckedChange={checked =>
											setAugmentationBackTranslation(
												checked as boolean,
											)
										}
										disabled={!datasetAugmentation}
									/>
									<Label htmlFor="augmentation-back-translation">
										Back Translation
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<Checkbox
										id="augmentation-paraphrasing"
										checked={augmentationParaphrasing}
										onCheckedChange={checked =>
											setAugmentationParaphrasing(
												checked as boolean,
											)
										}
										disabled={!datasetAugmentation}
									/>
									<Label htmlFor="augmentation-paraphrasing">
										Paraphrasing
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<Checkbox
										id="augmentation-synthesis"
										checked={augmentationSynthesis}
										onCheckedChange={checked =>
											setAugmentationSynthesis(
												checked as boolean,
											)
										}
										disabled={!datasetAugmentation}
									/>
									<Label htmlFor="augmentation-synthesis">
										Synthesis (AI-Generated)
									</Label>
								</div>
							</div>
						</CardContent>

						{augmentationSynthesis && (
							<CardContent className="border-b-0">
								<h2 className="font-semibold mb-2">
									Synthesis Settings
								</h2>
								<p className="text-sm text-muted-foreground mb-4">
									Configure settings for AI-generated
									synthesis augmentation.
								</p>
								<div className="space-y-4">
									<div className="flex flex-col gap-2">
										<Label htmlFor="gemini-api-key">
											Gemini API Key *
										</Label>
										<Input
											id="gemini-api-key"
											type="password"
											value={
												augmentationGeminiApiKey || ""
											}
											onChange={e =>
												setAugmentationGeminiApiKey(
													e.target.value,
												)
											}
											placeholder="Enter your Gemini API key"
											disabled={
												!datasetAugmentation ||
												!augmentationSynthesis
											}
										/>
									</div>
									<div className="flex flex-col gap-2">
										<Label htmlFor="synthesis-ratio">
											Synthesis Ratio *
										</Label>
										<div className="mt-1">
											<Slider
												className="w-full"
												min={0.1}
												max={1.0}
												step={0.1}
												value={[
													augmentationSynthesisRatio ||
														0.5,
												]}
												onValueChange={value =>
													setAugmentationSynthesisRatio(
														value[0],
													)
												}
												disabled={
													!datasetAugmentation ||
													!augmentationSynthesis
												}
											/>
											<div className="flex justify-between text-sm text-muted-foreground mt-1">
												<span>
													{augmentationSynthesisRatio ||
														0.5}
												</span>
												<span>1.0</span>
											</div>
										</div>
									</div>
									<div className="flex flex-col gap-2">
										<Label htmlFor="custom-prompt">
											Custom System Prompt (Optional)
										</Label>
										<Input
											id="custom-prompt"
											value={
												augmentationCustomPrompt || ""
											}
											onChange={e =>
												setAugmentationCustomPrompt(
													e.target.value,
												)
											}
											placeholder="Enter custom system prompt for synthesis"
											disabled={
												!datasetAugmentation ||
												!augmentationSynthesis
											}
										/>
									</div>
								</div>
							</CardContent>
						)}
					</>
				)}
			</Card>

			<Button
				className="w-full cursor-pointer"
				disabled={datasetProcessingLoading}
				onClick={handleProcessDataset}
			>
				{datasetProcessingLoading ? (
					<>
						<Loader2 className="w-4 h-4 animate-spin" />
						Processing...
					</>
				) : (
					"Process Dataset"
				)}
			</Button>

			{datasetProcessingLoading && (
				<div className="flex items-center justify-center gap-2 text-muted-foreground">
					<Loader2 className="w-4 h-4 animate-spin" />
					<span>
						Processing dataset. This may take a few minutes...
					</span>
				</div>
			)}
		</div>
	);
};

export default DatasetConfiguration;
