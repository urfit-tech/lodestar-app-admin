import { QuestionCircleFilled } from '@ant-design/icons'
import { Button, Form, Input, message, Skeleton, Tooltip } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import {
  AdminBlock,
  AdminBlockTitle,
  AdminPaneTitle,
  StyledCraftSettingLabel,
  StyledTips,
} from '../../components/admin'
import { useAuth } from '../../contexts/AuthContext'
import { handleError } from '../../helpers'
import { commonMessages, craftPageMessages, errorMessages } from '../../helpers/translation'
import { useMutateAppPage } from '../../hooks/appPage'
import { CraftPageAdminProps } from '../../types/craft'
import CraftPageDeletionAdminCard from './CraftPageDeletionAdminCard'

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
      <AdminBlock>
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
              <span>
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
            <StyledCraftSettingLabel>{window.location.host + path}</StyledCraftSettingLabel>
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
      </AdminBlock>
      <AdminBlock>
        <AdminBlockTitle>{formatMessage(craftPageMessages.label.deletePage)}</AdminBlockTitle>
        <CraftPageDeletionAdminCard
          page={pageAdmin}
          // onRefetch={refetchCraftPage}
        />
      </AdminBlock>
    </div>
  )
}

export default CraftPageBasicSettingBlock
