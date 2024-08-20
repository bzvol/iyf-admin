import './styles/ContentEditor.scss';
import './styles/theme.scss';
import {InitialConfigType, LexicalComposer} from '@lexical/react/LexicalComposer';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import theme from './theme';
import {ToolbarPlugin} from "./ToolbarPlugin";
import {HeadingNode} from "@lexical/rich-text";
import {LinkNode} from "@lexical/link";
import {ImageNode, ImagePlugin} from "./ImagePlugin";
import {ListItemNode, ListNode} from "@lexical/list";
import {ListPlugin} from "@lexical/react/LexicalListPlugin";
import {useEffect, useRef} from "react";
import {LinkPlugin} from "@lexical/react/LexicalLinkPlugin";
import {ClickableLinkPlugin} from "@lexical/react/LexicalClickableLinkPlugin";
import {EditorState} from "lexical";
import {OnChangePlugin} from "@lexical/react/LexicalOnChangePlugin";

export interface ContentEditorState {
    title: string;
    content: string;
}

interface ContentEditorProps {
    namespace?: string;
    submitLabel?: string;
    onSubmit: (state: ContentEditorState) => void;
    state?: {
        title: string;
        content: string;
    }
    before?: React.ReactNode;
    after?: React.ReactNode;
}

export default function ContentEditor({
                                          namespace = 'Editor',
                                          submitLabel = 'Submit', onSubmit,
                                          state, before, after
                                      }: ContentEditorProps) {
    const titleRef = useRef<HTMLInputElement>(null);
    const editorStateRef = useRef<EditorState | null>(null);

    const initialConfig: InitialConfigType  = {
        namespace,
        theme,
        onError: console.error,
        nodes: [HeadingNode, LinkNode, ListItemNode, ListNode, ImageNode],
        editorState: state?.content
    }

    const handleSubmit = () => {
        if (!titleRef.current) return;
        const title = titleRef.current.value;
        if (!title) {
            titleRef.current.focus();
            return;
        }

        if (!editorStateRef.current) return;
        const editorState = editorStateRef.current;
        if (editorState!.isEmpty()) {
            const editor = document.querySelector('.ContentEditor__editor')! as HTMLElement;
            editor.focus();
            return;
        }

        const content = JSON.stringify(editorState!.toJSON());

        onSubmit({title, content});
    }

    return (
        <div className="ContentEditor">
            <input className="ContentEditor__title" ref={titleRef}
                   type="text" id="editor-title" name="title"
                   placeholder="Title..." defaultValue={state?.title} required/>
            {before}
            <div className="ContentEditor__editor-wrapper">
                <LexicalComposer initialConfig={initialConfig}>
                    <ToolbarPlugin/>
                    <LinkPlugin/>
                    <ClickableLinkPlugin newTab={true}/>
                    <ListPlugin/>
                    <ImagePlugin/>
                    <div className="ContentEditor__editor-wrapper2">
                        <RichTextPlugin
                            contentEditable={<ContentEditable className="ContentEditor__editor"/>}
                            placeholder={<ContentEditorPlaceholder/>}
                            ErrorBoundary={LexicalErrorBoundary}
                        />
                    </div>
                    <HistoryPlugin/>
                    <OnChangePlugin onChange={editorState => editorStateRef.current = editorState}/>
                </LexicalComposer>
            </div>
            {after}
            <button className="ContentEditor__submit" onClick={handleSubmit}>{submitLabel}</button>
        </div>
    );
}

function ContentEditorPlaceholder() {
    useEffect(() => {
        setPlaceholderPosition();
        window.addEventListener('resize', setPlaceholderPosition);
        return () => window.removeEventListener('resize', setPlaceholderPosition);
    }, []);

    return <div className="ContentEditor__editor-placeholder">Tell a story...</div>;
}

function setPlaceholderPosition() {
    const placeholder = document.querySelector('.ContentEditor__editor-placeholder') as HTMLElement;
    const editor = document.querySelector('.ContentEditor__editor-wrapper2') as HTMLElement;
    const top = editor.offsetTop + 'px';
    placeholder.style.top = `calc(${top} + 1.1rem)`;
}
