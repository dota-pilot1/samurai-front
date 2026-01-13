'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/shared/api/base';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }
        try {
            await api.post('/auth/signup', { email, password, name });
            alert('회원가입이 완료되었습니다. 로그인해 주세요.');
            router.push('/');
        } catch (err: any) {
            setError(err.response?.data?.message || '회원가입에 실패했습니다.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] bg-zinc-50/50 p-4">
            <Card className="w-full max-w-md shadow-lg border-zinc-200">
                <CardHeader className="space-y-1 py-10 text-center">
                    <CardTitle className="text-3xl font-extrabold tracking-tight text-blue-900">
                        Mechanic Samurai
                    </CardTitle>
                    <CardDescription className="text-zinc-500">
                        회원가입을 환영합니다!
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-zinc-700" htmlFor="name">이름</label>
                            <Input
                                id="name"
                                placeholder="홍길동"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-11"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-zinc-700" htmlFor="email">이메일</label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="samurai@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-11"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-zinc-700" htmlFor="password">비밀번호</label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-11"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-zinc-700" htmlFor="confirmPassword">비밀번호 확인</label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="h-11"
                                required
                            />
                        </div>
                        {error && <p className="text-sm font-medium text-destructive text-center">{error}</p>}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 py-8">
                        <Button type="submit" className="w-full h-11 text-base font-bold bg-green-700 hover:bg-green-800">
                            회원가입
                        </Button>
                        <div className="text-center text-sm text-zinc-500">
                            이미 계정이 있으신가요?{' '}
                            <Link href="/" className="font-bold text-blue-600 hover:underline hover:text-blue-700">
                                우측 상단 로그인 바를 이용하세요
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
