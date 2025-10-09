"use client";

import { auth } from "@/lib/firebase";
import { type User, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import {
	type ReactNode,
	createContext,
	useContext,
	useEffect,
	useState,
} from "react";

interface AuthContextType {
	user: User | null;
	loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
	user: null,
	loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async user => {
			setUser(user);

			try {
				if (user) {
					// this automatically refreshes the token and updates the cookie
					const token = await user.getIdToken();
					await fetch("/api/auth/login", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ token }),
					});

					// Redirect to dashboard if user just logged in and is on login page
					if (
						typeof window !== "undefined" &&
						window.location.pathname === "/login"
					) {
						// router.refresh();
						router.push("/dashboard");
						// window.location.href = "/dashboard";
					}
				} else {
					console.log("[AuthProvider] Calling logout API...");
					await fetch("/api/auth/logout", { method: "POST" });

					// Redirect to login if user just logged out and is on a protected route
					if (
						typeof window !== "undefined" &&
						window.location.pathname.startsWith("/dashboard")
					) {
						// router.refresh();
						router.push("/login");
						// window.location.href = "/login";
					}
				}
			} catch (error) {
				console.error("Auth API call failed:", error);
			} finally {
				setLoading(false);
			}
		});

		return () => unsubscribe();
	}, [router]);

	return (
		<AuthContext.Provider value={{ user, loading }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
