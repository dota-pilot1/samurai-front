'use client';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TRANSFORMERS } from '@lexical/markdown';
import { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ListNode, ListItemNode } from '@lexical/list';
import { $getRoot, $createParagraphNode, $createTextNode } from 'lexical';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { CodeNode, CodeHighlightNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { LexicalToolbar } from './LexicalToolbar';

const theme = {
    ltr: 'ltr',
    rtl: 'rtl',
    placeholder: 'text-zinc-400 font-medium absolute top-8 left-8 pointer-events-none',
    paragraph: 'mb-2 relative font-medium text-sm leading-relaxed text-zinc-700 text-left',
    quote: 'border-l-4 border-zinc-200 pl-4 italic text-zinc-500 text-left',
    heading: {
        h1: 'text-2xl font-black text-zinc-900 mb-4 mt-6 text-left',
        h2: 'text-xl font-black text-zinc-900 mb-3 mt-5 text-left',
        h3: 'text-lg font-black text-zinc-900 mb-2 mt-4 text-left',
    },
    list: {
        nested: {
            listitem: 'list-none',
        },
        ol: 'list-decimal ml-6 mb-4',
        ul: 'list-disc ml-6 mb-4',
        listitem: 'mb-1',
    },
    link: 'text-blue-600 underline',
    text: {
        bold: 'font-black',
        italic: 'italic',
        underline: 'underline',
        strikethrough: 'line-through',
    },
    code: 'bg-zinc-100 px-1.5 py-0.5 rounded font-mono text-[13px] text-zinc-800',
};

// Custom parser: plain text with line breaks preserved
function parseTextToNodes(text: string) {
    const root = $getRoot();
    root.clear();

    // Split by newlines - each line becomes a paragraph
    const lines = text.split('\n');

    for (const line of lines) {
        const paragraph = $createParagraphNode();
        if (line.trim()) {
            paragraph.append($createTextNode(line));
        }
        root.append(paragraph);
    }
}

// Custom serializer: preserve line breaks
function serializeNodesToText(): string {
    const root = $getRoot();
    const children = root.getChildren();
    const lines: string[] = [];

    for (const child of children) {
        lines.push(child.getTextContent());
    }

    return lines.join('\n');
}

// Plugin to sync external text changes to Lexical Editor
function ValueSyncPlugin({ value, isInitialLoad }: { value: string; isInitialLoad: React.RefObject<boolean> }) {
    const [editor] = useLexicalComposerContext();
    const lastValueRef = useRef(value);

    // Initial load
    useEffect(() => {
        if (isInitialLoad.current && value) {
            editor.update(() => {
                parseTextToNodes(value);
            });
            lastValueRef.current = value;
            isInitialLoad.current = false;
        }
    }, [editor, value, isInitialLoad]);

    // External value changes (e.g., AI assistant updating content)
    useEffect(() => {
        if (!isInitialLoad.current && value !== lastValueRef.current) {
            // Check if editor has focus - if so, don't override user input
            const hasFocus = document.activeElement?.closest('[data-lexical-editor]');
            if (!hasFocus) {
                editor.update(() => {
                    parseTextToNodes(value);
                });
            }
            lastValueRef.current = value;
        }
    }, [editor, value]);

    return null;
}

interface LexicalEditorProps {
    value: string;
    onChange: (text: string) => void;
    placeholder?: string;
}

export default function LexicalEditor({ value, onChange, placeholder }: LexicalEditorProps) {
    const isInitialLoad = useRef(true);

    const initialConfig = {
        namespace: 'SpecEditor',
        theme,
        onError: (error: Error) => console.error(error),
        nodes: [
            HeadingNode,
            ListNode,
            ListItemNode,
            QuoteNode,
            CodeNode,
            CodeHighlightNode,
            AutoLinkNode,
            LinkNode,
        ],
    };

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <div className="relative border-2 border-zinc-100 rounded-2xl bg-zinc-50 focus-within:border-blue-500 focus-within:bg-white transition-all flex flex-col min-h-[300px] overflow-hidden" dir="ltr">
                <div className="flex-1 flex flex-col min-h-0 bg-white">
                    <LexicalToolbar />
                    <div className="flex-1 min-h-[300px] relative overflow-y-auto">
                        <RichTextPlugin
                            contentEditable={
                                <ContentEditable className="min-h-full p-8 outline-none" />
                            }
                            placeholder={<div className={theme.placeholder}>{placeholder || '작성해 보세요...'}</div>}
                            ErrorBoundary={LexicalErrorBoundary}
                        />
                    </div>
                </div>
                <HistoryPlugin />
                <AutoFocusPlugin />
                <ListPlugin />
                <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
                <ValueSyncPlugin value={value} isInitialLoad={isInitialLoad} />
                <OnChangePlugin onChange={(editorState) => {
                    editorState.read(() => {
                        const text = serializeNodesToText();
                        onChange(text);
                    });
                }} />
            </div>
        </LexicalComposer>
    );
}
