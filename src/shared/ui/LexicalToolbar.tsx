'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useCallback, useEffect, useState } from 'react';
import {
    $getSelection,
    $isRangeSelection,
    FORMAT_TEXT_COMMAND,
    FORMAT_ELEMENT_COMMAND,
    UNDO_COMMAND,
    REDO_COMMAND,
    SELECTION_CHANGE_COMMAND,
    COMMAND_PRIORITY_CRITICAL,
} from 'lexical';
import {
    $getNearestNodeOfType,
    mergeRegister,
} from '@lexical/utils';
import {
    $isListNode,
    ListNode,
    INSERT_ORDERED_LIST_COMMAND,
    INSERT_UNORDERED_LIST_COMMAND,
    REMOVE_LIST_COMMAND,
} from '@lexical/list';
import {
    $isHeadingNode,
    $createHeadingNode,
    $createQuoteNode,
    HeadingTagType,
} from '@lexical/rich-text';
import {
    $setBlocksType,
} from '@lexical/selection';
import { $createCodeMirrorNode } from './lexical/CodeMirrorNode';
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Heading1,
    Heading2,
    List,
    ListOrdered,
    Quote,
    Undo2,
    Redo2,
    Code,
    Code2,
    Table,
    Type,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LexicalToolbar() {
    const [editor] = useLexicalComposerContext();
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [isStrikethrough, setIsStrikethrough] = useState(false);
    const [isCode, setIsCode] = useState(false);
    const [blockType, setBlockType] = useState('paragraph');

    const updateToolbar = useCallback(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            setIsBold(selection.hasFormat('bold'));
            setIsItalic(selection.hasFormat('italic'));
            setIsUnderline(selection.hasFormat('underline'));
            setIsStrikethrough(selection.hasFormat('strikethrough'));
            setIsCode(selection.hasFormat('code'));

            const anchorNode = selection.anchor.getNode();
            const element = anchorNode.getKey() === 'root'
                ? anchorNode
                : anchorNode.getTopLevelElementOrThrow();
            const elementKey = element.getKey();
            const elementDOM = editor.getElementByKey(elementKey);

            if (elementDOM !== null) {
                if ($isListNode(element)) {
                    const parentList = $getNearestNodeOfType(anchorNode, ListNode);
                    const type = parentList ? parentList.getListType() : element.getListType();
                    setBlockType(type);
                } else {
                    const type = $isHeadingNode(element) ? element.getTag() : element.getType();
                    setBlockType(type);
                }
            }
        }
    }, [editor]);

    useEffect(() => {
        return mergeRegister(
            editor.registerUpdateListener(({ editorState }) => {
                editorState.read(() => {
                    updateToolbar();
                });
            }),
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                () => {
                    updateToolbar();
                    return false;
                },
                COMMAND_PRIORITY_CRITICAL,
            ),
        );
    }, [editor, updateToolbar]);

    const formatHeading = (headingSize: HeadingTagType) => {
        if (blockType !== headingSize) {
            editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    $setBlocksType(selection, () => $createHeadingNode(headingSize));
                }
            });
        }
    };

    const formatBulletList = () => {
        if (blockType !== 'bullet') {
            editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
        } else {
            editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
        }
    };

    const formatNumberedList = () => {
        if (blockType !== 'number') {
            editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
        } else {
            editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
        }
    };

    const formatQuote = () => {
        if (blockType !== 'quote') {
            editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    $setBlocksType(selection, () => $createQuoteNode());
                }
            });
        }
    };

    const insertCodeMirror = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                const codeMirrorNode = $createCodeMirrorNode('// 코드를 입력하세요', 'javascript');
                selection.insertNodes([codeMirrorNode]);
            }
        });
    };

    return (
        <div className="flex items-center gap-1 p-2 border-b bg-white/40 backdrop-blur-md sticky top-0 z-20 overflow-x-auto no-scrollbar shadow-sm">
            <div className="flex items-center gap-0.5 pr-2 border-r border-zinc-200 mr-2">
                <ToolbarButton
                    onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
                    icon={<Undo2 size={16} />}
                    tooltip="Undo"
                />
                <ToolbarButton
                    onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
                    icon={<Redo2 size={16} />}
                    tooltip="Redo"
                />
            </div>

            <div className="flex items-center gap-0.5 pr-2 border-r border-zinc-200 mr-2">
                <ToolbarButton
                    onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
                    active={isBold}
                    icon={<Bold size={16} />}
                    tooltip="Bold"
                />
                <ToolbarButton
                    onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
                    active={isItalic}
                    icon={<Italic size={16} />}
                    tooltip="Italic"
                />
                <ToolbarButton
                    onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
                    active={isUnderline}
                    icon={<Underline size={16} />}
                    tooltip="Underline"
                />
                <ToolbarButton
                    onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
                    active={isStrikethrough}
                    icon={<Strikethrough size={16} />}
                    tooltip="Strikethrough"
                />
                <ToolbarButton
                    onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')}
                    active={isCode}
                    icon={<Code size={16} />}
                    tooltip="Inline Code"
                />
            </div>

            <div className="flex items-center gap-0.5 pr-2 border-r border-zinc-200 mr-2">
                <ToolbarButton
                    onClick={() => formatHeading('h1')}
                    active={blockType === 'h1'}
                    icon={<Heading1 size={16} />}
                    tooltip="H1"
                />
                <ToolbarButton
                    onClick={() => formatHeading('h2')}
                    active={blockType === 'h2'}
                    icon={<Heading2 size={16} />}
                    tooltip="H2"
                />
                <ToolbarButton
                    onClick={() => formatQuote()}
                    active={blockType === 'quote'}
                    icon={<Quote size={16} />}
                    tooltip="Quote"
                />
            </div>

            <div className="flex items-center gap-0.5 pr-2 border-r border-zinc-200 mr-2">
                <ToolbarButton
                    onClick={formatBulletList}
                    active={blockType === 'bullet'}
                    icon={<List size={16} />}
                    tooltip="Bullet List"
                />
                <ToolbarButton
                    onClick={formatNumberedList}
                    active={blockType === 'number'}
                    icon={<ListOrdered size={16} />}
                    tooltip="Numbered List"
                />
            </div>

            <div className="flex items-center gap-0.5">
                <ToolbarButton
                    onClick={insertCodeMirror}
                    active={blockType === 'codemirror'}
                    icon={<Code2 size={16} />}
                    tooltip="Code Block"
                />
                <ToolbarButton
                    onClick={() => { }} // Placeholder for Table
                    icon={<Table size={16} />}
                    tooltip="Insert Table"
                />
            </div>
        </div>
    );
}

function ToolbarButton({ onClick, active, icon, tooltip }: { onClick: () => void, active?: boolean, icon: React.ReactNode, tooltip: string }) {
    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={onClick}
            className={`h-8 w-8 p-0 rounded-md transition-all ${active ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'text-zinc-500 hover:bg-zinc-100'}`}
            title={tooltip}
        >
            {icon}
        </Button>
    );
}
