import type { Block } from 'payload'

// Allowed values, kept here as the single source of truth so the frontend
// component and the HTML converter map the same strings to styles.
export const TABLE_CELL_ALIGNMENTS = ['left', 'center', 'right'] as const
export const TABLE_CELL_BACKGROUNDS = ['none', 'emerald-soft', 'emerald-solid', 'muted'] as const

const alignOptions = [
  { label: 'Left', value: 'left' },
  { label: 'Center', value: 'center' },
  { label: 'Right', value: 'right' },
]

const backgroundOptions = [
  { label: 'None', value: 'none' },
  { label: 'Emerald (subtle)', value: 'emerald-soft' },
  { label: 'Emerald (solid)', value: 'emerald-solid' },
  { label: 'Muted', value: 'muted' },
]

// A structured table authored as rows → cells. Deliberately self-contained so a
// table can be dropped into any rich text field via the Blocks feature and
// rendered identically on the React frontend and in the HTML themes.
export const Table: Block = {
  slug: 'table',
  interfaceName: 'TableBlock',
  labels: { singular: 'Table', plural: 'Tables' },
  fields: [
    {
      name: 'caption',
      type: 'text',
      admin: {
        description: 'Optional caption shown beneath the table. Also read by screen readers.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'headerRow',
          type: 'checkbox',
          defaultValue: true,
          label: 'First row is a header',
          admin: { width: '34%' },
        },
        {
          name: 'headerColumn',
          type: 'checkbox',
          defaultValue: false,
          label: 'First column is a header',
          admin: { width: '33%' },
        },
        {
          name: 'striped',
          type: 'checkbox',
          defaultValue: true,
          label: 'Striped rows',
          admin: { width: '33%' },
        },
      ],
    },
    {
      name: 'rows',
      type: 'array',
      label: 'Rows',
      labels: { singular: 'Row', plural: 'Rows' },
      minRows: 1,
      required: true,
      fields: [
        {
          name: 'cells',
          type: 'array',
          label: 'Cells',
          labels: { singular: 'Cell', plural: 'Cell' },
          minRows: 1,
          required: true,
          admin: {
            description: 'Add one cell per column. Keep the count consistent across rows.',
          },
          fields: [
            {
              name: 'content',
              type: 'textarea',
              label: 'Content',
              admin: { description: 'Plain text. Line breaks are preserved.' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'align',
                  type: 'select',
                  defaultValue: 'left',
                  options: alignOptions,
                  admin: { width: '25%' },
                },
                {
                  name: 'background',
                  type: 'select',
                  defaultValue: 'none',
                  options: backgroundOptions,
                  admin: { width: '25%' },
                },
                {
                  name: 'colSpan',
                  type: 'number',
                  defaultValue: 1,
                  min: 1,
                  label: 'Col span',
                  admin: { width: '25%', step: 1 },
                },
                {
                  name: 'rowSpan',
                  type: 'number',
                  defaultValue: 1,
                  min: 1,
                  label: 'Row span',
                  admin: { width: '25%', step: 1 },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
