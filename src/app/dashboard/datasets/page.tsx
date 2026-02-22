"use client";

import DatasetCard from "@/components/dataset-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { useDatasets } from "@/hooks/useDatasets";
import { cn } from "@/lib/utils";
import { Loader2, PlusIcon, RefreshCcw } from "lucide-react";
import Link from "next/link";

const Datasets = () => {
	const { datasets, loading, error, refresh } = useDatasets();

	return (
		<div>
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">All Datasets</h1>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						onClick={() => refresh()}
						disabled={loading}
						className="cursor-pointer"
					>
						<RefreshCcw className={cn(loading && "animate-spin")} />
						Refresh
					</Button>
					<Link
						href="/dashboard/datasets/selection"
						className={cn(buttonVariants({ variant: "outline" }))}
					>
						<PlusIcon className="w-4 h-4" />
						Add Dataset
					</Link>
				</div>
			</div>
			{loading ? (
				<div className="flex items-center justify-center py-12">
					<div className="flex flex-col items-center gap-4">
						<Loader2 className="w-8 h-8 animate-spin" />
						<p className="text-muted-foreground">
							Loading datasets...
						</p>
					</div>
				</div>
			) : error ? (
				<div className="text-center py-12 border-2 border-dashed border-muted-foreground/25 rounded-lg space-y-6">
					<p className="text-muted-foreground">{error}</p>
				</div>
			) : datasets.length === 0 ? (
				<div className="text-center py-12 border-2 border-dashed border-muted-foreground/25 rounded-lg space-y-6">
					<p className="text-muted-foreground">
						No datasets yet. Add a dataset to get started.
					</p>
				</div>
			) : datasets.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
					{datasets.map((dataset, index) => (
						<DatasetCard
							key={
								dataset.datasetId ||
								dataset.processed_dataset_id ||
								`dataset-${index}` // needed this to fix non unique key error
							}
							dataset={dataset}
						/>
					))}
				</div>
			) : null}
		</div>
	);
};

export default Datasets;
