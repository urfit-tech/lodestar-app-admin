import { CopyOutlined, GlobalOutlined } from '@ant-design/icons'
import { IconButton } from '@chakra-ui/button'
import { Textarea } from '@chakra-ui/textarea'
import { Button, Form, Input, message } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import axios from 'axios'
import dayjs from 'dayjs'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { AdminPageTitle } from '../components/admin'
import AdminCard from '../components/admin/AdminCard'
import AdminLayout from '../components/layout/AdminLayout'
import { copyToClipboard, isValidEmail } from '../helpers'
import { commonMessages, errorMessages } from '../helpers/translation'
import ForbiddenPage from './ForbiddenPage'
import pageMessages from './translation'

const StyledPassHashBlock = styled.div`
  padding: 12px;
  border: 1px solid #cccccc;
  background-color: #cbe5f3;
  width: fit-content;
`

const StyledPassHashRow = styled.div`
  display: flex;
  align-items: center;
`
type FieldProps = { applicantEmail: string; userEmail: string; purpose: string }

const AppTmpPasswordPage: React.FC = () => {
  const { permissions, currentMember, currentMemberId } = useAuth()

  const { id: appId } = useApp()
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const [passHash, setPassHash] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [expiredAt, setExpiredAt] = useState<string | null>(null)

  if (!permissions.APP_SETTING_ADMIN) {
    return <ForbiddenPage />
  }

  const handleSubmit = async (values: FieldProps) => {
    form
      .validateFields()
      .then(async () => {
        setLoading(true)
        if (!isValidEmail(values.userEmail)) {
          return message.error(formatMessage(pageMessages.AppTmpPasswordPage.invalidEmail))
        }
        const {
          data: {
            result: { password, expiredAt },
          },
        } = await axios.post(`${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/auth/password/temporary`, {
          appId,
          applicant: currentMemberId,
          email: values.userEmail,
          purpose: values.purpose,
        })
        setPassHash(password)
        setExpiredAt(dayjs(expiredAt).format('YYYY-MM-DD HH:mm:ss'))
      })
      .catch(err => {
        console.log(err)
      })
      .finally(() => {
        setLoading(false)
      })
  }
  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <GlobalOutlined className="mr-3" />
        <span>{formatMessage(pageMessages.AppTmpPasswordPage.temporaryPasswordRequest)}</span>
      </AdminPageTitle>
      <AdminCard title={formatMessage(pageMessages.AppTmpPasswordPage.tmpPassword)}>
        <Form
          form={form}
          labelAlign="left"
          labelCol={{ md: { span: 6 } }}
          wrapperCol={{ md: { span: 18 } }}
          colon={false}
          onFinish={handleSubmit}
          initialValues={{ applicantEmail: currentMember?.email }}
          requiredMark
        >
          <Form.Item label={formatMessage(pageMessages.AppTmpPasswordPage.applicant)} name={'applicantEmail'} required>
            <Input width={200} disabled />
          </Form.Item>
          <Form.Item
            label={formatMessage(pageMessages.AppTmpPasswordPage.userEmail)}
            name={'userEmail'}
            rules={[
              {
                required: true,
                message: formatMessage(errorMessages.form.isRequired, {
                  field: formatMessage(pageMessages.AppTmpPasswordPage.userEmail),
                }),
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={formatMessage(pageMessages.AppTmpPasswordPage.purposeOfApplication)}
            name={'purpose'}
            rules={[
              {
                required: true,
                message: formatMessage(errorMessages.form.isRequired, {
                  field: formatMessage(pageMessages.AppTmpPasswordPage.purposeOfApplication),
                }),
              },
            ]}
          >
            <Textarea />
          </Form.Item>
          {passHash && expiredAt ? (
            <StyledPassHashBlock>
              <StyledPassHashRow>
                <div className="mr-2">
                  {formatMessage(pageMessages.AppTmpPasswordPage.tmpPassword)}：{passHash}
                </div>
                <IconButton
                  aria-label="copy password"
                  icon={<CopyOutlined />}
                  onClick={() => {
                    copyToClipboard(passHash)
                    message.success(formatMessage(commonMessages.text.copiedToClipboard))
                  }}
                />
              </StyledPassHashRow>
              <div>
                {formatMessage(pageMessages.AppTmpPasswordPage.expirationDate)}：{expiredAt}
              </div>
            </StyledPassHashBlock>
          ) : (
            <Form.Item wrapperCol={{ md: { offset: 6 } }}>
              <Button type="primary" htmlType="submit" loading={loading}>
                {formatMessage(pageMessages.AppTmpPasswordPage.requestTemporaryPassword)}
              </Button>
            </Form.Item>
          )}
        </Form>
      </AdminCard>
    </AdminLayout>
  )
}

export default AppTmpPasswordPage
