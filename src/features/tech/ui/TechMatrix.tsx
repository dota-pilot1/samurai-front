'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/shared/api/base';
import * as Lucide from 'lucide-react';
import { Plus, Pencil, Trash2, LayoutDashboard, Rocket, ChevronRight } from 'lucide-react';
import { CompactDialog } from '@/shared/ui/CompactDialog';

// Dynamic Icon Mapper (핵심 5개만)
const IconMap: Record<string, any> = {
    Rocket: Lucide.Rocket,
    Code2: Lucide.Code2,
    Database: Lucide.Database,
    Server: Lucide.Server,
    Smartphone: Lucide.Smartphone,
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
        icon: 'Rocket',
        description: '',
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
            setTechData({ name: '', techType: '', icon: 'Rocket', description: '', parentId: null, displayOrder: 0 });
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
            const { id, name, techType, icon, description, displayOrder, parentId, categoryType, depth } = targetTech;
            await api.patch(`/specs/categories/${id}`, { name, techType, icon, description, displayOrder, parentId, categoryType, depth });
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
        <div className="space-y-8">
            {categories.map((category, catIdx) => (
                <section key={category.id} className="group/section animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${catIdx * 50}ms` }}>
                    {/* 섹션 헤더 */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <h2 className="text-base font-bold text-zinc-800">
                                {category.name}
                            </h2>
                            <span className="px-2 py-0.5 bg-zinc-100 text-zinc-500 text-[10px] font-medium rounded-full">
                                {category.items?.length || 0}
                            </span>
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
                        </div>
                        {isAdminMode && (
                            <button
                                onClick={() => { setTechData({ ...techData, parentId: category.id }); setShowTechModal('add'); }}
                                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-all"
                            >
                                <Plus size={14} />
                                추가
                            </button>
                        )}
                    </div>

                    {/* 카드 그리드 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {category.items.map((tech: any) => {
                            const IconComponent = IconMap[tech.icon] || Lucide.FileText;
                            return (
                                <div key={tech.id} className="relative group/card">
                                    <Link
                                        href={`/specs?tech=${encodeURIComponent(tech.techType || tech.name)}`}
                                        className="block"
                                    >
                                        <div className="relative flex items-center gap-4 p-4 bg-white border border-zinc-200 rounded-xl hover:border-zinc-300 transition-all hover:shadow-md">
                                            <div className="p-2.5 rounded-lg bg-zinc-100 text-zinc-600 group-hover/card:bg-blue-50 group-hover/card:text-blue-600 transition-colors">
                                                <IconComponent size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-zinc-900 group-hover/card:text-blue-600 transition-colors text-sm truncate">
                                                    {tech.name}
                                                </h3>
                                                {tech.description && (
                                                    <p className="text-xs text-zinc-400 truncate mt-0.5">{tech.description}</p>
                                                )}
                                            </div>
                                            <ChevronRight size={16} className="text-zinc-300 group-hover/card:text-blue-400 group-hover/card:translate-x-0.5 transition-all shrink-0" />
                                        </div>
                                    </Link>

                                    {isAdminMode && (
                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/card:opacity-100 transition-all">
                                            <button
                                                onClick={(e) => { e.preventDefault(); setTargetTech(tech); setShowTechModal('edit'); }}
                                                className="p-1.5 bg-white hover:bg-zinc-50 rounded-md border border-zinc-200 text-zinc-400 hover:text-blue-600 transition-all shadow-sm"
                                            >
                                                <Pencil size={12} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.preventDefault(); handleDeleteTech(tech.id); }}
                                                className="p-1.5 bg-white hover:bg-zinc-50 rounded-md border border-zinc-200 text-zinc-400 hover:text-red-500 transition-all shadow-sm"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>
            ))}

            {isAdminMode && (
                <button
                    onClick={() => setShowGroupModal('add')}
                    className="w-full py-5 border-2 border-dashed border-zinc-200 rounded-xl text-zinc-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/30 transition-all flex items-center justify-center gap-2"
                >
                    <Plus size={16} />
                    <span className="text-sm font-medium">새 그룹 추가</span>
                </button>
            )}

            {/* Modals for Groups */}
            <CompactDialog
                isOpen={showGroupModal === 'add' || (showGroupModal === 'edit' && !!targetGroup)}
                onClose={() => setShowGroupModal(null)}
                variant="default"
                title={
                    <>
                        <LayoutDashboard size={16} className="text-blue-600" />
                        {showGroupModal === 'add' ? '새 기술 그룹 추가' : '기술 그룹 수정'}
                    </>
                }
                maxWidth="max-w-sm"
                footer={
                    <>
                        <button onClick={() => setShowGroupModal(null)} className="flex-1 px-4 py-2.5 bg-zinc-100 text-zinc-600 rounded text-sm font-medium hover:bg-zinc-200 transition-colors">취소</button>
                        <button onClick={showGroupModal === 'add' ? handleAddGroup : handleEditGroup} className="flex-1 px-4 py-2.5 bg-zinc-900 text-white rounded text-sm font-medium hover:bg-zinc-800 transition-colors" disabled={isSubmitting}>
                            {isSubmitting ? '처리 중...' : (showGroupModal === 'add' ? '그룹 생성' : '수정 완료')}
                        </button>
                    </>
                }
            >
                <div>
                    <label className="text-xs font-medium text-zinc-500 mb-1.5 block">그룹 이름</label>
                    <input
                        type="text"
                        value={showGroupModal === 'add' ? groupData.name : targetGroup?.name || ''}
                        onChange={(e) => showGroupModal === 'add' ? setGroupData({ ...groupData, name: e.target.value }) : setTargetGroup({ ...targetGroup, name: e.target.value })}
                        className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                        placeholder="예: INFRASTRUCTURE"
                    />
                </div>
            </CompactDialog>

            {/* Modals for Techs */}
            <CompactDialog
                isOpen={showTechModal === 'add' || (showTechModal === 'edit' && !!targetTech)}
                onClose={() => setShowTechModal(null)}
                variant="default"
                title={
                    <>
                        <Rocket size={16} className="text-blue-600" />
                        {showTechModal === 'add' ? '새 기술 스택 추가' : '기술 스택 설정 수정'}
                    </>
                }
                maxWidth="max-w-md"
                footer={
                    <>
                        <button onClick={() => setShowTechModal(null)} className="flex-1 px-4 py-2.5 bg-zinc-100 text-zinc-600 rounded text-sm font-medium hover:bg-zinc-200 transition-colors">취소</button>
                        <button onClick={showTechModal === 'add' ? handleAddTech : handleEditTech} className="flex-1 px-4 py-2.5 bg-zinc-900 text-white rounded text-sm font-medium hover:bg-zinc-800 transition-colors" disabled={isSubmitting}>
                            {isSubmitting ? '처리 중...' : (showTechModal === 'add' ? '기술 추가' : '수정 완료')}
                        </button>
                    </>
                }
            >
                <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium text-zinc-500 mb-1.5 block">표시 이름</label>
                            <input
                                type="text"
                                value={showTechModal === 'add' ? techData.name : targetTech?.name || ''}
                                onChange={(e) => showTechModal === 'add' ? setTechData({ ...techData, name: e.target.value }) : setTargetTech({ ...targetTech, name: e.target.value })}
                                className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                                placeholder="예: Docker"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-zinc-500 mb-1.5 block">식별 코드</label>
                            <input
                                type="text"
                                value={showTechModal === 'add' ? techData.techType : targetTech?.techType || ''}
                                onChange={(e) => showTechModal === 'add' ? setTechData({ ...techData, techType: e.target.value }) : setTargetTech({ ...targetTech, techType: e.target.value })}
                                className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                                placeholder="예: docker"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-zinc-500 mb-2 block">아이콘</label>
                        <div className="flex gap-2">
                            {Object.keys(IconMap).map((iconName) => {
                                const Icon = IconMap[iconName];
                                const currentIcon = showTechModal === 'add' ? techData.icon : targetTech?.icon;
                                return (
                                    <button
                                        key={iconName}
                                        onClick={() => showTechModal === 'add' ? setTechData({ ...techData, icon: iconName }) : setTargetTech({ ...targetTech, icon: iconName })}
                                        className={`p-2.5 rounded border transition-all ${currentIcon === iconName ? 'bg-blue-600 text-white border-blue-600' : 'bg-zinc-50 border-zinc-200 text-zinc-400 hover:border-zinc-300'}`}
                                    >
                                        <Icon size={18} />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-zinc-500 mb-1.5 block">설명 (선택)</label>
                        <textarea
                            value={showTechModal === 'add' ? techData.description : targetTech?.description || ''}
                            onChange={(e) => showTechModal === 'add' ? setTechData({ ...techData, description: e.target.value }) : setTargetTech({ ...targetTech, description: e.target.value })}
                            className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm resize-none"
                            placeholder="이 기술 스택에서 다룰 내용을 간략히 적어주세요"
                            rows={3}
                        />
                    </div>
                </div>
            </CompactDialog>
        </div>
    );
};
