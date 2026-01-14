'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    ChevronDown, ChevronRight, FileText, FileCode,
    Plus, MoreVertical, Search, Settings,
    Bell, Users, LayoutDashboard, Database,
    Rocket, Info, CheckCircle2, Zap, HelpCircle, Trophy,
    X, Pencil, Trash2, Sparkles
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Card } from '@/components/ui/card';
import { api } from '@/shared/api/base';
import { CommonContextMenu } from '@/shared/ui/CommonContextMenu';
import LexicalEditor from '@/shared/ui/LexicalEditor';
import AIEditorDialog from '@/shared/ui/AIEditorDialog';

interface SpecDetailViewProps {
    tech: string;
    isAdminMode: boolean;
    setIsAdminMode: (val: boolean) => void;
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

export const SpecDetailView = ({ tech, isAdminMode, setIsAdminMode }: SpecDetailViewProps) => {
    const [categories, setCategories] = useState<any[]>([]);
    const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
    const [contents, setContents] = useState<any[]>([]);
    const [activeContent, setActiveContent] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Admin States
    const [showModal, setShowModal] = useState<'add' | 'edit' | null>(null);
    const [showContentModal, setShowContentModal] = useState<'add' | 'edit' | null>(null);
    const [targetCategory, setTargetCategory] = useState<any>(null);
    const [newCategoryData, setNewCategoryData] = useState({ name: '', type: 'TOPIC', parentId: null as number | null });
    const [newContentData, setNewContentData] = useState({ title: '', content: '', itemType: 'CONCEPT' });
    const [targetContent, setTargetContent] = useState<any>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, category: any } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAIEditor, setShowAIEditor] = useState(false);

    // Sidebar Resize States
    const [sidebarWidth, setSidebarWidth] = useState(288); // 72 * 4 = 288px (w-72 default)
    const [isResizing, setIsResizing] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef('');

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

    const fetchContents = async () => {
        if (!activeCategoryId) {
            setContents([]);
            setActiveContent(null);
            return;
        }
        try {
            const response = await api.get(`/specs/contents/${activeCategoryId}`);
            const data = response.data;
            setContents(data);

            // Maintain the current selection if it still exists in the new list
            if (data.length > 0) {
                const current = data.find((c: any) => c.id === activeContent?.id) || data[0];
                setActiveContent(current);
                console.log('[SpecDetailView] fetchContents activeContent set to:', current.id);
            } else {
                setActiveContent(null);
            }
        } catch (error) {
            console.error('Failed to fetch contents:', error);
            setContents([]);
            setActiveContent(null);
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
        fetchContents();
    }, [activeCategoryId]);

    // Content Handlers
    const handleAddContent = async () => {
        if (!newContentData.title.trim() || !activeCategoryId || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await api.post('/specs/contents', {
                ...newContentData,
                content: contentRef.current, // Use ref for absolute latest sync
                categoryId: activeCategoryId
            });
            setShowContentModal(null);
            setNewContentData({ title: '', content: '', itemType: 'CONCEPT' });
            const response = await api.get(`/specs/contents/${activeCategoryId}`);
            const updatedContents = response.data;
            setContents(updatedContents);

            // Auto-select the newly created content (usually the last one by displayOrder)
            if (updatedContents.length > 0) {
                const latest = updatedContents[updatedContents.length - 1];
                setActiveContent(latest);
            }
        } catch (error) {
            alert('Failed to add content');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditContent = async () => {
        // Use the ref content if state is lagging
        const finalContent = contentRef.current;

        if (!targetContent || !targetContent.id || !targetContent.title.trim() || isSubmitting) {
            console.error('[SpecDetailView] Invalid targetContent or already submitting:', targetContent);
            return;
        }

        setIsSubmitting(true);
        const payload = { ...targetContent, content: finalContent };
        console.log('[SpecDetailView] handleEditContent START id=', targetContent.id, 'contentLen=', finalContent.length);

        try {
            const patchResponse = await api.patch(`/specs/contents/${targetContent.id}`, payload);
            console.log('[SpecDetailView] handleEditContent SUCCESS response:', patchResponse.data);

            // Drizzle returns an array for .returning()
            const updatedRow = Array.isArray(patchResponse.data) ? patchResponse.data[0] : patchResponse.data;

            if (!updatedRow) {
                throw new Error('No data returned from update');
            }

            // Update local state immediately without full re-fetch
            setContents(prev => prev.map(c => c.id === updatedRow.id ? updatedRow : c));

            if (activeContent?.id === updatedRow.id) {
                setActiveContent(updatedRow);
            }

            setShowContentModal(null);
            setTargetContent(null);
        } catch (error) {
            console.error('[SpecDetailView] handleEditContent ERROR:', error);
            alert('문서 내용 수정 중 오류가 발생했습니다. 다시 시도해 주세요.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteContent = async (id: number) => {
        if (!confirm('정말 이 문서를 삭제하시겠습니까?')) return;
        try {
            await api.delete(`/specs/contents/${id}`);
            // Re-fetch
            const response = await api.get(`/specs/contents/${activeCategoryId}`);
            setContents(response.data);
            if (activeContent?.id === id) {
                setActiveContent(response.data[0] || null);
            }
        } catch (error) {
            alert('Failed to delete content');
        }
    };

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
                        <span className="text-xs font-black text-zinc-900 uppercase tracking-widest">DEBUG: {tech} Management</span>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    {/* Admin Mode Toggle */}
                    <div className="flex items-center gap-2 px-3 py-1 bg-white border border-zinc-200 rounded-full shadow-sm hover:border-blue-200 transition-all cursor-pointer select-none"
                        onClick={() => setIsAdminMode(!isAdminMode)}>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isAdminMode ? 'text-blue-600' : 'text-zinc-400'}`}>
                            Admin Mode
                        </span>
                        <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${isAdminMode ? 'bg-blue-600' : 'bg-zinc-200'}`}>
                            <div className={`w-3 h-3 bg-white rounded-full transition-transform ${isAdminMode ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
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

                                {/* Secondary Admin Toggle in Content Area */}
                                <div className="ml-4 flex items-center gap-2 px-3 py-1 bg-zinc-50 border border-zinc-200 rounded-full shadow-sm hover:border-blue-200 transition-all cursor-pointer select-none"
                                    onClick={() => setIsAdminMode(!isAdminMode)}>
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${isAdminMode ? 'text-blue-600' : 'text-zinc-400'}`}>
                                        Admin
                                    </span>
                                    <div className={`w-7 h-3.5 rounded-full p-0.5 transition-colors ${isAdminMode ? 'bg-blue-600' : 'bg-zinc-200'}`}>
                                        <div className={`w-2.5 h-2.5 bg-white rounded-full transition-transform ${isAdminMode ? 'translate-x-3.5' : 'translate-x-0'}`} />
                                    </div>
                                </div>
                            </div>
                            <p className="text-zinc-400 text-sm font-medium">본사 개발팀이 검수하고 최적화한 {tech} 핵심 분석 노트입니다.</p>
                        </div>
                        {isAdminMode && (
                            <button
                                onClick={() => {
                                    setNewContentData({ title: '', content: '', itemType: 'CONCEPT' });
                                    contentRef.current = '';
                                    setShowContentModal('add');
                                }}
                                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all hover:scale-105 active:scale-95">
                                <Plus size={18} />
                                새 문서 추가
                            </button>
                        )}
                    </header>

                    <div className="p-6 max-w-5xl mx-auto w-full">
                        {activeContent ? (
                            <Card className="border border-zinc-100 shadow-xl shadow-zinc-200/20 rounded-[32px] overflow-hidden min-h-[600px] bg-white transition-all">
                                <div className="p-10 space-y-8">
                                    <section className="space-y-4 relative">
                                        {isAdminMode && (
                                            <div className="absolute top-0 right-0 flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setTargetContent(activeContent);
                                                        contentRef.current = activeContent?.content || '';
                                                        setShowContentModal('edit');
                                                    }}
                                                    className="p-2 hover:bg-zinc-100 rounded-xl transition-colors text-zinc-400 hover:text-blue-600"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteContent(activeContent.id)}
                                                    className="p-2 hover:bg-zinc-100 rounded-xl transition-colors text-zinc-400 hover:text-red-600"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        )}
                                        <h2 className="text-4xl font-black text-zinc-900 tracking-tight leading-tight">
                                            {activeContent.title}
                                        </h2>
                                        {activeContent.itemType && (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-100 text-zinc-500 text-[10px] font-bold rounded-full border border-zinc-200 uppercase tracking-wider">
                                                {activeContent.itemType === 'CODE' ? <FileCode size={12} /> : <Zap size={12} />}
                                                {activeContent.itemType === 'CODE' ? 'Implementation' : 'Concept Node'}
                                            </div>
                                        )}
                                    </section>

                                    <div className="prose prose-zinc max-w-none">
                                        <div className="p-8 rounded-[2rem] bg-zinc-50 border border-zinc-100 text-zinc-600 font-medium leading-relaxed">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm, remarkBreaks]}
                                                components={{
                                                    p({ children }) {
                                                        return <p className="mb-3 last:mb-0 min-h-[1.5em]">{children}</p>;
                                                    },
                                                    code({ node, inline, className, children, ...props }: any) {
                                                        const match = /language-(\w+)/.exec(className || '');
                                                        return !inline && match ? (
                                                            <SyntaxHighlighter
                                                                style={vscDarkPlus as any}
                                                                language={match[1]}
                                                                PreTag="div"
                                                                {...props}
                                                            >
                                                                {String(children).replace(/\n$/, '')}
                                                            </SyntaxHighlighter>
                                                        ) : (
                                                            <code className={className} {...props}>
                                                                {children}
                                                            </code>
                                                        );
                                                    }
                                                }}
                                            >
                                                {activeContent.content?.split('\n').map((line: string) => line || '&nbsp;').join('  \n')}
                                            </ReactMarkdown>
                                        </div>
                                    </div>

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
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                        <Card className="w-full max-w-md p-8 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 border-none bg-white">
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                        <Card className="w-full max-w-md p-8 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 border-none bg-white">
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

                {/* Content Modals */}
                {(showContentModal === 'add' || (showContentModal === 'edit' && targetContent)) && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                        <Card className="w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col p-6 md:p-10 rounded-[32px] shadow-2xl animate-in zoom-in-95 duration-200 bg-white border-none">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-black flex items-center gap-2">
                                    {showContentModal === 'add' ? (
                                        <>
                                            <Plus size={24} className="text-blue-600" />
                                            새 문서 작성
                                        </>
                                    ) : (
                                        <>
                                            <Pencil size={24} className="text-blue-600" />
                                            문서 수정
                                        </>
                                    )}
                                </h3>
                                <button onClick={() => setShowContentModal(null)} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors">
                                    <X size={24} className="text-zinc-400" />
                                </button>
                            </div>

                            <div className="mb-6 flex justify-end">
                                <button
                                    onClick={() => setShowAIEditor(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-black hover:shadow-lg hover:shadow-blue-200 transition-all hover:-translate-y-0.5"
                                >
                                    <Sparkles size={14} />
                                    AI 어시스턴트와 함께 작성하기
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-6 pr-2 min-h-0">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1.5 block">문서 제목</label>
                                    <input
                                        type="text"
                                        value={showContentModal === 'add' ? newContentData.title : targetContent.title}
                                        onChange={(e) => showContentModal === 'add'
                                            ? setNewContentData({ ...newContentData, title: e.target.value })
                                            : setTargetContent({ ...targetContent, title: e.target.value })}
                                        className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-lg"
                                        placeholder="제목을 입력하세요"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1.5 block">노트 종류</label>
                                    <div className="flex gap-2">
                                        {[
                                            { id: 'CONCEPT', label: '개념 설명', icon: <Zap size={14} /> },
                                            { id: 'CODE', label: '코드 조각', icon: <FileText size={14} /> },
                                        ].map((t) => (
                                            <button
                                                key={t.id}
                                                onClick={() => showContentModal === 'add'
                                                    ? setNewContentData({ ...newContentData, itemType: t.id })
                                                    : setTargetContent({ ...targetContent, itemType: t.id })}
                                                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all font-bold text-xs ${(showContentModal === 'add' ? newContentData.itemType : targetContent.itemType) === t.id
                                                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100'
                                                    : 'bg-white border-zinc-100 text-zinc-500 hover:bg-zinc-50'
                                                    }`}
                                            >
                                                {t.icon}
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex-1 min-h-[300px] flex flex-col">
                                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1.5 block">본문 내용 (Meta Lexical Editor 지원)</label>
                                    <div className="flex-1 flex flex-col min-h-0">
                                        <LexicalEditor
                                            key={showContentModal === 'add' ? 'new' : `edit-${targetContent.id}`}
                                            value={showContentModal === 'add' ? newContentData.content : targetContent.content}
                                            onChange={(markdown) => {
                                                contentRef.current = markdown; // Core fix: absolute latest sync
                                                if (showContentModal === 'add') {
                                                    setNewContentData(prev => ({ ...prev, content: markdown }));
                                                } else {
                                                    setTargetContent((prev: any) => prev ? ({ ...prev, content: markdown }) : null);
                                                }
                                            }}
                                            placeholder="# 제목&#10;내용을 입력하세요..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-6 border-t mt-6">
                                <button onClick={() => setShowContentModal(null)} className="flex-1 p-4 bg-zinc-100 text-zinc-600 rounded-2xl font-bold text-sm hover:bg-zinc-200" disabled={isSubmitting}>취소</button>
                                <button
                                    onClick={showContentModal === 'add' ? handleAddContent : handleEditContent}
                                    className="flex-[2] p-4 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-100 disabled:opacity-50"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? '처리 중...' : (showContentModal === 'add' ? '문서 저장하기' : '수정 완료')}
                                </button>
                            </div>
                        </Card>
                    </div>
                )}
            </div>

            {/* AI Editor Dialog (Full Screen) */}
            <AIEditorDialog
                isOpen={showAIEditor}
                onClose={() => setShowAIEditor(false)}
                initialValue={showContentModal === 'add' ? newContentData.content : targetContent?.content || ''}
                onSave={(content) => {
                    contentRef.current = content; // Sync AI result to ref
                    if (showContentModal === 'add') {
                        setNewContentData(prev => ({ ...prev, content }));
                    } else if (targetContent) {
                        setTargetContent((prev: any) => prev ? ({ ...prev, content }) : null);
                    }
                    setShowAIEditor(false);
                }}
                title={showContentModal === 'add' ? newContentData.title : targetContent?.title}
            />
        </div>
    );
};
