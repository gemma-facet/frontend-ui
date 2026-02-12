"use client";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useDatasetDetail } from "@/hooks/useDatasetDetail";
import { cn } from "@/lib/utils";
import type {
	DatasetDeleteResponse,
	DatasetMessage,
	DatasetSplit,
} from "@/types/dataset";
import {
	AlertCircle,
	CalendarIcon,
	DatabaseIcon,
	ExternalLink,
	FileTextIcon,
	HashIcon,
	ImageIcon,
	Loader2,
	Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense, use, useState } from "react";

const DatasetPage = ({
	params,
}: {
	params: Promise<{ datasetName: string }>;
}) => {
	const { datasetName } = use(params);
	// Use processed_dataset_id for backend operations, but datasetName for URL routing
	const { data, loading, error, deleteDataset } =
		useDatasetDetail(datasetName);

	// State for delete operations
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteSuccess, setDeleteSuccess] =
		useState<DatasetDeleteResponse | null>(null);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

	const handleDelete = async () => {
		if (
			!confirm(
				"Are you sure you want to delete this dataset? This action cannot be undone.",
			)
		) {
			return;
		}

		setIsDeleting(true);
		try {
			const deleteData = await deleteDataset();
			setDeleteSuccess(deleteData);
			setShowDeleteDialog(true);

			// Auto-redirect after 5 seconds
			setTimeout(() => {
				window.location.href = "/dashboard/datasets";
			}, 5000);
		} catch (error) {
			console.error("Delete failed:", error);
			alert(
				error instanceof Error
					? error.message
					: "Failed to delete dataset",
			);
		} finally {
			setIsDeleting(false);
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const renderMessage = (message: DatasetMessage) => {
		const contentKey =
			typeof message.content === "string"
				? message.content.slice(0, 20)
				: message.content
						.map(part =>
							part.type === "text"
								? part.text.slice(0, 20)
								: part.image.slice(0, 20),
						)
						.join("-");

		return (
			<div
				key={`${message.role}-${contentKey}`}
				className={`p-3 rounded-lg flex gap-2 items-start ${
					message.role === "system"
						? "bg-blue-950/20 border border-blue-800/30"
						: message.role === "user"
							? "bg-muted border border-border"
							: "bg-green-950/20 border border-green-800/30"
				}`}
			>
				<Badge variant="outline" className="text-xs">
					{message.role}
				</Badge>
				<div className="text-sm whitespace-pre-wrap">
					{typeof message.content === "string" ? (
						<p>{message.content}</p>
					) : (
						<div className="flex flex-col gap-2">
							{message.content.map(part => (
								<div
									key={
										part.type === "text"
											? part.text
											: part.image
									}
								>
									{part.type === "text" ? (
										<p>{part.text}</p>
									) : (
										<Image
											src={part.image}
											alt="User image"
											width={200}
											height={200}
											className="rounded-md"
										/>
									)}
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		);
	};

	const renderSplit = (split: DatasetSplit) => (
		<Card key={split.split_name} className="">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<FileTextIcon className="w-5 h-5" />
					{split.split_name}
				</CardTitle>
				<CardDescription>
					{split.num_rows.toLocaleString()} examples
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<Accordion
						type="single"
						collapsible
						className="w-full border border-input/30 rounded-md px-4 bg-card"
					>
						<AccordionItem value="sample-conversations">
							<AccordionTrigger className="cursor-pointer">
								Sample Conversations
							</AccordionTrigger>
							<AccordionContent>
								<div className="space-y-4">
									{split.samples.map((sample, index) => (
										<Card
											key={`sample-${index}-${JSON.stringify(sample).slice(0, 20)}`}
											className="border-dashed"
										>
											<CardContent className="">
												{sample.messages ? (
													// Language modeling format
													<div className="space-y-3">
														{sample.messages.map(
															(
																message,
																msgIndex,
															) =>
																renderMessage(
																	message,
																),
														)}
													</div>
												) : sample.prompt ? (
													// Prompt-only or Preference format
													<div className="space-y-3">
														<div className="text-sm font-medium text-muted-foreground mb-2">
															Prompt:
														</div>
														{sample.prompt.map(
															(
																message,
																msgIndex,
															) =>
																renderMessage(
																	message,
																),
														)}

														{/* Handle preference format (chosen/rejected) */}
														{sample.chosen &&
														sample.rejected ? (
															<div className="space-y-4 mt-4">
																<div>
																	<div className="text-sm font-medium text-green-700 mb-2">
																		Chosen
																		Response:
																	</div>
																	<div className="space-y-2">
																		{(
																			sample.chosen as DatasetMessage[]
																		).map(
																			(
																				message: DatasetMessage,
																				msgIndex: number,
																			) =>
																				renderMessage(
																					message,
																				),
																		)}
																	</div>
																</div>
																<div>
																	<div className="text-sm font-medium text-red-700 mb-2">
																		Rejected
																		Response:
																	</div>
																	<div className="space-y-2">
																		{(
																			sample.rejected as DatasetMessage[]
																		).map(
																			(
																				message: DatasetMessage,
																				msgIndex: number,
																			) =>
																				renderMessage(
																					message,
																				),
																		)}
																	</div>
																</div>
															</div>
														) : (
															/* Show additional fields for prompt-only */
															Object.entries(
																sample,
															)
																.filter(
																	([key]) =>
																		key !==
																		"prompt",
																)
																.map(
																	([
																		key,
																		value,
																	]) => (
																		<div
																			key={
																				key
																			}
																			className="mt-3 p-2 bg-muted/50 rounded"
																		>
																			<div className="text-sm font-medium text-muted-foreground">
																				{
																					key
																				}
																				:
																			</div>
																			<div className="text-sm">
																				{String(
																					value,
																				)}
																			</div>
																		</div>
																	),
																)
														)}
													</div>
												) : (
													<div className="text-sm text-muted-foreground">
														Unknown sample format
													</div>
												)}
											</CardContent>
										</Card>
									))}
								</div>
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</div>
			</CardContent>
		</Card>
	);

	return (
		<div className="space-y-6">
			<Suspense fallback={<div>Loading...</div>}>
				{loading && (
					<Card>
						<CardContent className="flex items-center justify-center py-8">
							<Loader2 className="w-6 h-6 animate-spin mr-2" />
							Loading dataset details...
						</CardContent>
					</Card>
				)}

				{error && (
					<Card>
						<CardContent className="flex items-center gap-2 py-8 text-destructive">
							<AlertCircle className="w-5 h-5" />
							{error}
						</CardContent>
					</Card>
				)}

				{data && (
					<div className="space-y-6">
						{/* Dataset Overview */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<DatabaseIcon className="w-5 h-5" />
									{data.dataset_name}
									{data.modality === "vision" ? (
										<ImageIcon className="w-4 h-4" />
									) : (
										<FileTextIcon className="w-4 h-4" />
									)}
								</CardTitle>
								<CardDescription>
									Dataset details and configuration
								</CardDescription>
								<CardAction className="flex gap-2">
									{data.dataset_source === "huggingface" && (
										<Link
											href={`https://huggingface.co/datasets/${data.dataset_id}`}
											target="_blank"
											className={cn(
												buttonVariants({
													variant: "outline",
												}),
											)}
										>
											View on Hugging Face{" "}
											<ExternalLink />
										</Link>
									)}
									<Button
										variant="destructive"
										size="sm"
										onClick={handleDelete}
										disabled={isDeleting}
										className="ml-auto"
									>
										{isDeleting ? (
											<>
												<Loader2 className="w-4 h-4 animate-spin mr-2" />
												Deleting...
											</>
										) : (
											<>
												<Trash2 className="w-4 h-4 mr-2" />
												Delete Dataset
											</>
										)}
									</Button>
								</CardAction>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<div className="flex items-center gap-2 text-sm">
											<HashIcon className="w-4 h-4 text-muted-foreground" />
											<span className="font-medium">
												Source ID:
											</span>
											<span className="font-mono text-xs bg-muted px-2 py-1 rounded">
												{data.dataset_id}
											</span>
										</div>
										<div className="flex items-center gap-2 text-sm">
											<HashIcon className="w-4 h-4 text-muted-foreground" />
											<span className="font-medium">
												Dataset ID:
											</span>
											<span className="font-mono text-xs bg-muted px-2 py-1 rounded">
												{data.processed_dataset_id}
											</span>
										</div>
										<div className="flex items-center gap-2 text-sm">
											<DatabaseIcon className="w-4 h-4 text-muted-foreground" />
											<span className="font-medium">
												Source:
											</span>
											<Badge variant="outline">
												{data.dataset_source ===
												"upload"
													? "local"
													: "huggingface"}
											</Badge>
										</div>
										<div className="flex items-center gap-2 text-sm">
											<FileTextIcon className="w-4 h-4 text-muted-foreground" />
											<span className="font-medium">
												Subset:
											</span>
											<Badge variant="outline">
												{data.dataset_subset}
											</Badge>
										</div>
									</div>
									<div className="space-y-2">
										<div className="flex items-center gap-2 text-sm">
											<CalendarIcon className="w-4 h-4 text-muted-foreground" />
											<span className="font-medium">
												Created:
											</span>
											<span>
												{formatDate(data.created_at)}
											</span>
										</div>
										<div className="flex items-center gap-2 text-sm">
											<FileTextIcon className="w-4 h-4 text-muted-foreground" />
											<span className="font-medium">
												Splits:
											</span>
											<div className="flex gap-1 flex-wrap">
												{data.splits.map(
													(split: DatasetSplit) => (
														<Badge
															key={
																split.split_name
															}
															variant="outline"
															className="text-xs"
														>
															{split.split_name}
														</Badge>
													),
												)}
											</div>
										</div>
										<div className="flex items-center gap-2 text-sm">
											<HashIcon className="w-4 h-4 text-muted-foreground" />
											<span className="font-medium">
												Total Examples:
											</span>
											<span>
												{data.splits
													.reduce(
														(
															total: number,
															split: DatasetSplit,
														) =>
															total +
															split.num_rows,
														0,
													)
													.toLocaleString()}
											</span>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Dataset Splits */}
						{data.splits.map(renderSplit)}
					</div>
				)}
			</Suspense>

			{/* Delete Success Dialog */}
			<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-green-900">
							<div className="w-4 h-4 rounded-full bg-green-500" />
							Dataset Deleted Successfully
						</DialogTitle>
						<DialogDescription>
							{deleteSuccess?.message}
						</DialogDescription>
					</DialogHeader>

					{deleteSuccess?.deleted_resources &&
						deleteSuccess.deleted_resources.length > 0 && (
							<div className="mt-4">
								<p className="text-sm font-medium text-gray-900 mb-2">
									Deleted Resources:
								</p>
								<div className="max-h-40 overflow-y-auto space-y-1">
									{deleteSuccess.deleted_resources.map(
										(resource: string) => (
											<div
												key={resource}
												className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-700"
											>
												{resource}
											</div>
										),
									)}
								</div>
							</div>
						)}

					{deleteSuccess?.deleted_files_count && (
						<div className="mt-4">
							<p className="text-sm font-medium text-gray-900">
								Deleted {deleteSuccess.deleted_files_count}{" "}
								files
							</p>
						</div>
					)}

					<div className="mt-4 flex items-center justify-between">
						<p className="text-xs text-gray-600">
							Redirecting to datasets dashboard in 5 seconds...
						</p>
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								window.location.href = "/dashboard/datasets";
							}}
						>
							Go Now
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default DatasetPage;
