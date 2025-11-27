"use client";

import HFDatasetSelector from "@/components/hf-dataset-selector";
import LocalDatasetSelector from "@/components/local-dataset-selector";
import SynthesisDatasetSelector from "@/components/synthesis-dataset-selector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DatasetSelection = () => {
	return (
		<div className="">
			<Tabs defaultValue="huggingface" className="">
				<TabsList className="w-full grid w-full grid-cols-3">
					<TabsTrigger value="huggingface">
						Start from Hugging Face
					</TabsTrigger>
					<TabsTrigger value="custom">Upload Dataset</TabsTrigger>
					<TabsTrigger value="synthesize">
						Synthesize Dataset
					</TabsTrigger>
				</TabsList>
				<TabsContent value="huggingface">
					<HFDatasetSelector />
				</TabsContent>
				<TabsContent value="custom">
					<LocalDatasetSelector />
				</TabsContent>
				<TabsContent value="synthesize">
					<SynthesisDatasetSelector />
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default DatasetSelection;
