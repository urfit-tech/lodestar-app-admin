import { gql, useMutation, useQuery } from '@apollo/client'
import { Button, Form, message, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import BraftEditor, { EditorState } from 'braft-editor'
import { BraftContent } from 'lodestar-app-element/src/components/common/StyledBraftEditor'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { dateRangeFormatter, handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import { StyledModalTitle } from '../common'
import AdminBraftEditor from '../form/AdminBraftEditor'
import appointmentMessages from './translation'

type FieldProps = {
  appointmentResult: EditorState
}

const StyledModalMetaBlock = styled.div`
  padding: 0.75rem;
  background-color: var(--gray-lighter);
  font-size: 14px;
  border-radius: 4px;
`
const StyledModalNotation = styled.div`
  color: var(--gray-dark);
  font-size: 14px;
  line-height: normal;
  letter-spacing: 0.4px;
`

const AppointmentIssueAndResultModal: React.VFC<
  AdminModalProps & {
    appointmentEnrollmentId: string
    startedAt: Date
    endedAt: Date
    onRefetch?: () => void
  }
> = ({ appointmentEnrollmentId, startedAt, endedAt, onRefetch, ...props }) => {
  const [form] = useForm<FieldProps>()
  const [loading, setLoading] = useState(false)
  const {
    loading: loadingAppointmentIssueAndResult,
    error: errorAppointmentIssueAndResult,
    appointmentIssueAndResult,
  } = useAppointmentEnrollmentIssueAndResult(appointmentEnrollmentId)
  const { formatMessage } = useIntl()

  const [updateAppointmentResult] = useMutation<
    hasura.UPDATE_APPOINTMENT_RESULT,
    hasura.UPDATE_APPOINTMENT_RESULTVariables
  >(UPDATE_APPOINTMENT_RESULT)

  const handleSubmit = (onSuccess: () => void) => {
    form
      .validateFields()
      .then(() => {
        setLoading(true)
        const values = form.getFieldsValue()
        updateAppointmentResult({
          variables: {
            orderProductId: appointmentIssueAndResult.orderProductId,
            data: {
              ...appointmentIssueAndResult.options,
              appointmentResult: values.appointmentResult?.getCurrentContent().hasText()
                ? values.appointmentResult.toRAW()
                : null,
            },
          },
        })
          .then(() => {
            message.success(formatMessage(commonMessages.event.successfullySaved))
            onSuccess()
            onRefetch?.()
          })
          .catch(handleError)
          .finally(() => setLoading(false))
      })
      .catch(() => {})
  }

  return (
    <AdminModal
      width={660}
      centered
      footer={null}
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={() => setVisible(false)}>
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleSubmit(() => setVisible(false))}>
            {formatMessage(commonMessages.ui.confirm)}
          </Button>
        </>
      )}
      {...props}
    >
      {errorAppointmentIssueAndResult ? (
        <div className="d-flex justify-content-center">{formatMessage(appointmentMessages['*'].fetchDataError)}</div>
      ) : loadingAppointmentIssueAndResult ? (
        <Skeleton active />
      ) : (
        <>
          <StyledModalTitle className="mb-4">
            {formatMessage(appointmentMessages['*'].appointmentIssueAndResult)}
          </StyledModalTitle>
          <StyledModalMetaBlock className="mb-4">
            <span className="mr-2">
              {formatMessage(appointmentMessages.AppointmentIssueAndResultModal.appointmentDate)}
            </span>
            <span>{dateRangeFormatter({ startedAt, endedAt, dateFormat: 'MM/DD(dd)' })}</span>
          </StyledModalMetaBlock>

          <div className="mb-4">
            <strong className="mb-3">
              {formatMessage(appointmentMessages.AppointmentIssueAndResultModal.appointmentIssue)}
            </strong>
            <BraftContent>{appointmentIssueAndResult.appointmentIssue}</BraftContent>
          </div>

          <div>
            <strong>{formatMessage(appointmentMessages.AppointmentIssueAndResultModal.appointmentResult)}</strong>
            <StyledModalNotation className="mb-2">
              {formatMessage(appointmentMessages.AppointmentIssueAndResultModal.appointmentResultNotation)}
            </StyledModalNotation>
          </div>
          <Form
            form={form}
            initialValues={{
              appointmentResult: BraftEditor.createEditorState(appointmentIssueAndResult.appointmentResult),
            }}
          >
            <Form.Item name="appointmentResult">
              <AdminBraftEditor />
            </Form.Item>
          </Form>
        </>
      )}
    </AdminModal>
  )
}

const UPDATE_APPOINTMENT_RESULT = gql`
  mutation UPDATE_APPOINTMENT_RESULT($orderProductId: uuid!, $data: jsonb) {
    update_order_product(where: { id: { _eq: $orderProductId } }, _set: { options: $data }) {
      affected_rows
    }
  }
`

const useAppointmentEnrollmentIssueAndResult = (id: string) => {
  const { loading, data, error } = useQuery<
    hasura.GET_APPOINTMENT_ENROLLMENT_ISSUE_AND_RESULT,
    hasura.GET_APPOINTMENT_ENROLLMENT_ISSUE_AND_RESULTVariables
  >(
    gql`
      query GET_APPOINTMENT_ENROLLMENT_ISSUE_AND_RESULT($id: uuid!) {
        appointment_enrollment(where: { id: { _eq: $id } }) {
          id
          issue
          result
          order_product {
            id
            options
          }
        }
      }
    `,
    { variables: { id } },
  )
  const appointmentIssueAndResult: {
    id: string
    options: any
    orderProductId: string
    appointmentIssue: string | null
    appointmentResult: string | null
  } = {
    id: data?.appointment_enrollment[0].id,
    orderProductId: data?.appointment_enrollment[0].order_product?.id,
    options: data?.appointment_enrollment[0].order_product?.options,
    appointmentIssue: data?.appointment_enrollment[0].issue || '',
    appointmentResult: data?.appointment_enrollment[0].result || '',
  }

  return {
    loading,
    error,
    appointmentIssueAndResult,
  }
}

export default AppointmentIssueAndResultModal
