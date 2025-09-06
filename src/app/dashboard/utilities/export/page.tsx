"use client";

import ExportJobCard from "@/components/export-job-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ExportJob, ExportJobsResponse } from "@/types/export";
import { Loader2, RefreshCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const ExportPage = () => {
	const [jobs, setJobs] = useState<ExportJob[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const refresh = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			const response = await fetch("/api/export/jobs");
			if (!response.ok) {
				throw new Error("Failed to fetch export jobs");
			}

			const data: ExportJobsResponse = await response.json();
			setJobs(data.jobs);
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Unknown error");
		} finally {
			setLoading(false);
		}
	}, []);

	// Refresh on page visit
	useEffect(() => {
		refresh();
	}, [refresh]);

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
