import { CardProps } from 'antd/lib/card'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import EmptyCover from '../../images/default/empty-cover.png'
import { ProductInventoryStatusProps } from '../../types/general'
import AdminCard from '../admin/AdminCard'

export type PracticeCardProps = CardProps & {
  practiceId: string
  coverUrl: string | null
  createdAt: Date
  practiceTitle: string
  onRefetch?: () => void
}

const PracticeCard: React.FC<{}> = ({}) => {
  const { formatMessage } = useIntl()
  const [visible, setVisible] = useState(false)

  return <></>
}

export default PracticeCard
