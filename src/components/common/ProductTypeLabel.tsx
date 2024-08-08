import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { commonMessages } from '../../helpers/translation'

const messages = defineMessages({
  program: { id: 'common.programPlan', defaultMessage: '課程方案' },
})

const ProductTypeLabel: React.FC<{ productType?: string }> = ({ productType }) => {
  const { formatMessage } = useIntl()

  switch (productType) {
    //FIXME: switch perpetual, subscription, period program type label
    case 'Program':
    case 'ProgramPlan':
      return <>{formatMessage(messages.program)}</>
    case 'ProgramContent':
      return <>{formatMessage(commonMessages.product.programContent)}</>
    case 'ProgramPackagePlan':
      return <>{formatMessage(commonMessages.product.programPackagePlan)}</>
    case 'ProjectPlan':
      return <>{formatMessage(commonMessages.product.projectPlan)}</>
    case 'Card':
      return <>{formatMessage(commonMessages.product.card)}</>
    case 'ActivityTicket':
      return <>{formatMessage(commonMessages.product.activityTicket)}</>
    case 'Merchandise':
      return <>{formatMessage(commonMessages.product.merchandise)}</>
    case 'MerchandiseSpec':
      return <>{formatMessage(commonMessages.product.merchandiseSpec)}</>
    case 'PodcastProgram':
      return <>{formatMessage(commonMessages.product.podcastProgram)}</>
    case 'PodcastPlan':
      return <>{formatMessage(commonMessages.product.podcastPlan)}</>
    case 'AppointmentPlan':
      return <>{formatMessage(commonMessages.product.appointmentPlan)}</>
    case 'Estimator':
      return <>{formatMessage(commonMessages.product.estimator)}</>
    case 'Token':
      return <></>
    default:
      return <>{formatMessage(commonMessages.product.unknownType)}</>
  }
}

export default ProductTypeLabel
