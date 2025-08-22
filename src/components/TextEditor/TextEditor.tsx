import type { Editor } from "@tiptap/react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import React from "react";

type TextEditorProps = {
  value: string;
  name: string;
  onChange: (event: { target: { name: string; value: string } }) => void;
};

export function TextEditor({ value, name, onChange }: TextEditorProps) {
  const editor = useEditor({
    content: value,
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      Underline,
      BulletList,
      OrderedList,
      ListItem,
    ],
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange({
        target: {
          name,
          value: html,
        },
      });
    },
    immediatelyRender: false,
  });
  return (
    <div>
      <MenuBar editor={editor} />
      <div
        className="prose min-h-[200px] max-w-[500px] cursor-text rounded border border-gray-300 p-4 focus:outline-none"
        onClick={() => editor?.commands.focus()}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function MenuBar({ editor }: { editor: Editor | null }) {
  // Read the current editor's state, and re-render the component when it changes
  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      return {
        isBold: ctx.editor?.isActive("bold") ?? false,
        canBold: ctx.editor?.can().chain().toggleBold().run() ?? false,
        isItalic: ctx.editor?.isActive("italic") ?? false,
        canItalic: ctx.editor?.can().chain().toggleItalic().run() ?? false,
        isParagraph: ctx.editor?.isActive("paragraph") ?? false,
        isUnderline: ctx.editor?.isActive("underline") ?? false,
        canUnderline:
          ctx.editor?.can().chain().toggleUnderline().run() ?? false,
        isBulletList: ctx.editor?.isActive("bulletList") ?? false,
        isOrderedList: ctx.editor?.isActive("orderedList") ?? false,
        canUndo: ctx.editor?.can().chain().undo().run() ?? false,
        canRedo: ctx.editor?.can().chain().redo().run() ?? false,
      };
    },
  });

  if (!editor) {
    return <>loading...</>; // Prevent crash on initial render
  }

  return (
    <div className="flex flex-row flex-wrap gap-1">
      <button
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleBold().run();
        }}
        disabled={!editorState?.canBold}
        className={`${
          editorState?.isBold ? "bg-gray-600" : "bg-gray-400"
        } inline-flex justify-center rounded-md border border-transparent  py-1 px-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2`}
      >
        Bold
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleItalic().run();
        }}
        disabled={!editorState?.canItalic}
        className={`${
          editorState?.isItalic ? "bg-gray-600" : "bg-gray-400"
        } inline-flex justify-center rounded-md border border-transparent  py-1 px-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2`}
      >
        Italic
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().setParagraph().run();
        }}
        className={`${
          editorState?.isParagraph ? "bg-gray-600" : "bg-gray-400"
        } inline-flex justify-center rounded-md border border-transparent  py-1 px-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2`}
      >
        Paragraph
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleUnderline().run();
        }}
        disabled={!editorState?.canUnderline}
        className={`${
          editorState?.isUnderline ? "bg-gray-600" : "bg-gray-400"
        } inline-flex justify-center rounded-md border border-transparent  py-1 px-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2`}
      >
        Underline
      </button>

      <button
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleBulletList().run();
        }}
        className={`${
          editorState?.isBulletList ? "bg-gray-600" : "bg-gray-400"
        } inline-flex justify-center rounded-md border border-transparent  py-1 px-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2`}
      >
        Bullet list
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleOrderedList().run();
        }}
        className={`${
          editorState?.isOrderedList ? "bg-gray-600" : "bg-gray-400"
        } inline-flex justify-center rounded-md border border-transparent  py-1 px-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2`}
      >
        Ordered list
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().undo().run();
        }}
        disabled={!editorState?.canUndo}
        className="inline-flex justify-center rounded-md border border-transparent bg-gray-600  py-1 px-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
      >
        Undo
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().redo().run();
        }}
        disabled={!editorState?.canRedo}
        className="inline-flex justify-center rounded-md border border-transparent bg-gray-600  py-1 px-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
      >
        Redo
      </button>
    </div>
  );
}
