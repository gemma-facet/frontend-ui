import type { DatasetMessage, DatasetSample } from "@/types/dataset";

export interface DatasetAdapter {
	getInputMessages(sample: DatasetSample): DatasetMessage[];
	getGroundTruth(sample: DatasetSample): DatasetMessage | string | null;
	getDatasetType(): "conversation" | "prompt-only" | "preference";
	canHandle(sample: DatasetSample): boolean;
}

export class ConversationAdapter implements DatasetAdapter {
	canHandle(sample: DatasetSample): boolean {
		return !!sample.messages;
	}

	getInputMessages(sample: DatasetSample): DatasetMessage[] {
		return sample.messages?.filter(m => m.role !== "assistant") || [];
	}

	getGroundTruth(sample: DatasetSample): DatasetMessage | null {
		return sample.messages?.find(m => m.role === "assistant") || null;
	}

	getDatasetType(): "conversation" {
		return "conversation";
	}
}

export class PromptOnlyAdapter implements DatasetAdapter {
	canHandle(sample: DatasetSample): boolean {
		// Prompt-only datasets have only prompts, no conversation history, chosen/rejected responses
		return (
			!!sample.prompt &&
			!sample.messages &&
			!sample.chosen &&
			!sample.rejected
		);
	}

	getInputMessages(sample: DatasetSample): DatasetMessage[] {
		return sample.prompt || [];
	}

	getGroundTruth(sample: DatasetSample): null {
		// Prompt-only datasets don't have ground truth - they're for inference only
		return null;
	}

	getDatasetType(): "prompt-only" {
		return "prompt-only";
	}
}

export class PreferenceAdapter implements DatasetAdapter {
	canHandle(sample: DatasetSample): boolean {
		return !!sample.prompt && !!sample.chosen && !!sample.rejected;
	}

	getInputMessages(sample: DatasetSample): DatasetMessage[] {
		return sample.prompt || [];
	}

	getGroundTruth(sample: DatasetSample): DatasetMessage | null {
		return sample.chosen?.[0] || null; // Use chosen as ground truth
	}

	getDatasetType(): "preference" {
		return "preference";
	}
}

export function getDatasetAdapter(sample: DatasetSample): DatasetAdapter {
	const adapters = [
		new PreferenceAdapter(), // Check preference first (most specific)
		new ConversationAdapter(), // Then conversation
		new PromptOnlyAdapter(), // Then prompt-only (least specific)
	];

	return (
		adapters.find(adapter => adapter.canHandle(sample)) ||
		new ConversationAdapter()
	);
}

// Helper functions for use in components
export function getInferenceMessages(sample: DatasetSample): DatasetMessage[] {
	const adapter = getDatasetAdapter(sample);
	return adapter.getInputMessages(sample);
}

export function getGroundTruth(
	sample: DatasetSample,
): DatasetMessage | string | null {
	const adapter = getDatasetAdapter(sample);
	return adapter.getGroundTruth(sample);
}

export function getDatasetType(
	sample: DatasetSample,
): "conversation" | "prompt-only" | "preference" {
	const adapter = getDatasetAdapter(sample);
	return adapter.getDatasetType();
}
