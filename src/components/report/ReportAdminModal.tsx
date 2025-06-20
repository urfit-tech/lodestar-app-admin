import { Button, Checkbox, Form, Input, Radio, Select } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { handleError } from '../../helpers'
import { useMutateReport, useMutateReportPermissionGroup } from '../../hooks/report'
import { ReportProps } from '../../types/report'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import PermissionGroupSelector from '../form/PermissionGroupSelector'
import { reportMessages } from './translations'

type FieldProps = {
  title: string
  type: 'metabase'
  formType: 'question' | 'dashboard'
  question: string
  dashboard: string
  viewPermissions?: string[]
  canViewSelfDataOnly: boolean
  canViewGroupDataOnly: boolean
}

const ReportAdminModal: React.FC<
  {
    report?: ReportProps
    onRefetch?: () => void
    reports: ReportProps[]
  } & AdminModalProps
> = ({ report, onRefetch, onCancel, reports, ...props }) => {
  const originFormType =
    ((report && Object.keys(report.options?.metabase?.resource)[0]) as FieldProps['formType']) || 'question'
  const [formType, setFormType] = useState<FieldProps['formType']>(originFormType)
  const [loading, setLoading] = useState(false)
  const { insertReport } = useMutateReport()
  const { insertReportPermissionGroup, deleteReportPermissionGroupByReportId } = useMutateReportPermissionGroup()
  const [form] = useForm<FieldProps>()
  const { id: appId, enabledModules } = useApp()
  const { currentMemberId } = useAuth()
  const { formatMessage } = useIntl()

  const generateReportOptions = (formValue: FieldProps) => {
    const { type, formType, dashboard, question, canViewSelfDataOnly, canViewGroupDataOnly } = formValue
    switch (type) {
      case 'metabase':
        return {
          metabase: {
            resource: { [formType]: parseInt(question || dashboard) },
            //FIXME: Metabase only takes lower case parameter.
            params: formType === 'dashboard' ? { appid: appId } : { appId },
          },
          canViewSelfDataOnly,
          canViewGroupDataOnly,
        }
      default:
        return null
    }
  }

  const checkExistReport = (type: string, options: any) => {
    const formTypeValue: string = options[type].resource[formType]
    return reports.filter(
      r => report?.id !== r.id && r.options?.[type as FieldProps['type']].resource?.[formType] === formTypeValue,
    )
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
        const existReport = checkExistReport?.(values.type, options)
        if (existReport.length !== 0) {
          return handleError({ message: formatMessage(reportMessages.ReportAdminModal.existReport) })
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

  const handleCancel = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    onCancel?.(event)
    form.resetFields()
  }

  return (
    <AdminModal
      footer={null}
      renderFooter={({ setVisible }) => (
        <>
          <Button
            className="mr-2"
            onClick={e => {
              handleCancel(e)
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
      onCancel={handleCancel}
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
          formType: originFormType,
          [originFormType]: report?.options?.metabase?.resource?.[originFormType],
          viewPermissions: report?.viewingPermissions?.map(viewingPermission => viewingPermission.id),
          canViewSelfDataOnly: !!report?.options?.canViewSelfDataOnly,
          canViewGroupDataOnly: !!report?.options?.canViewGroupDataOnly,
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
          style={{ marginBottom: '0px' }}
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
        <Form.Item style={{ marginTop: '16px' }} name="formType">
          <Radio.Group onChange={e => setFormType(e.target.value)}>
            <Radio value="question">{formatMessage(reportMessages.ReportAdminModal.embedSingleReport)}</Radio>
            <Radio value="dashboard">{formatMessage(reportMessages.ReportAdminModal.embedDashboard)}</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          label={formatMessage(reportMessages.ReportAdminModal.setting)}
          name={originFormType || formType}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="canViewSelfDataOnly" valuePropName="checked">
          <Checkbox> {formatMessage(reportMessages.ReportAdminModal.canViewSelfDataOnly)}</Checkbox>
        </Form.Item>
        <Form.Item name="canViewGroupDataOnly" valuePropName="checked" style={{ marginTop: '-24px' }}>
          <Checkbox>{formatMessage(reportMessages.ReportAdminModal.canViewGroupDataOnly)}</Checkbox>
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
