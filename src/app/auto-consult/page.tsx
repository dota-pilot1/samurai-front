'use client';

import {
    Send, User2, MessageSquare, Clock, Zap,
    Database, Activity, Monitor, ChevronRight,
    MoreHorizontal, Paperclip, Smile
} from 'lucide-react';

const projectQueue = [
    { title: '금융 시스템 모듈화', status: '상담중', time: '5분 전', project: 'Nex Finance', priority: 'High' },
    { title: '실시간 데이터 파이프라인', status: '대기중', time: '12분 전', project: 'DataStream', priority: 'Medium' },
    { title: 'MSA 보안 아키텍처', status: '대기중', time: '20분 전', project: 'Cloud Shield', priority: 'High' },
    { title: '프론트엔드 성능 최적화', status: '완료됨', time: '1시간 전', project: 'Speedy UI', priority: 'Low' },
];

export default function AutoConsultPage() {
    return (
        <main className="h-[calc(100vh-3.5rem)] bg-zinc-50 flex overflow-hidden animate-in fade-in duration-700">
            {/* Left Sidebar: Project Queue */}
            <aside className="w-80 border-r bg-white flex flex-col shrink-0 overflow-hidden">
                <div className="p-6 border-b flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-zinc-900">상담 대기열</h2>
                        <p className="text-xs text-zinc-500 font-medium">실시간 프로젝트 큐 관리</p>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-600 rounded-full border border-green-100 animate-pulse">
                        <Activity size={12} />
                        <span className="text-[10px] font-bold">LIVE</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {projectQueue.map((item, idx) => (
                        <div
                            key={idx}
                            className={`p-4 rounded-xl border transition-all cursor-pointer group ${item.status === '상담중'
                                    ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-100'
                                    : 'bg-white border-zinc-100 hover:border-zinc-200'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.status === '상담중' ? 'bg-blue-500 text-white' :
                                        item.status === '대기중' ? 'bg-zinc-100 text-zinc-500' :
                                            'bg-zinc-50 text-zinc-300'
                                    }`}>
                                    {item.status}
                                </span>
                                <span className="text-[10px] text-zinc-400 font-medium flex items-center gap-1">
                                    <Clock size={10} /> {item.time}
                                </span>
                            </div>
                            <h3 className="text-sm font-bold text-zinc-800 mb-1 group-hover:text-blue-600 transition-colors">
                                {item.title}
                            </h3>
                            <p className="text-xs text-zinc-400 font-medium">{item.project}</p>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t bg-zinc-50/50">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-zinc-200">
                        <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center text-white shrink-0">
                            <Monitor size={20} />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-bold text-zinc-900 truncate">HQ Senior Developer</p>
                            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Active Agent</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content: Chat Interface */}
            <div className="flex-1 flex flex-col bg-white overflow-hidden">
                {/* Chat Header */}
                <header className="px-8 py-5 border-b flex items-center justify-between shadow-sm relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg relative">
                            <User2 size={24} />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-black text-zinc-900">본사 선임 개발자 상담</h1>
                                <span className="px-2 py-0.5 bg-zinc-100 text-zinc-500 text-[10px] font-bold rounded uppercase tracking-tighter">Level 9</span>
                            </div>
                            <p className="text-sm text-zinc-500 font-medium flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                현재 3개의 세션을 동시에 지원하고 있습니다.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden lg:flex gap-2 mr-4">
                            <div className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-2">
                                <Zap size={14} className="fill-current" />
                                <span className="text-xs font-bold">WebSocket Sync</span>
                            </div>
                            <div className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-100 flex items-center gap-2">
                                <Database size={14} className="fill-current" />
                                <span className="text-xs font-bold">Redis Cache</span>
                            </div>
                        </div>
                        <button className="p-2 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-400">
                            <MoreHorizontal size={20} />
                        </button>
                    </div>
                </header>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-zinc-50/30">
                    <div className="flex justify-center">
                        <span className="text-[11px] font-bold text-zinc-400 bg-white border border-zinc-100 px-4 py-1 rounded-full shadow-sm uppercase tracking-widest">
                            2026. 01. 13. Consultation Started
                        </span>
                    </div>

                    <div className="flex gap-4 max-w-3xl">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                            <User2 size={20} />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-baseline gap-2">
                                <span className="text-sm font-bold text-zinc-900">Senior Dev (HQ)</span>
                                <span className="text-[10px] text-zinc-400">오후 2:30</span>
                            </div>
                            <div className="bg-white border text-zinc-800 p-4 rounded-2xl rounded-tl-none shadow-sm text-sm font-medium leading-relaxed">
                                안녕하세요, DXLINE 본사 선임 개발자입니다. <br />
                                현재 진행 중인 금융 시스템 모듈화 프로젝트의 아키텍처 난제에 대해 지원해 드리고 있습니다.
                                <br /><br />
                                특히 Drizzle ORM과 NestJS를 활용한 도메인 계층 분리 방식에 대해 고민이 많으셨죠?
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 flex-row-reverse max-w-3xl ml-auto">
                        <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-white shrink-0">
                            <Activity size={20} />
                        </div>
                        <div className="space-y-2 text-right">
                            <div className="flex items-baseline flex-row-reverse gap-2">
                                <span className="text-sm font-bold text-zinc-900">Project Agent</span>
                                <span className="text-[10px] text-zinc-400">오후 2:32</span>
                            </div>
                            <div className="bg-zinc-900 text-white p-4 rounded-2xl rounded-tr-none shadow-md shadow-zinc-200 text-sm font-medium leading-relaxed inline-block text-left">
                                네, 맞습니다. 인프라 계층에서 데이터베이스 종속성이 도메인 레이어까지 침범하고 있는 현상을 발견했습니다.
                                효율적인 의존성 역전(DIP) 적용 방안이 필요합니다.
                            </div>
                        </div>
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-8 pt-0 bg-white border-t">
                    <div className="mt-8 p-3 bg-zinc-50 border border-zinc-200 rounded-[2rem] flex items-center gap-2 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all shadow-sm">
                        <button className="p-2 hover:bg-zinc-200 rounded-full transition-colors text-zinc-400">
                            <Paperclip size={20} />
                        </button>
                        <input
                            type="text"
                            placeholder="선임 개발자에게 실시간 메시지 전송..."
                            className="flex-1 bg-transparent border-none focus:outline-none text-sm font-bold px-2 py-3"
                        />
                        <button className="p-2 hover:bg-zinc-200 rounded-full transition-colors text-zinc-400 hidden sm:block">
                            <Smile size={20} />
                        </button>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-all shadow-lg hover:scale-105 active:scale-95 group">
                            <Send size={20} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                    </div>
                    <div className="mt-4 flex items-center justify-center gap-4">
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                            <ChevronRight size={10} className="text-blue-500" /> Connected to dxline-central-backend
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
