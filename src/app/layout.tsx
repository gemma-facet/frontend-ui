import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
});

const interTight = Inter_Tight({
	variable: "--font-inter-tight",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Facet AI",
	description:
		"Open-source no-code web platform to fine tune, evaluate, and ship customized Gemma VLM/SLM.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className="dark font-body antialiased">
				<AuthProvider>
					<Toaster richColors theme="dark" />
					{children}
				</AuthProvider>
			</body>
		</html>
	);
}
