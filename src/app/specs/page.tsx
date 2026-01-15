'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { TechMatrix } from '@/features/tech/ui/TechMatrix';
import { SpecDetailView } from '@/features/tech/ui/SpecDetailView';
import { Search, Settings } from 'lucide-react';

function SpecsContent() {
    const searchParams = useSearchParams();
    const tech = searchParams.get('tech');
    const [isAdminMode, setIsAdminMode] = useState(false);

    if (tech) {
        return <SpecDetailView tech={tech} isAdminMode={isAdminMode} setIsAdminMode={setIsAdminMode} />;
    }

    return (
        <main className="min-h-[calc(100vh-3.5rem)] bg-zinc-50/50 py-6 px-4">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* 상단 헤더: 좌측 제목, 우측 검색+Admin */}
                <header className="flex items-center justify-between gap-4">
                    <h1 className="text-xl font-bold text-zinc-900">스펙 관리</h1>
                    <div className="flex items-center gap-3">
                        {/* 검색 */}
                        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-zinc-200 rounded-lg focus-within:ring-1 focus-within:ring-zinc-300 transition-all">
                            <Search size={16} className="text-zinc-400" />
                            <input
                                type="text"
                                placeholder="검색..."
                                className="bg-transparent border-none focus:outline-none text-sm w-40"
                            />
                        </div>
                        {/* Admin Mode Badge */}
                        <button
                            onClick={() => setIsAdminMode(!isAdminMode)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                isAdminMode
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white border border-zinc-200 text-zinc-500 hover:border-zinc-300'
                            }`}
                        >
                            <Settings size={14} />
                            Admin
                        </button>
                    </div>
                </header>

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
