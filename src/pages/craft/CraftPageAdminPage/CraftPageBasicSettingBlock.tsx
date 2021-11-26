import { QuestionCircleFilled } from '@ant-design/icons'
import { Button, Form, Input, message, Skeleton, Tooltip } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import { AdminPaneTitle, StyledAdminBlock, StyledAdminBlockTitle, StyledTips } from '../../../components/admin'
import AdminModal from '../../../components/admin/AdminModal'
import { handleError } from '../../../helpers'
import { commonMessages, craftPageMessages, errorMessages } from '../../../helpers/translation'
import { useMutateAppPage } from '../../../hooks/appPage'
import { CraftPageAdminProps } from '../../../types/craft'
import { CraftSettingLabel } from './CraftSettingsPanel'

type FieldProps = {
  pageName: string
  path: string
}

const CraftPageBasicSettingBlock: React.VFC<{
  pageAdmin: CraftPageAdminProps | null
  onRefetch?: () => void
}> = ({ pageAdmin, onRefetch }) => {
  const { currentMemberId } = useAuth()
  const { formatMessage } = useIntl()
  const { updateAppPage } = useMutateAppPage()
  const [form] = useForm<FieldProps>()
  const [path, setPath] = useState(pageAdmin?.path || '')
  const [loading, setLoading] = useState(false)

  if (!pageAdmin) {
    return <Skeleton active />
  }

  const handleSubmit = (values: FieldProps) => {
    if (!currentMemberId) {
      return
    }
    setLoading(true)
    updateAppPage({
      pageId: pageAdmin.id,
      path: values.path,
      title: values.pageName,
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
        onRefetch?.()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <div className="container py-5">
      <AdminPaneTitle>{formatMessage(commonMessages.label.basicSettings)}</AdminPaneTitle>
      <StyledAdminBlock>
        <Form
          form={form}
          colon={false}
          requiredMark={false}
          labelAlign="left"
          labelCol={{ md: { span: 4 } }}
          wrapperCol={{ md: { span: 8 } }}
          initialValues={{
            pageName: pageAdmin?.title,
            path: pageAdmin?.path,
          }}
          onFinish={handleSubmit}
        >
          <Form.Item label={formatMessage(craftPageMessages.label.pageName)}>
            <Form.Item
              name="pageName"
              noStyle
              rules={[
                {
                  required: true,
                  message: formatMessage(errorMessages.form.isRequired, {
                    field: formatMessage(craftPageMessages.label.pageName),
                  }),
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Form.Item>
          <Form.Item
            label={
              <span className="d-flex align-items-center">
                {formatMessage(craftPageMessages.label.path)}
                <Tooltip
                  placement="top"
                  title={
                    <StyledTips>
                      {
                        // TODO: fill the url tip, zeplin didn't labeled
                      }
                    </StyledTips>
                  }
                >
                  <QuestionCircleFilled className="ml-2" />
                </Tooltip>
              </span>
            }
          >
            <Form.Item
              name="path"
              noStyle
              rules={[
                {
                  required: true,
                  message: formatMessage(errorMessages.form.isRequired, {
                    field: formatMessage(craftPageMessages.label.path),
                  }),
                },
              ]}
            >
              <Input className="mb-2" onChange={e => setPath(e.target.value)} />
            </Form.Item>
            <CraftSettingLabel>{window.location.host + path}</CraftSettingLabel>
          </Form.Item>
          <Form.Item wrapperCol={{ md: { offset: 4 } }}>
            <Button
              className="mr-2"
              onClick={() => {
                form.resetFields()
              }}
            >
              {formatMessage(commonMessages.ui.cancel)}
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {formatMessage(commonMessages.ui.save)}
            </Button>
          </Form.Item>
        </Form>
      </StyledAdminBlock>
      <StyledAdminBlock>
        <StyledAdminBlockTitle>{formatMessage(craftPageMessages.label.deletePage)}</StyledAdminBlockTitle>
        <CraftPageDeletionAdminCard
          page={pageAdmin}
          // onRefetch={refetchCraftPage}
        />
      </StyledAdminBlock>
    </div>
  )
}

const StyledConfirmation = styled.div`
  line-height: 24px;
`

const CraftPageDeletionAdminCard: React.FC<{
  page: CraftPageAdminProps | null
  onRefetch?: () => void
}> = ({ page }) => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const { updateAppPage } = useMutateAppPage()

  if (!page) {
    return <Skeleton active />
  }

  const handleArchive = (pageId: string) => {
    updateAppPage({
      pageId,
      isDeleted: true,
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullyDeleted))
        history.push('/craft-page')
      })
      .catch(handleError)
  }

  return (
    <div className="d-flex align-items-center justify-content-between">
      <div>{formatMessage(craftPageMessages.text.deletePageWarning)}</div>
      <AdminModal
        className="mb-2"
        title={formatMessage(craftPageMessages.ui.deletePage)}
        renderTrigger={({ setVisible }) => (
          <Button type="primary" danger onClick={() => setVisible(true)}>
            {formatMessage(craftPageMessages.ui.deletePage)}
          </Button>
        )}
        okText={formatMessage(commonMessages.ui.delete)}
        okButtonProps={{ danger: true }}
        cancelText={formatMessage(commonMessages.ui.back)}
        onOk={() => handleArchive(page.id)}
      >
        <StyledConfirmation>{formatMessage(craftPageMessages.text.deletePageConfirmation)}</StyledConfirmation>
      </AdminModal>
    </div>
  )
}

export default CraftPageBasicSettingBlock
