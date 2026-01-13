import Link from 'next/link';
import { Rocket, ShieldCheck, Sparkles, FolderTree, MessageSquare } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-white py-16 px-4">
      <div className="max-w-6xl mx-auto space-y-24">
        {/* Hero Section */}
        <section className="text-center space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="space-y-6">
            <h1 className="text-6xl font-black text-zinc-900 tracking-tight leading-tight">
              Bridging Tradition <br />
              <span className="text-blue-600">with Innovation</span>
            </h1>
            <p className="text-zinc-500 text-xl max-w-2xl mx-auto font-medium leading-relaxed">
              Mechanic Samurai는 DXLINE의 지능형 기술 상담 및 스펙 관리 솔루션입니다. <br />
              현대적인 아키텍처와 AI 기술을 통해 엔지니어링의 새로운 기준을 제시합니다.
            </p>
          </div>

          <div className="max-w-5xl mx-auto rounded-[2rem] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] border border-zinc-100 bg-black aspect-video relative group">
            <video
              src="/dxline.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
          </div>
        </section>

        {/* Service Overview */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 py-12">
          <div className="group p-10 bg-zinc-50 rounded-[2.5rem] border border-zinc-100 hover:border-blue-200 transition-all duration-500 hover:shadow-xl hover:-translate-y-2">
            <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
              <FolderTree size={30} />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">스펙 관리 시스템</h2>
            <p className="text-zinc-500 font-medium leading-relaxed mb-8">
              수십 종류의 오픈소스와 프레임워크 스택을 체계적으로 분류하고,
              현업에 즉시 적용 가능한 마스터 플랜과 메뉴얼을 제공합니다.
            </p>
            <Link href="/specs" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all">
              매트릭스 탐색하기 <Rocket size={18} />
            </Link>
          </div>

          <div className="group p-10 bg-zinc-50 rounded-[2.5rem] border border-zinc-100 hover:border-blue-200 transition-all duration-500 hover:shadow-xl hover:-translate-y-2">
            <div className="w-14 h-14 bg-zinc-900 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-zinc-200 group-hover:scale-110 transition-transform">
              <MessageSquare size={30} />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">지능형 자동 상담</h2>
            <p className="text-zinc-500 font-medium leading-relaxed mb-8">
              AI 엔진을 기반으로 기술적 난제에 대한 실시간 해결책을 제안합니다.
              엔지니어의 생산성을 극대화하는 스마트한 파트너를 만나보세요.
            </p>
            <Link href="/auto-consult" className="inline-flex items-center gap-2 text-zinc-900 font-bold hover:gap-3 transition-all">
              AI 상담 시작하기 <Sparkles size={18} />
            </Link>
          </div>
        </section>

        {/* Company Vision / Mini About */}
        <section className="bg-zinc-900 rounded-[3rem] p-12 md:p-20 text-center text-white space-y-8 overflow-hidden relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent opacity-50" />
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-sm font-bold tracking-wider uppercase backdrop-blur-sm">
              <ShieldCheck size={16} className="text-blue-400" /> Secure & Scalable
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">
              Beyond the Technology, <br />
              Creating Value.
            </h2>
            <p className="text-zinc-400 text-lg font-medium leading-relaxed">
              DXLINE은 단순한 코드 작성을 넘어 비즈니스의 가치를 창출하는 기술 파트너입니다. <br className="hidden md:block" />
              에이스 하이엔드 타워의 중심에서, 우리는 소프트웨어의 미래를 설계하고 있습니다.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
