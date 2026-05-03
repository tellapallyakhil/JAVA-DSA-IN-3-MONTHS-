"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Uncaught error in ${this.props.name || "Component"}:`, error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-[300px] w-full glass-card p-12 flex flex-col items-center justify-center text-center space-y-6 bg-red-500/5 border-red-500/20">
          <div className="p-4 bg-red-500/20 rounded-full text-red-400">
            <AlertCircle size={48} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
            <p className="text-zinc-500 max-w-md mx-auto">
              {this.props.name ? `The ${this.props.name} feature` : "This section"} encountered an unexpected error. Don't worry, your progress is safe.
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => this.setState({ hasError: false })}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold transition-all"
            >
              <RefreshCcw size={18} /> Try Again
            </button>
            <Link
              href="/"
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
            >
              <Home size={18} /> Go Home
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
