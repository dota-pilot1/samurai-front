'use client';

import { useEffect, useRef, useState } from 'react';
import { EditorState } from '@codemirror/state';
import {
    EditorView,
    keymap,
    lineNumbers,
    highlightActiveLine,
} from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { sql } from '@codemirror/lang-sql';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { Trash2, ChevronUp, ChevronDown } from 'lucide-react';

interface CodeMirrorEditorProps {
    code: string;
    language: string;
    onChange: (value: string) => void;
    onLanguageChange: (lang: string) => void;
    onRemove: () => void;
    readOnly?: boolean;
}

const LANGUAGES = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'json', label: 'JSON' },
    { value: 'sql', label: 'SQL' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'shell', label: 'Shell' },
];

function getLanguageExtension(lang: string) {
    switch (lang) {
        case 'javascript':
            return javascript();
        case 'typescript':
            return javascript({ typescript: true });
        case 'python':
            return python();
        case 'java':
            return java();
        case 'html':
            return html();
        case 'css':
            return css();
        case 'json':
            return json();
        case 'sql':
            return sql();
        case 'markdown':
            return markdown();
        default:
            return javascript();
    }
}

export default function CodeMirrorEditor({
    code,
    language,
    onChange,
    onLanguageChange,
    onRemove,
    readOnly = false,
}: CodeMirrorEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const lineCount = code.split('\n').length;
    const calculatedHeight = Math.min(Math.max(lineCount * 20 + 20, 100), 400);

    useEffect(() => {
        if (!editorRef.current || isCollapsed) return;

        const updateListener = EditorView.updateListener.of((update) => {
            if (update.docChanged) {
                onChange(update.state.doc.toString());
            }
            if (update.focusChanged) {
                setIsFocused(update.view.hasFocus);
            }
        });

        const state = EditorState.create({
            doc: code,
            extensions: [
                lineNumbers(),
                highlightActiveLine(),
                history(),
                keymap.of([...defaultKeymap, ...historyKeymap]),
                getLanguageExtension(language),
                oneDark,
                updateListener,
                EditorView.editable.of(!readOnly),
                EditorView.theme({
                    '&': {
                        height: `${calculatedHeight}px`,
                        fontSize: '13px',
                    },
                    '.cm-scroller': {
                        overflow: 'auto',
                        fontFamily: 'monospace',
                    },
                    '.cm-content': {
                        padding: '8px 0',
                    },
                }),
            ],
        });

        const view = new EditorView({
            state,
            parent: editorRef.current,
        });

        viewRef.current = view;

        return () => {
            view.destroy();
            viewRef.current = null;
        };
    }, [language, isCollapsed, readOnly]);

    // 외부에서 code가 변경되었을 때 에디터 업데이트
    useEffect(() => {
        if (viewRef.current) {
            const currentCode = viewRef.current.state.doc.toString();
            if (currentCode !== code) {
                viewRef.current.dispatch({
                    changes: {
                        from: 0,
                        to: currentCode.length,
                        insert: code,
                    },
                });
            }
        }
    }, [code]);

    return (
        <div
            className={`my-3 border rounded-lg overflow-hidden transition-all ${
                isFocused ? 'ring-2 ring-blue-500 border-blue-500' : 'border-zinc-300'
            }`}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-zinc-800 border-b border-zinc-700">
                <div className="flex items-center gap-2">
                    <select
                        value={language}
                        onChange={(e) => onLanguageChange(e.target.value)}
                        disabled={readOnly}
                        className="text-xs bg-zinc-700 text-zinc-200 border border-zinc-600 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        {LANGUAGES.map((lang) => (
                            <option key={lang.value} value={lang.value}>
                                {lang.label}
                            </option>
                        ))}
                    </select>
                    <span className="text-xs text-zinc-400">{lineCount} lines</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-1 text-zinc-400 hover:text-zinc-200 transition-colors"
                        title={isCollapsed ? '펼치기' : '접기'}
                    >
                        {isCollapsed ? (
                            <ChevronDown className="w-4 h-4" />
                        ) : (
                            <ChevronUp className="w-4 h-4" />
                        )}
                    </button>
                    {!readOnly && (
                        <button
                            type="button"
                            onClick={onRemove}
                            className="p-1 text-zinc-400 hover:text-red-400 transition-colors"
                            title="삭제"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* CodeMirror Editor */}
            {!isCollapsed && <div ref={editorRef} />}

            {/* Collapsed Preview */}
            {isCollapsed && (
                <div className="px-3 py-2 bg-zinc-900 text-zinc-400 text-xs font-mono truncate">
                    {code.split('\n')[0] || '(빈 코드)'}
                </div>
            )}
        </div>
    );
}
