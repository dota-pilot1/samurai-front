'use client';

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
    code: string;
    language: string;
}

export default function CodeBlock({ code, language }: CodeBlockProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group my-4 rounded-lg overflow-hidden">
            {/* Copy Button */}
            <button
                onClick={handleCopy}
                className="absolute top-2 right-2 z-10 p-2 rounded-md bg-zinc-700/80 hover:bg-zinc-600 text-zinc-300 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                title="복사"
            >
                {copied ? (
                    <Check className="w-4 h-4 text-green-400" />
                ) : (
                    <Copy className="w-4 h-4" />
                )}
            </button>

            {/* Language Badge */}
            <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded text-xs font-medium bg-zinc-700/80 text-zinc-300">
                {language}
            </div>

            {/* Code */}
            <SyntaxHighlighter
                language={language}
                style={vscDarkPlus}
                customStyle={{
                    margin: 0,
                    padding: '2.5rem 1rem 1rem 1rem',
                    borderRadius: '0.5rem',
                    fontSize: '13px',
                }}
                showLineNumbers
                lineNumberStyle={{
                    minWidth: '2.5em',
                    paddingRight: '1em',
                    color: '#6b7280',
                    userSelect: 'none',
                }}
            >
                {code}
            </SyntaxHighlighter>
        </div>
    );
}
