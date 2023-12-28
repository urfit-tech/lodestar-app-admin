import { Button, Form, Input, Select } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { handleError } from '../../helpers'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import { reportMessages } from './translations'
import { useMutateReport, useMutateReportPermissionGroup } from '../../hooks/report'
import PermissionGroupSelector from '../form/PermissionGroupSelector'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { ReportProps } from '../../types/report'

type FieldProps = {
  title: string
  type: string
  question: string
  viewPermissions?: string[]
}

const ReportAdminModal: React.FC<
  {
    report?: ReportProps
    onRefetch?: () => void
  } & AdminModalProps
> = ({ report, onRefetch, onCancel, ...props }) => {
  const [loading, setLoading] = useState(false)
  const { insertReport } = useMutateReport()
  const { insertReportPermissionGroup, deleteReportPermissionGroupByReportId } = useMutateReportPermissionGroup()
  const [form] = useForm<FieldProps>()
  const { id: appId, enabledModules } = useApp()
  const { currentMemberId } = useAuth()
  const { formatMessage } = useIntl()

  const generateReportOptions = (formValue: FieldProps) => {
    const { question, type } = formValue
    switch (type) {
      case 'metabase':
        return {
          metabase: {
            resource: { question: parseInt(question) },
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
        }).then(async ({ data }) => {
          const reportId = data?.insert_report?.returning[0].id
          await deleteReportPermissionGroupByReportId({
            variables: { reportId },
          }).catch(handleError)
          await insertReportPermissionGroup({
            variables: {
              data:
                values.viewPermissions?.map(permissionGroupId => ({
                  report_id: reportId,
                  permission_group_id: permissionGroupId,
                  editor_id: currentMemberId,
                })) ?? [],
            },
          }).catch(handleError)
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
            {formatMessage(reportMessages.ReportAdminModal.cancel)}
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleSubmit(() => setVisible(false))}>
            {formatMessage(reportMessages.ReportAdminModal.confirm)}
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
          title: report?.title,
          type: 'metabase',
          question: report?.options?.metabase?.resource?.question,
          viewPermissions: report?.viewingPermissions?.map(viewingPermission => viewingPermission.id),
        }}
      >
        <Form.Item
          label={formatMessage(reportMessages.ReportAdminModal.title)}
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
          label={formatMessage(reportMessages.ReportAdminModal.type)}
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
          label={formatMessage(reportMessages.ReportAdminModal.setting)}
          name="question"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        {enabledModules.permission_group ? (
          <Form.Item label={formatMessage(reportMessages.ReportAdminModal.viewingPermission)} name="viewPermissions">
            <PermissionGroupSelector />
          </Form.Item>
        ) : null}
      </Form>
    </AdminModal>
  )
}

export default ReportAdminModal
