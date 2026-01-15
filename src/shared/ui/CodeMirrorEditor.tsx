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
                        minHeight: '60px',
                        maxHeight: '240px', // ~10 lines
                        fontSize: '12px',
                    },
                    '.cm-scroller': {
                        overflow: 'auto',
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                    },
                    '.cm-content': {
                        padding: '4px 0',
                    },
                    '.cm-gutters': {
                        fontSize: '10px',
                        minWidth: '32px',
                    },
                    '.cm-lineNumbers .cm-gutterElement': {
                        padding: '0 4px 0 8px',
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
            className={`my-2 rounded-lg overflow-hidden transition-all shadow-sm ${
                isFocused ? 'ring-1 ring-blue-500/50' : ''
            }`}
        >
            {/* Compact Header */}
            <div className="flex items-center justify-between px-2 py-1 bg-zinc-900">
                <div className="flex items-center gap-2">
                    <select
                        value={language}
                        onChange={(e) => onLanguageChange(e.target.value)}
                        disabled={readOnly}
                        className="text-[11px] bg-zinc-800 text-zinc-300 border-none rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500/50 cursor-pointer"
                    >
                        {LANGUAGES.map((lang) => (
                            <option key={lang.value} value={lang.value}>
                                {lang.label}
                            </option>
                        ))}
                    </select>
                    <span className="text-[10px] text-zinc-500">{lineCount}L</span>
                </div>
                <div className="flex items-center">
                    <button
                        type="button"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-0.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                        title={isCollapsed ? '펼치기' : '접기'}
                    >
                        {isCollapsed ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                            <ChevronUp className="w-3.5 h-3.5" />
                        )}
                    </button>
                    {!readOnly && (
                        <button
                            type="button"
                            onClick={onRemove}
                            className="p-0.5 ml-0.5 text-zinc-500 hover:text-red-400 transition-colors"
                            title="삭제"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* CodeMirror Editor */}
            {!isCollapsed && <div ref={editorRef} />}

            {/* Collapsed Preview */}
            {isCollapsed && (
                <div className="px-2 py-1 bg-zinc-900 text-zinc-500 text-[11px] font-mono truncate">
                    {code.split('\n')[0] || '(빈 코드)'}
                </div>
            )}
        </div>
    );
}
