import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { UserFieldMapping } from "@/types/dataset";
import { PlusIcon, TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";

// small helper to create a stable-ish id for keys
const generateId = () =>
	`${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

interface UserFieldMappingProps {
	columns: string[];
	value: UserFieldMapping[];
	onChange: (value: UserFieldMapping[]) => void;
	excludeColumns?: string[];
}

const UserFieldMappingComponent = ({
	columns,
	value,
	onChange,
	excludeColumns = [],
}: UserFieldMappingProps) => {
	const availableColumns = columns.filter(
		col => !excludeColumns.includes(col),
	);

	// generate a reasonably unique id for each content part and keep them
	// internal to the component so keys remain stable across value changes.
	const [keys, setKeys] = useState<string[]>(() =>
		value.map(() => generateId()),
	);

	// keep keys in sync with the controlled `value` prop length. Use the
	// functional updater to avoid reading `keys` from the outer scope so the
	// effect only needs to depend on `value.length` (satisfies exhaustive-deps).
	useEffect(() => {
		setKeys(prev => {
			if (value.length > prev.length) {
				return [
					...prev,
					...Array(value.length - prev.length)
						.fill(0)
						.map(() => generateId()),
				];
			}
			if (value.length < prev.length) {
				return prev.slice(0, value.length);
			}
			return prev;
		});
	}, [value.length]);

	const handleAddField = () => {
		onChange([...value, { type: "template", value: "" }]);
		// optimistically add a key so new item mounts with stable key
		setKeys(prev => [...prev, generateId()]);
	};

	const handleRemoveField = (index: number) => {
		const newValue = value.filter((_, i) => i !== index);
		onChange(newValue);
		setKeys(prev => prev.filter((_, i) => i !== index));
	};

	const handleFieldChange = (index: number, field: UserFieldMapping) => {
		const newValue = [...value];
		newValue[index] = field;
		onChange(newValue);
	};

	const handleTypeChange = (
		index: number,
		type: "template" | "column" | "image",
	) => {
		const newField = { ...value[index], type, value: "" };
		handleFieldChange(index, newField);
	};

	const handleValueChange = (index: number, newValue: string) => {
		const newField = { ...value[index], value: newValue };
		handleFieldChange(index, newField);
	};

	return (
		<div className="space-y-4">
			{value.map((field, index) => (
				<div
					key={keys[index]}
					className="flex flex-col gap-3 p-3 border rounded-lg"
				>
					<div className="flex items-center justify-between">
						<Label>Content Part {index + 1}</Label>
						{value.length > 1 && (
							<Button
								variant="destructive"
								size="sm"
								onClick={() => handleRemoveField(index)}
								type="button"
							>
								<TrashIcon className="h-4 w-4" />
							</Button>
						)}
					</div>

					<Tabs
						value={field.type}
						onValueChange={newType =>
							handleTypeChange(
								index,
								newType as "template" | "column" | "image",
							)
						}
					>
						<TabsList className="grid w-full grid-cols-3">
							<TabsTrigger value="template">Template</TabsTrigger>
							<TabsTrigger value="column">Column</TabsTrigger>
							<TabsTrigger value="image">Image</TabsTrigger>
						</TabsList>

						<TabsContent value="template" className="space-y-2">
							<Label htmlFor={`template-${index}`}>
								Template Text
							</Label>
							<Textarea
								id={`template-${index}`}
								value={field.value || ""}
								onChange={e =>
									handleValueChange(index, e.target.value)
								}
								placeholder="Enter template text for user message"
								rows={3}
							/>
						</TabsContent>

						<TabsContent value="column" className="space-y-2">
							<Label htmlFor={`column-${index}`}>
								Source Column
							</Label>
							<Select
								value={field.value || ""}
								onValueChange={newValue =>
									handleValueChange(index, newValue)
								}
							>
								<SelectTrigger id={`column-${index}`}>
									<SelectValue placeholder="Select a column" />
								</SelectTrigger>
								<SelectContent>
									{columns
										.filter(
											col =>
												!excludeColumns.includes(col) ||
												col === field.value,
										)
										.map(column => (
											<SelectItem
												key={column}
												value={column}
											>
												{column}
											</SelectItem>
										))}
								</SelectContent>
							</Select>
						</TabsContent>

						<TabsContent value="image" className="space-y-2">
							<Label htmlFor={`image-${index}`}>
								Image Column
							</Label>
							<Select
								value={field.value || ""}
								onValueChange={newValue =>
									handleValueChange(index, newValue)
								}
							>
								<SelectTrigger id={`image-${index}`}>
									<SelectValue placeholder="Select an image column" />
								</SelectTrigger>
								<SelectContent>
									{columns
										.filter(
											col =>
												!excludeColumns.includes(col) ||
												col === field.value,
										)
										.map(column => (
											<SelectItem
												key={column}
												value={column}
											>
												{column}
											</SelectItem>
										))}
								</SelectContent>
							</Select>
						</TabsContent>
					</Tabs>
				</div>
			))}

			<Button
				onClick={handleAddField}
				className="w-full"
				variant="outline"
				type="button"
			>
				<PlusIcon className="h-4 w-4 mr-2" />
				Add Content Part
			</Button>
		</div>
	);
};

export default UserFieldMappingComponent;
