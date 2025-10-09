"use client";

import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { ExportJobListEntry } from "@/types/export";
import Link from "next/link";

export type ExportJobCardProps = {
	job: ExportJobListEntry;
};

export default function ExportJobCard({ job }: ExportJobCardProps) {
	const getFileExportTypes = () => {
		const artifacts = job.artifacts?.file;
		return [
			{ type: "Adapter", available: !!artifacts?.adapter },
			{ type: "Merged", available: !!artifacts?.merged },
			{ type: "GGUF", available: !!artifacts?.gguf },
		];
	};

	const getHfExportTypes = () => {
		const artifacts = job.artifacts?.hf;
		return [
			{ type: "Adapter", available: !!artifacts?.adapter },
			{ type: "Merged", available: !!artifacts?.merged },
			{ type: "GGUF", available: !!artifacts?.gguf },
		];
	};

	const fileExportTypes = getFileExportTypes();
	const hfExportTypes = getHfExportTypes();

	return (
		<Link href={`/dashboard/utilities/export/${job.job_id}`}>
			<Card className="hover:bg-muted/30 transition-colors duration-200 h-full">
				<CardHeader className="pb-2">
					<div className="flex items-start justify-between">
						<div className="flex items-center gap-3 min-w-0 flex-1">
							<CardTitle className="text-lg truncate text-wrap">
								{job.job_name}
							</CardTitle>
						</div>
					</div>
				</CardHeader>

				<CardContent className="space-y-2">
					<div>
						<p className="text-xs text-muted-foreground mb-1">
							Base model
						</p>
						<p className="text-sm font-medium text-foreground truncate">
							{job.base_model_id ?? "-"}
						</p>
					</div>
					<div>
						<p className="text-xs text-muted-foreground mb-1">
							Job ID
						</p>
						<p className="text-sm font-medium text-foreground truncate">
							{job.job_id}
						</p>
					</div>

					<div className="pt-2 border-t space-y-3">
						<div>
							<p className="text-xs text-muted-foreground mb-2">
								Direct downloads (GCS)
							</p>
							<div className="flex flex-wrap gap-1">
								{fileExportTypes.map(item => (
									<Badge
										key={`file-${item.type}`}
										variant={
											item.available
												? "default"
												: "outline"
										}
										className={`text-xs ${item.available ? "bg-white" : ""}`}
									>
										{item.type}
									</Badge>
								))}
							</div>
						</div>
						<div>
							<p className="text-xs text-muted-foreground mb-2">
								Hugging Face Hub
							</p>
							<div className="flex flex-wrap gap-1">
								{hfExportTypes.map(item => (
									<Badge
										key={`hf-${item.type}`}
										variant={
											item.available
												? "default"
												: "outline"
										}
										className={`text-xs ${item.available ? "bg-white" : ""}`}
									>
										{item.type}
									</Badge>
								))}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}
