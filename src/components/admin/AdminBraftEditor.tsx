import { ControlType, EditorState } from 'braft-editor'
import React, { forwardRef } from 'react'
import StyledBraftEditor from '../common/StyledBraftEditor'

type AdminBraftVariant = 'default' | 'short'
const controls: {
  [key in AdminBraftVariant]: ControlType[]
} = {
  default: [
    'headings',
    { key: 'font-size', title: '字級' },
    'line-height',
    'text-color',
    'bold',
    'italic',
    'underline',
    'strike-through',
    { key: 'remove-styles', title: '清除樣式' },
    'separator',
    'text-align',
    'separator',
    'list-ol',
    'list-ul',
    'blockquote',
    { key: 'code', title: '程式碼' },
    'separator',
    'media',
    { key: 'link', title: '連結' },
    { key: 'hr', title: '水平線' },
    'separator',
    { key: 'fullscreen', title: '全螢幕' },
  ],
  short: ['bold', 'italic', 'underline', { key: 'remove-styles', title: '清除樣式' }, 'separator', 'media'],
}

const AdminBraftEditor: React.FC<{
  variant?: 'short' | 'default'
  value?: EditorState
  onChange?: (editorState: EditorState) => void
}> = ({ variant, value, onChange }, ref) => {
  return (
    <StyledBraftEditor
      ref={ref}
      value={value}
      onChange={onChange}
      contentClassName={variant === 'short' ? 'short-bf-content' : undefined}
      language="zh-hant"
      controls={controls[variant || 'default']}
    />
  )
}

export default forwardRef(AdminBraftEditor)
