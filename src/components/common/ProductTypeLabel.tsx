import React from 'react'
import { useIntl } from 'react-intl'
import { commonMessages } from '../../helpers/translation'

const ProductTypeLabel: React.FC<{ productType?: string }> = ({ productType }) => {
  const { formatMessage } = useIntl()

  switch (productType) {
    case 'Program':
      return <>{formatMessage(commonMessages.product.program)}</>
    case 'ProgramPlan':
      return <>{formatMessage(commonMessages.product.programPlan)}</>
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
    case 'PodcastProgram':
      return <>{formatMessage(commonMessages.product.podcastProgram)}</>
    case 'PodcastPlan':
      return <>{formatMessage(commonMessages.product.podcastPlan)}</>
    case 'AppointmentPlan':
      return <>{formatMessage(commonMessages.product.appointmentPlan)}</>
    default:
      return <>{formatMessage(commonMessages.product.unknownType)}</>
  }
}

export default ProductTypeLabel
