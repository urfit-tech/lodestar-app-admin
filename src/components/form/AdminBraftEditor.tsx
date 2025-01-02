import { ControlType, EditorState } from 'braft-editor'
import StyledBraftEditor from 'lodestar-app-element/src/components/common/StyledBraftEditor'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React from 'react'
import { v4 as uuid } from 'uuid'
import { uploadFile } from '../../helpers'

export const braftLanguageFn = (languages: { [lan: string]: any }, context: any) => {
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
        url: params.file.type.startsWith('image/png')
          ? `https://${process.env.REACT_APP_S3_BUCKET}/images/${appId}/editor/${uniqId}/1200`
          : `https://${process.env.REACT_APP_S3_BUCKET}/images/${appId}/editor/${uniqId}`,
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

type AdminBraftVariant = 'default' | 'short' | 'merchandise' | 'question'
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
  question: ['font-size', 'bold', 'italic', 'underline', 'list-ol', 'list-ul', 'remove-styles', 'separator', 'media'],
}

const AdminBraftEditor: React.FC<{
  variant?: AdminBraftVariant
  value?: EditorState
  customControls?: ControlType[]
  onChange?: (editorState: EditorState) => void
  onBlur?: () => void
}> = ({ variant, value, customControls, onChange, onBlur }) => {
  const { id: appId } = useApp()
  const { authToken } = useAuth()

  return (
    <StyledBraftEditor
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      contentClassName={variant === 'short' ? 'short-bf-content' : undefined}
      language={braftLanguageFn}
      controls={customControls ?? controls[variant || 'default']}
      media={{
        uploadFn: createUploadFn(appId, authToken),
        accepts: { video: false, audio: false },
        externals: { image: true, video: false, audio: false, embed: true },
      }}
      imageControls={variant === 'question' ? ['remove'] : undefined}
      imageResizable={variant === 'question' ? false : undefined}
    />
  )
}

export default AdminBraftEditor
