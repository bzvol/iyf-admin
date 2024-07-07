import {
    COMMAND_PRIORITY_EDITOR,
    createCommand,
    DecoratorNode, DOMConversionMap, DOMConversionOutput, DOMExportOutput,
    EditorConfig, LexicalCommand,
    LexicalEditor,
    LexicalNode,
    NodeKey, SerializedLexicalNode, Spread
} from "lexical";
import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import React, {ReactNode, useEffect} from "react";
import {$insertNodeToNearestRoot} from "@lexical/utils";
import {Close} from "@mui/icons-material";

interface ImageAttributes {
    src: string;
    alt?: string;
    title?: string;
}

type SerializedImageNode = Spread<ImageAttributes, SerializedLexicalNode>;

export class ImageNode extends DecoratorNode<ReactNode> {
    readonly __src: string;
    readonly __alt?: string;
    readonly __title?: string;

    constructor(attributes: ImageAttributes, key?: NodeKey) {
        super(key);
        this.__src = attributes.src;
        this.__alt = attributes.alt;
        this.__title = attributes.title;
    }

    static getType() {
        return 'iyf-admin-image'; // 'image' throws an error
    }

    static clone(node: ImageNode) {
        return new ImageNode({
            src: node.__src,
            alt: node.__alt,
            title: node.__title,
        }, node.__key);
    }

    static importJSON(serializedNode: SerializedImageNode): ImageNode {
        return $createImageNode(serializedNode);
    }

    exportJSON(): SerializedImageNode {
        return {
            type: 'iyf-admin-image',
            src: this.__src,
            alt: this.__alt,
            title: this.__title,
            version: 1,
        };
    }

    static importDOM(): DOMConversionMap | null {
        return {
            img: () => ({
                conversion: $convertImageElement,
                priority: 0
            })
        };
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement('img');
        element.src = this.__src;
        if (this.__alt) element.alt = this.__alt;
        if (this.__title) element.title = this.__title;
        return {element};
    }

    createDOM(config: EditorConfig): HTMLElement {
        const element = document.createElement('div');
        element.className = config.theme.image || "";
        return element;
    }

    updateDOM(): false {
        return false;
    }

    decorate(editor: LexicalEditor, _: EditorConfig): React.ReactNode {
        const handleRemove = () => editor.update(() => this.remove());

        return (
            <>
                <img src={this.__src} alt={this.__alt} title={this.__title}/>
                {editor.isEditable() && <button onClick={handleRemove}><Close/></button>}
            </>
        );
    }
}

export const $createImageNode = (attributes: ImageAttributes) => new ImageNode(attributes);
export const $isImageNode = (node: LexicalNode): node is ImageNode => node instanceof ImageNode;
export const $convertImageElement = (domNode: Node): DOMConversionOutput | null => {
    const img = domNode as HTMLImageElement;
    const node = $createImageNode(img);
    return {node};
}

export const INSERT_IMAGE_COMMAND: LexicalCommand<ImageAttributes> =
    createCommand('INSERT_IMAGE_COMMAND');

export function ImagePlugin() {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!editor.hasNodes([ImageNode]))
            throw new Error("ImagePlugin: ImageNode not registered on editor");

        return editor.registerCommand<ImageAttributes>(
            INSERT_IMAGE_COMMAND,
            (payload) => {
                $insertNodeToNearestRoot($createImageNode(payload))
                return true;
            },
            COMMAND_PRIORITY_EDITOR,
        );
    }, [editor]);

    return null;
}
