"use client";

import ExportJobCard from "@/components/export-job-card";
import { Button } from "@/components/ui/button";
import { useExports } from "@/hooks/useExports";
import { cn } from "@/lib/utils";
import { Loader2, RefreshCcw } from "lucide-react";

const ExportPage = () => {
	const { jobs, loading, error, refresh } = useExports();

	return (
		<div>
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold">Export Models</h1>
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
				</div>
			</div>
			{loading ? (
				<div className="flex items-center justify-center py-12">
					<div className="flex flex-col items-center gap-4">
						<Loader2 className="w-8 h-8 animate-spin" />
						<p className="text-muted-foreground">
							Loading completed jobs...
						</p>
					</div>
				</div>
			) : error ? (
				<div className="text-center py-12 border-2 border-dashed border-muted-foreground/25 rounded-lg space-y-6">
					<p className="text-muted-foreground">{error}</p>
				</div>
			) : jobs.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
					{jobs.map(job => (
						<ExportJobCard key={job.job_id} job={job} />
					))}
				</div>
			) : (
				<div className="text-center py-12 border-2 border-dashed border-muted-foreground/25 rounded-lg space-y-6">
					<p className="text-muted-foreground">
						No completed training jobs found. Complete a training
						job to see it here for export.
					</p>
				</div>
			)}
		</div>
	);
};

export default ExportPage;
