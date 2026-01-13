'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export interface ContextMenuItem {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: 'default' | 'danger';
    disabled?: boolean;
}

export interface ContextMenuSection {
    items: ContextMenuItem[];
}

interface CommonContextMenuProps {
    x: number;
    y: number;
    onClose: () => void;
    sections: ContextMenuSection[];
}

export const CommonContextMenu = ({ x, y, onClose, sections }: CommonContextMenuProps) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (menuRef.current) {
            const rect = menuRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            let finalX = x;
            let finalY = y;

            if (x + rect.width > viewportWidth) {
                finalX = x - rect.width;
            }
            if (y + rect.height > viewportHeight) {
                finalY = y - rect.height;
            }

            menuRef.current.style.left = `${finalX}px`;
            menuRef.current.style.top = `${finalY}px`;
            menuRef.current.style.opacity = '1';
        }
    }, [x, y]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);

    return createPortal(
        <div
            ref={menuRef}
            className="fixed z-[9999] min-w-[180px] bg-white rounded-2xl shadow-2xl border border-zinc-100 py-1.5 overflow-hidden transition-opacity duration-200 opacity-0"
            style={{ left: x, top: y }}
        >
            {sections.map((section, sIdx) => (
                <div key={sIdx} className={sIdx !== 0 ? 'border-t border-zinc-50' : ''}>
                    {section.items.map((item, iIdx) => (
                        <button
                            key={iIdx}
                            disabled={item.disabled}
                            onClick={() => {
                                if (!item.disabled) {
                                    item.onClick();
                                    onClose();
                                }
                            }}
                            className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold transition-all
                                ${item.variant === 'danger'
                                    ? 'text-red-500 hover:bg-red-50'
                                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-blue-600'}
                                ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                            `}
                        >
                            <span className="shrink-0">{item.icon}</span>
                            <span className="flex-1 text-left">{item.label}</span>
                        </button>
                    ))}
                </div>
            ))}
        </div>,
        document.body
    );
};
