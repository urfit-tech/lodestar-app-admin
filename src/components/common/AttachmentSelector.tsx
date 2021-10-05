import { Button, Select } from 'antd'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import { useAttachments } from '../../hooks/data'
import { Attachment } from '../../types/general'

const messages = defineMessages({
  addAttachment: { id: 'attachment.selector.addAttachment', defaultMessage: '新增檔案' },
  placeholder: { id: 'attachment.selector.placeholder', defaultMessage: '從媒體庫選擇' },
  refresh: { id: 'attachment.selector.refresh', defaultMessage: '重新整理' },
})
export type AttachmentSelectorValue = Pick<Attachment, 'id' | 'size' | 'options' | 'duration'>
const AttachmentSelector: React.VFC<{
  status?: string
  contentType?: string
  value?: AttachmentSelectorValue | null
  onChange?: (attachment: AttachmentSelectorValue | null) => void
}> = ({ status, contentType, value, onChange }) => {
  const { formatMessage } = useIntl()
  const { attachments, loading, refetch } = useAttachments({ contentType, status })
  return (
    <div className="d-flex">
      <Link target="_blank" to="/media-library?open=video">
        <Button className="mr-2">{formatMessage(messages.addAttachment)}</Button>
      </Link>
      <Select
        loading={loading}
        showSearch
        allowClear
        style={{ width: 200 }}
        placeholder={formatMessage(messages.placeholder)}
        filterOption={(input, option) => option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        value={value?.id}
        onChange={v => {
          const selectedAttachment = attachments.find(attachment => attachment.id === v) || null
          onChange?.(selectedAttachment)
        }}
      >
        {attachments.map(attachment => (
          <Select.Option key={attachment.id} value={attachment.id} disabled={attachment.status !== 'READY'}>
            {`${attachment.name} / ${attachment.author.name}`}
          </Select.Option>
        ))}
      </Select>
      <Button type="link" onClick={() => refetch()}>
        {formatMessage(messages.refresh)}
      </Button>
    </div>
  )
}

export default AttachmentSelector
