'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/shared/api/base';
import { useAuthStore } from '@/entities/user/model/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export const LoginFormPopover = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const response = await api.post('/auth/signin', { email, password });
            setAuth(response.data.user, response.data.access_token, rememberMe);
            window.location.reload(); // Refresh to update all auth-dependent UI
        } catch (err: any) {
            setError(err.response?.data?.message || '로그인에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="sm">로그인</Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-6 shadow-xl border-zinc-200" align="end">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2 text-center pb-2">
                        <h4 className="font-bold text-lg text-blue-900 leading-none">로그인</h4>
                        <p className="text-sm text-zinc-500">계정 정보를 입력하세요</p>
                    </div>
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="pop-email">이메일</Label>
                            <Input
                                id="pop-email"
                                type="email"
                                placeholder="samurai@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-9"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="pop-password">비밀번호</Label>
                            <Input
                                id="pop-password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-9"
                            />
                        </div>
                        <div className="flex items-center gap-2 py-1">
                            <Checkbox
                                id="pop-remember"
                                checked={rememberMe}
                                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                            />
                            <Label htmlFor="pop-remember" className="text-sm text-zinc-600 cursor-pointer select-none">
                                로그인 상태 유지
                            </Label>
                        </div>
                    </div>
                    {error && <p className="text-xs font-medium text-destructive text-center">{error}</p>}
                    <Button type="submit" className="w-full h-10 bg-blue-700 hover:bg-blue-800 font-bold" disabled={isLoading}>
                        {isLoading ? '로그인 중...' : '로그인'}
                    </Button>
                    <div className="pt-2 text-center text-xs text-zinc-500">
                        계정이 없으신가요?{' '}
                        <a href="/signup" className="font-bold text-blue-600 hover:underline">회원가입</a>
                    </div>
                </form>
            </PopoverContent>
        </Popover>
    );
};
