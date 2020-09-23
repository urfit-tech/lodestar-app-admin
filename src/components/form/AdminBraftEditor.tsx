import { ControlType, EditorState } from 'braft-editor'
import React, { useContext } from 'react'
import { v4 as uuid } from 'uuid'
import AppContext from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
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

export const createUploadFn = (appId: string, authToken: string | null) => {
  return async (params: {
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
    const uniqId = uuid()
    uploadFile(`images/${appId}/editor/${uniqId}`, params.file, authToken).then(() => {
      params.success({
        url: `https://${process.env.REACT_APP_S3_BUCKET}/images/${appId}/editor/${uniqId}`,
        meta: {
          id: '',
          title: '',
          alt: '',
          loop: false,
          autoPlay: false,
          controls: true,
          poster: '',
        },
      })
    })
  }
}

type AdminBraftVariant = 'default' | 'short' | 'merchandise'
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
  merchandise: [
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
    'link',
    'hr',
    'separator',
    'fullscreen',
  ],
}

const AdminBraftEditor: React.FC<{
  variant?: AdminBraftVariant
  value?: EditorState
  onChange?: (editorState: EditorState) => void
}> = ({ variant, value, onChange }) => {
  const { id: appId } = useContext(AppContext)
  const { authToken } = useAuth()

  return (
    <StyledBraftEditor
      value={value}
      onChange={onChange}
      contentClassName={variant === 'short' ? 'short-bf-content' : undefined}
      language={braftLanguageFn}
      controls={controls[variant || 'default']}
      media={{ uploadFn: createUploadFn(appId, authToken) }}
    />
  )
}

export default AdminBraftEditor
