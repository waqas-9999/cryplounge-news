'use client';

import { useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extensions';
import { TableKit } from '@tiptap/extension-table';
import {
  Bold,
  Columns3,
  HelpCircle,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Rows3,
  Table as TableIcon,
  Trash2,
  Undo2,
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { isSafeLinkUrl, normalizeLinkUrl } from '@/lib/article-body';
import { FigureImage, type PickedImage } from './FigureImage';
import { FaqBlock } from './FaqBlock';
import { MediaPickerDialog } from './MediaPickerDialog';

interface ArticleBodyEditorProps {
  /** Stored body HTML. Legacy bodies are parsed into the editor's schema on load. */
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const BLOCK_STYLES = [
  { value: 'p', label: 'Paragraph' },
  { value: 'h2', label: 'Heading 2' },
  { value: 'h3', label: 'Heading 3' },
  { value: 'h4', label: 'Heading 4' },
] as const;

/**
 * The newsroom body editor: a structured (ProseMirror) document with
 * paragraphs, H2–H4, bold/italic, safe links, lists, quotes, dividers,
 * media-library images and FAQ blocks. It never produces arbitrary HTML —
 * only the shapes its schema defines, which the backend enforces again on save.
 */
export function ArticleBodyEditor({ value, onChange, placeholder }: ArticleBodyEditorProps) {
  const lastEmitted = useRef<string | null>(null);
  const pickerResolver = useRef<((image: PickedImage | null) => void) | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);

  /** Opens the media picker and resolves with the chosen image (null if cancelled). */
  function pickImage(): Promise<PickedImage | null> {
    return new Promise(resolve => {
      pickerResolver.current = resolve;
      setPickerOpen(true);
    });
  }

  function settlePicker(image: PickedImage | null) {
    pickerResolver.current?.(image);
    pickerResolver.current = null;
    setPickerOpen(false);
  }

  const editor = useEditor({
    // Rendered on the client only: avoids SSR hydration mismatches.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        code: false,
        codeBlock: false,
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: 'https',
          // Pasted, typed or stored links with a dangerous scheme are dropped.
          isAllowedUri: url => isSafeLinkUrl(url),
          HTMLAttributes: { rel: null, target: null },
        },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? 'Start writing the story. Use Heading 2 for sections; add images, quotes and an FAQ from the toolbar.',
      }),
      // Fixed-width columns: a stored `colwidth` would have to survive both
      // sanitizers and means nothing at a reader's screen width.
      TableKit.configure({ table: { resizable: false, HTMLAttributes: {} } }),
      FigureImage.configure({ pickImage }),
      FaqBlock,
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'ae-content',
        'aria-label': 'Article body',
        role: 'textbox',
        'aria-multiline': 'true',
      },
    },
    onUpdate: ({ editor: e }) => {
      const html = e.isEmpty ? '' : e.getHTML();
      lastEmitted.current = html;
      onChange(html);
    },
  });

  // External value changes (the article loading on the edit page) replace the
  // document; our own updates are ignored so the cursor never jumps.
  useEffect(() => {
    if (!editor || value === lastEmitted.current) return;
    lastEmitted.current = value;
    // Deferred out of React's commit phase: setContent renders the image/FAQ
    // node views synchronously, which React refuses to do inside an effect.
    queueMicrotask(() => {
      if (!editor.isDestroyed) editor.commands.setContent(value || '', { emitUpdate: false });
    });
  }, [editor, value]);

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            block: e.isActive('heading', { level: 2 })
              ? 'h2'
              : e.isActive('heading', { level: 3 })
                ? 'h3'
                : e.isActive('heading', { level: 4 })
                  ? 'h4'
                  : 'p',
            bold: e.isActive('bold'),
            italic: e.isActive('italic'),
            link: e.isActive('link'),
            bullet: e.isActive('bulletList'),
            ordered: e.isActive('orderedList'),
            quote: e.isActive('blockquote'),
            inTable: e.isActive('table'),
            canUndo: e.can().undo(),
            canRedo: e.can().redo(),
            words: e.getText().trim() ? e.getText().trim().split(/\s+/).length : 0,
          }
        : null,
  });

  async function insertImage() {
    if (!editor) return;
    // Remember where the cursor was: the dialog takes focus away.
    const at = editor.state.selection.to;
    const picked = await pickImage();
    if (!picked) return;
    editor
      .chain()
      .focus()
      .setTextSelection(Math.min(at, editor.state.doc.content.size))
      .insertFigureImage({
        src: picked.url,
        alt: picked.altText ?? '',
        mediaId: picked.id,
        width: picked.width,
        height: picked.height,
      })
      .run();
  }

  if (!editor || !state) {
    return <div className="ae-shell min-h-[560px] animate-pulse" aria-busy="true" />;
  }

  return (
    <div className="ae-shell">
      <div className="ae-toolbar" role="toolbar" aria-label="Formatting">
        <label className="sr-only" htmlFor="ae-block-style">Text style</label>
        <select
          id="ae-block-style"
          className="ae-select"
          value={state.block}
          onChange={e => {
            const v = e.target.value;
            const chain = editor.chain().focus();
            if (v === 'p') chain.setParagraph().run();
            else chain.setHeading({ level: Number(v.slice(1)) as 2 | 3 | 4 }).run();
          }}
        >
          {BLOCK_STYLES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <Sep />
        <Tool label="Bold (Ctrl+B)" active={state.bold} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="w-4 h-4" />
        </Tool>
        <Tool label="Italic (Ctrl+I)" active={state.italic} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="w-4 h-4" />
        </Tool>
        <Tool label="Link (Ctrl+K)" active={state.link} onClick={() => setLinkOpen(true)}>
          <Link2 className="w-4 h-4" />
        </Tool>

        <Sep />
        <Tool label="Bulleted list" active={state.bullet} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="w-4 h-4" />
        </Tool>
        <Tool label="Numbered list" active={state.ordered} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="w-4 h-4" />
        </Tool>
        <Tool label="Blockquote" active={state.quote} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="w-4 h-4" />
        </Tool>

        <Sep />
        <Tool label="Image" onClick={insertImage} text="Image">
          <ImagePlus className="w-4 h-4" />
        </Tool>
        <Tool label="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus className="w-4 h-4" />
        </Tool>
        <Tool
          label="Table"
          active={state.inTable}
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          text="Table"
        >
          <TableIcon className="w-4 h-4" />
        </Tool>
        <Tool label="FAQ" onClick={() => editor.chain().focus().insertFaq().run()} text="FAQ">
          <HelpCircle className="w-4 h-4" />
        </Tool>

        <div className="ml-auto flex items-center">
          <Tool label="Undo (Ctrl+Z)" disabled={!state.canUndo} onClick={() => editor.chain().focus().undo().run()}>
            <Undo2 className="w-4 h-4" />
          </Tool>
          <Tool label="Redo (Ctrl+Shift+Z)" disabled={!state.canRedo} onClick={() => editor.chain().focus().redo().run()}>
            <Redo2 className="w-4 h-4" />
          </Tool>
        </div>
      </div>

      {/* Table controls appear only with the cursor inside a table. */}
      {state.inTable && (
        <div className="ae-toolbar ae-subbar" role="toolbar" aria-label="Table">
          <span className="ae-drag !cursor-default"><TableIcon className="w-3.5 h-3.5" aria-hidden="true" /> Table</span>
          <Sep />
          <Tool label="Add row above" onClick={() => editor.chain().focus().addRowBefore().run()}>
            <Rows3 className="w-4 h-4 rotate-180" />
          </Tool>
          <Tool label="Add row below" onClick={() => editor.chain().focus().addRowAfter().run()} text="Row">
            <Rows3 className="w-4 h-4" />
          </Tool>
          <Tool label="Delete row" onClick={() => editor.chain().focus().deleteRow().run()}>
            <Rows3 className="w-4 h-4 opacity-60" />
            <span className="sr-only">Delete row</span>
            <Trash2 className="w-3 h-3" />
          </Tool>
          <Sep />
          <Tool label="Add column left" onClick={() => editor.chain().focus().addColumnBefore().run()}>
            <Columns3 className="w-4 h-4 rotate-180" />
          </Tool>
          <Tool label="Add column right" onClick={() => editor.chain().focus().addColumnAfter().run()} text="Column">
            <Columns3 className="w-4 h-4" />
          </Tool>
          <Tool label="Delete column" onClick={() => editor.chain().focus().deleteColumn().run()}>
            <Columns3 className="w-4 h-4 opacity-60" />
            <span className="sr-only">Delete column</span>
            <Trash2 className="w-3 h-3" />
          </Tool>
          <Sep />
          <Tool label="Toggle header row" onClick={() => editor.chain().focus().toggleHeaderRow().run()} text="Header row">
            <Rows3 className="w-4 h-4" />
          </Tool>
          <Tool label="Delete table" onClick={() => editor.chain().focus().deleteTable().run()} text="Delete table">
            <Trash2 className="w-4 h-4" />
          </Tool>
        </div>
      )}

      <EditorContent
        editor={editor}
        onKeyDown={e => {
          if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            setLinkOpen(true);
          }
        }}
      />

      <div className="ae-footer">
        <span>{state.words.toLocaleString()} words</span>
        <span className="hidden sm:inline">Drag images and FAQs by their handle to reposition them.</span>
      </div>

      <MediaPickerDialog open={pickerOpen} onClose={() => settlePicker(null)} onPick={image => settlePicker(image)} />
      <LinkDialog editor={editor} open={linkOpen} onClose={() => setLinkOpen(false)} />
    </div>
  );
}

function Tool({
  label,
  active,
  disabled,
  onClick,
  children,
  text,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  text?: string;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      // Keep the editor's selection: toolbar clicks must not steal it.
      onMouseDown={e => e.preventDefault()}
      onClick={onClick}
      className={`ae-tool ${active ? 'is-active' : ''}`}
    >
      {children}
      {text && <span className="hidden md:inline">{text}</span>}
    </button>
  );
}

function Sep() {
  return <span className="ae-sep" aria-hidden="true" />;
}

function LinkDialog({ editor, open, onClose }: { editor: Editor; open: boolean; onClose: () => void }) {
  const [url, setUrl] = useState('');
  const [newTab, setNewTab] = useState(false);
  const [error, setError] = useState('');
  const editing = open && editor.isActive('link');

  useEffect(() => {
    if (!open) return;
    const attrs = editor.getAttributes('link');
    setUrl(attrs.href ?? '');
    setNewTab(attrs.target === '_blank');
    setError('');
  }, [open, editor]);

  function apply(e: React.FormEvent) {
    e.preventDefault();
    const href = normalizeLinkUrl(url);
    if (!isSafeLinkUrl(href)) {
      setError('Use a web address (https://…), an internal path (/news/…), mailto: or tel:.');
      return;
    }
    const chain = editor.chain().focus().extendMarkRange('link');
    if (editor.state.selection.empty && !editor.isActive('link')) {
      // Nothing selected: insert the URL itself as the link text.
      chain.insertContent({ type: 'text', text: href, marks: [{ type: 'link', attrs: { href, target: newTab ? '_blank' : null } }] }).run();
    } else {
      chain.setLink({ href, target: newTab ? '_blank' : null }).run();
    }
    onClose();
  }

  function remove() {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={next => !next && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={apply} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit link' : 'Add link'}</DialogTitle>
            <DialogDescription>Link the selected text to a source or another CrypLounge page.</DialogDescription>
          </DialogHeader>
          <div>
            <label htmlFor="ae-link-url" className="block text-sm text-gray-700 dark:text-gray-300 mb-1.5">URL</label>
            <input
              id="ae-link-url"
              autoFocus
              value={url}
              onChange={e => {
                setUrl(e.target.value);
                setError('');
              }}
              placeholder="https://… or /news/tech/…"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'ae-link-error' : undefined}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-[#0D0D0E] border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            {error && (
              <p id="ae-link-error" className="mt-1.5 text-xs text-red-600 dark:text-red-400" role="alert">{error}</p>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" checked={newTab} onChange={e => setNewTab(e.target.checked)} className="w-4 h-4 accent-[#EFB81A]" />
            Open in a new tab (for external sources)
          </label>
          <DialogFooter className="gap-2">
            {editing && (
              <button type="button" onClick={remove} className="mr-auto px-3 py-2 text-sm rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                Remove link
              </button>
            )}
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm rounded-md bg-[#EFB81A] hover:bg-[#d9a617] text-gray-900">
              {editing ? 'Update link' : 'Add link'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
