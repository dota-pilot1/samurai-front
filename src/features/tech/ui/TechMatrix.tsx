'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/shared/api/base';
import * as Lucide from 'lucide-react';

// Dynamic Icon Mapper
const IconMap: Record<string, any> = {
    Leaf: Lucide.Leaf,
    ShieldCheck: Lucide.ShieldCheck,
    Repeat: Lucide.Repeat,
    Code2: Lucide.Code2,
    Globe: Lucide.Globe,
    Workflow: Lucide.Workflow,
    Rocket: Lucide.Rocket,
    Settings: Lucide.Settings,
    Sparkles: Lucide.Sparkles,
    Database: Lucide.Database,
    Layers: Lucide.Layers,
    Palette: Lucide.Palette,
    Zap: Lucide.Zap,
};

export const TechMatrix = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const response = await api.get('/specs/subjects');
                setCategories(response.data);
            } catch (error) {
                console.error('Failed to fetch subjects:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSubjects();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-24 bg-zinc-100 animate-pulse rounded-2xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {categories.map((category, catIdx) => (
                <div key={catIdx} className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${catIdx * 100}ms` }}>
                    <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-zinc-200" />
                        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">{category.name}</h2>
                        <div className="h-px flex-1 bg-zinc-200" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {category.items.map((tech: any) => {
                            const IconComponent = IconMap[tech.icon] || Lucide.FileText;
                            return (
                                <Link
                                    key={tech.id}
                                    href={`/specs?tech=${encodeURIComponent(tech.techType || tech.name)}`}
                                    className="group block"
                                >
                                    <div className="relative flex items-center p-5 bg-white border border-zinc-100 rounded-2xl hover:border-blue-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                                        <div className={`p-2.5 rounded-xl ${tech.bg || 'bg-zinc-50'} ${tech.color || 'text-zinc-400'} mr-4 group-hover:scale-110 transition-all duration-500`}>
                                            <IconComponent size={22} />
                                        </div>
                                        <div className="flex flex-col">
                                            <h3 className="font-black text-zinc-900 group-hover:text-blue-600 transition-colors text-[13px] tracking-tight">
                                                {tech.name}
                                            </h3>
                                            <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest mt-0.5">Explore Docs</span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};
