import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import Image from "next/image";

const DatasetPreview = ({
	rows,
}: { rows: { row: Record<string, unknown> }[] }) => {
	// Don't show preview if there are no rows
	if (!rows || rows.length === 0) {
		return null;
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Dataset Preview</CardTitle>
				<CardDescription>
					Below is a preview of the dataset subset and split you have
					selected.
				</CardDescription>
			</CardHeader>
			<CardContent className="">
				<div className="rounded-md border border-input">
					<Table className="">
						<TableCaption>Dataset preview</TableCaption>
						<TableHeader>
							<TableRow className="bg-input/30">
								{Object.keys(rows[0].row).map(col => {
									return (
										<TableHead key={col} className="">
											<div className="flex gap-3 items-center">
												<span>{col}</span>
											</div>
										</TableHead>
									);
								})}
							</TableRow>
						</TableHeader>
						<TableBody className="rounded-md">
							{rows.map((rowObj, _) => (
								<TableRow
									key={`row-${JSON.stringify(rowObj.row)}`}
								>
									{Object.entries(rowObj.row).map(
										([col, value]) => {
											const isImage =
												typeof value === "object" &&
												value !== null &&
												"src" in value;
											return (
												<TableCell key={col}>
													{isImage ? (
														<Image
															src={
																(
																	value as {
																		src: string;
																	}
																).src
															}
															alt={col}
															width={200}
															height={200}
															className="rounded-md"
														/>
													) : (
														<span className="truncate max-w-[300px] inline-block align-bottom">
															{String(value)}
														</span>
													)}
												</TableCell>
											);
										},
									)}
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</CardContent>
		</Card>
	);
};

export default DatasetPreview;
