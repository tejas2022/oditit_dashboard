import { useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

function toHtml(val: string): string {
  if (!val || !val.trim()) return '<p><br></p>';
  const t = val.trim();
  if (t.startsWith('<') && t.endsWith('>')) return val;
  return '<p>' + t.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '</p><p>') + '</p>';
}

export interface PolicyEditorHandle {
  /** Plain text of the full document (for API / enhance) */
  getPlainText: () => string;
  /** Currently selected text */
  getSelectedText: () => string;
  /** Quill selection { index, length } – store when opening enhance, use in insertAtSelection */
  getQuillSelection: () => { index: number; length: number } | null;
  /** Replace the range [index, index+length) with the given text (for enhance result) */
  insertAtSelection: (index: number, length: number, text: string) => void;
  /** Character offsets in plain text for backward compat */
  getSelectionRange: () => { start: number; end: number };
  setSelectionRange: (start: number, end: number) => void;
  focus: () => void;
}

interface PolicyEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
  onDownload?: () => void;
  className?: string;
}

// Toolbar: H1–H3, image, bold, italic, underline, font, size, align left/center/right, bullet list, ordered list, table
const QUILL_MODULES = {
  toolbar: {
    container: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ font: [false, 'serif', 'monospace'] }],
      [{ size: ['small', false, 'large', 'huge'] }],
      [{ align: [false, 'center', 'right', 'justify'] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['image', 'table'],
      ['clean'],
    ],
    handlers: {
      image: imageHandler,
      table: tableHandler,
    },
  },
  table: true,
};

function imageHandler(this: { quill: Quill }) {
  const url = window.prompt('Enter image URL:');
  if (url) {
    const range = this.quill.getSelection(true);
    if (range) this.quill.insertEmbed(range.index, 'image', url, 'user');
  }
}

function tableHandler(this: { quill: Quill }) {
  const rows = Math.max(1, parseInt(String(window.prompt('Number of rows?', '3')), 10) || 3);
  const cols = Math.max(1, parseInt(String(window.prompt('Number of columns?', '3')), 10) || 3);
  const table = this.quill.getModule('table') as { insertTable?: (rows: number, cols: number) => void } | undefined;
  if (table?.insertTable) table.insertTable(rows, cols);
}

export const PolicyEditor = forwardRef<PolicyEditorHandle, PolicyEditorProps>(
  ({ value, onChange, placeholder, disabled, onDownload, className = '' }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const quillInstanceRef = useRef<Quill | null>(null);
    const lastSentRef = useRef<string>(value ?? '');
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    const getQuill = useCallback((): Quill | null => quillInstanceRef.current, []);

    useImperativeHandle(
      ref,
      () => ({
        getPlainText: () => getQuill()?.getText() ?? '',
        getSelectedText: () => {
          const q = getQuill();
          if (!q) return '';
          const sel = q.getSelection(true);
          if (!sel || sel.length === 0) return '';
          return q.getText(sel.index, sel.length) ?? '';
        },
        getQuillSelection: () => {
          const q = getQuill();
          if (!q) return null;
          const sel = q.getSelection(true);
          if (!sel) return null;
          return { index: sel.index, length: sel.length };
        },
        insertAtSelection: (index: number, length: number, text: string) => {
          const q = getQuill();
          if (!q) return;
          q.deleteText(index, length, 'user');
          q.insertText(index, text, 'user');
          q.setSelection(index + text.length, 0, 'silent');
        },
        getSelectionRange: () => {
          const q = getQuill();
          if (!q) return { start: 0, end: 0 };
          const sel = q.getSelection(true);
          if (!sel) return { start: 0, end: 0 };
          const before = q.getText(0, sel.index);
          return { start: before.length, end: before.length + sel.length };
        },
        setSelectionRange: (start: number, end: number) => {
          const q = getQuill();
          if (!q || start < 0 || end < start) return;
          q.setSelection(start, end - start, 'silent');
        },
        focus: () => getQuill()?.focus(),
      }),
      [getQuill]
    );

    // Mount Quill on the container div (no findDOMNode – React 19 compatible)
    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;

      const quill = new Quill(el, {
        theme: 'snow',
        placeholder: placeholder ?? 'Write policy content...',
        readOnly: disabled ?? false,
        modules: QUILL_MODULES,
      });

      quillInstanceRef.current = quill;

      const initial =
        !value || !String(value).trim()
          ? '<p><br></p>'
          : String(value).trim().startsWith('<')
            ? value
            : toHtml(value);
      quill.clipboard.dangerouslyPasteHTML(initial, 'silent');
      lastSentRef.current = value ?? '';

      quill.on('text-change', () => {
        const html = quill.root.innerHTML;
        lastSentRef.current = html;
        onChangeRef.current(html);
      });

      return () => {
        // Quill 2.0 (Snow theme) prepends the toolbar to the parent of the editor container.
        // We must remove it explicitly to avoid duplicates in StrictMode/fast-refresh.
        const parent = el.parentElement;
        if (parent) {
          const toolbars = parent.querySelectorAll('.ql-toolbar');
          toolbars.forEach((tb) => tb.remove());
        }
        el.innerHTML = '';
        quillInstanceRef.current = null;
      };
    }, []);

    // Sync value from parent when it changes externally (e.g. after enhance or when entering edit mode)
    useEffect(() => {
      const q = quillInstanceRef.current;
      if (!q || value === undefined) return;
      if (value === lastSentRef.current) return;
      const next =
        value && String(value).trim()
          ? String(value).trim().startsWith('<')
            ? value
            : toHtml(value)
          : '<p><br></p>';
      q.clipboard.dangerouslyPasteHTML(next, 'silent');
      lastSentRef.current = value;
    }, [value]);

    // Update readOnly when disabled prop changes
    useEffect(() => {
      const q = quillInstanceRef.current;
      if (!q) return;
      q.enable(!disabled);
    }, [disabled]);

    return (
      <div className={`flex flex-col rounded-lg border border-slate-700 bg-slate-900/30 ${className}`}>
        {onDownload && (
          <div className="flex items-center gap-1 border-b border-slate-700 bg-slate-800/50 px-2 py-1.5">
            <button
              type="button"
              onClick={onDownload}
              className="rounded p-2 text-slate-400 hover:bg-slate-700 hover:text-white"
              title="Download"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        )}
        <div className="policy-editor-wrapper min-h-[28rem]">
          <div ref={containerRef} className="policy-quill-editor" />
        </div>
        <style>{`
          .policy-editor-wrapper .ql-toolbar.ql-snow { border-color: rgb(51 65 85); background: rgb(30 41 59 / 0.5); }
          .policy-editor-wrapper .ql-container.ql-snow { border-color: rgb(51 65 85); font-size: 14px; min-height: 26rem; }
          .policy-editor-wrapper .ql-editor { min-height: 26rem; color: rgb(203 213 225); }
          .policy-editor-wrapper .ql-editor.ql-blank::before { color: #64748b; }
          .policy-editor-wrapper .ql-snow .ql-stroke { stroke: rgb(71 85 105); }
          .policy-editor-wrapper .ql-snow .ql-fill { fill: rgb(148 163 184); }
          .policy-editor-wrapper .ql-snow .ql-picker { color: rgb(203 213 225); }
          .policy-editor-wrapper .ql-snow .ql-toolbar button:hover .ql-stroke,
          .policy-editor-wrapper .ql-snow .ql-toolbar button.ql-active .ql-stroke { stroke: rgb(56 189 248); }
          .policy-editor-wrapper .ql-snow .ql-toolbar button:hover .ql-fill,
          .policy-editor-wrapper .ql-snow .ql-toolbar button.ql-active .ql-fill { fill: rgb(56 189 248); }
        `}</style>
      </div>
    );
  }
);

PolicyEditor.displayName = 'PolicyEditor';
