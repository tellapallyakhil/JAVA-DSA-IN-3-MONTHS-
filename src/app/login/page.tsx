"use client";

import { useState } from 'react';
import { login, signup } from './actions';
import { LogIn, UserPlus, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setMessage(null);

        const action = isSignUp ? signup : login;

        const result = await action(formData) as { error?: string, success?: string };

        if (result?.error) {
            let errorMessage = result.error;
            if (errorMessage.includes('Email not confirmed')) {
                errorMessage = 'Email not verified. Please check your inbox OR go to Supabase Dashboard -> Auth -> Providers -> Email -> Disable "Confirm Email".';
            }
            setMessage({ text: errorMessage, type: 'error' });
            setLoading(false);
        } else if (result?.success) {
            setMessage({ text: result.success, type: 'success' });
            setLoading(false);
        }
        // If successful redirect happens in server action, so we don't need to do anything here usually.
        // But if we are here, either error or success message (for verify email).
    }

    async function handleGoogleLogin() {
        setSocialLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            setMessage({ text: error.message, type: 'error' });
            setSocialLoading(false);
        }
    }

    async function handleForgotPassword() {
        const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
        const email = emailInput?.value;

        if (!email) {
            setMessage({ text: 'Please enter your email address first.', type: 'error' });
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/callback?next=/profile`,
        });

        if (error) {
            setMessage({ text: error.message, type: 'error' });
        } else {
            setMessage({ text: 'Password reset link sent! Check your email.', type: 'success' });
        }
        setLoading(false);
    }

    return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <div className="glass-card p-8 w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
                    <p className="text-muted-foreground">{isSignUp ? 'Start your DS journey today.' : 'Continue where you left off.'}</p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={handleGoogleLogin}
                        disabled={socialLoading || loading}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {socialLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <svg className="h-5 w-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
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
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                        )}
                        <span className="font-medium">Continue with Google</span>
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#0a0a0a] px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>

                    <form action={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium ml-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="hello@example.com"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary transition-all placeholder:text-zinc-600"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <input
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary transition-all placeholder:text-zinc-600"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            {!isSignUp && (
                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    className="text-xs text-primary hover:text-primary/80 font-medium underline underline-offset-4"
                                >
                                    Forgot Password?
                                </button>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || socialLoading}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_-5px_rgba(124,58,237,0.5)] hover:shadow-[0_0_30px_-5px_rgba(124,58,237,0.6)]"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" />
                            ) : isSignUp ? (
                                <>Sign Up <UserPlus size={18} /></>
                            ) : (
                                <>Sign In <LogIn size={18} /></>
                            )}
                        </button>
                    </form>
                </div>

                {message && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 text-sm ${message.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                        <AlertCircle size={18} />
                        {message.text}
                    </div>
                )}

                <div className="text-center text-sm text-muted-foreground">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button
                        type="button"
                        onClick={() => { setIsSignUp(!isSignUp); setMessage(null); }}
                        className="text-primary hover:text-primary/80 font-semibold underline underline-offset-4"
                    >
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                    </button>
                </div>
            </div>
        </div>
    );
}
