'use client';

import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface CompactDialogProps {
    isOpen: boolean;
    onClose: () => void;
    title: ReactNode;
    headerActions?: ReactNode;
    footer?: ReactNode;
    children: ReactNode;
    maxWidth?: string;
    variant?: 'compact' | 'default';
}

export function CompactDialog({
    isOpen,
    onClose,
    title,
    headerActions,
    footer,
    children,
    maxWidth = 'max-w-3xl',
    variant = 'compact',
}: CompactDialogProps) {
    if (!isOpen) return null;

    const isDefault = variant === 'default';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6">
            <div className={`w-full ${maxWidth} max-h-[90vh] overflow-hidden flex flex-col rounded-lg shadow-2xl animate-in zoom-in-95 duration-200 bg-white border border-zinc-300`}>
                {/* Header */}
                <div className={`flex items-center justify-between border-b border-zinc-200 ${isDefault ? 'px-6 py-4' : 'px-4 py-2 bg-zinc-50'}`}>
                    <div className={`flex items-center gap-2 text-zinc-700 font-medium ${isDefault ? 'text-base' : 'text-xs'}`}>
                        {title}
                    </div>
                    <div className="flex items-center gap-1.5">
                        {headerActions}
                        <button
                            onClick={onClose}
                            className={`hover:bg-zinc-100 rounded transition-colors ${isDefault ? 'p-1.5' : 'p-1'}`}
                        >
                            <X size={isDefault ? 20 : 16} className="text-zinc-500" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className={`flex-1 overflow-y-auto min-h-0 ${isDefault ? 'p-6' : 'p-4'}`}>
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className={`flex gap-2 border-t border-zinc-200 ${isDefault ? 'px-6 py-4' : 'px-4 py-3 bg-zinc-50'}`}>
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
