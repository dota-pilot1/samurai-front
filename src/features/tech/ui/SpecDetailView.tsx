'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    ChevronDown, ChevronRight, FileText,
    Plus, MoreVertical, Search, Settings,
    Bell, Users, LayoutDashboard, Database,
    Rocket, Info, CheckCircle2, Zap, HelpCircle, Trophy,
    Pencil, Trash2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { api } from '@/shared/api/base';
import { CommonContextMenu } from '@/shared/ui/CommonContextMenu';

interface SpecDetailViewProps {
    tech: string;
}

const getCategoryIcon = (type: string, active: boolean) => {
    const color = active ? 'text-blue-600' : 'text-zinc-400';
    switch (type) {
        case 'ROOT': return <LayoutDashboard size={16} className={color} />;
        case 'TOPIC': return <Database size={16} className={color} />;
        case 'NOTE': return <Zap size={16} className={color} />;
        case 'CHALLENGE': return <Trophy size={16} className={color} />;
        case 'FAQ': return <HelpCircle size={16} className={color} />;
        default: return <FileText size={16} className={color} />;
    }
};

const getCategoryLabel = (type: string) => {
    switch (type) {
        case 'ROOT': return 'ROOT';
        case 'TOPIC': return '주제';
        case 'NOTE': return '노트';
        case 'CHALLENGE': return '챌린지';
        case 'FAQ': return 'FAQ';
        default: return '문서';
    }
};

const CategoryNode = ({
    node, depth, activeCategoryId, setActiveCategoryId, isAdminMode,
    handleContextMenu, getCategoryIcon, getCategoryLabel,
    setNewCategoryData, setShowModal, newCategoryData
}: any) => {
    const [isOpen, setIsOpen] = useState(depth === 0);
    const hasChildren = node.children && node.children.length > 0;
    const isActive = activeCategoryId === node.id;

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (hasChildren) setIsOpen(!isOpen);
        setActiveCategoryId(node.id);
    };

    return (
        <div className="space-y-0.5">
            <div
                className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer group transition-all ${isActive ? 'bg-blue-50 border border-blue-100' : 'hover:bg-zinc-50 border border-transparent'}`}
                onClick={handleToggle}
                onContextMenu={(e) => handleContextMenu(e, node)}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    {hasChildren ? (
                        isOpen ? <ChevronDown size={14} className="text-blue-600 shrink-0" /> : <ChevronRight size={14} className="text-zinc-400 shrink-0" />
                    ) : (
                        <div className="w-4 shrink-0" />
                    )}
                    {getCategoryIcon(node.category_type, isActive)}
                    <div className="flex flex-col truncate">
                        <span className={`text-[13px] font-bold truncate ${isActive ? 'text-blue-700' : 'text-zinc-700'}`}>
                            {node.name}
                        </span>
                        <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest leading-none">
                            {getCategoryLabel(node.category_type)}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    {isAdminMode && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleContextMenu(e as any, node); }}
                            className="p-1 hover:bg-zinc-200 rounded text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <MoreVertical size={14} />
                        </button>
                    )}
                </div>
            </div>

            {isOpen && hasChildren && (
                <div className="ml-4 pl-2 border-l border-zinc-100 space-y-0.5 mt-1">
                    {node.children.map((child: any, idx: number) => (
                        <CategoryNode
                            key={idx}
                            node={child}
                            depth={depth + 1}
                            activeCategoryId={activeCategoryId}
                            setActiveCategoryId={setActiveCategoryId}
                            isAdminMode={isAdminMode}
                            handleContextMenu={handleContextMenu}
                            getCategoryIcon={getCategoryIcon}
                            getCategoryLabel={getCategoryLabel}
                            setNewCategoryData={setNewCategoryData}
                            setShowModal={setShowModal}
                            newCategoryData={newCategoryData}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export const SpecDetailView = ({ tech }: SpecDetailViewProps) => {
    const [categories, setCategories] = useState<any[]>([]);
    const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
    const [contents, setContents] = useState<any[]>([]);
    const [activeContent, setActiveContent] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Admin States
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [showModal, setShowModal] = useState<'add' | 'edit' | null>(null);
    const [targetCategory, setTargetCategory] = useState<any>(null);
    const [newCategoryData, setNewCategoryData] = useState({ name: '', type: 'TOPIC', parentId: null as number | null });
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, category: any } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Sidebar Resize States
    const [sidebarWidth, setSidebarWidth] = useState(288); // 72 * 4 = 288px (w-72 default)
    const [isResizing, setIsResizing] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);

    const startResizing = useCallback((e: React.MouseEvent) => {
        setIsResizing(true);
        e.preventDefault();
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = useCallback((e: MouseEvent) => {
        if (isResizing) {
            const newWidth = e.clientX;
            if (newWidth > 150 && newWidth < 600) {
                setSidebarWidth(newWidth);
            }
        }
    }, [isResizing]);

    useEffect(() => {
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResizing);
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [resize, stopResizing]);

    const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
        if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
            e.preventDefault();
            action();
        }
    };

    const handleContextMenu = (e: React.MouseEvent, category: any) => {
        if (!isAdminMode) return;
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, category });
    };

    const fetchTree = async () => {
        try {
            const response = await api.get(`/specs/tree?tech=${tech}`);
            setCategories(response.data);

            if (response.data.length > 0 && !activeCategoryId) {
                const first = response.data[0];
                setActiveCategoryId(first.id);
            }
        } catch (error) {
            console.error('Failed to fetch spec tree:', error);
        }
    };

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await fetchTree();
            setLoading(false);
        };
        init();
    }, [tech]);

    useEffect(() => {
        if (activeCategoryId) {
            const fetchContents = async () => {
                try {
                    const response = await api.get(`/specs/contents/${activeCategoryId}`);
                    setContents(response.data);
                    if (response.data.length > 0) {
                        setActiveContent(response.data[0]);
                    } else {
                        setActiveContent(null);
                    }
                } catch (error) {
                    console.error('Failed to fetch contents:', error);
                }
            };
            fetchContents();
        }
    }, [activeCategoryId]);

    // Admin Handlers
    const handleAddCategory = async () => {
        if (!newCategoryData.name.trim() || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await api.post('/specs/categories', {
                name: newCategoryData.name,
                categoryType: newCategoryData.type,
                techType: tech,
                parentId: newCategoryData.parentId
            });
            setShowModal(null);
            setNewCategoryData({ name: '', type: 'TOPIC', parentId: null });
            await fetchTree();
        } catch (error) {
            alert('Failed to add category');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditCategory = async () => {
        if (!targetCategory.name.trim() || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await api.patch(`/specs/categories/${targetCategory.id}`, {
                name: targetCategory.name,
                categoryType: targetCategory.categoryType
            });
            setShowModal(null);
            setTargetCategory(null);
            await fetchTree();
        } catch (error) {
            alert('Failed to update category');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteCategory = async (id: number) => {
        if (!confirm('정말 삭제하시겠습니까? 관련 문서도 모두 삭제됩니다.')) return;
        try {
            await api.delete(`/specs/categories/${id}`);
            await fetchTree();
            if (activeCategoryId === id) setActiveCategoryId(null);
        } catch (error) {
            alert('Failed to delete category');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-3.5rem)] bg-zinc-50">
                <div className="animate-pulse text-zinc-400 font-bold tracking-widest uppercase">INITIALIZING SPEC SYSTEM...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-white animate-in fade-in duration-500">
            {/* Top Toolbar */}
            <header className="px-6 py-2 bg-zinc-50 border-b flex items-center justify-between">
                <div className="flex items-center gap-1">
                    <button className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-zinc-500">
                        <LayoutDashboard size={16} />
                    </button>
                    <div className="h-4 w-px bg-zinc-200 mx-2" />
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">{tech} Management</span>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    {/* Admin Mode Toggle */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-zinc-200 rounded-full shadow-sm">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isAdminMode ? 'text-blue-600' : 'text-zinc-400'}`}>
                            Admin Mode
                        </span>
                        <button
                            onClick={() => setIsAdminMode(!isAdminMode)}
                            className={`w-10 h-5 rounded-full p-1 transition-colors ${isAdminMode ? 'bg-blue-600' : 'bg-zinc-200'}`}
                        >
                            <div className={`w-3 h-3 bg-white rounded-full transition-transform ${isAdminMode ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Left Sidebar: Spec Tree */}
                <aside
                    ref={sidebarRef}
                    style={{ width: `${sidebarWidth}px` }}
                    className="border-r flex flex-col bg-white select-none"
                >
                    <div className="p-5 border-b flex items-center justify-between bg-zinc-50/30">
                        <h2 className="text-sm font-black text-zinc-900 uppercase tracking-tighter">카테고리</h2>
                        {isAdminMode && (
                            <button
                                onClick={() => { setNewCategoryData({ ...newCategoryData, parentId: null }); setShowModal('add'); }}
                                className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white rounded-md text-[11px] font-bold hover:bg-blue-700 shadow-sm transition-all hover:scale-105">
                                <Plus size={12} />
                                추가
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-1">
                        {categories.map((folder, idx) => (
                            <CategoryNode
                                key={idx}
                                node={folder}
                                depth={0}
                                activeCategoryId={activeCategoryId}
                                setActiveCategoryId={setActiveCategoryId}
                                isAdminMode={isAdminMode}
                                handleContextMenu={handleContextMenu}
                                getCategoryIcon={getCategoryIcon}
                                getCategoryLabel={getCategoryLabel}
                                setNewCategoryData={setNewCategoryData}
                                setShowModal={setShowModal}
                                newCategoryData={newCategoryData}
                            />
                        ))}
                    </div>
                </aside>

                {/* Resize Handle */}
                <div
                    onMouseDown={startResizing}
                    className={`w-[2px] transition-all cursor-col-resize flex-shrink-0 relative group ${isResizing ? 'bg-blue-500' : 'bg-transparent hover:bg-zinc-200'}`}
                >
                    <div className="absolute inset-y-0 -left-2 -right-2" /> {/* Expand hit area for better UX */}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto bg-zinc-50/30 flex flex-col">
                    <header className="px-10 py-8 bg-white border-b flex items-start justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-black text-zinc-900 tracking-tight">{tech} 상세 메뉴얼</h1>
                                <div className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black rounded border border-blue-100 uppercase tracking-widest">Master Plan</div>
                            </div>
                            <p className="text-zinc-400 text-sm font-medium">본사 개발팀이 검수하고 최적화한 {tech} 핵심 분석 노트입니다.</p>
                        </div>
                        {isAdminMode && (
                            <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all hover:scale-105 active:scale-95">
                                <Plus size={18} />
                                새 문서 추가
                            </button>
                        )}
                    </header>

                    <div className="p-10 max-w-5xl">
                        {activeContent ? (
                            <Card className="border-none shadow-sm rounded-3xl overflow-hidden min-h-[600px] bg-white">
                                <div className="p-12 space-y-10">
                                    <section className="space-y-4 relative">
                                        {isAdminMode && (
                                            <button className="absolute top-0 right-0 p-2 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors">
                                                <Settings size={18} className="text-zinc-600" />
                                            </button>
                                        )}
                                        <div className="flex items-center gap-2 text-blue-600 mb-2">
                                            <Info size={18} />
                                            <span className="text-xs font-black uppercase tracking-widest">Current Chapter</span>
                                        </div>
                                        <h2 className="text-4xl font-black text-zinc-900 tracking-tight leading-tight">{activeContent.title}</h2>
                                        <div className="h-1.5 w-24 bg-blue-600 rounded-full" />
                                    </section>

                                    <div className="prose prose-zinc max-w-none">
                                        <div className="p-8 rounded-[2rem] bg-zinc-50 border border-zinc-100 whitespace-pre-wrap text-zinc-600 font-medium leading-relaxed">
                                            {activeContent.content}
                                        </div>
                                    </div>

                                    <section className="space-y-6 pt-10 border-t">
                                        <h3 className="text-xl font-bold text-zinc-900">연관 리소스</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {contents.filter(c => c.id !== activeContent.id).map(c => (
                                                <div key={c.id}
                                                    onClick={() => setActiveContent(c)}
                                                    className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer group">
                                                    <div className="flex items-center gap-2 text-zinc-400 group-hover:text-blue-500 transition-colors">
                                                        <FileText size={14} />
                                                        <span className="text-xs font-bold truncate">{c.title}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {contents.length <= 1 && (
                                                <div className="col-span-3 py-10 text-center text-zinc-300 text-sm font-bold tracking-tighter">
                                                    연관된 다른 문서가 없습니다.
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                </div>
                            </Card>
                        ) : (
                            <div className="flex flex-col items-center justify-center min-h-[600px] text-zinc-300">
                                <div className="w-20 h-20 rounded-full bg-zinc-50 flex items-center justify-center mb-6">
                                    <FileText size={40} className="opacity-20" />
                                </div>
                                <h3 className="text-xl font-black tracking-tight mb-2">등록된 콘텐츠가 없습니다</h3>
                                <p className="text-sm font-medium">관리자 권한으로 새로운 마스터 플랜을 등록할 수 있습니다.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Context Menu */}
                {contextMenu && (
                    <CommonContextMenu
                        x={contextMenu.x}
                        y={contextMenu.y}
                        onClose={() => setContextMenu(null)}
                        sections={[
                            {
                                items: [
                                    {
                                        label: '하위 항목 추가',
                                        icon: <Plus size={14} />,
                                        onClick: () => {
                                            setNewCategoryData({ ...newCategoryData, parentId: contextMenu.category.id });
                                            setShowModal('add');
                                        }
                                    },
                                    {
                                        label: '수정',
                                        icon: <Pencil size={14} />,
                                        onClick: () => {
                                            setTargetCategory(contextMenu.category);
                                            setShowModal('edit');
                                        }
                                    }
                                ]
                            },
                            {
                                items: [
                                    {
                                        label: '삭제',
                                        icon: <Trash2 size={14} />,
                                        onClick: () => handleDeleteCategory(contextMenu.category.id),
                                        variant: 'danger'
                                    }
                                ]
                            }
                        ]}
                    />
                )}

                {/* Modals */}
                {showModal === 'add' && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <Card className="w-full max-w-md p-8 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
                            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                                <Plus size={20} className="text-blue-600" />
                                {newCategoryData.parentId ? '서브 카테고리 추가' : '최상위 카테고리 추가'}
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1.5 block">카테고리 명</label>
                                    <input
                                        type="text"
                                        value={newCategoryData.name}
                                        onChange={(e) => setNewCategoryData({ ...newCategoryData, name: e.target.value })}
                                        onKeyDown={(e) => handleKeyDown(e, handleAddCategory)}
                                        className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-sm"
                                        placeholder="이름을 입력하세요"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1.5 block">타입 선택</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['ROOT', 'TOPIC', 'NOTE', 'CHALLENGE', 'FAQ'].map(t => (
                                            <button
                                                key={t}
                                                onClick={() => setNewCategoryData({ ...newCategoryData, type: t })}
                                                className={`p-3 rounded-xl border text-[11px] font-black transition-all ${newCategoryData.type === t ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white border-zinc-100 text-zinc-500 hover:bg-zinc-50'}`}
                                            >
                                                {getCategoryLabel(t)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-4">
                                    <button onClick={() => setShowModal(null)} className="flex-1 p-4 bg-zinc-100 text-zinc-600 rounded-2xl font-bold text-sm hover:bg-zinc-200" disabled={isSubmitting}>취소</button>
                                    <button onClick={handleAddCategory} className="flex-1 p-4 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-100 disabled:opacity-50" disabled={isSubmitting}>
                                        {isSubmitting ? '처리 중...' : '추가하기'}
                                    </button>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {showModal === 'edit' && targetCategory && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <Card className="w-full max-w-md p-8 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
                            <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-blue-600">
                                <Settings size={20} />
                                카테고리 설정 수정
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1.5 block">카테고리 명</label>
                                    <input
                                        type="text"
                                        value={targetCategory.name}
                                        onChange={(e) => setTargetCategory({ ...targetCategory, name: e.target.value })}
                                        onKeyDown={(e) => handleKeyDown(e, handleEditCategory)}
                                        className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-sm"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1.5 block">타입 변경</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['ROOT', 'TOPIC', 'NOTE', 'CHALLENGE', 'FAQ'].map(t => (
                                            <button
                                                key={t}
                                                onClick={() => setTargetCategory({ ...targetCategory, categoryType: t })}
                                                className={`p-3 rounded-xl border text-[11px] font-black transition-all ${targetCategory.categoryType === t ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white border-zinc-100 text-zinc-500 hover:bg-zinc-50'}`}
                                            >
                                                {getCategoryLabel(t)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-4">
                                    <button onClick={() => setShowModal(null)} className="flex-1 p-4 bg-zinc-100 text-zinc-600 rounded-2xl font-bold text-sm hover:bg-zinc-200" disabled={isSubmitting}>취소</button>
                                    <button onClick={handleEditCategory} className="flex-1 p-4 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-100 disabled:opacity-50" disabled={isSubmitting}>
                                        {isSubmitting ? '처리 중...' : '수정 완료'}
                                    </button>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};
