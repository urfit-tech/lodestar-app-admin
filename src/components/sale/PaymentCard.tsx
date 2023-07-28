import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { PaymentLog } from '../../types/general'
import saleMessages from './translation'

dayjs.extend(timezone)
dayjs.extend(utc)

const currentTimeZone = dayjs.tz.guess()

const StyledCard = styled.div`
  padding: 16px;
  border-radius: 4px;
  border: solid 1px #ececec;
  margin-bottom: 16px;
`

const StyledInfoTitle = styled.div`
  color: var(--gray-darker);
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  letter-spacing: 0.2px;
  width: 35%;
`

const StyledInfoMessage = styled.div`
  width: 65%;
`

const PaymentCard: React.FC<{ payments: Pick<PaymentLog, 'no' | 'status' | 'price' | 'gateway' | 'paidAt'>[] }> = ({
  payments,
}) => {
  const { formatMessage } = useIntl()

  return (
    <>
      {payments.map(payment => {
        const contentList = [
          { title: formatMessage(saleMessages.PaymentCard.paymentStatus), message: payment.status, isRender: true },
          {
            title: formatMessage(saleMessages.PaymentCard.paidAt),
            message: payment.paidAt ? dayjs(payment.paidAt).tz(currentTimeZone).format('YYYY-MM-DD HH:mm') : '',
            isRender: true,
          },
          {
            title: formatMessage(saleMessages.PaymentCard.paymentNo),
            message: payment.no,
            isRender: true,
          },
          { title: formatMessage(saleMessages.PaymentCard.price), message: payment.price, isRender: true },
          { title: formatMessage(saleMessages.PaymentCard.gateway), message: payment.gateway, isRender: true },
        ]
        return (
          <StyledCard key={payment.no}>
            <div className="container">
              {contentList.map((row, idx) =>
                row.isRender ? (
                  <div className="row mb-2 justify-content-between" key={idx}>
                    <StyledInfoTitle className="column">{row.title}</StyledInfoTitle>
                    <StyledInfoMessage className="column">{row.message}</StyledInfoMessage>
                  </div>
                ) : null,
              )}
            </div>
          </StyledCard>
        )
      })}
    </>
  )
}
export default PaymentCard
