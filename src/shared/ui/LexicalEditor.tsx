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
import { CodeMirrorNode, $createCodeMirrorNode } from './lexical/CodeMirrorNode';

const theme = {
    ltr: 'ltr',
    rtl: 'rtl',
    placeholder: 'text-zinc-400 font-medium absolute top-5 left-5 pointer-events-none text-sm',
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

// Custom parser: plain text with line breaks preserved, code blocks parsed
function parseTextToNodes(text: string) {
    const root = $getRoot();
    root.clear();

    // Regex to match code blocks: ```language\ncode\n```
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
        // Add text before the code block
        const textBefore = text.slice(lastIndex, match.index);
        if (textBefore) {
            const lines = textBefore.split('\n');
            for (const line of lines) {
                const paragraph = $createParagraphNode();
                if (line.trim()) {
                    paragraph.append($createTextNode(line));
                }
                root.append(paragraph);
            }
        }

        // Add the code block as CodeMirrorNode
        const language = match[1] || 'javascript';
        const code = match[2].replace(/\n$/, ''); // Remove trailing newline
        const codeNode = $createCodeMirrorNode(code, language);
        root.append(codeNode);

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text after last code block
    const remainingText = text.slice(lastIndex);
    if (remainingText) {
        const lines = remainingText.split('\n');
        for (const line of lines) {
            const paragraph = $createParagraphNode();
            if (line.trim()) {
                paragraph.append($createTextNode(line));
            }
            root.append(paragraph);
        }
    }

    // If no content was added, add empty paragraph
    if (root.getChildrenSize() === 0) {
        root.append($createParagraphNode());
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
            CodeMirrorNode,
        ],
    };

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <div className="relative rounded-md bg-white overflow-hidden border border-zinc-300 focus-within:ring-2 focus-within:ring-zinc-900 focus-within:ring-offset-1 transition-all flex flex-col min-h-[280px]" dir="ltr">
                <LexicalToolbar />
                <div className="flex-1 min-h-[240px] relative overflow-y-auto">
                    <RichTextPlugin
                        contentEditable={
                            <ContentEditable className="min-h-full p-5 outline-none text-sm" />
                        }
                        placeholder={<div className={theme.placeholder}>{placeholder || '내용을 입력하세요...'}</div>}
                        ErrorBoundary={LexicalErrorBoundary}
                    />
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
