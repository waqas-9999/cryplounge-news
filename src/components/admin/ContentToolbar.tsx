'use client';

import { RefObject } from 'react';
import { Bold, Italic, Heading2, Heading3, Heading4, Link2, List, ListOrdered, Quote, Minus } from 'lucide-react';

interface ContentToolbarProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (next: string) => void;
}

interface ToolAction {
  label: string;
  icon: typeof Bold;
  apply: (selected: string) => { before: string; after: string; placeholder: string };
}

const BLOCK_TOOLS: ToolAction[] = [
  { label: 'Heading 2', icon: Heading2, apply: () => ({ before: '<h2>', after: '</h2>', placeholder: 'Section heading' }) },
  { label: 'Heading 3', icon: Heading3, apply: () => ({ before: '<h3>', after: '</h3>', placeholder: 'Subsection heading' }) },
  { label: 'Heading 4', icon: Heading4, apply: () => ({ before: '<h4>', after: '</h4>', placeholder: 'Minor heading' }) },
  { label: 'Bold', icon: Bold, apply: () => ({ before: '<strong>', after: '</strong>', placeholder: 'bold text' }) },
  { label: 'Italic', icon: Italic, apply: () => ({ before: '<em>', after: '</em>', placeholder: 'italic text' }) },
  { label: 'Bulleted list', icon: List, apply: () => ({ before: '<ul>\n  <li>', after: '</li>\n</ul>', placeholder: 'List item' }) },
  { label: 'Numbered list', icon: ListOrdered, apply: () => ({ before: '<ol>\n  <li>', after: '</li>\n</ol>', placeholder: 'List item' }) },
  { label: 'Blockquote', icon: Quote, apply: () => ({ before: '<blockquote>', after: '</blockquote>', placeholder: 'Quoted text' }) },
];

/**
 * Inserts HTML snippets into the article body textarea at the cursor (or
 * around the current selection). Not a WYSIWYG editor — the field remains
 * raw HTML, sanitized on render (`ArticleDetailPage`) and again on save
 * (`HtmlSanitizerService`) — this just removes the need to hand-type tags
 * for the formatting the editor already supports end to end.
 */
export function ContentToolbar({ textareaRef, value, onChange }: ContentToolbarProps) {
  function wrapSelection(before: string, after: string, placeholder: string) {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const selected = value.slice(start, end) || placeholder;
    const next = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      const cursor = start + before.length + selected.length + after.length;
      el.setSelectionRange(cursor, cursor);
    });
  }

  function insertLink() {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const selectedText = value.slice(start, end);
    const url = window.prompt('Link URL (https://... or /news/...)');
    if (!url) return;
    const trimmed = url.trim();
    const isSafe = /^(https?:|mailto:|tel:|\/)/i.test(trimmed);
    if (!isSafe) {
      window.alert('Only http(s), mailto, tel or internal (/…) links are allowed.');
      return;
    }
    const text = selectedText || window.prompt('Link text', trimmed) || trimmed;
    const external = /^https?:/i.test(trimmed);
    const tag = external
      ? `<a href="${trimmed}" target="_blank" rel="noopener noreferrer">${text}</a>`
      : `<a href="${trimmed}">${text}</a>`;
    const next = value.slice(0, start) + tag + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => el.focus());
  }

  function insertHr() {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? value.length;
    const next = `${value.slice(0, start)}\n<hr>\n${value.slice(start)}`;
    onChange(next);
    requestAnimationFrame(() => el.focus());
  }

  return (
    <div className="flex flex-wrap gap-1 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
      {BLOCK_TOOLS.map(tool => (
        <button
          key={tool.label}
          type="button"
          title={tool.label}
          onClick={() => {
            const { before, after, placeholder } = tool.apply('');
            wrapSelection(before, after, placeholder);
          }}
          className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <tool.icon className="w-4 h-4" />
        </button>
      ))}
      <button
        type="button"
        title="Link"
        onClick={insertLink}
        className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <Link2 className="w-4 h-4" />
      </button>
      <button
        type="button"
        title="Horizontal rule"
        onClick={insertHr}
        className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <Minus className="w-4 h-4" />
      </button>
    </div>
  );
}
