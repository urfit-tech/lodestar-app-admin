import { Button, Result } from 'antd'
import { ResultProps } from 'antd/lib/result'
import { useIntl } from 'react-intl'
import { salesLeadDeliveryPageMessages } from '../../pages/SalesLeadDeliveryPage/translation'

export type AssignResult = {
  status: ResultProps['status']
  data?: number
  error?: Error
}

const SalesLeadResultSection: React.FC<{ result: AssignResult; onBack?: () => void }> = ({ result, onBack }) => {
  const { formatMessage } = useIntl()
  return (
    <Result
      status={result.status}
      title={
        result.status === 'success'
          ? formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.deliverSuccessfully)
          : result.status === 'error'
          ? formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.deliverFailed)
          : formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.delivering)
      }
      subTitle={
        result.status === 'success'
          ? formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.deliveredCount, {
              count: result.data,
            })
          : result.status === 'error'
          ? result.error?.message
          : formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.deliveringMessage)
      }
      extra={[
        <Button onClick={() => onBack?.()}>
          {formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.deliverAgain)}
        </Button>,
      ]}
    />
  )
}

export default SalesLeadResultSection
