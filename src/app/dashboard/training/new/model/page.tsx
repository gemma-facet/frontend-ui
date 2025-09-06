"use client";

import { trainingModelAtom } from "@/atoms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RadioCardGroup, RadioCardGroupItem } from "@/components/ui/radio-card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	type ModelProvider,
	type TrainingType,
	gemmaModels,
	providers,
	trainingTypes,
} from "@/lib/models";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ModelSelectionPage() {
	const [selected, setSelected] = useAtom(trainingModelAtom);
	const [selectedModelId, setSelectedModelId] = useState<string>(
		selected?.modelId || "",
	);
	const [selectedProvider, setSelectedProvider] = useState<ModelProvider>(
		selected?.provider || "unsloth",
	);
	const [selectedTrainingType, setSelectedTrainingType] =
		useState<TrainingType>(selected?.trainingType || "it");
	const router = useRouter();

	const handleModelSelect = (modelId: string) => {
		setSelectedModelId(modelId);
		setSelected({
			modelId,
			provider: selectedProvider,
			trainingType: selectedTrainingType,
		});
	};

	const handleProviderChange = (provider: ModelProvider) => {
		setSelectedProvider(provider);
		if (selectedModelId) {
			setSelected({
				modelId: selectedModelId,
				provider,
				trainingType: selectedTrainingType,
			});
		}
	};

	const handleTrainingTypeChange = (trainingType: TrainingType) => {
		setSelectedTrainingType(trainingType);
		if (selectedModelId) {
			setSelected({
				modelId: selectedModelId,
				provider: selectedProvider,
				trainingType,
			});
		}
	};

	const handleNext = () => {
		if (!selected) return;
		router.push("/dashboard/training/new/dataset");
	};

	return (
		<div className="max-w-4xl mx-auto py-10 space-y-8">
			{/* Header */}
			<div className="space-y-2">
				<h1 className="text-2xl font-bold">Choose Your Model</h1>
				<p className="text-muted-foreground">
					Select a Gemma model and configure your training
					preferences.
				</p>
			</div>

			{/* Configuration Section */}
			<div className="grid gap-6 md:grid-cols-2 mb-6">
				<div className="space-y-2">
					<div className="text-sm font-medium">Model Type</div>
					<Select
						value={selectedTrainingType}
						onValueChange={(value: TrainingType) =>
							handleTrainingTypeChange(value)
						}
					>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Select training type">
								{selectedTrainingType && (
									<span>
										{
											trainingTypes.find(
												type =>
													type.id ===
													selectedTrainingType,
											)?.name
										}
									</span>
								)}
							</SelectValue>
						</SelectTrigger>
						<SelectContent>
							{trainingTypes.map(type => (
								<SelectItem key={type.id} value={type.id}>
									<div className="flex flex-col items-start">
										<span className="font-medium">
											{type.name}
										</span>
										<span className="text-xs text-muted-foreground">
											{type.description}
										</span>
									</div>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<div className="text-sm font-medium">Provider</div>
					<Select
						value={selectedProvider}
						onValueChange={(value: ModelProvider) =>
							handleProviderChange(value)
						}
					>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Select provider" />
						</SelectTrigger>
						<SelectContent>
							{providers.map(provider => (
								<SelectItem
									key={provider.id}
									value={provider.id}
								>
									<div className="flex items-center gap-2">
										<span className="font-medium">
											{provider.name}
										</span>
										{provider.id === "unsloth" && (
											<Badge
												variant="secondary"
												className="text-xs"
											>
												Recommended
											</Badge>
										)}
									</div>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Model Selection */}
			<div className="space-y-4">
				<div className="space-y-2">
					<h3 className="text-lg font-semibold">Model Size</h3>
					<p className="text-sm text-muted-foreground">
						Choose based on dataset size and task complexity. Larger
						models take longer to train.
					</p>
				</div>

				<RadioCardGroup
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
					value={selectedModelId}
					onValueChange={handleModelSelect}
				>
					{gemmaModels.map(model => (
						<RadioCardGroupItem
							key={model.id}
							value={model.id}
							className="p-4"
						>
							<div className="space-y-2">
								<div className="font-semibold">
									{model.name}
								</div>
								<p className="text-sm text-muted-foreground">
									{model.description}
								</p>
							</div>
						</RadioCardGroupItem>
					))}
				</RadioCardGroup>
			</div>

			{/* Next Button */}
			<div className="flex justify-end">
				<Button
					onClick={handleNext}
					disabled={!selectedModelId}
					size="lg"
				>
					Next
				</Button>
			</div>
		</div>
	);
}
