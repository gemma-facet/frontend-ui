import type { ProcessingMode } from "@/atoms";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { RadioCardGroup, RadioCardGroupItem } from "@/components/ui/radio-card";

interface ProcessingModeSelectorProps {
	value: ProcessingMode;
	onChange: (value: ProcessingMode) => void;
}

const processingModeOptions = [
	{
		value: "language_modeling" as const,
		title: "Language Modeling",
		description:
			"Standard conversational format for supervised fine-tuning. Maps your data to assistant responses for the model to learn from.",
	},
	{
		value: "prompt_only" as const,
		title: "Prompt-Only",
		description:
			"For policy optimization like GRPO. Only provides prompts, the model generates its own responses during training.",
	},
	{
		value: "preference" as const,
		title: "Preference",
		description:
			"For preference learning like DPO/ORPO. Includes chosen and rejected responses for the model to learn preferences.",
	},
];

const ProcessingModeSelector = ({
	value,
	onChange,
}: ProcessingModeSelectorProps) => {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Processing Mode</CardTitle>
				<CardDescription>
					Choose how your dataset should be processed for fine-tuning.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<RadioCardGroup
					value={value}
					onValueChange={newValue =>
						onChange(newValue as ProcessingMode)
					}
					className="grid w-full grid-cols-1 gap-4 md:grid-cols-2"
				>
					{processingModeOptions.map(option => (
						<RadioCardGroupItem
							key={option.value}
							value={option.value}
							className="cursor-pointer"
						>
							<div className="flex flex-col space-y-2">
								<div className="text-sm font-medium">
									{option.title}
								</div>
								<div className="text-xs text-muted-foreground">
									{option.description}
								</div>
							</div>
						</RadioCardGroupItem>
					))}
				</RadioCardGroup>
			</CardContent>
		</Card>
	);
};

export default ProcessingModeSelector;
