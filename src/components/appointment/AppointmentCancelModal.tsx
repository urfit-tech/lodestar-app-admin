import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { CommonTitleMixin } from 'lodestar-app-element/src/components/common'
import appointmentMessages from './translation'
import { commonMessages } from '../../helpers/translation'
import { Textarea } from '@chakra-ui/react'
import { useState } from 'react'
import { Button, message } from 'antd'
import { handleError } from '../../helpers'
import { useCancelAppointment } from '../../hooks/appointment'

const StyledModalTitle = styled.div`
  ${CommonTitleMixin}
`

const StyledModalSubTitle = styled.div`
  color: var(--gray-darker);
  font-size: 14px;
  letter-spacing: 0.4px;
`

const AppointmentCancelModal: React.VFC<AdminModalProps & { orderProductId: string; onRefetch?: () => void }> = ({
  orderProductId,
  onRefetch,
  ...props
}) => {
  const { formatMessage } = useIntl()
  const [canceledReason, setCanceledReason] = useState('')
  const [loading, setLoading] = useState(false)
  const cancelAppointment = useCancelAppointment(orderProductId)

  const handleCancel = (onCancel: () => void) => {
    setLoading(true)
    cancelAppointment(canceledReason)
      .then(() => {
        message.success('success!!!')
        onCancel()
        onRefetch?.()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <>
      <AdminModal
        width={384}
        centered
        footer={null}
        renderFooter={({ setVisible }) => (
          <>
            <Button className="mr-2" onClick={() => setVisible(false)}>
              {formatMessage(commonMessages.ui.cancel)}
            </Button>
            <Button type="primary" loading={loading} onClick={() => handleCancel(() => setVisible(false))}>
              {formatMessage(commonMessages.ui.confirm)}
            </Button>
          </>
        )}
        {...props}
      >
        <StyledModalTitle className="mb-4">
          {formatMessage(appointmentMessages.AppointmentCancelModal.confirmCancelAlert)}
        </StyledModalTitle>
        <div className="mb-4">{formatMessage(appointmentMessages.AppointmentCancelModal.confirmCancelNotation)}</div>
        <StyledModalSubTitle>
          {formatMessage(appointmentMessages.AppointmentCancelModal.canceledReason)}
        </StyledModalSubTitle>
        <Textarea
          onChange={e => {
            setCanceledReason(e.target.value)
          }}
        />
      </AdminModal>
    </>
  )
}

export default AppointmentCancelModal
