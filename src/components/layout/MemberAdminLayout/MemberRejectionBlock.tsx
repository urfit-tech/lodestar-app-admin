import { Button, Form, Input } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import moment from 'moment'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages } from '../../../helpers/translation'
import AdminModal from '../../admin/AdminModal'

const StyledTime = styled.div`
  font-family: NotoSansCJKtc;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.18px;
  color: var(--gray-darker);
`
const StyledText = styled.div`
  font-family: NotoSansCJKtc;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.5;
  letter-spacing: 0.2px;
  color: var(--gray-darker);
`
const StyledSubText = styled.span`
  font-family: NotoSansCJKtc;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.6px;
  line-height: 1;
  color: var(--gray-dark);
`
const StyledTitle = styled.h4`
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0.18px;
  color: var(--gray-darker);
`

const messages = defineMessages({
  memberReject: { id: 'member.ui.memberReject', defaultMessage: '學員拒絕' },
  removeMember: { id: 'member.text.removeMember', defaultMessage: '學員將從「開發中」的名單內抽離。' },
  reasonOfRejection: { id: 'member.label.reasonOfRejection', defaultMessage: '拒絕原因' },
  markAsRejection: { id: 'member.text.markAsRejection', defaultMessage: '標註為拒絕' },
  changeStateToRejection: { id: 'member.text.changeStateToRejection', defaultMessage: '要更改狀態為已拒絕嗎？' },
})

export const MemberRejectionBlock: React.FC<{
  lastRejectedMemberNote: {
    author: {
      name: string
    }
    description: string | null
    rejectedAt: Date | null
  }
  insertMemberNoteRejectedAt: (description: string) => void
}> = ({ lastRejectedMemberNote, insertMemberNoteRejectedAt }) => {
  const [form] = useForm()
  const { formatMessage } = useIntl()

  return (
    <>
      <AdminModal
        title={formatMessage(messages.changeStateToRejection)}
        renderTrigger={({ setVisible }) => (
          <Button onClick={() => setVisible(true)}>{formatMessage(messages.memberReject)}</Button>
        )}
        footer={null}
        renderFooter={({ setVisible }) => (
          <div>
            <Button className="mr-2" onClick={() => setVisible(false)}>
              {formatMessage(commonMessages.ui.back)}
            </Button>
            <Button
              className="mr-2"
              type="primary"
              onClick={() => {
                const description = form.getFieldValue('description')
                insertMemberNoteRejectedAt(description)
                setVisible(false)
              }}
            >
              {formatMessage(commonMessages.ui.modify)}
            </Button>
          </div>
        )}
      >
        <div className="mb-3">{formatMessage(messages.removeMember)}</div>
        <StyledTitle>{formatMessage(messages.reasonOfRejection)}</StyledTitle>
        <Form form={form}>
          <Form.Item name="description">
            <Input.TextArea className="mb-4" />
          </Form.Item>
        </Form>
      </AdminModal>

      {lastRejectedMemberNote.rejectedAt && (
        <div className="mt-3">
          <StyledTime className="mb-1 lh-1">
            {moment(lastRejectedMemberNote.rejectedAt).format('YYYY-MM-DD HH:mm')}{' '}
            {formatMessage(messages.markAsRejection)}
          </StyledTime>
          <StyledText>{lastRejectedMemberNote.description}</StyledText>
          <StyledSubText>By. {lastRejectedMemberNote.author.name}</StyledSubText>
        </div>
      )}
    </>
  )
}
