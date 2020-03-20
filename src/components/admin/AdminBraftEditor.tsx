import { ControlType, EditorState } from 'braft-editor'
import React, { forwardRef } from 'react'
import { v4 as uuid } from 'uuid'
import { uploadFile } from '../../helpers'
import StyledBraftEditor from '../common/StyledBraftEditor'

const braftLanguageFn = (languages: { [lan: string]: any }, context: any) => {
  if (context === 'braft-editor') {
    languages['zh-hant'].controls.normal = '內文'
    languages['zh-hant'].controls.fontSize = '字級'
    languages['zh-hant'].controls.removeStyles = '清除樣式'
    languages['zh-hant'].controls.code = '程式碼'
    languages['zh-hant'].controls.link = '連結'
    languages['zh-hant'].controls.hr = '水平線'
    languages['zh-hant'].controls.fullscreen = '全螢幕'

    return languages['zh-hant']
  }
}

export const uploadFn = async (params: {
  file: File
  success: (res: {
    url: string
    meta: {
      id: string
      title: string
      alt: string
      loop: boolean
      autoPlay: boolean
      controls: boolean
      poster: string
    }
  }) => void
}) => {
  uploadFile(`images/${localStorage.getItem('kolable.app.id')}/editor/${uuid()}`, params.file).then(signedUrl => {
    params.success({
      url: signedUrl.split('?')[0],
      meta: {
        id: '',
        title: '',
        alt: '',
        loop: false,
        autoPlay: false,
        controls: false,
        poster: '',
      },
    })
  })
}

type AdminBraftVariant = 'default' | 'short'
const controls: {
  [key in AdminBraftVariant]: ControlType[]
} = {
  default: [
    'headings',
    'font-size',
    'line-height',
    'text-color',
    'bold',
    'italic',
    'underline',
    'strike-through',
    'remove-styles',
    'separator',
    'text-align',
    'separator',
    'list-ol',
    'list-ul',
    'blockquote',
    'code',
    'separator',
    'media',
    'link',
    'hr',
    'separator',
    'fullscreen',
  ],
  short: ['bold', 'italic', 'underline', 'remove-styles', 'separator', 'media'],
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
      language={braftLanguageFn}
      controls={controls[variant || 'default']}
      media={{ uploadFn }}
    />
  )
}

export default forwardRef(AdminBraftEditor)
