'use client';

import { Node } from '@tiptap/core';
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from '@tiptap/react';
import { ArrowDown, ArrowUp, GripVertical, HelpCircle, Plus, Trash2, X } from 'lucide-react';
import { FAQ_TITLE } from '@/lib/article-body';

export interface FaqItem {
  question: string;
  answer: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    faqBlock: {
      insertFaq: () => ReturnType;
    };
  }
}

/** Answer text → paragraphs: a blank line starts a new paragraph. */
function paragraphs(answer: string): string[] {
  return answer
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(Boolean);
}

/**
 * FAQ: a structured list of question/answer pairs written by the editor.
 * Nothing is generated. Serializes to
 * `<section data-type="faq"><details data-type="faq-item">…` so the public page
 * renders an accessible disclosure with no JavaScript.
 */
export const FaqBlock = Node.create({
  name: 'faqBlock',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      items: { default: [{ question: '', answer: '' }] as FaqItem[], rendered: false },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'section[data-type="faq"]',
        getAttrs: el => {
          const items = Array.from((el as HTMLElement).querySelectorAll('details')).map(d => ({
            question: (d.querySelector('summary')?.textContent ?? '').trim(),
            answer: Array.from(d.querySelectorAll('[data-role="faq-answer"] p'))
              .map(p => (p.textContent ?? '').trim())
              .filter(Boolean)
              .join('\n\n'),
          }));
          return { items: items.length ? items : [{ question: '', answer: '' }] };
        },
      },
    ];
  },

  renderHTML({ node }) {
    const items = (node.attrs.items as FaqItem[]).filter(i => i.question.trim() || i.answer.trim());
    return [
      'section',
      { 'data-type': 'faq' },
      ['h2', { 'data-role': 'faq-title' }, FAQ_TITLE],
      ...items.map(item => [
        'details',
        { 'data-type': 'faq-item' },
        ['summary', {}, item.question.trim()],
        ['div', { 'data-role': 'faq-answer' }, ...paragraphs(item.answer).map(p => ['p', {}, p])],
      ]),
    ] as never;
  },

  addCommands() {
    return {
      insertFaq:
        () =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { items: [{ question: '', answer: '' }] } }),
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(FaqView);
  },
});

const field =
  'w-full px-3 py-2 text-sm bg-white dark:bg-[#0D0D0E] border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400';

function FaqView({ node, updateAttributes, deleteNode, selected }: NodeViewProps) {
  const items = node.attrs.items as FaqItem[];
  const set = (next: FaqItem[]) => updateAttributes({ items: next });

  const update = (index: number, patch: Partial<FaqItem>) =>
    set(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  const move = (index: number, by: -1 | 1) => {
    const target = index + by;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    set(next);
  };

  return (
    <NodeViewWrapper className={`ae-block ${selected ? 'is-selected' : ''}`} contentEditable={false}>
      <div className="ae-figure-bar">
        <span className="ae-drag" data-drag-handle title="Drag to move">
          <GripVertical className="w-4 h-4" aria-hidden="true" />
          <HelpCircle className="w-4 h-4" aria-hidden="true" />
          FAQ · {items.length} {items.length === 1 ? 'question' : 'questions'}
        </span>
        <button type="button" className="ae-icon-btn ae-danger ml-auto" onClick={deleteNode} title="Remove FAQ">
          <Trash2 className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">Remove FAQ</span>
        </button>
      </div>

      <ol className="divide-y divide-gray-200 dark:divide-gray-800">
        {items.map((item, index) => (
          <li key={index} className="p-3 flex gap-3">
            <span className="mt-2 text-xs font-semibold tabular-nums text-gray-400 w-5 shrink-0">{index + 1}</span>
            <div className="flex-1 min-w-0 space-y-2">
              <input
                className={`${field} font-medium`}
                value={item.question}
                maxLength={200}
                placeholder="Question"
                aria-label={`Question ${index + 1}`}
                onChange={e => update(index, { question: e.target.value })}
              />
              <textarea
                className={`${field} min-h-[72px] resize-y`}
                value={item.answer}
                maxLength={2000}
                placeholder="Answer. Leave a blank line to start a new paragraph."
                aria-label={`Answer ${index + 1}`}
                onChange={e => update(index, { answer: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1 shrink-0">
              <button type="button" className="ae-icon-btn" onClick={() => move(index, -1)} disabled={index === 0} title="Move up" aria-label={`Move question ${index + 1} up`}>
                <ArrowUp className="w-4 h-4" />
              </button>
              <button type="button" className="ae-icon-btn" onClick={() => move(index, 1)} disabled={index === items.length - 1} title="Move down" aria-label={`Move question ${index + 1} down`}>
                <ArrowDown className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="ae-icon-btn ae-danger"
                onClick={() => (items.length === 1 ? deleteNode() : set(items.filter((_, i) => i !== index)))}
                title="Delete question"
                aria-label={`Delete question ${index + 1}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </li>
        ))}
      </ol>
      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
        <button type="button" className="ae-icon-btn" onClick={() => set([...items, { question: '', answer: '' }])}>
          <Plus className="w-4 h-4" aria-hidden="true" /> Add question
        </button>
      </div>
    </NodeViewWrapper>
  );
}
