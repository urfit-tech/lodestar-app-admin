import { Button, Form, message, Modal } from 'antd'
import axios from 'axios'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { handleError } from 'lodestar-app-element/src/helpers'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages, memberMessages } from '../../helpers/translation'

interface DeleteMemberModalProps {
  email: string
  visible: boolean
  setVisible: React.Dispatch<React.SetStateAction<boolean>>
}

const StyledModalTitle = styled.div`
  color: var(--gray-darker);
  font-size: 20px;
  font-weight: bold;
`

const StyledDeleteButton = styled(Button)`
  background-color: var(--error);
  color: white;
`

const StyledModal = styled(Modal)`
  color: ${props => props.theme['@normal-color']};

  .ant-modal-body {
    padding-bottom: 24px, 24px, 24px, 12px;
  }
`

const DeleteMemberModal: React.FC<DeleteMemberModalProps> = ({ email, visible, setVisible }) => {
  const [loading, setLoading] = useState(false)

  const { currentUserRole, authToken } = useAuth()

  const { formatMessage } = useIntl()

  const handleSubmit = async () => {
    if (currentUserRole !== 'app-owner') {
      message.error('Do not have the necessary permissions to delete a member')
      return
    }

    setLoading(true)
    try {
      const response = await axios.delete(`${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/members/email/${email}`, {
        headers: { authorization: `Bearer ${authToken}` },
      })

      if (response.data.code === 'SUCCESS') {
        window.open(`${process.env.PUBLIC_URL}/members`, '_self')
      } else {
        message.error(response.data.message || 'An unknown error occurred')
      }
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <StyledModal
      title={null}
      footer={null}
      centered
      destroyOnClose
      visible={visible}
      onCancel={() => setVisible(false)}
      width={384}
    >
      <StyledModalTitle className="mb-4">{formatMessage(memberMessages.ui.deleteMember)}</StyledModalTitle>
      <Form layout="vertical" colon={false} hideRequiredMark onFinish={handleSubmit}>
        <Form.Item className="text-left">
          <span>{formatMessage(memberMessages.text.deleteMemberConfirmation)}</span>
        </Form.Item>
        <Form.Item className="text-right">
          <Button onClick={() => setVisible(false)} className="mr-2">
            {formatMessage(commonMessages.ui.back)}
          </Button>
          <StyledDeleteButton htmlType="submit" loading={loading}>
            {formatMessage(commonMessages.ui.delete)}
          </StyledDeleteButton>
        </Form.Item>
      </Form>
    </StyledModal>
  )
}

export default DeleteMemberModal
