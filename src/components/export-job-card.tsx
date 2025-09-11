"use client";

import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { JobSchema } from "@/types/export";
import { FileTextIcon, ImageIcon } from "lucide-react";
import Link from "next/link";

export type ExportJobCardProps = {
	job: JobSchema;
};

export default function ExportJobCard({ job }: ExportJobCardProps) {
	const ModalityIcon = job.modality === "vision" ? ImageIcon : FileTextIcon;

	const getExportTypes = () => {
		const artifacts = job.artifacts?.file;
		const exportTypes = [
			{ type: "Adapter", available: !!artifacts?.adapter },
			{ type: "Merged", available: !!artifacts?.merged },
			{ type: "GGUF", available: !!artifacts?.gguf },
		];

		return exportTypes;
	};

	const exportTypes = getExportTypes();

	return (
		<Link href={`/dashboard/utilities/export/${job.job_id}`}>
			<Card className="hover:bg-muted/30 transition-colors duration-200 h-full">
				<CardHeader className="pb-2">
					<div className="flex items-start justify-between">
						<div className="flex items-center gap-3 min-w-0 flex-1">
							<CardTitle className="text-lg truncate text-wrap">
								{job.job_id}
							</CardTitle>
							<ModalityIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
						</div>
					</div>
					<CardDescription className="text-sm font-medium text-emerald-600">
						Ready to export
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
