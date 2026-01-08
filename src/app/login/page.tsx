"use client";

import { useState } from 'react';
import { login, signup } from './actions';
import { LogIn, UserPlus, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
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

    return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <div className="glass-card p-8 w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
                    <p className="text-muted-foreground">{isSignUp ? 'Start your DS journey today.' : 'Continue where you left off.'}</p>
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

                    <button
                        type="submit"
                        disabled={loading}
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
