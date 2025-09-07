import { getDatasetAdapter } from "@/lib/dataset-adapters";
import type { DatasetMessage, DatasetSample } from "@/types/dataset";
import Image from "next/image";
import type React from "react";

interface MessageDisplayProps {
	messages?: DatasetMessage[];
	sample?: DatasetSample;
	className?: string;
	showGroundTruth?: boolean;
	compact?: boolean;
}

function renderContent(
	content: DatasetMessage["content"],
	role: string,
	compact = false,
): React.ReactNode {
	if (typeof content === "string") {
		return (
			<p className={compact ? "text-xs" : ""}>
				<b>{role}:</b> {content}
			</p>
		);
	}

	return (
		<div className="flex flex-col gap-2">
			{content.map((part, partIdx) =>
				part.type === "text" ? (
					<p
						key={`${part.text.slice(0, 20)}-${partIdx}`}
						className={compact ? "text-xs" : ""}
					>
						<b>{role}:</b> {part.text}
					</p>
				) : (
					<Image
						key={`${part.image.slice(0, 20)}-${partIdx}`}
						src={part.image}
						alt=""
						width={compact ? 100 : 200}
						height={compact ? 100 : 200}
						className="rounded-md"
					/>
				),
			)}
		</div>
	);
}

function renderGroundTruth(
	groundTruth: DatasetMessage | string | null,
	compact = false,
): React.ReactNode {
	if (!groundTruth) return null;

	if (typeof groundTruth === "string") {
		return (
			<div
				className={`p-2 bg-muted/50 rounded border ${compact ? "text-xs" : "text-sm"}`}
			>
				<div className="font-medium text-muted-foreground mb-1">
					Expected:
				</div>
				<div>{groundTruth}</div>
			</div>
		);
	}

	// Handle DatasetMessage format
	return (
		<div
			className={`p-2 bg-muted/50 rounded border ${compact ? "text-xs" : "text-sm"}`}
		>
			<div className="font-medium text-muted-foreground mb-1">
				Expected:
			</div>
			<div>
				{renderContent(groundTruth.content, groundTruth.role, compact)}
			</div>
		</div>
	);
}

export function MessageDisplay({
	messages,
	sample,
	className = "",
	showGroundTruth = false,
	compact = false,
}: MessageDisplayProps) {
	// If sample is provided, use adapter pattern
	if (sample) {
		const adapter = getDatasetAdapter(sample);
		const inputMessages = adapter.getInputMessages(sample);
		const groundTruth = showGroundTruth
			? adapter.getGroundTruth(sample)
			: null;
		const datasetType = adapter.getDatasetType();

		return (
			<div
				className={`space-y-2 ${compact ? "text-xs" : "text-sm"} ${className}`}
			>
				{compact && (
					<div className="text-xs text-muted-foreground">
						Type: {datasetType}
					</div>
				)}

				<div className="space-y-1">
					{inputMessages.map((msg, idx) => {
						const contentKey =
							typeof msg.content === "string"
								? msg.content.slice(0, 20)
								: msg.content
										.map(part =>
											part.type === "text"
												? part.text.slice(0, 20)
												: part.image.slice(0, 20),
										)
										.join("-");

						return (
							<div
								key={`${msg.role}-${contentKey}-${idx}`}
								className="space-y-1"
							>
								{renderContent(msg.content, msg.role, compact)}
							</div>
						);
					})}
				</div>

				{/* Only show ground truth if it exists and is requested */}
				{groundTruth &&
					showGroundTruth &&
					renderGroundTruth(groundTruth, compact)}

				{/* Show indicator for prompt-only datasets that don't have ground truth */}
				{datasetType === "prompt-only" && showGroundTruth && (
					<div
						className={`p-2 bg-blue-50 rounded border ${compact ? "text-xs" : "text-sm"}`}
					>
						<div className="font-medium text-blue-600 mb-1">
							Prompt-only dataset:
						</div>
						<div className="text-muted-foreground">
							No ground truth available - designed for inference
							only
						</div>
					</div>
				)}

				{/* Show rejected option for preference datasets */}
				{datasetType === "preference" &&
					sample.rejected &&
					showGroundTruth && (
						<div
							className={`p-2 bg-red-50 rounded border ${compact ? "text-xs" : "text-sm"}`}
						>
							<div className="font-medium text-red-600 mb-1">
								Rejected:
							</div>
							<div className="space-y-1">
								{sample.rejected.map((msg, idx) => {
									const contentKey =
										typeof msg.content === "string"
											? msg.content.slice(0, 20)
											: msg.content
													.map(part =>
														part.type === "text"
															? part.text.slice(
																	0,
																	20,
																)
															: part.image.slice(
																	0,
																	20,
																),
													)
													.join("-");

									return (
										<div
											key={`rejected-${msg.role}-${contentKey}-${idx}`}
										>
											{renderContent(
												msg.content,
												msg.role,
												compact,
											)}
										</div>
									);
								})}
							</div>
						</div>
					)}
			</div>
		);
	}

	// Fallback to original behavior for direct messages
	const displayMessages = messages || [];

	return (
		<div
			className={`space-y-1 ${compact ? "text-xs" : "text-sm"} ${className}`}
		>
			{displayMessages.map((msg, idx) => {
				const contentKey =
					typeof msg.content === "string"
						? msg.content.slice(0, 20)
						: msg.content
								.map(part =>
									part.type === "text"
										? part.text.slice(0, 20)
										: part.image.slice(0, 20),
								)
								.join("-");
				return (
					<div
						key={`${msg.role}-${contentKey}-${idx}`}
						className="space-y-1"
					>
						{renderContent(msg.content, msg.role, compact)}
					</div>
				);
			})}
		</div>
	);
}
