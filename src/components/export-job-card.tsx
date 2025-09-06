"use client";

import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { ExportJob } from "@/types/export";
import { FileTextIcon, ImageIcon } from "lucide-react";
import Link from "next/link";

export type ExportJobCardProps = {
	job: ExportJob;
};

export default function ExportJobCard({ job }: ExportJobCardProps) {
	const ModalityIcon = job.modality === "vision" ? ImageIcon : FileTextIcon;

	const getExportStatus = () => {
		if (!job.export_status)
			return { text: "Ready to export", color: "text-emerald-600" };

		const statusConfig = {
			adapter: { text: "Exporting adapter...", color: "text-amber-600" },
			merged: {
				text: "Exporting merged model...",
				color: "text-amber-600",
			},
			gguf: { text: "Exporting GGUF...", color: "text-amber-600" },
		};

		return statusConfig[job.export_status];
	};

	const getExportTypes = () => {
		const exportTypes = [
			{ type: "Adapter", available: !!job.export?.adapter },
			{ type: "Merged", available: !!job.export?.merged },
			{ type: "GGUF", available: !!job.export?.gguf },
		];

		return exportTypes;
	};

	const exportStatus = getExportStatus();
	const exportTypes = getExportTypes();

	return (
		<Link href={`/dashboard/utilities/export/${job.job_id}`}>
			<Card className="hover:bg-muted/30 transition-colors duration-200 h-full">
				<CardHeader className="pb-2">
					<div className="flex items-start justify-between">
						<div className="flex items-center gap-2 min-w-0 flex-1">
							<ModalityIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
							<CardTitle className="text-lg truncate">
								{job.job_name ?? job.job_id}
							</CardTitle>
						</div>
					</div>
					<CardDescription
						className={`text-sm font-medium ${exportStatus.color}`}
					>
						{exportStatus.text}
					</CardDescription>
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

					<div className="pt-2 border-t">
						<p className="text-xs text-muted-foreground mb-2">
							Export types
						</p>
						<div className="flex flex-wrap gap-1">
							{exportTypes.map(exportItem => (
								<Badge
									key={exportItem.type}
									variant={
										exportItem.available
											? "default"
											: "outline"
									}
									className={`text-xs ${
										exportItem.available ? "bg-white" : ""
									}`}
								>
									{exportItem.type}
								</Badge>
							))}
						</div>
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}
