"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
			<div className="max-w-2xl mx-auto text-center">
				<h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-6xl">
					Welcome to Facet AI
				</h1>
				<p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
					A platform for fine-tuning Gemma VLM/SLM models to your
					specific needs. Get started by creating an account or
					logging in.
				</p>
				<div className="mt-10 flex items-center justify-center gap-x-6">
					<Link href="/login">
						<Button>Login</Button>
					</Link>
					<Link href="/login">
						<Button variant="outline">Sign Up</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}
