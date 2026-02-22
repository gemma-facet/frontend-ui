"use client";

import { useAuth } from "@/components/auth-provider";
import DatasetCard from "@/components/dataset-card";
import TrainingJobCard from "@/components/training-job-card";
import { Button } from "@/components/ui/button";
import type { Dataset } from "@/types/dataset";
import type { TrainingJob } from "@/types/training";
import {
	ArrowRight,
	BarChart3,
	Book,
	ClipboardList,
	Code2,
	Component,
	Database,
	DatabaseZap,
	Download,
	ExternalLink,
	Github,
	House,
	Package,
	Play,
	RefreshCcw,
	Settings,
	SlidersHorizontal,
	Sparkles,
	ThumbsUp,
	User as UserIcon,
	Zap,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

const MOCK_DATASETS: Dataset[] = [
	{
		datasetName: "medical-qa-instruct",
		datasetId: "medqa",
		processed_dataset_id: "pdid_medqa_001",
		datasetSource: "huggingface",
		datasetSubset: "default",
		numExamples: 15420,
		createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
		splits: ["train", "test"],
		modality: "text",
	},
	{
		datasetName: "chest-xray-vlm",
		datasetId: "xray",
		processed_dataset_id: "pdid_xray_002",
		datasetSource: "local",
		datasetSubset: "default",
		numExamples: 8250,
		createdAt: new Date(Date.now() - 86400000).toISOString(),
		splits: ["train", "val"],
		modality: "vision",
	},
];

const MOCK_JOBS: TrainingJob[] = [
	{
		job_id: "tr_8f92a1b",
		job_name: "gemma-2b-med-sft",
		status: "training",
		base_model_id: "google/gemma-2b-it",
		modality: "text",
		created_at: new Date(Date.now() - 3600000).toISOString(),
	},
	{
		job_id: "tr_3d71c4e",
		job_name: "paligemma-3b-xray",
		status: "completed",
		base_model_id: "google/paligemma-3b-pt-224",
		modality: "vision",
		created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
	},
];

// ─────────────────────────────────────────────────────────────────────────────

export default function HomePage() {
	const { user, loading } = useAuth();

	return (
		<div className="flex flex-col min-h-screen bg-[#030712] text-slate-50 selection:bg-indigo-500/30 font-body">
			{/* Nav */}
			<header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/50 backdrop-blur-xl">
				<div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
					<div className="flex items-center gap-2">
						<Sparkles className="h-6 w-6 text-indigo-500" />
						<span className="text-lg font-bold tracking-tight">
							Facet AI
						</span>
					</div>
					<nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
						<Link
							href="#features"
							className="hover:text-white transition-colors"
						>
							Features
						</Link>
						<Link
							href="https://facetai.mintlify.app"
							target="_blank"
							className="hover:text-white transition-colors"
						>
							Documentation
						</Link>
						<Link
							href="https://github.com/gemma-facet"
							target="_blank"
							className="hover:text-white transition-colors"
						>
							GitHub
						</Link>
					</nav>
					<div className="flex items-center gap-4">
						{loading ? null : user ? (
							<Link href="/dashboard">
								<Button className="bg-indigo-600 hover:bg-indigo-700 text-white border-0">
									Dashboard
								</Button>
							</Link>
						) : (
							<>
								<Link href="/login">
									<Button className="bg-white text-black hover:bg-slate-200 border-0">
										Get Started
									</Button>
								</Link>
							</>
						)}
					</div>
				</div>
			</header>

			<main className="flex-1">
				{/* Hero Section */}
				<section className="relative w-full overflow-hidden py-16 lg:py-24 xl:py-32">
					<div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

					<div className="container relative z-10 mx-auto px-4 md:px-6">
						<div className="flex flex-col items-center space-y-8 text-center">
							<div className="space-y-4 max-w-4xl mx-auto">
								<div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-300 backdrop-blur-sm mb-4">
									<span className="flex h-2 w-2 rounded-full bg-indigo-500 mr-2 animate-pulse" />
									Google Summer of Code 2025
								</div>
								<h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70">
									Fine-tune LLM.{" "}
									<br className="hidden sm:block" />
									<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
										Without the boilerplate.
									</span>
								</h1>
								<p className="mx-auto max-w-[700px] text-lg text-slate-400 md:text-xl leading-relaxed mt-6">
									The open-source, no-code platform for
									deploying specialized Gemma models. From raw
									dataset to optimized inference in minutes,
									not days.
								</p>
							</div>
							<div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-8 justify-center">
								<Link href={user ? "/dashboard" : "/login"}>
									<Button
										size="lg"
										className="w-full sm:w-auto h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white border-0 text-base"
									>
										Start Fine-tuning
										<ArrowRight className="ml-2 h-4 w-4" />
									</Button>
								</Link>
								<Link
									href="https://github.com/gemma-facet"
									target="_blank"
								>
									<Button
										size="lg"
										variant="outline"
										className="w-full sm:w-auto h-12 px-8 border-white/10 bg-white/5 hover:bg-white/10 text-white text-base backdrop-blur-sm"
									>
										<Code2 className="mr-2 h-4 w-4" />
										Star on GitHub
									</Button>
								</Link>
							</div>
						</div>

						{/* Dashboard Preview — real components, static mock data */}
						<div className="relative mx-auto max-w-6xl mt-12 lg:mt-16">
							{/* Glow behind the frame */}
							<div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-indigo-500/20 to-transparent blur-2xl pointer-events-none" />

							{/* App shell frame */}
							<div className="relative rounded-xl border border-white/10 bg-[#080808] shadow-2xl overflow-hidden ring-1 ring-white/10 text-left flex flex-col">
								{/* Title bar */}
								<div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-[#080808] shrink-0">
									<div className="flex gap-1.5">
										<div className="w-3 h-3 rounded-full bg-red-500/70" />
										<div className="w-3 h-3 rounded-full bg-yellow-500/70" />
										<div className="w-3 h-3 rounded-full bg-green-500/70" />
									</div>
									<div className="mx-auto flex h-6 items-center rounded-md bg-white/5 border border-white/10 px-4 text-xs text-slate-500 font-mono">
										app.facet.ai / dashboard
									</div>
								</div>

								{/* Content: sidebar + main */}
								<div className="flex h-[700px] w-full bg-[#080808] p-2 gap-2">
									{/* Sidebar (static visual only) */}
									<div className="hidden md:flex w-[240px] flex-col bg-[#080808] shrink-0 rounded-lg">
										{/* Header matches actual sidebar */}
										<div className="flex items-center gap-2 flex-row p-2 mx-2 mt-2 border-white/10 border rounded-xl shadow-sm bg-[#080808]">
											<div className="bg-white flex aspect-square size-8 items-center justify-center rounded-md">
												<Sparkles
													className="size-4"
													fill="black"
													stroke="black"
												/>
											</div>
											<div className="flex flex-col gap-0.5 leading-none">
												<span className="font-semibold text-sm text-white">
													Facet AI
												</span>
											</div>
										</div>

										<div className="flex-1 overflow-y-auto px-2 py-4 space-y-6 [&::-webkit-scrollbar]:w-0">
											{/* Main */}
											<div className="space-y-0.5">
												<div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors bg-white/10 text-white font-medium cursor-pointer">
													<House className="size-4" />
													<span>Home</span>
												</div>
												<div className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors text-slate-400 hover:bg-white/5 hover:text-white cursor-pointer">
													<div className="flex items-center gap-2">
														<Book className="size-4" />
														<span>Docs</span>
													</div>
													<ExternalLink className="size-3" />
												</div>
												<div className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors text-slate-400 hover:bg-white/5 hover:text-white cursor-pointer">
													<div className="flex items-center gap-2">
														<Github className="size-4" />
														<span>GitHub</span>
													</div>
													<ExternalLink className="size-3" />
												</div>
											</div>

											{/* Collections */}
											<div className="space-y-0.5">
												<div className="px-2 text-[10px] font-semibold text-slate-500 mb-2 tracking-wider uppercase">
													Collections
												</div>
												<div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors text-slate-400 hover:bg-white/5 hover:text-white cursor-pointer">
													<Database className="size-4" />
													<span>Datasets</span>
												</div>
												<div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors text-slate-400 hover:bg-white/5 hover:text-white cursor-pointer">
													<Play className="size-4" />
													<span>Training Jobs</span>
												</div>
											</div>

											{/* Utilities */}
											<div className="space-y-0.5">
												<div className="px-2 text-[10px] font-semibold text-slate-500 mb-2 tracking-wider uppercase">
													Utilities
												</div>
												<div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors text-slate-400 hover:bg-white/5 hover:text-white cursor-pointer">
													<BarChart3 className="size-4" />
													<span>
														Model Evaluation
													</span>
												</div>
												<div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors text-slate-400 hover:bg-white/5 hover:text-white cursor-pointer">
													<Download className="size-4" />
													<span>Model Export</span>
												</div>
											</div>

											{/* New Dataset */}
											<div className="space-y-0.5">
												<div className="px-2 text-[10px] font-semibold text-slate-500 mb-2 tracking-wider uppercase">
													New Dataset
												</div>
												<div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors text-slate-400 hover:bg-white/5 hover:text-white cursor-pointer">
													<DatabaseZap className="size-4" />
													<span>
														Dataset selection
													</span>
												</div>
												<div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors text-slate-400 hover:bg-white/5 hover:text-white cursor-pointer">
													<Settings className="size-4" />
													<span>Preprocessing</span>
												</div>
											</div>

											{/* New Training Job */}
											<div className="space-y-0.5">
												<div className="px-2 text-[10px] font-semibold text-slate-500 mb-2 tracking-wider uppercase">
													New Training Job
												</div>
												<div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors text-slate-400 hover:bg-white/5 hover:text-white cursor-pointer">
													<Component className="size-4" />
													<span>Model Selection</span>
												</div>
												<div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors text-slate-400 hover:bg-white/5 hover:text-white cursor-pointer">
													<DatabaseZap className="size-4" />
													<span>
														Dataset Selection
													</span>
												</div>
												<div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors text-slate-400 hover:bg-white/5 hover:text-white cursor-pointer">
													<SlidersHorizontal className="size-4" />
													<span>
														Training Configuration
													</span>
												</div>
											</div>
										</div>

										<div className="p-2 mt-auto">
											<div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors text-slate-400 hover:bg-white/5 hover:text-white cursor-pointer">
												<UserIcon className="size-4" />
												<span className="truncate">
													gemma@facet.ai
												</span>
											</div>
										</div>
									</div>

									{/* Main dashboard area (Inset variant style) */}
									<div className="flex-1 overflow-y-auto bg-[#030712] border border-white/10 rounded-xl p-6 sm:p-8 shadow-sm relative [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
										<div className="space-y-6 max-w-5xl mx-auto w-full">
											<div>
												<h1 className="text-3xl font-bold">
													Dashboard
												</h1>
												<p className="text-muted-foreground mt-2">
													Craft your own facet of
													Gemma
												</p>
											</div>

											{/* Datasets */}
											<div className="space-y-4">
												<div className="flex items-center justify-between">
													<h2 className="text-xl font-semibold">
														Recent Datasets
													</h2>
													<div className="flex items-center gap-2">
														<Button
															variant="outline"
															size="sm"
															className="opacity-50 pointer-events-none hidden sm:flex"
														>
															<RefreshCcw className="mr-2 h-4 w-4" />
															Refresh
														</Button>
														<Button
															variant="outline"
															size="sm"
															className="opacity-50 pointer-events-none"
														>
															All Datasets
														</Button>
													</div>
												</div>
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													{MOCK_DATASETS.map(ds => (
														<DatasetCard
															key={
																ds.processed_dataset_id
															}
															dataset={ds}
														/>
													))}
												</div>
											</div>

											{/* Training Jobs */}
											<div className="space-y-4">
												<div className="flex items-center justify-between">
													<h2 className="text-xl font-semibold">
														Recent Training Jobs
													</h2>
													<div className="flex items-center gap-2">
														<Button
															variant="outline"
															size="sm"
															className="opacity-50 pointer-events-none hidden sm:flex"
														>
															<RefreshCcw className="mr-2 h-4 w-4" />
															Refresh
														</Button>
														<Button
															variant="outline"
															size="sm"
															className="opacity-50 pointer-events-none"
														>
															All Jobs
														</Button>
													</div>
												</div>
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													{MOCK_JOBS.map(job => (
														<TrainingJobCard
															key={job.job_id}
															job={job}
														/>
													))}
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Features Section */}
				<section
					id="features"
					className="w-full py-16 bg-black relative border-y border-white/5"
				>
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px]" />
					<div className="container relative z-10 mx-auto px-4 md:px-6">
						<div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
							<h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
								The best DX for LLM fine tuning
							</h2>
							<p className="max-w-[700px] text-slate-400 text-lg">
								Despite the number of available tools, the
								developer experience (DX) for LLM fine tuning
								still sucks. We've abstracted away its
								complexity to allow small and medium sized teams
								to focus on data, use-case, and business value.
							</p>
						</div>

						<div className="grid max-w-5xl mx-auto gap-6 sm:grid-cols-2 lg:grid-cols-3">
							<FeatureCard
								icon={
									<Database className="h-6 w-6 text-indigo-400" />
								}
								title="Dataset Management"
								description="Upload custom CSV/JSONL files or sync directly from Hugging Face. We handle the formatting and tokenization."
							/>
							<FeatureCard
								icon={
									<Zap className="h-6 w-6 text-yellow-400" />
								}
								title="Optimized Training"
								description="Leverage techniques like LoRA, QLoRA, and full parameter tuning with 4-bit/8-bit quantization out of the box."
							/>
							<FeatureCard
								icon={
									<Package className="h-6 w-6 text-emerald-400" />
								}
								title="Seamless Export"
								description="Export adapters, merge weights, convert to GGUF, and push directly to the Hugging Face Hub or GCS."
							/>
							<FeatureCard
								icon={
									<ClipboardList className="h-6 w-6 text-pink-400" />
								}
								title="Instruction Tuning (SFT)"
								description="Adapt foundational models to follow precise instructions and format outputs for your specific domain."
							/>
							<FeatureCard
								icon={
									<Sparkles className="h-6 w-6 text-cyan-400" />
								}
								title="Reasoning (GRPO)"
								description="Enhance the cognitive capabilities of Gemma for complex, multi-step tasks and logical problem-solving."
							/>
							<FeatureCard
								icon={
									<ThumbsUp className="h-6 w-6 text-purple-400" />
								}
								title="Preference Tuning (DPO)"
								description="Align your model's outputs with human preferences to improve safety, accuracy, and user experience."
							/>
						</div>
					</div>
				</section>

				{/* CTA Section */}
				<section className="w-full py-16 lg:py-24 relative overflow-hidden">
					<div className="absolute inset-0 bg-indigo-900/10" />
					<div className="container relative z-10 mx-auto px-4 md:px-6">
						<div className="flex flex-col items-center justify-center space-y-6 text-center max-w-3xl mx-auto">
							<h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
								Craft your own facet of Gemma
							</h2>
							<p className="text-slate-400 text-lg">
								Join the community building the next generation
								of specialized, efficient AI models. Open-source
								and free to use.
							</p>
							<div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
								<Link href={user ? "/dashboard" : "/login"}>
									<Button
										size="lg"
										className="h-12 px-8 bg-white text-black hover:bg-slate-200 border-0 text-base w-full sm:w-auto"
									>
										Get Started for Free
									</Button>
								</Link>
								<Link
									href="https://facetai.mintlify.app"
									target="_blank"
								>
									<Button
										size="lg"
										variant="outline"
										className="h-12 px-8 border-white/10 bg-white/5 hover:bg-white/10 text-white text-base backdrop-blur-sm w-full sm:w-auto"
									>
										Read Documentation
									</Button>
								</Link>
							</div>
						</div>
					</div>
				</section>
			</main>

			<footer className="border-t border-white/10 bg-black py-12">
				<div className="container mx-auto px-4 md:px-6">
					<div className="flex flex-col md:flex-row justify-between items-center gap-6">
						<div className="flex items-center gap-2">
							<Sparkles className="h-6 w-6 text-indigo-500" />
							<span className="text-lg font-bold tracking-tight">
								Facet AI
							</span>
						</div>
						<p className="text-sm text-slate-500">
							Built for the Gemmaverse. Google Summer of Code
							2025. By Jet & Adarsh.
						</p>
						<div className="flex gap-4">
							<Link
								href="https://github.com/gemma-facet"
								target="_blank"
								className="text-slate-400 hover:text-white transition-colors"
							>
								GitHub
							</Link>
							<Link
								href="https://facetai.mintlify.app"
								target="_blank"
								className="text-slate-400 hover:text-white transition-colors"
							>
								Docs
							</Link>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}

function FeatureCard({
	icon,
	title,
	description,
}: { icon: ReactNode; title: string; description: string }) {
	return (
		<div className="group rounded-2xl border border-white/5 bg-white/[0.02] p-8 transition-all hover:bg-white/[0.04] hover:border-white/10">
			<div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 group-hover:bg-white/10 transition-colors">
				{icon}
			</div>
			<h3 className="mb-2 text-xl font-semibold text-white">{title}</h3>
			<p className="text-slate-400 leading-relaxed text-sm">
				{description}
			</p>
		</div>
	);
}
