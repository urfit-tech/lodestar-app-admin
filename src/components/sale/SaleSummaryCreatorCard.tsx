import { Icon, Tooltip } from 'antd'
import React from 'react'
import styled from 'styled-components'
import { commaFormatter } from '../../helpers'
import AdminCard from '../admin/AdminCard'
import { AvatarImage as SaleSummaryAvatarImage } from '../common/Image'

const SaleSummaryWrapper = styled.div`
  display: flex;
  align-items: center;
`
const SaleSummaryInfo = styled.div`
  h3 {
    line-height: 1.3;
    letter-spacing: 0.77px;
    margin-bottom: 10px;
    font-size: 20px;
    font-weight: bold;
  }

  p {
    line-height: 1.5;
    letter-spacing: 0.2px;
    margin-bottom: 0px;
    font-family: Roboto;
    font-size: 16px;
  }
`
const TipsText = styled.span`
  font-size: 12px;
`

type SaleSummaryCreatorCardProps = {
  loading?: boolean
  error?: Error
  totalPrice: number
  totalDiscount: number
  name: string
  avatar: string
}

const SaleSummaryCreatorCard: React.FC<SaleSummaryCreatorCardProps> = ({
  loading,
  totalPrice,
  totalDiscount,
  avatar,
  name,
}) => {
  return (
    <AdminCard loading={loading}>
      <SaleSummaryWrapper className="d-flex align-items-center justify-content-start">
        <SaleSummaryAvatarImage className="flex-shrink-0" src={avatar} size={80} />
        <SaleSummaryInfo className="ml-4">
          <h3>{name}</h3>
          <p>
            <span className="mr-2">實際銷售總額 {commaFormatter(totalPrice - totalDiscount)} 元</span>
            {totalDiscount > 0 && (
              <Tooltip placement="top" title={<TipsText>銷售總額 - 訂閱首期折扣 = 實際銷售總額</TipsText>}>
                <Icon type="question-circle" theme="filled" />
              </Tooltip>
            )}
          </p>
        </SaleSummaryInfo>
      </SaleSummaryWrapper>
    </AdminCard>
  )
}

export default SaleSummaryCreatorCard
