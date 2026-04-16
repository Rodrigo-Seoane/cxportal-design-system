'use client'

import { useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  TextBolderIcon,
  TextItalicIcon,
  TextStrikethroughIcon,
  QuotesIcon,
  ListBulletsIcon,
  ListNumbersIcon,
  ListChecksIcon,
  TextIndentIcon,
  TextOutdentIcon,
  TableIcon,
  ImageIcon,
  LinkIcon,
  CodeIcon,
  MinusIcon,
  TextHIcon,
  SquareSplitHorizontalIcon,
  SquareIcon,
  ArrowsInLineHorizontalIcon,
} from '@phosphor-icons/react'

// ── Types ──────────────────────────────────────────────────────────────────────

interface MarkdownEditorProps {
  value: string
  onChange: (v: string) => void
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getLineStart(text: string, pos: number): number {
  const idx = text.lastIndexOf('\n', pos - 1)
  return idx === -1 ? 0 : idx + 1
}

function getLineEnd(text: string, pos: number): number {
  const idx = text.indexOf('\n', pos)
  return idx === -1 ? text.length : idx
}

function getCurrentLine(text: string, pos: number): string {
  return text.slice(getLineStart(text, pos), getLineEnd(text, pos))
}

// ── Toolbar button ─────────────────────────────────────────────────────────────

function ToolBtn({
  title,
  onClick,
  children,
  active,
}: {
  title: string
  onClick: () => void
  children: React.ReactNode
  active?: boolean
}) {
  return (
    <button
      title={title}
      onMouseDown={e => { e.preventDefault(); onClick() }}
      style={{
        display:      'flex',
        alignItems:   'center',
        justifyContent: 'center',
        width:        26,
        height:       26,
        border:       'none',
        borderRadius: 4,
        background:   active ? '#e8effd' : 'transparent',
        color:        active ? '#3264b8' : '#4b535e',
        cursor:       'pointer',
        fontSize:     12,
        fontWeight:   600,
        flexShrink:   0,
      }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = '#f0f2f5' }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
    >
      {children}
    </button>
  )
}

function Divider() {
  return (
    <span style={{
      width:      1,
      height:     18,
      background: '#d9dce0',
      flexShrink: 0,
      margin:     '0 2px',
      display:    'inline-block',
    }} />
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [scrollSync, setScrollSync] = useState(false)
  const [splitView, setSplitView]   = useState(true)

  // Restore cursor after a state update
  function applyChange(newValue: string, newCursor: number) {
    onChange(newValue)
    requestAnimationFrame(() => {
      if (!textareaRef.current) return
      textareaRef.current.focus()
      textareaRef.current.setSelectionRange(newCursor, newCursor)
    })
  }

  function applyChangeWithSelection(newValue: string, selStart: number, selEnd: number) {
    onChange(newValue)
    requestAnimationFrame(() => {
      if (!textareaRef.current) return
      textareaRef.current.focus()
      textareaRef.current.setSelectionRange(selStart, selEnd)
    })
  }

  // ── Toolbar actions ──────────────────────────────────────────────────────────

  function wrapSelection(before: string, after: string) {
    const ta = textareaRef.current
    if (!ta) return
    const { selectionStart: s, selectionEnd: e } = ta
    const selected = value.slice(s, e)
    const newVal = value.slice(0, s) + before + selected + after + value.slice(e)
    applyChangeWithSelection(newVal, s + before.length, s + before.length + selected.length)
  }

  function prefixLine(prefix: string) {
    const ta = textareaRef.current
    if (!ta) return
    const pos = ta.selectionStart
    const lineStart = getLineStart(value, pos)
    const newVal = value.slice(0, lineStart) + prefix + value.slice(lineStart)
    applyChange(newVal, pos + prefix.length)
  }

  function removePrefixFromLine(prefix: string) {
    const ta = textareaRef.current
    if (!ta) return
    const pos = ta.selectionStart
    const lineStart = getLineStart(value, pos)
    const line = getCurrentLine(value, pos)
    if (line.startsWith(prefix)) {
      const newVal = value.slice(0, lineStart) + value.slice(lineStart + prefix.length)
      applyChange(newVal, Math.max(lineStart, pos - prefix.length))
    }
  }

  function insertAtCursor(text: string) {
    const ta = textareaRef.current
    if (!ta) return
    const s = ta.selectionStart
    const newVal = value.slice(0, s) + text + value.slice(s)
    applyChange(newVal, s + text.length)
  }

  function handleHeading() {
    const ta = textareaRef.current
    if (!ta) return
    const pos = ta.selectionStart
    const line = getCurrentLine(value, pos)
    const lineStart = getLineStart(value, pos)

    let newLine: string
    let cursorOffset: number

    if (line.startsWith('### ')) {
      // ### → none
      newLine = line.slice(4)
      cursorOffset = -4
    } else if (line.startsWith('## ')) {
      // ## → ###
      newLine = '###' + line.slice(2)
      cursorOffset = 1
    } else if (line.startsWith('# ')) {
      // # → ##
      newLine = '#' + line
      cursorOffset = 1
    } else {
      // none → #
      newLine = '## ' + line
      cursorOffset = 3
    }

    const lineEnd = getLineEnd(value, pos)
    const newVal = value.slice(0, lineStart) + newLine + value.slice(lineEnd)
    applyChange(newVal, pos + cursorOffset)
  }

  function handleCode() {
    const ta = textareaRef.current
    if (!ta) return
    const { selectionStart: s, selectionEnd: e } = ta
    const selected = value.slice(s, e)
    if (selected.includes('\n')) {
      const block = '```\n' + selected + '\n```'
      const newVal = value.slice(0, s) + block + value.slice(e)
      applyChangeWithSelection(newVal, s + 4, s + 4 + selected.length)
    } else {
      wrapSelection('`', '`')
    }
  }

  function handleTable() {
    const template = '\n| Header 1 | Header 2 | Header 3 |\n| --- | --- | --- |\n| Cell | Cell | Cell |\n'
    insertAtCursor(template)
  }

  function handleLink() {
    const ta = textareaRef.current
    if (!ta) return
    const { selectionStart: s, selectionEnd: e } = ta
    const selected = value.slice(s, e) || 'link text'
    const newVal = value.slice(0, s) + '[' + selected + '](url)' + value.slice(e)
    onChange(newVal)
    requestAnimationFrame(() => {
      if (!textareaRef.current) return
      textareaRef.current.focus()
      // Select the "url" part so user can type over it
      const urlStart = s + selected.length + 3
      textareaRef.current.setSelectionRange(urlStart, urlStart + 3)
    })
  }

  // ── Prose CSS for the preview panel ─────────────────────────────────────────

  const proseStyles: Record<string, React.CSSProperties> = {
    h1:          { fontSize: 28, fontWeight: 700, margin: '0 0 12px', color: '#021920' },
    h2:          { fontSize: 22, fontWeight: 700, margin: '16px 0 10px', color: '#021920' },
    h3:          { fontSize: 18, fontWeight: 600, margin: '14px 0 8px', color: '#021920' },
    p:           { fontSize: 14, fontWeight: 400, color: '#021920', lineHeight: 1.6, margin: '0 0 10px' },
    code:        { background: '#f0f2f5', borderRadius: 4, padding: '1px 4px', fontSize: 13, fontFamily: 'monospace' },
    pre:         { background: '#f0f2f5', padding: 12, borderRadius: 6, overflow: 'auto', margin: '0 0 12px' },
    blockquote:  { borderLeft: '3px solid #4285f4', paddingLeft: 12, color: '#4b535e', margin: '0 0 12px', fontStyle: 'italic' },
    ul:          { paddingLeft: 20, margin: '0 0 10px' },
    ol:          { paddingLeft: 20, margin: '0 0 10px' },
    li:          { marginBottom: 4, fontSize: 14, color: '#021920', lineHeight: 1.6 },
    hr:          { borderTop: '1px solid #eff1f3', border: 'none', borderTopColor: '#eff1f3', borderTopStyle: 'solid', borderTopWidth: 1, margin: '12px 0' },
    table:       { width: '100%', borderCollapse: 'collapse', margin: '0 0 12px', fontSize: 13 },
    th:          { border: '1px solid #eff1f3', padding: '6px 8px', textAlign: 'left', background: '#f5f7fa', fontWeight: 600 },
    td:          { border: '1px solid #eff1f3', padding: '6px 8px', textAlign: 'left' },
    strong:      { fontWeight: 700 },
    em:          { fontStyle: 'italic' },
    del:         { textDecoration: 'line-through', color: '#7a828c' },
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>

      {/* ── Toolbar ── */}
      <div style={{
        display:       'flex',
        alignItems:    'center',
        gap:           2,
        padding:       '4px 12px',
        borderBottom:  '1px solid #eff1f3',
        background:    '#fff',
        flexShrink:    0,
        flexWrap:      'wrap',
      }}>
        <ToolBtn title="Heading" onClick={handleHeading}>
          <TextHIcon size={14} />
        </ToolBtn>
        <ToolBtn title="Bold" onClick={() => wrapSelection('**', '**')}>
          <TextBolderIcon size={14} />
        </ToolBtn>
        <ToolBtn title="Italic" onClick={() => wrapSelection('*', '*')}>
          <TextItalicIcon size={14} />
        </ToolBtn>
        <ToolBtn title="Strikethrough" onClick={() => wrapSelection('~~', '~~')}>
          <TextStrikethroughIcon size={14} />
        </ToolBtn>

        <Divider />

        <ToolBtn title="Horizontal Rule" onClick={() => insertAtCursor('\n---\n')}>
          <MinusIcon size={14} />
        </ToolBtn>
        <ToolBtn title="Blockquote" onClick={() => prefixLine('> ')}>
          <QuotesIcon size={14} />
        </ToolBtn>

        <Divider />

        <ToolBtn title="Bullet List" onClick={() => prefixLine('- ')}>
          <ListBulletsIcon size={14} />
        </ToolBtn>
        <ToolBtn title="Numbered List" onClick={() => prefixLine('1. ')}>
          <ListNumbersIcon size={14} />
        </ToolBtn>
        <ToolBtn title="Task List" onClick={() => prefixLine('- [ ] ')}>
          <ListChecksIcon size={14} />
        </ToolBtn>
        <ToolBtn title="Indent" onClick={() => prefixLine('  ')}>
          <TextIndentIcon size={14} />
        </ToolBtn>
        <ToolBtn title="Outdent" onClick={() => removePrefixFromLine('  ')}>
          <TextOutdentIcon size={14} />
        </ToolBtn>

        <Divider />

        <ToolBtn title="Insert Table" onClick={handleTable}>
          <TableIcon size={14} />
        </ToolBtn>
        <ToolBtn title="Insert Image" onClick={() => insertAtCursor('![alt text](url)')}>
          <ImageIcon size={14} />
        </ToolBtn>
        <ToolBtn title="Insert Link" onClick={handleLink}>
          <LinkIcon size={14} />
        </ToolBtn>
        <ToolBtn title="Code" onClick={handleCode}>
          <CodeIcon size={14} />
        </ToolBtn>

        <div style={{ flex: 1 }} />

        {/* View toggle */}
        <ToolBtn title="Split view" onClick={() => setSplitView(true)} active={splitView}>
          <SquareSplitHorizontalIcon size={14} />
        </ToolBtn>
        <ToolBtn title="Editor only" onClick={() => setSplitView(false)} active={!splitView}>
          <SquareIcon size={14} />
        </ToolBtn>

        {/* Scroll sync pill */}
        <button
          onMouseDown={e => { e.preventDefault(); setScrollSync(s => !s) }}
          style={{
            display:      'flex',
            alignItems:   'center',
            gap:          4,
            padding:      '2px 8px',
            border:       '1px solid',
            borderColor:  scrollSync ? '#4285f4' : '#d9dce0',
            borderRadius: 12,
            background:   scrollSync ? '#e8effd' : 'transparent',
            color:        scrollSync ? '#3264b8' : '#7a828c',
            fontSize:     11,
            fontWeight:   500,
            cursor:       'pointer',
            marginLeft:   4,
          }}
        >
          <ArrowsInLineHorizontalIcon size={11} />
          Scroll
        </button>
      </div>

      {/* ── Split pane ── */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* Editor */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          spellCheck={false}
          style={{
            flex:        1,
            resize:      'none',
            border:      'none',
            borderRight: splitView ? '1px solid #eff1f3' : 'none',
            padding:     16,
            fontFamily:  'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Monaco, Consolas, monospace',
            fontSize:    13,
            lineHeight:  1.6,
            background:  '#fafbfc',
            color:       '#021920',
            outline:     'none',
            overflowY:   'auto',
          }}
        />

        {/* Preview */}
        {splitView && (
          <div style={{
            flex:       1,
            padding:    16,
            overflowY:  'auto',
            background: '#fff',
            minWidth:   0,
          }}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1:         ({ children }) => <h1 style={proseStyles.h1}>{children}</h1>,
                h2:         ({ children }) => <h2 style={proseStyles.h2}>{children}</h2>,
                h3:         ({ children }) => <h3 style={proseStyles.h3}>{children}</h3>,
                p:          ({ children }) => <p style={proseStyles.p}>{children}</p>,
                strong:     ({ children }) => <strong style={proseStyles.strong}>{children}</strong>,
                em:         ({ children }) => <em style={proseStyles.em}>{children}</em>,
                del:        ({ children }) => <del style={proseStyles.del}>{children}</del>,
                blockquote: ({ children }) => <blockquote style={proseStyles.blockquote}>{children}</blockquote>,
                ul:         ({ children }) => <ul style={proseStyles.ul}>{children}</ul>,
                ol:         ({ children }) => <ol style={proseStyles.ol}>{children}</ol>,
                li:         ({ children }) => <li style={proseStyles.li}>{children}</li>,
                hr:         () => <hr style={{ border: 'none', borderTop: '1px solid #eff1f3', margin: '12px 0' }} />,
                table:      ({ children }) => <table style={proseStyles.table}>{children}</table>,
                th:         ({ children }) => <th style={proseStyles.th}>{children}</th>,
                td:         ({ children }) => <td style={proseStyles.td}>{children}</td>,
                pre:        ({ children }) => <pre style={proseStyles.pre}>{children}</pre>,
                code:       ({ children, className }) => {
                  const isBlock = !!className
                  return isBlock
                    ? <code style={{ fontFamily: 'monospace', fontSize: 13 }}>{children}</code>
                    : <code style={proseStyles.code}>{children}</code>
                },
              }}
            >
              {value}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}
