import { gql, useMutation } from '@apollo/client'
import { Button, Form, Input, Select } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { handleError } from '../../helpers'
import hasura from '../../hasura'
import { commonMessages, reportMessages } from '../../helpers/translation'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'

type FieldProps = {
  title: string
  type: string
  options: string
}

const ReportAdminModal: React.FC<
  {
    report?: any
    onRefetch?: () => void
  } & AdminModalProps
> = ({ report, onRefetch, onCancel, ...props }) => {
  const [loading, setLoading] = useState(false)
  const [insertReport] = useMutation<hasura.INSERT_REPORT, hasura.INSERT_REPORTVariables>(INSERT_REPORT)
  const [form] = useForm<FieldProps>()
  const { id: appId } = useApp()
  const { formatMessage } = useIntl()

  const generateReportOptions = (formValue: FieldProps) => {
    const { options, type } = formValue
    switch (type) {
      case 'metabase':
        return {
          metabase: {
            resource: { question: parseInt(options) },
            params: { appId },
          },
        }
      default:
        return null
    }
  }

  const handleSubmit = (onSuccess?: () => void) => {
    setLoading(true)
    form
      .validateFields()
      .then(async () => {
        const values = form.getFieldsValue()
        const options = generateReportOptions(values)
        const insertReportData = {
          title: values.title,
          type: values.type,
          app_id: appId,
          options,
        }
        if (report) {
          Object.assign(insertReportData, { id: report.id }) // for update report
        }
        await insertReport({
          variables: {
            data: [insertReportData],
          },
        })
        onRefetch?.()
        onSuccess?.()
        if (!report) form.resetFields() //reset field when using create report button
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <AdminModal
      footer={null}
      renderFooter={({ setVisible }) => (
        <>
          <Button
            className="mr-2"
            onClick={e => {
              onCancel?.(e)
              setVisible(false)
            }}
          >
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleSubmit(() => setVisible(false))}>
            {formatMessage(commonMessages.ui.confirm)}
          </Button>
        </>
      )}
      onCancel={onCancel}
      {...props}
    >
      <Form
        form={form}
        layout="vertical"
        colon={false}
        hideRequiredMark
        initialValues={{
          type: 'metabase',
        }}
      >
        <Form.Item
          label={formatMessage(reportMessages.label.title)}
          name="title"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={formatMessage(reportMessages.label.type)}
          name="type"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select>
            <Select.Option key="metabase" value="metabase">
              Metabase
            </Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          label={formatMessage(reportMessages.label.options)}
          name="options"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

const INSERT_REPORT = gql`
  mutation INSERT_REPORT($data: [report_insert_input!]!) {
    insert_report(
      objects: $data
      on_conflict: { constraint: report_pkey, update_columns: [title, options, app_id, type] }
    ) {
      affected_rows
    }
  }
`

export default ReportAdminModal
