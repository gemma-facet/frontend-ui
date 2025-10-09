"use client";

import { hfDatasetTokenAtom, trainingHfTokenAtom } from "@/atoms";
import { useAuth } from "@/components/auth-provider";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useAtom } from "jotai";
import { Download, LogOut, User as UserIcon } from "lucide-react";
import {
	BarChart3,
	Component,
	Database,
	DatabaseZap,
	ExternalLink,
	Github,
	House,
	Play,
	Settings,
	SlidersHorizontal,
	Sparkles,
	Zap,
} from "lucide-react";
import Link from "next/link";

const collections = [
	{
		title: "Datasets",
		url: "/dashboard/datasets",
		icon: Database,
	},
	{
		title: "Training Jobs",
		url: "/dashboard/training",
		icon: Play,
	},
];

const datasetSteps = [
	{
		title: "Dataset selection",
		url: "/dashboard/datasets/selection",
		icon: DatabaseZap,
	},
	{
		title: "Preprocessing Configuration",
		url: "/dashboard/datasets/configuration",
		icon: Settings,
	},
];

const modelSteps = [
	{
		title: "Model Selection",
		url: "/dashboard/training/new/model",
		icon: Component,
	},
	{
		title: "Dataset Selection",
		url: "/dashboard/training/new/dataset",
		icon: DatabaseZap,
	},
	{
		title: "Training Configuration",
		url: "/dashboard/training/new/configuration",
		icon: SlidersHorizontal,
	},
];

const utilities = [
	{
		title: "Model Evaluation",
		url: "/dashboard/utilities/evaluation",
		icon: BarChart3,
	},
	{
		title: "Model Export",
		url: "/dashboard/utilities/export",
		icon: Download,
	},
];

export function AppSidebar() {
	const { user } = useAuth();
	const [trainingHfToken, setTrainingHfToken] = useAtom(trainingHfTokenAtom);
	const [hfDatasetToken, setHfDatasetToken] = useAtom(hfDatasetTokenAtom);

	const handleLogout = async () => {
		localStorage.removeItem("hfToken");
		localStorage.removeItem("wbToken");
		setTrainingHfToken("");
		setHfDatasetToken("");
		await signOut(auth);
		// Let AuthProvider handle the redirect
	};

	return (
		<Sidebar variant="inset">
			<SidebarHeader className="flex items-center gap-2 flex-row p-2 m-3 border-border border rounded-lg shadow-xs">
				<div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
					<Sparkles className="size-4" fill="white" stroke="white" />
				</div>
				<div className="flex flex-col gap-0.5 leading-none">
					<span className="font-semibold font-title">Facet AI</span>
					<span className="text-xs">v0.0.1-beta</span>
				</div>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton asChild>
								<Link href="/dashboard">
									<House /> Home
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton asChild>
								<Link
									href="https://github.com/gemma-fine-tuning"
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center justify-between"
								>
									<span className="flex items-center gap-1">
										<Github size={16} />
										GitHub
									</span>
									<ExternalLink />
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroup>
				<SidebarGroup>
					<SidebarGroupLabel>Collections</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{collections.map(collection => (
								<SidebarMenuItem key={collection.title}>
									<SidebarMenuButton asChild>
										<Link href={collection.url}>
											<collection.icon />
											<span className="">
												{collection.title}
											</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
				<SidebarGroup>
					<SidebarGroupLabel>Utilities</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{utilities.map(utility => (
								<SidebarMenuItem key={utility.title}>
									<SidebarMenuButton asChild>
										<Link href={utility.url}>
											<utility.icon />
											<span className="">
												{utility.title}
											</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
				<SidebarGroup>
					<SidebarGroupLabel>New Dataset</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{datasetSteps.map(step => (
								<SidebarMenuItem key={step.title}>
									<SidebarMenuButton asChild>
										<Link href={step.url}>
											<step.icon />
											<span className="">
												{step.title}
											</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
				<SidebarGroup>
					<SidebarGroupLabel>New Training Job</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{modelSteps.map(step => (
								<SidebarMenuItem key={step.title}>
									<SidebarMenuButton asChild>
										<Link href={step.url}>
											<step.icon />
											<span className="">
												{step.title}
											</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				{user && (
					<SidebarGroup>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton asChild>
									<Link href="/dashboard/profile">
										<UserIcon />
										{user.email}
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton
									onClick={handleLogout}
									className="w-full"
								>
									<LogOut /> Logout
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroup>
				)}
			</SidebarFooter>
		</Sidebar>
	);
}
