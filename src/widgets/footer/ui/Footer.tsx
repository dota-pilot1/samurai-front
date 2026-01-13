import { MapPin, Phone, Mail, Smartphone } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="bg-zinc-900 text-zinc-400 py-12 border-t border-zinc-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <h3 className="text-white font-bold text-lg">Mechanic Samurai</h3>
                        <p className="text-sm leading-relaxed">
                            AI 기반 지능형 기술 상담 및 스펙 관리 솔루션. <br />
                            전통적인 기술의 가치와 현대적인 기술의 혁신을 연결합니다.
                        </p>
                    </div>

                    <div className="space-y-4 lg:col-span-2">
                        <h3 className="text-white font-bold text-lg">Contact Us</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <MapPin size={18} className="text-blue-500 shrink-0 mt-0.5" />
                                <span className="text-sm">
                                    (08591) 서울 금천구 가산 디지털1로 30, <br />
                                    314호(에이스 하이엔드 10차)
                                </span>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Phone size={18} className="text-blue-500 shrink-0" />
                                    <span className="text-sm italic">02. 2068. 8802</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Smartphone size={18} className="text-blue-500 shrink-0" />
                                    <span className="text-sm italic">010. 5383. 9871</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail size={18} className="text-blue-500 shrink-0" />
                                    <span className="text-sm">jykim@dxline.net</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-white font-bold text-lg">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li><a href="/" className="hover:text-blue-400 transition-colors">홈</a></li>
                            <li><a href="/specs" className="hover:text-blue-400 transition-colors">스펙 관리</a></li>
                            <li><a href="/auto-consult" className="hover:text-blue-400 transition-colors">자동 상담</a></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-zinc-800 text-center">
                    <p className="text-xs text-zinc-500">
                        &copy; {new Date().getFullYear()} DXLINE. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};
