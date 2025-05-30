import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import xss from 'xss'
import saleMessages from './translation'

const StyledContainer = styled.div`
  padding: 16px;
  border-radius: 4px;
  border: solid 1px #ececec;
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

const OrderOtherInfoCard: React.FC<{
  country: string
  orderLogExecutor: string
  referrer: string
  sharingCode: string
  sharingNote: string
  recipientName: string
  recipientPhone: string
  recipientAddress: string
  giftPlan: string
}> = ({
  country,
  orderLogExecutor,
  referrer,
  sharingCode,
  sharingNote,
  recipientName,
  recipientPhone,
  recipientAddress,
  giftPlan,
}) => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useApp()
  const contentList = [
    { title: formatMessage(saleMessages.OrderOtherInfoCard.country), message: xss(country), isRender: true },
    {
      title: formatMessage(saleMessages.OrderOtherInfoCard.orderLogExecutor),
      message: orderLogExecutor,
      isRender: enabledModules.member_assignment,
    },
    {
      title: formatMessage(saleMessages.OrderOtherInfoCard.referrer),
      message: referrer,
      isRender: enabledModules.referrer,
    },
    {
      title: formatMessage(saleMessages.OrderOtherInfoCard.sharingCode),
      message: sharingCode,
      isRender: enabledModules.sharing_code,
    },
    {
      title: formatMessage(saleMessages.OrderOtherInfoCard.sharingNote),
      message: sharingNote,
      isRender: enabledModules.sharing_code,
    },
    { title: formatMessage(saleMessages.OrderOtherInfoCard.giftPlan), message: giftPlan, isRender: true },
    { title: formatMessage(saleMessages.OrderOtherInfoCard.recipientName), message: recipientName, isRender: true },
    { title: formatMessage(saleMessages.OrderOtherInfoCard.recipientPhone), message: recipientPhone, isRender: true },
    {
      title: formatMessage(saleMessages.OrderOtherInfoCard.recipientAddress),
      message: recipientAddress,
      isRender: true,
    },
  ]
  return (
    <StyledContainer>
      <div className="container">
        {contentList.map(
          (row, idx) =>
            row.isRender && (
              <div className="row mb-2 justify-content-between" key={idx}>
                <StyledInfoTitle className="column">{row.title}</StyledInfoTitle>
                <StyledInfoMessage className="column">{row.message}</StyledInfoMessage>
              </div>
            ),
        )}
      </div>
    </StyledContainer>
  )
}

export default OrderOtherInfoCard
