'use client';

import { Pencil, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import CodeBlock from '@/shared/ui/CodeBlock';
import type { SpecContent } from '@/entities/tech/model/types';

interface NoteCardProps {
    content: SpecContent;
    index: number;
    isActive: boolean;
    isAdminMode: boolean;
    onClick: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export function NoteCard({
    content,
    index,
    isActive,
    isAdminMode,
    onClick,
    onEdit,
    onDelete,
}: NoteCardProps) {
    return (
        <div
            className={`group border rounded-lg overflow-hidden bg-white transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-md ${
                isActive
                    ? 'border-blue-400 ring-1 ring-blue-100 shadow-md'
                    : 'border-zinc-200 hover:border-zinc-300 shadow-sm'
            }`}
            onClick={onClick}
        >
            {/* Header */}
            <div className="flex items-center gap-2.5 px-3 py-2.5 bg-zinc-900">
                <span className="w-5 h-5 rounded bg-white text-zinc-900 text-[10px] font-bold flex items-center justify-center shrink-0">
                    {String(index).padStart(2, '0')}
                </span>
                <h2 className="flex-1 text-sm font-semibold text-white truncate">
                    {content.title}
                </h2>
                {isAdminMode && (
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit();
                            }}
                            className="p-1.5 bg-zinc-100 hover:bg-zinc-200 rounded transition-colors text-zinc-600 hover:text-zinc-900"
                        >
                            <Pencil size={14} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            className="p-1.5 bg-zinc-100 hover:bg-red-100 rounded transition-colors text-zinc-600 hover:text-red-600"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-3">
                <div className="text-zinc-600 text-sm leading-relaxed max-h-[240px] overflow-hidden relative">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkBreaks]}
                        components={{
                            p({ children }) {
                                const isEmpty = !children || (Array.isArray(children) && children.length === 0) || children === '';
                                return <p className="mb-2 last:mb-0 min-h-[1.2em]">{isEmpty ? '\u00A0' : children}</p>;
                            },
                            code({ node, inline, className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || '');
                                return !inline && match ? (
                                    <CodeBlock
                                        code={String(children).replace(/\n$/, '')}
                                        language={match[1]}
                                    />
                                ) : (
                                    <code className="bg-zinc-200 px-1 py-0.5 rounded text-xs font-mono text-zinc-800" {...props}>
                                        {children}
                                    </code>
                                );
                            }
                        }}
                    >
                        {content.content}
                    </ReactMarkdown>
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                </div>
            </div>
        </div>
    );
}
