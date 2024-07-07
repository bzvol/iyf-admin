import './styles/ToolbarPlugin.scss';
import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import {
    FormatAlignCenter,
    FormatAlignJustify,
    FormatAlignLeft,
    FormatAlignRight,
    FormatBold,
    FormatItalic,
    FormatListBulleted,
    FormatListNumbered,
    FormatUnderlined,
    Image,
    InsertLink, LinkOff
} from "@mui/icons-material";
import React, {useContext, useRef, useState} from "react";
import {
    $createParagraphNode,
    $getSelection,
    $isRangeSelection,
    $setSelection,
    BaseSelection,
    FORMAT_ELEMENT_COMMAND
} from "lexical";
import {$setBlocksType} from "@lexical/selection";
import {$createHeadingNode} from "@lexical/rich-text";
import {INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND} from "@lexical/list";
import Modal from "../Modal";
import {TOGGLE_LINK_COMMAND} from "@lexical/link";
import {NotificationsContext} from "../sidebar/Notifications";
import {INSERT_IMAGE_COMMAND} from "./ImagePlugin";

export function ToolbarPlugin() {
    return (
        <div className="ContentEditor__controls">
            <ParagraphPlugin/>
            <HeadingPlugin/>
            <DecorationPlugin/>
            <LinkPlugin/>
            <ListPlugin/>
            <ImagePlugin/>
            <AlignmentPlugin/>
        </div>
    )
}

function ParagraphPlugin() {
    const [editor] = useLexicalComposerContext();

    const handleFormat = () => editor.update(() => {
        const sel = $getSelection();
        if (!sel) return;
        $setBlocksType(sel, () => $createParagraphNode());
    });

    return (
        <button onClick={handleFormat} title="Paragraph / Normal">P</button>
    );
}

type Heading = 'h1' | 'h2' | 'h3';

function HeadingPlugin() {
    const [editor] = useLexicalComposerContext();

    const handleFormat = (format: Heading) => editor.update(() => {
        const sel = $getSelection();
        if (!sel) return;
        $setBlocksType(sel, () => $createHeadingNode(format));
    });

    return (
        <>
            <button onClick={() => handleFormat('h1')} title="Heading 1">H1</button>
            <button onClick={() => handleFormat('h2')} title="Heading 2">H2</button>
            <button onClick={() => handleFormat('h3')} title="Heading 3">H3</button>
        </>
    );
}

type Decoration = 'bold' | 'italic' | 'underline';

function DecorationPlugin() {
    const [editor] = useLexicalComposerContext();

    const handleFormat = (format: Decoration) => editor.update(() => {
        const sel = $getSelection();
        if (!sel || !$isRangeSelection(sel)) return;
        sel.formatText(format);
    });

    return (
        <>
            <button onClick={() => handleFormat('bold')} title="Bold"><FormatBold/></button>
            <button onClick={() => handleFormat('italic')} title="Italic"><FormatItalic/></button>
            <button onClick={() => handleFormat('underline')} title="Underlined"><FormatUnderlined/></button>
        </>
    );
}

function LinkPlugin() {
    const [editor] = useLexicalComposerContext();
    const [modalOpen, setModalOpen] = useState(false);
    const urlInputRef = useRef<HTMLInputElement>(null);
    const [selection, setSelection] = useState<BaseSelection | null>(null);

    const {addNotification} = useContext(NotificationsContext);

    const handleInsertLink = () => editor.update(() => {
        const url = handleClose();

        if (url && !url.startsWith('http')) {
            addNotification({
                type: 'error',
                message: 'Invalid URL!'
            });
            return;
        }

        editor.dispatchCommand(TOGGLE_LINK_COMMAND, url ? {url, target: '_blank'} : null);
    });

    const handleRemove = () => editor.update(() => {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    });

    const handleOpen = () => {
        const sel = editor.getEditorState().read(() => $getSelection()?.clone() || null);
        setSelection(sel);
        setModalOpen(true);
    }

    const handleClose = () => {
        setModalOpen(false);

        editor.update(() => $setSelection(selection));
        setSelection(null);

        if (!urlInputRef.current) return null;
        const url = urlInputRef.current.value;
        urlInputRef.current.value = "";
        return url;
    }

    return (
        <>
            <button onClick={handleOpen} title="Insert link"><InsertLink/></button>
            <button onClick={handleRemove} title="Remove link"><LinkOff/></button>
            <Modal isOpen={modalOpen} onClose={handleClose}>
                <h2>Insert Link</h2>
                <label htmlFor="CE-insert-link">Enter URL:</label>
                <input type="text" placeholder="URL..." ref={urlInputRef} id="CE-insert-link"/>
                <button onClick={handleInsertLink}>Insert</button>
            </Modal>
        </>
    );
}

type List = 'ordered-list' | 'unordered-list';

function ListPlugin() {
    const [editor] = useLexicalComposerContext();

    const handleFormat = (format: List) =>
        editor.dispatchCommand(format === 'ordered-list'
            ? INSERT_ORDERED_LIST_COMMAND : INSERT_UNORDERED_LIST_COMMAND, undefined)

    return (
        <>
            <button onClick={() => handleFormat('unordered-list')} title="Bullet list"><FormatListBulleted/></button>
            <button onClick={() => handleFormat('ordered-list')} title="Numbered list"><FormatListNumbered/></button>
        </>
    );
}

function ImagePlugin() {
    const [editor] = useLexicalComposerContext();
    const [modalOpen, setModalOpen] = useState(false);
    const srcInputRef = useRef<HTMLInputElement>(null);

    const {addNotification} = useContext(NotificationsContext);

    const handleInsertImage = async () => {
        const file = handleClose();
        if (!file) return;

        if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
            addNotification({
                type: 'error',
                message: 'Invalid file type!'
            });
            return;
        }

        const src = await imageToB64(file);

        editor.dispatchCommand(INSERT_IMAGE_COMMAND, {src});
    }

    const handleClose = () => {
        setModalOpen(false);
        if (!srcInputRef.current || !srcInputRef.current.files) return null;
        const file = srcInputRef.current.files[0];
        srcInputRef.current.value = '';
        return file;
    }

    return (
        <>
            <button onClick={() => setModalOpen(true)} title="Insert image"><Image/></button>
            <Modal isOpen={modalOpen} onClose={handleClose}>
                <h2>Insert image</h2>
                <label htmlFor="CE-upload-image">Upload image:</label>
                <input type="file" placeholder="Image..." ref={srcInputRef} className="CE-upload-image"/>
                <button onClick={handleInsertImage}>Insert</button>
            </Modal>
        </>
    )
}

const imageToB64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
});

type Alignment = 'left' | 'center' | 'right' | 'justify';

function AlignmentPlugin() {
    const [editor] = useLexicalComposerContext();

    const handleFormat = (format: Alignment) => {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, format);
    }

    return (
        <>
            <button onClick={() => handleFormat('left')} title="Align left"><FormatAlignLeft/></button>
            <button onClick={() => handleFormat('center')} title="Align center"><FormatAlignCenter/></button>
            <button onClick={() => handleFormat('right')} title="Align right"><FormatAlignRight/></button>
            <button onClick={() => handleFormat('justify')} title="Justify"><FormatAlignJustify/></button>
        </>
    );
}
