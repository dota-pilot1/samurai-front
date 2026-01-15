'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/shared/api/base';
import * as Lucide from 'lucide-react';
import { Plus, Pencil, Trash2, LayoutDashboard, Rocket, ChevronRight } from 'lucide-react';
import { CompactDialog } from '@/shared/ui/CompactDialog';

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
    LayoutDashboard: Lucide.LayoutDashboard,
    Box: Lucide.Box,
    Cpu: Lucide.Cpu,
    Smartphone: Lucide.Smartphone,
    Cloud: Lucide.Cloud,
    Search: Lucide.Search,
    Shield: Lucide.Shield,
    Server: Lucide.Server,
};

interface TechMatrixProps {
    isAdminMode?: boolean;
}

export const TechMatrix = ({ isAdminMode }: TechMatrixProps) => {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Admin States
    const [showGroupModal, setShowGroupModal] = useState<'add' | 'edit' | null>(null);
    const [showTechModal, setShowTechModal] = useState<'add' | 'edit' | null>(null);
    const [targetGroup, setTargetGroup] = useState<any>(null);
    const [targetTech, setTargetTech] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [groupData, setGroupData] = useState({ name: '', displayOrder: 0 });
    const [techData, setTechData] = useState({
        name: '',
        techType: '',
        icon: 'Box',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        parentId: null as number | null,
        displayOrder: 0
    });

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

    useEffect(() => {
        fetchSubjects();
    }, []);

    const handleAddGroup = async () => {
        if (!groupData.name.trim() || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await api.post('/specs/categories', {
                ...groupData,
                parentId: null,
                categoryType: 'ROOT',
                depth: 0
            });
            setShowGroupModal(null);
            setGroupData({ name: '', displayOrder: 0 });
            await fetchSubjects();
        } catch (error) {
            alert('그룹 추가 실패');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditGroup = async () => {
        if (!targetGroup.name.trim() || isSubmitting) return;
        setIsSubmitting(true);
        try {
            // Sanitize payload: only send fields that exist in the DB schema
            const { id, name, displayOrder, categoryType, depth } = targetGroup;
            await api.patch(`/specs/categories/${id}`, { name, displayOrder, categoryType, depth });
            setShowGroupModal(null);
            await fetchSubjects();
        } catch (error) {
            alert('그룹 수정 실패');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteGroup = async (id: number) => {
        if (!confirm('그룹을 삭제하시겠습니까? 하위 기술들도 모두 삭제됩니다.')) return;
        try {
            await api.delete(`/specs/categories/${id}`);
            await fetchSubjects();
        } catch (error) {
            alert('삭제 실패');
        }
    };

    const handleAddTech = async () => {
        if (!techData.name.trim() || !techData.techType.trim() || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await api.post('/specs/categories', {
                ...techData,
                categoryType: 'ROOT',
                depth: 1
            });
            setShowTechModal(null);
            setTechData({ name: '', techType: '', icon: 'Box', color: 'text-blue-600', bg: 'bg-blue-50', parentId: null, displayOrder: 0 });
            await fetchSubjects();
        } catch (error) {
            alert('기술 추가 실패');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditTech = async () => {
        if (!targetTech.name.trim() || isSubmitting) return;
        setIsSubmitting(true);
        try {
            // Sanitize payload: avoid sending extra fields like 'items'
            const { id, name, techType, icon, color, bg, displayOrder, parentId, categoryType, depth } = targetTech;
            await api.patch(`/specs/categories/${id}`, { name, techType, icon, color, bg, displayOrder, parentId, categoryType, depth });
            setShowTechModal(null);
            await fetchSubjects();
        } catch (error) {
            alert('기술 수정 실패');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteTech = async (id: number) => {
        if (!confirm('기술 스택을 삭제하시겠습니까? 관련 모든 문서가 삭제됩니다.')) return;
        try {
            await api.delete(`/specs/categories/${id}`);
            await fetchSubjects();
        } catch (error) {
            alert('삭제 실패');
        }
    };

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
        <div className="space-y-10">
            {categories.map((category, catIdx) => (
                <div key={category.id} className="group/section space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${catIdx * 50}ms` }}>
                    <div className="flex items-center gap-3">
                        <div className="h-px w-6 bg-zinc-300" />
                        <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-tight flex items-center gap-2">
                            {category.name}
                            <span className="text-[9px] text-zinc-400 font-medium tracking-wide">{category.items?.length || 0} UNITS</span>
                        </h2>
                        {isAdminMode && (
                            <div className="flex items-center gap-1 opacity-0 group-hover/section:opacity-100 transition-all">
                                <button
                                    onClick={() => { setTargetGroup(category); setShowGroupModal('edit'); }}
                                    className="p-1.5 hover:bg-zinc-100 rounded text-zinc-400 hover:text-blue-600 transition-colors"
                                >
                                    <Pencil size={12} />
                                </button>
                                <button
                                    onClick={() => handleDeleteGroup(category.id)}
                                    className="p-1.5 hover:bg-zinc-100 rounded text-zinc-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        )}
                        <div className="h-px flex-1 bg-zinc-100" />
                        {isAdminMode && (
                            <button
                                onClick={() => { setTechData({ ...techData, parentId: category.id }); setShowTechModal('add'); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 text-white rounded text-[10px] font-semibold hover:bg-zinc-800 transition-all"
                            >
                                <Plus size={12} />
                                ADD TECH
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {category.items.map((tech: any) => {
                            const IconComponent = IconMap[tech.icon] || Lucide.FileText;
                            return (
                                <div key={tech.id} className="relative group/card">
                                    <Link
                                        href={`/specs?tech=${encodeURIComponent(tech.techType || tech.name)}`}
                                        className="block"
                                    >
                                        <div className="relative flex items-center p-4 bg-white border border-zinc-200 rounded-lg hover:border-zinc-300 transition-all hover:shadow-md hover:-translate-y-0.5">
                                            <div className={`p-3 rounded-lg ${tech.bg || 'bg-zinc-50'} ${tech.color || 'text-zinc-400'} mr-4 group-hover/card:scale-105 transition-transform`}>
                                                <IconComponent size={20} />
                                            </div>
                                            <div className="flex flex-col flex-1 min-w-0">
                                                <h3 className="font-semibold text-zinc-900 group-hover/card:text-blue-600 transition-colors text-sm truncate">
                                                    {tech.name}
                                                </h3>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="text-[9px] font-medium text-zinc-400 uppercase tracking-wide">Master Spec</span>
                                                    <ChevronRight size={10} className="text-zinc-300 group-hover/card:translate-x-0.5 transition-transform" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>

                                    {isAdminMode && (
                                        <div className="absolute top-2 right-2 flex gap-0.5 opacity-0 group-hover/card:opacity-100 transition-all">
                                            <button
                                                onClick={(e) => { e.preventDefault(); setTargetTech(tech); setShowTechModal('edit'); }}
                                                className="p-1.5 bg-white hover:bg-zinc-50 rounded border border-zinc-200 text-zinc-400 hover:text-blue-600 transition-all"
                                            >
                                                <Pencil size={12} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.preventDefault(); handleDeleteTech(tech.id); }}
                                                className="p-1.5 bg-white hover:bg-zinc-50 rounded border border-zinc-200 text-zinc-400 hover:text-red-500 transition-all"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            {isAdminMode && (
                <button
                    onClick={() => setShowGroupModal('add')}
                    className="w-full py-6 border-2 border-dashed border-zinc-200 rounded-lg text-zinc-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/30 transition-all flex items-center justify-center gap-3"
                >
                    <Plus size={18} />
                    <span className="text-xs font-bold uppercase tracking-wide">New Technology Group</span>
                </button>
            )}

            {/* Modals for Groups */}
            <CompactDialog
                isOpen={showGroupModal === 'add' || (showGroupModal === 'edit' && !!targetGroup)}
                onClose={() => setShowGroupModal(null)}
                title={
                    <>
                        <LayoutDashboard size={14} className="text-blue-600" />
                        {showGroupModal === 'add' ? '새 기술 그룹 추가' : '기술 그룹 수정'}
                    </>
                }
                maxWidth="max-w-md"
                footer={
                    <>
                        <button onClick={() => setShowGroupModal(null)} className="flex-1 px-4 py-2 bg-zinc-100 text-zinc-600 rounded text-xs font-semibold hover:bg-zinc-200 transition-colors">취소</button>
                        <button onClick={showGroupModal === 'add' ? handleAddGroup : handleEditGroup} className="flex-1 px-4 py-2 bg-zinc-900 text-white rounded text-xs font-semibold hover:bg-zinc-800 transition-colors" disabled={isSubmitting}>
                            {isSubmitting ? '처리 중...' : (showGroupModal === 'add' ? '그룹 생성' : '수정 완료')}
                        </button>
                    </>
                }
            >
                <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wide mb-1.5 block">그룹 이름</label>
                    <input
                        type="text"
                        value={showGroupModal === 'add' ? groupData.name : targetGroup?.name || ''}
                        onChange={(e) => showGroupModal === 'add' ? setGroupData({ ...groupData, name: e.target.value }) : setTargetGroup({ ...targetGroup, name: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
                        placeholder="예: INFRASTRUCTURE"
                    />
                </div>
            </CompactDialog>

            {/* Modals for Techs */}
            <CompactDialog
                isOpen={showTechModal === 'add' || (showTechModal === 'edit' && !!targetTech)}
                onClose={() => setShowTechModal(null)}
                title={
                    <>
                        <Rocket size={14} className="text-blue-600" />
                        {showTechModal === 'add' ? '새 기술 스택 추가' : '기술 스택 설정 수정'}
                    </>
                }
                maxWidth="max-w-lg"
                footer={
                    <>
                        <button onClick={() => setShowTechModal(null)} className="flex-1 px-4 py-2 bg-zinc-100 text-zinc-600 rounded text-xs font-semibold hover:bg-zinc-200 transition-colors">취소</button>
                        <button onClick={showTechModal === 'add' ? handleAddTech : handleEditTech} className="flex-1 px-4 py-2 bg-zinc-900 text-white rounded text-xs font-semibold hover:bg-zinc-800 transition-colors" disabled={isSubmitting}>
                            {isSubmitting ? '처리 중...' : (showTechModal === 'add' ? '기술 추가' : '수정 완료')}
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wide mb-1.5 block">표시 이름</label>
                            <input
                                type="text"
                                value={showTechModal === 'add' ? techData.name : targetTech?.name || ''}
                                onChange={(e) => showTechModal === 'add' ? setTechData({ ...techData, name: e.target.value }) : setTargetTech({ ...targetTech, name: e.target.value })}
                                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
                                placeholder="예: Docker"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wide mb-1.5 block">식별 코드 (techType)</label>
                            <input
                                type="text"
                                value={showTechModal === 'add' ? techData.techType : targetTech?.techType || ''}
                                onChange={(e) => showTechModal === 'add' ? setTechData({ ...techData, techType: e.target.value }) : setTargetTech({ ...targetTech, techType: e.target.value })}
                                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
                                placeholder="예: docker"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wide mb-2 block">아이콘 선택 (Lucide)</label>
                        <div className="grid grid-cols-8 gap-1.5 max-h-32 overflow-y-auto p-2 bg-zinc-50 rounded border border-zinc-200">
                            {Object.keys(IconMap).map((iconName) => {
                                const Icon = IconMap[iconName];
                                const currentIcon = showTechModal === 'add' ? techData.icon : targetTech?.icon;
                                return (
                                    <button
                                        key={iconName}
                                        onClick={() => showTechModal === 'add' ? setTechData({ ...techData, icon: iconName }) : setTargetTech({ ...targetTech, icon: iconName })}
                                        className={`p-2 rounded flex items-center justify-center transition-all ${currentIcon === iconName ? 'bg-blue-600 text-white' : 'hover:bg-white text-zinc-400'}`}
                                    >
                                        <Icon size={16} />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wide mb-1.5 block">텍스트 색상 클래스</label>
                            <input
                                type="text"
                                value={showTechModal === 'add' ? techData.color : targetTech?.color || ''}
                                onChange={(e) => showTechModal === 'add' ? setTechData({ ...techData, color: e.target.value }) : setTargetTech({ ...targetTech, color: e.target.value })}
                                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded focus:ring-1 focus:ring-blue-500 outline-none transition-all text-xs font-medium"
                                placeholder="text-blue-600"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wide mb-1.5 block">배경 색상 클래스</label>
                            <input
                                type="text"
                                value={showTechModal === 'add' ? techData.bg : targetTech?.bg || ''}
                                onChange={(e) => showTechModal === 'add' ? setTechData({ ...techData, bg: e.target.value }) : setTargetTech({ ...targetTech, bg: e.target.value })}
                                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded focus:ring-1 focus:ring-blue-500 outline-none transition-all text-xs font-medium"
                                placeholder="bg-blue-50"
                            />
                        </div>
                    </div>
                </div>
            </CompactDialog>
        </div>
    );
};
