"use client";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import {
	BrainCircuit,
	ClipboardList,
	Gem,
	Layers,
	Package,
	ThumbsUp,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
	const { user, loading } = useAuth();

	return (
		<div className="flex flex-col min-h-screen bg-gray-900 text-white">
			<main className="flex-1">
				<section className="w-full py-20 md:py-32 lg:py-40 xl:py-48">
					<div className="container mx-auto px-4 md:px-6">
						<div className="flex flex-col items-center space-y-6 text-center">
							<div className="space-y-4">
								<h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none">
									Facet AI
								</h1>
								<p className="mx-auto max-w-[700px] text-gray-400 md:text-xl">
									No-code fine-tuning for Gemma models. Go
									from dataset to deployment, seamlessly.
									Open-source, free, easy to deploy.
								</p>
							</div>
							<div className="space-x-4">
								<Link href={user ? "/dashboard" : "/login"}>
									<Button
										size="lg"
										className="bg-indigo-600 hover:bg-indigo-700"
									>
										Get Started
									</Button>
								</Link>
								<Link
									href="https://github.com/gemma-facet"
									target="_blank"
								>
									<Button
										size="lg"
										variant="outline"
										className="border-gray-600 hover:bg-gray-800"
									>
										Learn More
									</Button>
								</Link>
							</div>
						</div>
					</div>
				</section>

				<section className="w-full py-12 md:py-24 lg:py-32 bg-gray-800/50">
					<div className="container mx-auto px-4 md:px-6">
						<div className="flex flex-col items-center justify-center space-y-4 text-center">
							<div className="space-y-4">
								<div className="inline-block rounded-lg bg-gray-700 px-3 py-1 text-base">
									Key Features
								</div>
								<h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
									Everything you need to fine-tune
								</h2>
								<p className="max-w-[900px] text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
									Facet AI handles the boilerplate, so you can
									focus on creating powerful, specialized
									models.
								</p>
							</div>
						</div>
						<div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none mt-12">
							<div className="grid gap-1 text-center">
								<div className="flex justify-center items-center">
									<Layers className="h-10 w-10 text-indigo-400" />
								</div>
								<h3 className="text-lg font-bold">
									Dataset Preprocessing
								</h3>
								<p className="text-base text-gray-400">
									Process vision and text data from custom
									uploads and Hugging Face.
								</p>
							</div>
							<div className="grid gap-1 text-center">
								<div className="flex justify-center items-center">
									<Gem className="h-10 w-10 text-indigo-400" />
								</div>
								<h3 className="text-lg font-bold">
									Optimized Training
								</h3>
								<p className="text-base text-gray-400">
									Utilize PEFT, LoRA, QLoRA, and full tuning
									with 4-bit/8-bit quantization.
								</p>
							</div>
							<div className="grid gap-1 text-center">
								<div className="flex justify-center items-center">
									<Package className="h-10 w-10 text-indigo-400" />
								</div>
								<h3 className="text-lg font-bold">
									Flexible Model Export
								</h3>
								<p className="text-base text-gray-400">
									Export to adapters, merged, quantized, GGUF,
									and deploy to the Hub or GCS.
								</p>
							</div>
						</div>
					</div>
				</section>

				<section className="w-full py-12 md:py-24 lg:py-32">
					<div className="container mx-auto px-4 md:px-6">
						<div className="flex flex-col items-center justify-center space-y-4 text-center">
							<div className="space-y-4">
								<div className="inline-block rounded-lg bg-gray-700 px-3 py-1 text-base">
									Use Cases
								</div>
								<h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
									Tailored for Your Needs
								</h2>
								<p className="max-w-[900px] text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
									Fine tune your model for a variety of tasks,
									without writing a single line of code.
								</p>
							</div>
						</div>
						<div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none mt-12">
							<div className="grid gap-1 text-center">
								<div className="flex justify-center items-center">
									<ClipboardList className="h-10 w-10 text-indigo-400" />
								</div>
								<h3 className="text-lg font-bold">
									Instruction Tuning (SFT)
								</h3>
								<p className="text-base text-gray-400">
									Adapt models to follow specific instructions
									and formats for precise outputs.
								</p>
							</div>
							<div className="grid gap-1 text-center">
								<div className="flex justify-center items-center">
									<BrainCircuit className="h-10 w-10 text-indigo-400" />
								</div>
								<h3 className="text-lg font-bold">
									Reasoning (GRPO)
								</h3>
								<p className="text-base text-gray-400">
									Enhance reasoning capabilities for complex,
									multi-step tasks and problem-solving.
								</p>
							</div>
							<div className="grid gap-1 text-center">
								<div className="flex justify-center items-center">
									<ThumbsUp className="h-10 w-10 text-indigo-400" />
								</div>
								<h3 className="text-lg font-bold">
									Preference Tuning (DPO)
								</h3>
								<p className="text-base text-gray-400">
									Align models with human preferences for
									better performance, safety, and user
									experience.
								</p>
							</div>
						</div>
					</div>
				</section>
			</main>
			<footer className="flex items-center justify-center w-full h-24 border-t border-gray-800">
				<p className="text-gray-500">
					Built for the Gemmaverse. Google Summer of Code 2025. By Jet
					& Adarsh.
				</p>
			</footer>
		</div>
	);
}
