import React, { useState } from "react";
import { base44 } from "@/services/api";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail, Lock, ChevronLeft, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/lib/AuthContext";

export default function Login() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { checkAppState } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await base44.auth.login({
                email: formData.email,
                password: formData.password,
            });
            await checkAppState();
            toast.success("Welcome back to Santi's Watches!");
            navigate(createPageUrl("home"));
        } catch (error) {
            toast.error(error.message || "Failed to sign in. Please check your credentials.");
            setIsLoading(false);
        }
    };

    const handleGoogleLoginSuccess = async (tokenResponse) => {
        setIsLoading(true);
        try {
            await base44.auth.loginWithOAuth("google", tokenResponse.access_token);
            await checkAppState();
            toast.success("Welcome back to Santi's Watches!");
            navigate(createPageUrl("home"));
        } catch (error) {
            toast.error(error.message || "Google sign-in failed.");
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: handleGoogleLoginSuccess,
        onError: () => toast.error("Google Login Failed"),
    });

    return (
        <div className="bg-offwhite min-h-screen pt-24 pb-20 flex items-center justify-center">
            <div className="max-w-md w-full px-6">
                <Link
                    to={createPageUrl("home")}
                    className="inline-flex items-center gap-2 text-muted-warm hover:text-warm-black text-xs font-semibold tracking-widest uppercase mb-8 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" /> Back to Home
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-warm-border p-10 rounded-2xl shadow-sm"
                >
                    <h1 className="font-condensed text-4xl font-bold uppercase tracking-tight text-warm-black mb-2 text-center">
                        Welcome Back
                    </h1>
                    <p className="font-sans text-sm font-light text-muted-warm text-center mb-8">
                        Sign in to access your luxury watch collection
                    </p>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <Label className="font-sans text-[10px] font-semibold tracking-widest uppercase text-muted-warm mb-1.5 block">
                                Email Address
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-warm" />
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="pl-10 bg-white border-warm-border text-warm-black placeholder:text-muted-warm focus-visible:ring-accent-orange/30 focus-visible:border-accent-orange rounded-lg"
                                    placeholder="john@example.com"
                                    autoComplete="email"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <Label className="font-sans text-[10px] font-semibold tracking-widest uppercase text-muted-warm">
                                    Password
                                </Label>
                                <a href="#" className="text-accent-orange text-[10px] font-medium hover:underline">
                                    Forgot password?
                                </a>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-warm" />
                                <Input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="pl-10 bg-white border-warm-border text-warm-black placeholder:text-muted-warm focus-visible:ring-accent-orange/30 focus-visible:border-accent-orange rounded-lg"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-warm-black text-white hover:opacity-90 rounded-lg font-sans font-semibold tracking-wide mt-2"
                        >
                            {isLoading ? "Signing in..." : "Sign In"}
                        </Button>

                        <div className="relative my-5">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-warm-border" />
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase">
                                <span className="bg-white px-3 text-muted-warm font-semibold tracking-widest">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleGoogleLogin}
                            className="w-full bg-white border-warm-border text-warm-black hover:bg-offwhite rounded-lg shadow-sm"
                        >
                            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-muted-warm">
                        Don't have an account?{" "}
                        <Link to={createPageUrl("register")} className="text-accent-orange font-medium hover:underline">
                            Create an account
                        </Link>
                    </div>
                </motion.div>

                {/* Trust signal */}
                <div className="mt-4 flex items-center justify-center gap-2 text-muted-warm">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span className="font-sans text-[10px] font-medium tracking-wide">Secure &amp; Encrypted</span>
                </div>
            </div>
        </div>
    );
}
