import type {
	TrainingConfig,
	TrainingJob,
	TrainingJobsState,
} from "@/types/training";
import { atom } from "jotai";
import type {
	DatasetsState,
	FieldMappings,
	UserFieldMapping,
} from "./types/dataset";

/* ********** Datasets Atoms ********** */
export const datasetsAtom = atom<DatasetsState>({
	datasets: [],
	loading: true,
	error: null,
	hasFetched: false,
});
/* ********** Datasets Atoms ********** */

/* ********** Dataset Selection Atoms ********** */
// Hugging Face Dataset
export const hfDatasetIdAtom = atom("");
export const hfDatasetTokenAtom = atom("");
export const hfDatasetConfigsAtom = atom<string[]>([]);
export const hfDatasetConfigsLoadingAtom = atom(false);
export const hfDatasetSelectedConfigAtom = atom("");

export const hfDatasetSplitsLoadingAtom = atom(false);
export type HFDatasetSplit = {
	name: string;
	num_examples: number;
};
export const hfDatasetSplitsAtom = atom<HFDatasetSplit[]>([]);
export const hfDatasetSelectedSplitAtom = atom("");

export const hfDatasetPreviewLoadingAtom = atom(false);
export const hfDatasetColumnsAtom = atom<string[]>([]);

export type DatasetPreviewRow = {
	row: Record<string, unknown>;
};
export const hfDatasetPreviewRowsAtom = atom<DatasetPreviewRow[]>([]);

// Local Dataset
export const localDatasetAtom = atom<File | null>(null);
export const localDatasetPreviewLoadingAtom = atom(false);
export const localDatasetIdAtom = atom("");
export const localDatasetColumnsAtom = atom<string[]>([]);
export const localDatasetPreviewRowsAtom = atom<DatasetPreviewRow[]>([]);
export const localDatasetSizeAtom = atom<number>(0);

// Final state for configuration
export type DatasetSelectionType = {
	type: "huggingface" | "local";
	datasetId: string;
	split?: string;
	availableSplits?: HFDatasetSplit[];
	config?: string;
	rows: DatasetPreviewRow[];
	columns: string[];
	modality?: "text" | "vision";
};
export const datasetSelectionAtom = atom<DatasetSelectionType | null>(null);
/* ********** Dataset Selection Atoms ********** */

/* ********** Dataset Configuration Atoms ********** */

export const datasetNameAtom = atom<string>("");

// Processing mode
export type ProcessingMode = "language_modeling" | "prompt_only" | "preference";
export const processingModeAtom = atom<ProcessingMode>("language_modeling");

export type FieldMappingType = "column" | "template";

export type FieldMapping = {
	type: FieldMappingType;
	value: string;
};

// System Message Mapping
export const systemMessageColumnAtom = atom<string>("");
export const systemMessageTemplateAtom = atom<string>("");
export const systemMessageTabAtom = atom<FieldMappingType>("column");
export const systemMessageMappingAtom = atom<FieldMapping>({
	type: "column",
	value: "",
});

// New user field list structure
export const userFieldListAtom = atom<UserFieldMapping[]>([
	{ type: "template", value: "" },
]);

// Assistant Message Mapping
export const assistantMessageColumnAtom = atom<string>("");
export const assistantMessageTemplateAtom = atom<string>("");
export const assistantMessageTabAtom = atom<FieldMappingType>("column");
export const assistantMessageMappingAtom = atom<FieldMapping>({
	type: "column",
	value: "",
});

// Chosen Field Mapping (for preference mode)
export const chosenFieldColumnAtom = atom<string>("");
export const chosenFieldTemplateAtom = atom<string>("");
export const chosenFieldTabAtom = atom<FieldMappingType>("column");
export const chosenFieldMappingAtom = atom<FieldMapping>({
	type: "column",
	value: "",
});

// Rejected Field Mapping (for preference mode)
export const rejectedFieldColumnAtom = atom<string>("");
export const rejectedFieldTemplateAtom = atom<string>("");
export const rejectedFieldTabAtom = atom<FieldMappingType>("column");
export const rejectedFieldMappingAtom = atom<FieldMapping>({
	type: "column",
	value: "",
});

// Vision Field Mapping
export const visionEnabledAtom = atom<boolean>(false);
export const visionFieldMappingAtom = atom<FieldMappings>({});

// Additional Field Mappings (for prompt-only mode)
export const additionalFieldMappingsAtom = atom<FieldMappings>({});

// Split Settings
export const splitTypeAtom = atom<"hf_split" | "manual_split" | "no_split">(
	"manual_split",
);
export const splitTestSizeAtom = atom<number>(0.2);
export const splitSampleSizeAtom = atom<number>(42);
export const splitHFSplitsAtom = atom<{ train: string; test: string }>({
	train: "",
	test: "",
});
export const splitSelectedSplitAtom = atom<HFDatasetSplit | null>(null);

// Dataset augmentation settings
export const datasetAugmentationAtom = atom<boolean>(false);
export const augmentationFactorAtom = atom<number>(1.5);
export const augmentationEDAAtom = atom<boolean>(false);
export const augmentationBackTranslationAtom = atom<boolean>(false);
export const augmentationParaphrasingAtom = atom<boolean>(false);
export const augmentationSynthesisAtom = atom<boolean>(false);
export const augmentationGeminiApiKeyAtom = atom<string | null>(null);
export const augmentationSynthesisRatioAtom = atom<number | null>(null);
export const augmentationCustomPromptAtom = atom<string | null>(null);

export const datasetProcessingLoadingAtom = atom(false);

/* ********** Dataset Configuration Atoms ********** */

/* ********** Training Job Creation Atoms ********** */
export type TrainingModelType = {
	modelId: string;
	provider: "unsloth" | "huggingface";
	trainingType: "it" | "pt";
};
export const trainingModelAtom = atom<TrainingModelType | null>(null);
export const trainingDatasetIdAtom = atom<string>("");
export const trainingDatasetModalityAtom = atom<"text" | "vision" | null>(null);
export type TrainingConfigType = TrainingConfig;
export const trainingConfigAtom = atom<TrainingConfigType | null>(null);
export const trainingJobNameAtom = atom<string>("");
export const trainingHfTokenAtom = atom<string>("");
/* ********** Training Job Creation Atoms ********** */

/* ********** Training Jobs Atoms ********** */
export const jobsAtom = atom<TrainingJobsState>({
	jobs: [],
	loading: true,
	error: null,
	hasFetched: false,
});

/* ********** Job Cache Atom ********** */
export const jobCacheAtom = atom<Record<string, TrainingJob>>({});
/* ********** Job Cache Atom ********** */

/* ********** Evaluation Atoms ********** */

export type EvaluationMode = "metrics" | "batch_inference";
export const evaluationModeAtom = atom<EvaluationMode | null>(null);

export type SelectedModel = {
	type: "base" | "trained";
	baseModelId?: string; // Store the original base model ID (e.g., "gemma-3-1b")
	useUnsloth?: boolean; // Whether Unsloth provider is used
	useQuantization?: boolean; // Whether quantization is enabled
	usePreTrained?: boolean; // Whether to use -pt instead of -it models
	job?: TrainingJob; // For trained models
};

export const selectedModelAtom = atom<SelectedModel | null>(null);

export type ComparisonModels = {
	isComparison: boolean;
	model1: SelectedModel | null;
	model2: SelectedModel | null;
};

export const comparisonModelsAtom = atom<ComparisonModels>({
	isComparison: false,
	model1: null,
	model2: null,
});

export const useVllmAtom = atom<boolean>(false);

/* ********** Evaluation Atoms ********** */
