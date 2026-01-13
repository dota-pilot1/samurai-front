'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/shared/api/base';
import { useAuthStore } from '@/entities/user/model/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export const InlineLoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const setAuth = useAuthStore((state) => state.setAuth);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await api.post('/auth/signin', { email, password });
            setAuth(response.data.user, response.data.access_token, rememberMe);
            window.location.reload();
        } catch (err: any) {
            alert(err.response?.data?.message || '로그인 실패');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="hidden lg:flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col gap-1">
                <Input
                    type="email"
                    placeholder="이메일"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-8 w-36 bg-zinc-50 border-zinc-200 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all text-[11px] px-2"
                />
            </div>
            <div className="flex flex-col gap-1">
                <Input
                    type="password"
                    placeholder="비밀번호"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-8 w-36 bg-zinc-50 border-zinc-200 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all text-[11px] px-2"
                />
            </div>
            <div className="flex items-center gap-1.5 self-center">
                <Checkbox
                    id="remember-inline"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="h-3.5 w-3.5 border-zinc-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <Label htmlFor="remember-inline" className="text-[10px] text-zinc-500 font-medium cursor-pointer select-none whitespace-nowrap">
                    상태 유지
                </Label>
            </div>
            <Button
                type="submit"
                size="sm"
                className="h-8 bg-blue-700 hover:bg-blue-800 font-bold px-4 text-xs tracking-tight"
                disabled={isLoading}
            >
                {isLoading ? '...' : '로그인'}
            </Button>
        </form>
    );
};
