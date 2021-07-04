import { QuestionCircleFilled } from '@ant-design/icons'
import { Button, Form, Input, Tooltip } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { commonMessages, craftPageMessages, errorMessages, programMessages } from '../../helpers/translation'
import { CraftPageAdminProps } from '../../types/craft'
import { AdminBlock, AdminBlockTitle, AdminPaneTitle, StyledCraftSettingLabel, StyledTips } from '../admin'
import CraftPageDeletionAdminCard from './CraftPageDeletionAdminCard'

type FieldProps = {
  pageName: string
  path: string
}

const CraftGeneralSettingBlock: React.VFC<{
  pageAdmin: CraftPageAdminProps | null
  onRefetch?: () => void
}> = ({ pageAdmin }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const [loading, setLoading] = useState(false)

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    //TODO: update page
    setLoading(false)
    //refresh
  }

  return (
    <div className="container py-5">
      <AdminPaneTitle>{formatMessage(commonMessages.label.basicSettings)}</AdminPaneTitle>
      <AdminBlock>
        <Form
          form={form}
          colon={false}
          hideRequiredMark
          labelAlign="left"
          labelCol={{ md: { span: 4 } }}
          wrapperCol={{ md: { span: 8 } }}
          initialValues={{
            //TODO: init
            pageName: pageAdmin?.pageName,
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
              <Input className="mb-2" />
            </Form.Item>

            <StyledCraftSettingLabel>www.demo.com/</StyledCraftSettingLabel>
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
        <AdminBlockTitle>{formatMessage(programMessages.label.deleteProgram)}</AdminBlockTitle>
        <CraftPageDeletionAdminCard
          page={pageAdmin}
          // onRefetch={refetchCraftPage}
        />
      </AdminBlock>
    </div>
  )
}

export default CraftGeneralSettingBlock
