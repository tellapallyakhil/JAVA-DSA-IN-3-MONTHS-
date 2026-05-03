'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ShortNotesProps {
    title: string;
    content: string;
}

export default function ShortNotes({ title, content }: ShortNotesProps) {
    return (
        <div className="short-notes-container">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
                {title}
            </h1>

            <div className="prose prose-invert max-w-none">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        // Custom heading styles
                        h2: ({ children }) => (
                            <h2 className="text-xl font-bold mt-8 mb-4 text-white flex items-center gap-2 pb-2 border-b border-white/10">
                                {children}
                            </h2>
                        ),
                        h3: ({ children }) => (
                            <h3 className="text-lg font-semibold mt-6 mb-3 text-purple-300">
                                {children}
                            </h3>
                        ),
                        // Styled code blocks
                        pre: ({ children }) => (
                            <pre className="bg-zinc-900/80 border border-zinc-700/50 rounded-lg sm:rounded-xl p-3 sm:p-4 my-3 sm:my-4 overflow-x-auto text-xs sm:text-sm">
                                {children}
                            </pre>
                        ),
                        code: ({ className, children, ...props }) => {
                            const isInline = !className;
                            if (isInline) {
                                return (
                                    <code className="bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                                        {children}
                                    </code>
                                );
                            }
                            return (
                                <code className="text-green-300 font-mono text-sm" {...props}>
                                    {children}
                                </code>
                            );
                        },
                        // Styled tables
                        table: ({ children }) => (
                            <div className="my-4 overflow-x-auto rounded-xl border border-white/10">
                                <table className="w-full text-sm">
                                    {children}
                                </table>
                            </div>
                        ),
                        thead: ({ children }) => (
                            <thead className="bg-purple-500/10 border-b border-white/10">
                                {children}
                            </thead>
                        ),
                        th: ({ children }) => (
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-purple-300 text-xs sm:text-sm whitespace-nowrap">
                                {children}
                            </th>
                        ),
                        td: ({ children }) => (
                            <td className="px-2 sm:px-4 py-2 sm:py-3 border-t border-white/5 text-white/80 text-xs sm:text-sm">
                                {children}
                            </td>
                        ),
                        tr: ({ children }) => (
                            <tr className="hover:bg-white/5 transition-colors">
                                {children}
                            </tr>
                        ),
                        // Styled lists
                        ul: ({ children }) => (
                            <ul className="my-3 space-y-2 list-none pl-0">
                                {children}
                            </ul>
                        ),
                        ol: ({ children }) => (
                            <ol className="my-3 space-y-2 list-decimal pl-5">
                                {children}
                            </ol>
                        ),
                        li: ({ children }) => (
                            <li className="text-white/80 flex gap-2 items-start">
                                <span className="text-purple-400 mt-1.5 shrink-0">•</span>
                                <span>{children}</span>
                            </li>
                        ),
                        // Styled paragraphs
                        p: ({ children }) => (
                            <p className="text-white/80 my-3 leading-relaxed">
                                {children}
                            </p>
                        ),
                        // Styled links
                        a: ({ href, children }) => (
                            <a href={href} className="text-blue-400 hover:text-blue-300 underline transition-colors" target="_blank" rel="noopener noreferrer">
                                {children}
                            </a>
                        ),
                        // Styled blockquotes
                        blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-purple-500/50 pl-4 my-4 bg-purple-500/5 py-2 rounded-r-lg italic text-white/70">
                                {children}
                            </blockquote>
                        ),
                        // Horizontal rules
                        hr: () => (
                            <hr className="my-6 border-t border-white/10" />
                        ),
                        // Strong/bold text
                        strong: ({ children }) => (
                            <strong className="font-bold text-white">
                                {children}
                            </strong>
                        ),
                        // Emphasis/italic
                        em: ({ children }) => (
                            <em className="italic text-purple-200">
                                {children}
                            </em>
                        ),
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>
        </div>
    );
}

