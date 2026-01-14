'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { TechMatrix } from '@/features/tech/ui/TechMatrix';
import { SpecDetailView } from '@/features/tech/ui/SpecDetailView';
import { Search } from 'lucide-react';

function SpecsContent() {
    const searchParams = useSearchParams();
    const tech = searchParams.get('tech');
    const [isAdminMode, setIsAdminMode] = useState(false);

    if (tech) {
        return <SpecDetailView tech={tech} isAdminMode={isAdminMode} setIsAdminMode={setIsAdminMode} />;
    }

    return (
        <main className="min-h-[calc(100vh-3.5rem)] bg-zinc-50/50 py-12 px-4">
            <div className="max-w-6xl mx-auto space-y-12">
                <section className="flex flex-col md:flex-row md:items-center justify-between border-b pb-8 gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-4">
                            <h1 className="text-4xl font-black text-zinc-900 tracking-tight">스펙 관리</h1>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-zinc-200 rounded-full shadow-sm">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${isAdminMode ? 'text-blue-600' : 'text-zinc-400'}`}>
                                    Admin Mode
                                </span>
                                <button
                                    onClick={() => setIsAdminMode(!isAdminMode)}
                                    className={`w-10 h-5 rounded-full p-1 transition-colors ${isAdminMode ? 'bg-blue-600' : 'bg-zinc-200'}`}
                                >
                                    <div className={`w-3 h-3 bg-white rounded-full transition-transform ${isAdminMode ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>
                        <p className="text-zinc-500 font-medium text-lg">기술 스택별 상세 가이드 및 메뉴얼을 체계적으로 탐색하세요.</p>
                    </div>
                    <div className="flex items-center gap-3 px-5 py-3 bg-white border rounded-xl shadow-sm w-full md:w-auto focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                        <Search size={20} className="text-zinc-400" />
                        <input
                            type="text"
                            placeholder="기술 스택 검색..."
                            className="bg-transparent border-none focus:outline-none text-base w-full md:w-64 font-medium"
                        />
                    </div>
                </section>

                <TechMatrix isAdminMode={isAdminMode} />
            </div>
        </main>
    );
}

export default function SpecsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-zinc-50">
                <div className="animate-pulse text-zinc-400 font-bold tracking-widest">LOADING SPEC SYSTEM...</div>
            </div>
        }>
            <SpecsContent />
        </Suspense>
    );
}
