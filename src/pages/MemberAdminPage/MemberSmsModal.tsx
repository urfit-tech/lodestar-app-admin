import Icon, { MessageOutlined } from '@ant-design/icons'
import { DatePicker, message } from 'antd'
import TextArea from 'antd/lib/input/TextArea'
import axios from 'axios'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { Moment } from 'moment'
import { useState } from 'react'
import AdminModal from '../../components/admin/AdminModal'

const MemberSmsModel: React.VFC<{ memberId: string; phone: string }> = ({ memberId, phone }) => {
  const [isSending, setIsSending] = useState(false)
  const [content, setContent] = useState('')
  const [sentAt, setSentAt] = useState<Moment | null>(null)
  const { authToken } = useAuth()
  return (
    <AdminModal
      okText="寄送"
      onOk={() => {
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
              message.success('sent successfully')
            } else {
              message.error(`sent faild: ${error}`)
            }
          })
          .finally(() => setIsSending(false))
      }}
      renderTrigger={({ setVisible }) => (
        <Icon component={() => <MessageOutlined />} onClick={() => setVisible(true)} className="cursor-pointer" />
      )}
    >
      <div className="mb-3">{phone}</div>
      <TextArea
        className="mb-3"
        placeholder="content"
        required
        value={content}
        onChange={e => setContent(e.target.value)}
      />
      <DatePicker
        style={{ width: '100%' }}
        showTime
        placeholder="scheduled date to sent (optional)"
        value={sentAt}
        onChange={date => setSentAt(date)}
      />
    </AdminModal>
  )
}

export default MemberSmsModel
