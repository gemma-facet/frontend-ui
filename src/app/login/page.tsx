"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/lib/firebase";
import {
	GoogleAuthProvider,
	createUserWithEmailAndPassword,
	getRedirectResult,
	signInWithEmailAndPassword,
	signInWithPopup,
	validatePassword,
} from "firebase/auth";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [mode, setMode] = useState<"login" | "signup">("login");

	useEffect(() => {
		getRedirectResult(auth).catch(error => {
			setError(error.message);
		});
	}, []);

	const handleAuthSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		if (mode === "signup") {
			const status = await validatePassword(auth, password);
			if (!status.isValid) {
				const missing: string[] = [];
				if (status.containsLowercaseLetter !== true)
					missing.push("lowercase letter");
				if (status.containsUppercaseLetter !== true)
					missing.push("uppercase letter");
				if (status.containsNumericCharacter === false)
					missing.push("digit");
				if (status.containsNonAlphanumericCharacter === false)
					missing.push("special character");
				if (status.meetsMinPasswordLength === false)
					missing.push("required length");
				setError(`Password missing: ${missing.join(", ")}`);
				return;
			}
		}
		try {
			if (mode === "login") {
				await signInWithEmailAndPassword(auth, email, password);
			} else {
				await createUserWithEmailAndPassword(auth, email, password);
			}
		} catch (error: unknown) {
			if (error instanceof Error) {
				setError(error.message);
			} else {
				setError("An unknown error occurred");
			}
		}
	};

	const handleGoogleSignIn = async () => {
		setError(null);
		try {
			const provider = new GoogleAuthProvider();
			// biome-ignore lint/correctness/noUnusedVariables: result used by AuthProvider
			const result = await signInWithPopup(auth, provider);
		} catch (error: unknown) {
			if (error instanceof Error) {
				setError(error.message);
			} else {
				setError("An unknown error occurred");
			}
		}
	};

	return (
		<div className="relative flex min-h-screen items-center justify-center bg-[#030712] overflow-hidden">
			{/* Background radial glow */}
			<div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(120,119,198,0.25),transparent)]" />
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

			{/* Card */}
			<div className="relative z-10 mx-auto w-full max-w-sm px-4">
				{/* Logo */}
				<div className="flex flex-col items-center gap-2 mb-8">
					<Link href="/" className="flex items-center gap-2.5 group">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors">
							<Sparkles className="h-5 w-5 text-indigo-400" />
						</div>
						<span className="text-xl font-bold text-white tracking-tight">
							Facet AI
						</span>
					</Link>
				</div>

				<div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 shadow-2xl">
					<div className="mb-6 text-center">
						<h1 className="text-2xl font-bold text-white tracking-tight">
							{mode === "signup"
								? "Create an account"
								: "Welcome back"}
						</h1>
						<p className="text-sm text-slate-400 mt-1">
							{mode === "signup"
								? "Start fine-tuning Gemma for free"
								: "Sign in to your Facet AI workspace"}
						</p>
					</div>

					{/* Google */}
					<Button
						type="button"
						variant="outline"
						className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-white mb-6"
						onClick={handleGoogleSignIn}
					>
						<svg
							className="mr-2 h-4 w-4"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
								fill="#4285F4"
							/>
							<path
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								fill="#34A853"
							/>
							<path
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
								fill="#FBBC05"
							/>
							<path
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								fill="#EA4335"
							/>
						</svg>
						Continue with Google
					</Button>

					<div className="relative mb-6">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t border-white/10" />
						</div>
						<div className="relative flex justify-center text-xs">
							<span className="bg-transparent px-3 text-slate-500 uppercase tracking-widest">
								or
							</span>
						</div>
					</div>

					<form onSubmit={handleAuthSubmit} className="space-y-4">
						<div className="space-y-1.5">
							<Label
								htmlFor="email"
								className="text-sm text-slate-300"
							>
								Email
							</Label>
							<Input
								id="email"
								type="email"
								value={email}
								onChange={e => setEmail(e.target.value)}
								required
								placeholder="name@example.com"
								className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500 focus-visible:border-indigo-500/50"
							/>
						</div>
						<div className="space-y-1.5">
							<Label
								htmlFor="password"
								className="text-sm text-slate-300"
							>
								Password
							</Label>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={e => setPassword(e.target.value)}
								required
								placeholder="••••••••"
								className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500 focus-visible:border-indigo-500/50"
							/>
						</div>

						{error && (
							<p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
								{error}
							</p>
						)}

						<Button
							type="submit"
							className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white border-0 mt-2"
						>
							{mode === "signup" ? "Create account" : "Sign in"}
						</Button>
					</form>

					<p className="mt-5 text-center text-sm text-slate-400">
						{mode === "signup"
							? "Already have an account? "
							: "Don't have an account? "}
						<button
							type="button"
							onClick={() =>
								setMode(mode === "signup" ? "login" : "signup")
							}
							className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
						>
							{mode === "signup" ? "Sign in" : "Sign up"}
						</button>
					</p>
				</div>

				<p className="mt-6 text-center text-xs text-slate-600">
					By continuing, you agree to our terms of service and privacy
					policy.
				</p>
			</div>
		</div>
	);
}
