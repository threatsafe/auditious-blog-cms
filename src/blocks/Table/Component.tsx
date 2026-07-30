import type { TableBlock as TableBlockProps } from '@/payload-types'

import { cn } from '@/utilities/ui'
import React from 'react'

type Props = { className?: string } & TableBlockProps

type Row = NonNullable<TableBlockProps['rows']>[number]
type Cell = NonNullable<Row['cells']>[number]

const ALIGN_CLASS: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

// Background choices → Tailwind classes (dark-mode aware).
const BACKGROUND_CLASS: Record<string, string> = {
  'emerald-soft': 'bg-emerald-50 dark:bg-emerald-950/40',
  'emerald-solid': 'bg-emerald-600 text-white dark:bg-emerald-700',
  muted: 'bg-muted',
}

export const TableBlock: React.FC<Props> = ({
  className,
  caption,
  headerRow,
  headerColumn,
  striped,
  rows,
}) => {
  const allRows = rows ?? []
  if (allRows.length === 0) return null

  const head = headerRow ? allRows[0] : null
  const body = headerRow ? allRows.slice(1) : allRows

  const renderCell = (cell: Cell, cellIndex: number, isHeaderRow: boolean) => {
    const isHeaderColumnCell = Boolean(headerColumn) && cellIndex === 0
    const isHeader = isHeaderRow || isHeaderColumnCell
    const Tag = isHeader ? 'th' : 'td'
    const scope = isHeaderRow ? 'col' : isHeaderColumnCell ? 'row' : undefined
    const align = cell.align ?? 'left'
    const background =
      cell.background && cell.background !== 'none' ? BACKGROUND_CLASS[cell.background] : undefined
    const colSpan = cell.colSpan && cell.colSpan > 1 ? cell.colSpan : undefined
    const rowSpan = cell.rowSpan && cell.rowSpan > 1 ? cell.rowSpan : undefined

    return (
      <Tag
        className={cn(
          'border border-border px-4 py-2 align-top whitespace-pre-line',
          ALIGN_CLASS[align],
          isHeader && 'font-semibold',
          // Header cells get a subtle fill unless the author set an explicit one.
          isHeader && !background && 'bg-muted',
          background,
        )}
        colSpan={colSpan}
        key={cell.id ?? cellIndex}
        rowSpan={rowSpan}
        scope={scope}
      >
        {cell.content}
      </Tag>
    )
  }

  return (
    <div className={cn('not-prose my-8 w-full overflow-x-auto', className)}>
      <table className="w-full border-collapse text-sm text-foreground">
        {caption ? (
          <caption className="caption-bottom pt-3 text-left text-sm text-muted-foreground">
            {caption}
          </caption>
        ) : null}
        {head ? (
          <thead>
            <tr>{(head.cells ?? []).map((cell, i) => renderCell(cell, i, true))}</tr>
          </thead>
        ) : null}
        <tbody>
          {body.map((row, rowIndex) => (
            <tr
              className={cn(striped && rowIndex % 2 === 1 && 'bg-muted/40')}
              key={row.id ?? rowIndex}
            >
              {(row.cells ?? []).map((cell, i) => renderCell(cell, i, false))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
