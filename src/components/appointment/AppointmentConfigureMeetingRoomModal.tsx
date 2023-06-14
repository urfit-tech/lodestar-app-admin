import { gql, useMutation } from '@apollo/client'
import { Button, Form, Input, message } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import { StyledModalTitle } from '../common'
import appointmentMessages from './translation'

type FieldProps = {
  joinUrl: string
}

const StyledLabel = styled.div`
  color: var(--gray-darker);
  font-size: 14px;
  line-height: normal;
  letter-spacing: 0.4px;
`

const AppointmentConfigureMeetingRoomModal: React.VFC<
  AdminModalProps & {
    appointmentEnrollmentId: string
    onRefetch?: () => void
    orderProduct: { id: string; options: any }
  }
> = ({ appointmentEnrollmentId, onRefetch, orderProduct, ...props }) => {
  const [form] = useForm<FieldProps>()
  const [loading, setLoading] = useState(false)
  const { formatMessage } = useIntl()

  const [updateAppointmentJoinUrl] = useMutation<
    hasura.UPDATE_APPOINTMENT_JOIN_URL,
    hasura.UPDATE_APPOINTMENT_JOIN_URLVariables
  >(UPDATE_APPOINTMENT_JOIN_URL)

  const handleSubmit = (onSuccess: () => void) => {
    form
      .validateFields()
      .then(() => {
        setLoading(true)
        const values = form.getFieldsValue()
        updateAppointmentJoinUrl({
          variables: {
            orderProductId: orderProduct.id,
            data: {
              ...orderProduct.options,
              joinUrl: values.joinUrl,
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
      width={520}
      centered
      footer={null}
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={() => setVisible(false)}>
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleSubmit(() => setVisible(false))}>
            {formatMessage(commonMessages.ui.save)}
          </Button>
        </>
      )}
      {...props}
    >
      <StyledModalTitle className="mb-4">
        {formatMessage(appointmentMessages['*'].appointmentConfigureMeetingRoom)}
      </StyledModalTitle>
      <StyledLabel className="mb-1">
        {formatMessage(appointmentMessages.AppointmentConfigureMeetingRoomModal.meetingLink)}
      </StyledLabel>
      <Form
        form={form}
        initialValues={{
          joinUrl: orderProduct.options?.joinUrl,
        }}
      >
        <Form.Item name="joinUrl">
          <Input />
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

const UPDATE_APPOINTMENT_JOIN_URL = gql`
  mutation UPDATE_APPOINTMENT_JOIN_URL($orderProductId: uuid!, $data: jsonb) {
    update_order_product(where: { id: { _eq: $orderProductId } }, _set: { options: $data }) {
      affected_rows
    }
  }
`

export default AppointmentConfigureMeetingRoomModal
