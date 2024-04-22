import { Textarea } from '@chakra-ui/react'
import { Button, message } from 'antd'
import { CommonTitleMixin } from 'lodestar-app-element/src/components/common'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { useCancelAppointment } from '../../hooks/appointment'
import { useMutateMeet } from '../../hooks/meet'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import appointmentMessages from './translation'

const StyledModalTitle = styled.div`
  ${CommonTitleMixin}
`

const StyledModalSubTitle = styled.div`
  color: var(--gray-darker);
  font-size: 14px;
  letter-spacing: 0.4px;
`

const AppointmentCancelModal: React.VFC<AdminModalProps & { orderProductId: string; meetId: string; onRefetch?: () => void }> = ({
  orderProductId,
  meetId,
  onRefetch,
  ...props
}) => {
  const { formatMessage } = useIntl()
  const [canceledReason, setCanceledReason] = useState('')
  const [loading, setLoading] = useState(false)
  const { cancelAppointment } = useCancelAppointment()
  const { deleteGeneralMeet } = useMutateMeet()

  const handleCancel = async (onCancel: () => void) => {
    setLoading(true)
    try {
      await cancelAppointment({
        variables: {
          orderProductId, data: {
            appointmentCanceledAt: new Date(),
            appointmentCanceledReason: canceledReason,
          }
        }
      })
      await deleteGeneralMeet({ variables: { meetId } })
      message.success('取消成功')
    } catch (error) {
      handleError(error)
    } finally {
      onRefetch?.()
      onCancel()
      setLoading(false)
    }
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
