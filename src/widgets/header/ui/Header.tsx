'use client';

import Link from 'next/link';
import { useAuthStore } from '@/entities/user/model/store';
import { Button } from '@/components/ui/button';
import { InlineLoginForm, LoginFormPopover } from '@/features/auth';

export const Header = () => {
    const { user, logout } = useAuthStore();

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="w-full flex h-14 items-center px-6">
                {/* 좌측: 로고 */}
                <div className="flex-1 flex items-center">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="font-bold text-xl text-blue-900 italic tracking-tight">Mechanic Samurai</span>
                    </Link>
                </div>

                {/* 중앙: 네비게이션 */}
                <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
                    <Link href="/specs" className="transition-colors hover:text-blue-600">스펙 관리</Link>
                    <Link href="/auto-consult" className="transition-colors hover:text-blue-600">자동 상담</Link>
                </nav>

                {/* 우측: 사용자 정보 */}
                <div className="flex-1 flex items-center justify-end gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-end leading-tight hidden sm:flex">
                                <span className="text-sm font-bold text-blue-900">{user.name}</span>
                                <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{user.role}</span>
                            </div>
                            <Button variant="outline" size="sm" onClick={logout} className="h-9 font-semibold border-zinc-300 hover:bg-zinc-50">
                                로그아웃
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            {/* Desktop: Direct Inline Form */}
                            <div className="hidden lg:block">
                                <InlineLoginForm />
                            </div>

                            {/* Mobile/Tablet: Popover Fallback */}
                            <div className="lg:hidden">
                                <LoginFormPopover />
                            </div>

                            <Link href="/signup">
                                <Button size="sm" className="h-9 bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-4">
                                    회원가입
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
