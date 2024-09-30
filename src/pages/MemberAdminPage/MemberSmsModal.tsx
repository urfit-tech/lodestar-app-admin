import Icon, { MessageOutlined } from '@ant-design/icons'
import { DatePicker, Form, message } from 'antd'
import TextArea from 'antd/lib/input/TextArea'
import axios from 'axios'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { Moment } from 'moment'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import AdminModal from '../../components/admin/AdminModal'
import { memberMessages } from '../../helpers/translation'
import pageMessages from '../translation'

const ONLY_GSM_ALPHABET_MAX_LENGTH = 159
const MAX_LENGTH = 69

const isGSMAlphabet = (text: string) => {
  const rule = `^[\\w \\r\\n@!$"#%'()*+,-.\\/:;<=>?_¡£¥&¤&§¿]+$`
  const regex = new RegExp(rule, 'ig')
  return Boolean(text.match(regex))
}

const MemberSmsModel: React.VFC<{ memberId: string; phone: string; name: string }> = ({ memberId, phone, name }) => {
  const [isSending, setIsSending] = useState(false)
  const [isTooLong, setIsTooLong] = useState(false)
  const [content, setContent] = useState('')
  const [sentAt, setSentAt] = useState<Moment | null>(null)
  const { authToken } = useAuth()
  const { formatMessage } = useIntl()

  const isValidateText = (text: string) => {
    if (text.length <= MAX_LENGTH) {
      return true
    }
    if (isGSMAlphabet(text) && text.length <= ONLY_GSM_ALPHABET_MAX_LENGTH) {
      return true
    }
    return false
  }

  return (
    <AdminModal
      okText={formatMessage(pageMessages.MemberSmsModal.send)}
      okButtonProps={{
        disabled: isTooLong || content === '',
      }}
      onOk={(_e, setVisible) => {
        setIsSending(true)
        axios
          .post(
            `${process.env.REACT_APP_API_BASE_ROOT}/sys/send-sms`,
            {
              memberId,
              phone,
              content,
              sentAt: sentAt ? sentAt.toDate() : undefined,
            },
            {
              headers: {
                Authorization: `bearer ${authToken}`,
              },
            },
          )
          .then(({ data: { code, error, result } }) => {
            if (code === 'SUCCESS') {
              message.success(formatMessage(memberMessages.text.smsSucceed))
            } else {
              message.error(
                formatMessage(memberMessages.text.smsFailed, {
                  errorMessage: error,
                }),
              )
            }
          })
          .finally(() => {
            setVisible(false)
            setIsSending(false)
          })
      }}
      renderTrigger={({ setVisible }) => (
        <Icon component={() => <MessageOutlined />} onClick={() => setVisible(true)} className="cursor-pointer" />
      )}
      confirmLoading={isSending}
    >
      <div className="mb-3">{`${name} / ${phone}`}</div>
      <Form.Item
        className="mb-3"
        validateStatus={isTooLong ? 'error' : ''}
        help={isTooLong ? formatMessage(memberMessages.text.smsTooLong, { charactersLimit: MAX_LENGTH }) : undefined}
      >
        <TextArea
          placeholder={formatMessage(memberMessages.placeholder.smsContent)}
          required
          value={content}
          onChange={e => {
            const text = e.target.value
            setContent(text)
            setIsTooLong(!isValidateText(text))
          }}
        />
      </Form.Item>
      <DatePicker
        style={{ width: '100%' }}
        showTime
        placeholder={formatMessage(memberMessages.placeholder.smsSchedule)}
        value={sentAt}
        onChange={date => setSentAt(date)}
      />
    </AdminModal>
  )
}

export default MemberSmsModel
