'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogPortal, DialogOverlay
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Sparkles, Send, Copy, ArrowLeft, Save,
    Bot, User, ChevronRight, Loader2, Wand2
} from 'lucide-react';
import LexicalEditor from './LexicalEditor';
import { api } from '@/shared/api/base';

interface AIEditorDialogProps {
    isOpen: boolean;
    onClose: () => void;
    initialValue: string;
    onSave: (content: string) => void;
    title?: string;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function AIEditorDialog({
    isOpen, onClose, initialValue, onSave, title
}: AIEditorDialogProps) {
    const [editorValue, setEditorValue] = useState(initialValue);
    const [prompt, setPrompt] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setEditorValue(initialValue);
            setMessages([]);
        }
    }, [isOpen, initialValue]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendPrompt = async () => {
        if (!prompt.trim() || isGenerating) return;

        const userMsg: Message = { role: 'user', content: prompt };
        setMessages(prev => [...prev, userMsg]);
        setPrompt('');
        setIsGenerating(true);

        try {
            const response = await api.post('/ai/generate', { prompt, context: editorValue });
            const aiMsg: Message = { role: 'assistant', content: response.data.content };

            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error('AI Generation failed:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ 생성 중 오류가 발생했습니다.' }]);
        } finally {
            setIsGenerating(false);
        }
    };

    const applyToEditor = (content: string) => {
        // Appending to the current content
        const newValue = editorValue ? `${editorValue}\n\n${content}` : content;
        setEditorValue(newValue);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogPortal>
                <DialogOverlay className="bg-zinc-950/70 backdrop-blur-sm" />
                <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0 overflow-hidden border-zinc-200 bg-white shadow-2xl rounded-[32px] flex flex-col">
                    <DialogHeader className="px-8 py-4 border-b bg-zinc-50/50 flex flex-row items-center justify-between space-y-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-black text-zinc-900 tracking-tight">
                                    AI 어시스턴트 에디터
                                </DialogTitle>
                                <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-0.5">
                                    {title || '지능형 노트 관리'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" onClick={onClose} className="rounded-xl font-bold border-zinc-200 hover:bg-zinc-100 h-11 px-6">
                                취소
                            </Button>
                            <Button onClick={() => onSave(editorValue)} className="rounded-xl font-black bg-blue-600 hover:bg-blue-700 h-11 px-8 shadow-lg shadow-blue-200">
                                <Save size={18} className="mr-2" />
                                최종 저장하기
                            </Button>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 flex overflow-hidden">
                        {/* Left Side: AI Assistant */}
                        <div className="w-[40%] flex flex-col bg-zinc-50/50 border-r">
                            <div className="p-4 border-b bg-zinc-50 flex items-center justify-between">
                                <span className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Bot size={14} className="text-blue-600" />
                                    AI Conversation
                                </span>
                            </div>

                            {/* Chat Feed */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {messages.length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
                                        <div className="p-6 bg-white rounded-3xl shadow-sm">
                                            <Sparkles size={40} className="text-blue-200" />
                                        </div>
                                        <p className="text-sm font-bold text-zinc-400">
                                            질문을 입력하여 노트를 풍성하게 만들어보세요.<br />
                                            예: "React와 Next.js의 차이점을 표로 정리해줘"
                                        </p>
                                    </div>
                                )}
                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] rounded-[24px] p-5 shadow-sm ${msg.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-tr-none'
                                            : 'bg-white border text-zinc-800 rounded-tl-none'
                                            }`}>
                                            <div className="flex items-center gap-2 mb-2">
                                                {msg.role === 'user' ? <User size={12} /> : <Bot size={12} className="text-blue-600" />}
                                                <span className="text-[10px] font-black uppercase tracking-widest opacity-70">
                                                    {msg.role === 'user' ? 'You' : 'Assistant'}
                                                </span>
                                            </div>
                                            <div className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
                                                {msg.content}
                                            </div>
                                            {msg.role === 'assistant' && !isGenerating && (
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => applyToEditor(msg.content)}
                                                    className="mt-4 w-full rounded-xl font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 h-9"
                                                >
                                                    <ChevronRight size={14} className="mr-1" />
                                                    에디터에 반영하기
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {isGenerating && (
                                    <div className="flex justify-start animate-pulse">
                                        <div className="bg-white border rounded-[24px] rounded-tl-none p-5 flex items-center gap-3">
                                            <Loader2 size={16} className="animate-spin text-blue-600" />
                                            <span className="text-xs font-bold text-zinc-400 tracking-tight">AI가 생각 중입니다...</span>
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Prompt Input */}
                            <div className="p-6 bg-white border-t">
                                <div className="relative flex items-end gap-2 bg-zinc-50 border border-zinc-200 rounded-[24px] p-2 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-200 transition-all">
                                    <textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendPrompt();
                                            }
                                        }}
                                        placeholder="어떤 내용을 작성해드릴까요?"
                                        className="flex-1 bg-transparent border-none focus:outline-none p-3 text-sm font-medium min-h-[44px] max-h-32 resize-none"
                                    />
                                    <Button
                                        disabled={!prompt.trim() || isGenerating}
                                        onClick={handleSendPrompt}
                                        className="rounded-2xl w-11 h-11 p-0 bg-blue-600 shadow-lg shadow-blue-200 hover:bg-blue-700 flex-shrink-0"
                                    >
                                        <Send size={18} />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Editor */}
                        <div className="w-[60%] flex flex-col bg-white">
                            <div className="p-4 border-b bg-zinc-50/30 flex items-center justify-between">
                                <span className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Wand2 size={12} className="text-blue-500" />
                                    Main Content Editor
                                </span>
                            </div>
                            <div className="flex-1 overflow-y-auto p-8">
                                <LexicalEditor
                                    key={isOpen ? 'opened' : 'closed'} // Force reset on open
                                    value={editorValue}
                                    onChange={setEditorValue}
                                    placeholder="AI가 생성한 내용을 이곳에 다듬거나 직접 작성해 보세요..."
                                />
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
}
