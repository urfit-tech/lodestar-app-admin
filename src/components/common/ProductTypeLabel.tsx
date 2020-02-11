import React from 'react'
import { defineMessages, useIntl } from 'react-intl'

const messages = defineMessages({
  program: { id: 'common.product.program', defaultMessage: '課程' },
  programPlan: { id: 'common.product.programPlan', defaultMessage: '課程' },
  programContent: { id: 'common.product.programContent', defaultMessage: '課程' },
  programPackagePlan: { id: 'common.product.programPackagePlan', defaultMessage: '課程組合' },
  projectPlan: { id: 'common.product.projectPlan', defaultMessage: '專案方案' },
  card: { id: 'common.product.card', defaultMessage: '會員卡' },
  activityTicket: { id: 'common.product.activityTicket', defaultMessage: '實體' },
  merchandise: { id: 'common.product.merchandise', defaultMessage: '商品' },
  podcastProgram: { id: 'common.product.podcastProgram', defaultMessage: '廣播節目' },
  podcastPlan: { id: 'common.product.podcastPlan', defaultMessage: '廣播頻道訂閱方案' },
  appointmentPlan: { id: 'common.product.appointmentPlan', defaultMessage: '預約' },
  unknownType: { id: 'common.product.unknownType', defaultMessage: '未知' },
})

const ProductTypeLabel: React.FC<{ productType?: string }> = ({ productType }) => {
  const { formatMessage } = useIntl()

  switch (productType) {
    case 'Program':
      return <>{formatMessage(messages.program)}</>
    case 'ProgramPlan':
      return <>{formatMessage(messages.programPlan)}</>
    case 'ProgramContent':
      return <>{formatMessage(messages.programContent)}</>
    case 'ProgramPackagePlan':
      return <>{formatMessage(messages.programPackagePlan)}</>
    case 'ProjectPlan':
      return <>{formatMessage(messages.projectPlan)}</>
    case 'Card':
      return <>{formatMessage(messages.card)}</>
    case 'ActivityTicket':
      return <>{formatMessage(messages.activityTicket)}</>
    case 'Merchandise':
      return <>{formatMessage(messages.merchandise)}</>
    case 'PodcastProgram':
      return <>{formatMessage(messages.podcastProgram)}</>
    case 'PodcastPlan':
      return <>{formatMessage(messages.podcastPlan)}</>
    case 'AppointmentPlan':
      return <>{formatMessage(messages.appointmentPlan)}</>
    default:
      return <>{formatMessage(messages.unknownType)}</>
  }
}

export default ProductTypeLabel
