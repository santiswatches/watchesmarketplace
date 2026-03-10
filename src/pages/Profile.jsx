import React, { useState, useEffect } from "react";
import { base44 } from "@/services/api";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { motion } from "framer-motion";
import { ChevronLeft, User, Package, Settings, LogOut } from "lucide-react";

export default function Profile() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const isAuthenticated = await base44.auth.isAuthenticated();
                if (!isAuthenticated) {
                    base44.auth.redirectToLogin(createPageUrl("profile"));
                    return;
                }
                const currentUser = await base44.auth.me();
                setUser(currentUser);
            } catch (error) {
                console.error("Failed to load user:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleLogout = async () => {
        try {
            await base44.auth.logout();
            window.location.href = "/";
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-background min-h-screen pt-24 flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading profile...</div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="bg-background min-h-screen pt-20 md:pt-24 pb-20">
            <div className="max-w-4xl mx-auto px-6 lg:px-12">
                <Link
                    to={createPageUrl("home")}
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-xs tracking-wide mb-8 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" /> Back to Home
                </Link>

                <h1 className="text-3xl text-foreground font-light tracking-tight mb-10">My Account</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1 border-r border-border/50 pr-8">
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-4 border-b border-border/50 pb-6">
                                <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center text-gold text-2xl font-light">
                                    {user.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-foreground text-lg truncate">{user.full_name || "Client"}</h2>
                                    <p className="text-muted-foreground text-xs truncate">{user.email}</p>
                                </div>
                            </div>

                            <nav className="flex flex-col gap-2">
                                <Link to={createPageUrl("profile")} className="flex items-center gap-3 px-4 py-3 bg-white/5 text-gold rounded-sm transition-colors text-sm">
                                    <User className="w-4 h-4" /> Profile Overview
                                </Link>
                                <Link to={createPageUrl("my-orders")} className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-white/5 hover:text-foreground rounded-sm transition-colors text-sm">
                                    <Package className="w-4 h-4" /> Order History
                                </Link>
                                <button className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-white/5 hover:text-foreground rounded-sm transition-colors text-sm text-left w-full">
                                    <Settings className="w-4 h-4" /> Settings
                                </button>
                                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-sm transition-colors text-sm text-left w-full mt-4">
                                    <LogOut className="w-4 h-4" /> Log Out
                                </button>
                            </nav>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <div className="bg-card border border-border/50 rounded-sm p-8">
                            <h2 className="text-xl text-foreground font-light tracking-tight mb-6">Profile Details</h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-muted-foreground text-xs tracking-wider uppercase mb-1 block">Full Name</label>
                                    <p className="text-foreground">{user.full_name || "Not provided"}</p>
                                </div>
                                <div>
                                    <label className="text-muted-foreground text-xs tracking-wider uppercase mb-1 block">Email Address</label>
                                    <p className="text-foreground">{user.email}</p>
                                </div>
                                <div>
                                    <label className="text-muted-foreground text-xs tracking-wider uppercase mb-1 block">Account Created</label>
                                    <p className="text-foreground">
                                        {user.created_date ? new Date(user.created_date).toLocaleDateString() : "Unknown"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
