import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Login() {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    // Form States
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        // Admin authentication
        if (isLogin) {
            if (email === "admin" && password === "admin") {
                navigate(createPageUrl("MainFeed"));
            } else {
                alert("Invalid credentials. Use admin/admin");
            }
        } else {
            // For signup, just navigate
            navigate(createPageUrl("MainFeed"));
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br bg-gray-50 flex flex-col relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none" />

            {/* Back Button */}
            <div className="absolute top-6 left-6 z-10">
                <button
                    onClick={() => navigate(createPageUrl("Settings"))}
                    className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-700" />
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col justify-center px-8 py-12">

                {/* Header Section */}
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        {isLogin ? "Welcome Back" : "Create Account"}
                    </h1>
                    <p className="text-gray-500">
                        {isLogin
                            ? "Enter your details to access your journal"
                            : "Start your journey with us today"}
                    </p>
                </div>

                {/* Form Section */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50">

                    {/* Toggle Switch */}
                    <div className="flex p-1 bg-gray-100 rounded-xl mb-8 relative">
                        <div
                            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-all duration-300 ease-in-out ${isLogin ? 'left-1' : 'left-[calc(50%+2px)]'}`}
                        />
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-2 text-sm font-semibold relative z-10 transition-colors ${isLogin ? 'text-gray-900' : 'text-gray-500'}`}
                        >
                            Log In
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-2 text-sm font-semibold relative z-10 transition-colors ${!isLogin ? 'text-gray-900' : 'text-gray-500'}`}
                        >
                            Sign Up
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Name Input (Sign Up Only) */}
                        {!isLogin && (
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-500 ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="John Doe"
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email Input */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="hello@example.com"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password (Log In Only) */}
                        {isLogin && (
                            <div className="flex items-center justify-between text-xs">
                                <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                                    <input type="checkbox" className="rounded border-gray-300 text-slate-700 focus:ring-blue-500" />
                                    Remember me
                                </label>
                                <button type="button" className="text-slate-700 font-medium hover:text-blue-700">
                                    Forgot Password?
                                </button>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full py-4 bg-gradient-to-r bg-slate-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:shadow-purple-300 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            {isLogin ? "Sign In" : "Create Account"}
                            <ArrowRight className="w-5 h-5" />
                        </button>

                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-400">Or continue with</span>
                        </div>
                    </div>

                    {/* Social Login */}
                    <div className="flex justify-center gap-4">
                        <button className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
                        </button>
                        <button className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                            <img src="https://www.svgrepo.com/show/475647/apple-color.svg" alt="Apple" className="w-6 h-6" />
                        </button>
                        <button className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                            <img src="https://www.svgrepo.com/show/475654/github-color.svg" alt="GitHub" className="w-6 h-6" />
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
