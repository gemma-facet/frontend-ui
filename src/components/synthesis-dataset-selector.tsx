"use client";

import {
	geminiApiKeyAtom,
	synthesisConfigAtom,
	synthesisFileAtom,
	synthesisPreviewLoadingAtom,
} from "@/atoms";
import type { SynthesisConfig } from "@/types/dataset";
import { useAtom } from "jotai";
import { Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "./ui/accordion";
import { Button } from "./ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";

const SynthesisDatasetSelector = () => {
	const [synthesisFile, setSynthesisFile] = useAtom(synthesisFileAtom);
	const [synthesisConfig, setSynthesisConfig] = useAtom(synthesisConfigAtom);
	const [geminiApiKey, setGeminiApiKey] = useAtom(geminiApiKeyAtom);
	const [synthesisPreviewLoading, setSynthesisPreviewLoading] = useAtom(
		synthesisPreviewLoadingAtom,
	);
	const router = useRouter();

	useEffect(() => {
		const storedGeminiKey =
			typeof window !== "undefined"
				? localStorage.getItem("geminiApiKey")
				: null;
		if (storedGeminiKey) {
			setGeminiApiKey(storedGeminiKey);
		}
	}, [setGeminiApiKey]);

	const handleConfigChange = useCallback(
		(field: keyof SynthesisConfig, value: number | string) => {
			setSynthesisConfig(prev => ({
				...prev,
				[field]:
					typeof value === "string" && field !== "dataset_name"
						? Number.parseFloat(value)
						: value,
			}));
		},
		[setSynthesisConfig],
	);

	const handleSynthesizeDataset = async () => {
		if (!synthesisFile) {
			toast.error("Please upload a file first");
			return;
		}

		if (!synthesisConfig.dataset_name.trim()) {
			toast.error("Please enter a dataset name");
			return;
		}

		if (!geminiApiKey?.trim()) {
			toast.error("Please enter a Gemini API key");
			return;
		}

		setSynthesisPreviewLoading(true);

		try {
			const formData = new FormData();
			formData.append("file", synthesisFile);

			// Build synthesis_config as a JSON object matching backend SynthesisConfig model
			const synthesisConfigPayload = {
				gemini_api_key: geminiApiKey,
				dataset_name: synthesisConfig.dataset_name,
				num_pairs: synthesisConfig.num_pairs || 5,
				temperature: synthesisConfig.temperature || 0.7,
				chunk_size: synthesisConfig.chunk_size || 4000,
				chunk_overlap: synthesisConfig.chunk_overlap || 200,
				multimodal: synthesisConfig.multimodal || false,
				threshold: synthesisConfig.threshold || 7.0,
				batch_size: synthesisConfig.batch_size || 5,
			};

			// Append as a single JSON string field as expected by backend
			formData.append(
				"synthesis_config",
				JSON.stringify(synthesisConfigPayload),
			);

			const response = await fetch("/api/datasets/synthesize", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to synthesize dataset");
			}

			const data = await response.json();

			toast.success("Dataset synthesized successfully!");

			// Redirect to the dataset detail page using processed_dataset_id
			router.push(`/dashboard/datasets/${data.processed_dataset_id}`);
		} catch (error) {
			console.error("Error synthesizing dataset:", error);
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to synthesize dataset",
			);
		} finally {
			setSynthesisPreviewLoading(false);
		}
	};

	return (
		<div className="space-y-6 mt-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						Synthesize Dataset
					</CardTitle>
					<CardDescription>
						Upload unstructured data files and generate synthetic QA
						pairs using the synthetic-data-kit.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="flex gap-2 items-end">
						<Label htmlFor="synthesisFile">
							Text File (PDF, HTML, TXT, DOCX, PPTX, etc.)
						</Label>
						<Input
							type="file"
							accept=".txt, .pdf, .md, .docx"
							onChange={e => {
								const file = e.target.files?.[0];
								if (file) {
									setSynthesisFile(file);
								}
							}}
						/>
					</div>

					<div className="space-y-3">
						<Label htmlFor="datasetName">Dataset Name *</Label>
						<Input
							id="datasetName"
							placeholder="Enter a name for your dataset"
							value={synthesisConfig.dataset_name}
							onChange={e =>
								handleConfigChange(
									"dataset_name",
									e.target.value,
								)
							}
						/>
					</div>

					<div className="space-y-3">
						<Label htmlFor="gemini-api-key">Gemini API Key *</Label>
						<Input
							id="gemini-api-key"
							type="password"
							placeholder="Enter your Gemini API key"
							value={geminiApiKey || ""}
							onChange={e => {
								setGeminiApiKey(e.target.value);
								// Save to localStorage
								if (typeof window !== "undefined") {
									localStorage.setItem(
										"geminiApiKey",
										e.target.value,
									);
								}
							}}
						/>
						<p className="text-xs text-muted-foreground">
							Your API key is saved locally and will be reused
						</p>
					</div>

					<div className="flex items-center justify-between rounded-lg border border-input bg-background px-4 py-3">
						<div className="space-y-0.5">
							<Label
								htmlFor="multimodal"
								className="text-sm font-medium"
							>
								Multimodal
							</Label>
							<p className="text-xs text-muted-foreground">
								Include images and other media in the synthesis
							</p>
						</div>
						<Switch
							id="multimodal"
							checked={synthesisConfig.multimodal || false}
							onCheckedChange={checked =>
								setSynthesisConfig(prev => ({
									...prev,
									multimodal: checked,
								}))
							}
						/>
					</div>

					<Accordion type="single" collapsible>
						<AccordionItem value="advanced">
							<AccordionTrigger>
								Advanced Configuration
							</AccordionTrigger>
							<AccordionContent>
								<div className="space-y-6 pt-4">
									<div className="space-y-2">
										<div className="flex justify-between">
											<Label>
												QA Pairs per Chunk (
												{synthesisConfig.num_pairs})
											</Label>
										</div>
										<Slider
											value={[
												synthesisConfig.num_pairs || 5,
											]}
											onValueChange={value =>
												handleConfigChange(
													"num_pairs",
													value[0],
												)
											}
											min={1}
											max={20}
											step={1}
											className="w-full"
										/>
										<p className="text-xs text-muted-foreground">
											Number of question-answer pairs to
											generate from each text chunk
										</p>
									</div>

									<div className="space-y-2">
										<div className="flex justify-between">
											<Label>
												Temperature (
												{(
													synthesisConfig.temperature ||
													0.7
												).toFixed(2)}
												)
											</Label>
										</div>
										<Slider
											value={[
												synthesisConfig.temperature ||
													0.7,
											]}
											onValueChange={value =>
												handleConfigChange(
													"temperature",
													value[0],
												)
											}
											min={0}
											max={1}
											step={0.1}
											className="w-full"
										/>
										<p className="text-xs text-muted-foreground">
											LLM temperature for generation
											(0.0=deterministic, 1.0=random)
										</p>
									</div>

									<div className="space-y-2">
										<div className="flex justify-between">
											<Label>
												Chunk Size (
												{synthesisConfig.chunk_size})
											</Label>
										</div>
										<Slider
											value={[
												synthesisConfig.chunk_size ||
													4000,
											]}
											onValueChange={value =>
												handleConfigChange(
													"chunk_size",
													value[0],
												)
											}
											min={1000}
											max={8000}
											step={500}
											className="w-full"
										/>
										<p className="text-xs text-muted-foreground">
											Size of text chunks for processing
										</p>
									</div>

									<div className="space-y-2">
										<div className="flex justify-between">
											<Label>
												Chunk Overlap (
												{synthesisConfig.chunk_overlap})
											</Label>
										</div>
										<Slider
											value={[
												synthesisConfig.chunk_overlap ||
													200,
											]}
											onValueChange={value =>
												handleConfigChange(
													"chunk_overlap",
													value[0],
												)
											}
											min={0}
											max={1000}
											step={50}
											className="w-full"
										/>
										<p className="text-xs text-muted-foreground">
											Overlap between consecutive chunks
										</p>
									</div>

									<div className="space-y-2">
										<div className="flex justify-between">
											<Label>
												Quality Threshold (
												{(
													synthesisConfig.threshold ||
													7.0
												).toFixed(1)}
												)
											</Label>
										</div>
										<Slider
											value={[
												synthesisConfig.threshold ||
													7.0,
											]}
											onValueChange={value =>
												handleConfigChange(
													"threshold",
													value[0],
												)
											}
											min={1}
											max={10}
											step={0.5}
											className="w-full"
										/>
										<p className="text-xs text-muted-foreground">
											Quality threshold for curation
											(1=lowest, 10=highest)
										</p>
									</div>

									<div className="space-y-2">
										<div className="flex justify-between">
											<Label>
												Batch Size (
												{synthesisConfig.batch_size})
											</Label>
										</div>
										<Slider
											value={[
												synthesisConfig.batch_size || 5,
											]}
											onValueChange={value =>
												handleConfigChange(
													"batch_size",
													value[0],
												)
											}
											min={1}
											max={20}
											step={1}
											className="w-full"
										/>
										<p className="text-xs text-muted-foreground">
											Number of items per batch for
											quality rating
										</p>
									</div>
								</div>
							</AccordionContent>
						</AccordionItem>
					</Accordion>
					<Button
						className="cursor-pointer"
						onClick={handleSynthesizeDataset}
						disabled={!synthesisFile || synthesisPreviewLoading}
					>
						{synthesisPreviewLoading ? (
							<Loader2 className="animate-spin" />
						) : (
							<Sparkles className="w-4 h-4" />
						)}
						{synthesisPreviewLoading
							? "Synthesizing..."
							: "Synthesize"}
					</Button>
				</CardContent>
			</Card>

			{synthesisPreviewLoading && (
				<div className="flex items-center gap-2 mt-10 justify-center">
					<Loader2 className="h-4 w-4 animate-spin" />
					<span>Synthesizing dataset...</span>
				</div>
			)}
		</div>
	);
};

export default SynthesisDatasetSelector;
