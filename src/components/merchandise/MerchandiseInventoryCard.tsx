import { CardProps } from 'antd/lib/card'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import EmptyCover from '../../images/default/empty-cover.png'
import { ProductInventoryStatusProps } from '../../types/general'
import AdminCard from '../admin/AdminCard'
import MerchandiseInventoryAdminModal from './MerchandiseInventoryAdminModal'

const messages = defineMessages({
  sold: { id: 'merchandiseInventory.label.sold', defaultMessage: '已售' },
  currentInventory: { id: 'merchandiseInventory.label.currentInventory', defaultMessage: '庫存' },
})

const StyledMerchandiseInventoryCard = styled(AdminCard)`
  position: relative;

  .mask {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    cursor: pointer;
    content: '';
    z-index: 998;
  }
`
export const MerchandiseCover = styled.div<{ src?: string | null }>`
  width: 56px;
  height: 56px;
  border-radius: 4px;
  background: url(${props => props.src || EmptyCover});
  background-size: cover;
  background-position: center;
`
export const MerchandiseTitle = styled.div`
  font-size: 15px;
  font-weight: bold;
  & span {
    margin: 0 8px;
  }
`
export const MerchandiseInventoryLabel = styled.div`
  font-size: 12px;
  line-height: 22px;
  color: var(--gray-dark);
`
const MerchandiseInventoryAmount = styled.div`
  line-height: 24px;
  color: var(--gray-darker);
`

export type MerchandiseInventoryCardProps = CardProps & {
  merchandiseSpecId: string
  coverUrl: string | null
  merchandiseTitle: string
  merchandiseSpecTitle: string
  merchandiseSpecInventoryStatus: ProductInventoryStatusProps
  merchandiseMemberShop?: string
  refetch?: () => void
}

const MerchandiseInventoryCard: React.FC<MerchandiseInventoryCardProps> = ({
  merchandiseSpecId,
  coverUrl,
  merchandiseTitle,
  merchandiseSpecTitle,
  merchandiseSpecInventoryStatus,
  merchandiseMemberShop,
  refetch,
  ...cardProps
}) => {
  const { formatMessage } = useIntl()
  const [isModalVisible, setModalVisible] = useState<boolean>(false)

  return (
    <>
      <StyledMerchandiseInventoryCard className="mb-3" {...cardProps}>
        <div className="d-flex align-items-center">
          <MerchandiseCover src={coverUrl} className="mr-sm-3 mr-2" />
          <div>
            <MerchandiseTitle>
              {merchandiseTitle}
              <span>|</span>
              {merchandiseSpecTitle}
            </MerchandiseTitle>
            <MerchandiseInventoryLabel>{merchandiseMemberShop}</MerchandiseInventoryLabel>
          </div>
          <div className="d-flex flex-fill justify-content-end">
            <div className="mr-sm-5 mr-1">
              <MerchandiseInventoryLabel className="d-flex justify-content-center">
                {formatMessage(messages.sold)}
              </MerchandiseInventoryLabel>
              <MerchandiseInventoryAmount className="d-flex justify-content-center">
                {merchandiseSpecInventoryStatus.deliveredQuantity + merchandiseSpecInventoryStatus.undeliveredQuantity}
              </MerchandiseInventoryAmount>
            </div>
            <div>
              <MerchandiseInventoryLabel className="d-flex justify-content-center">
                {formatMessage(messages.currentInventory)}
              </MerchandiseInventoryLabel>
              <MerchandiseInventoryAmount className="d-flex justify-content-center">
                {merchandiseSpecInventoryStatus.buyableQuantity}
              </MerchandiseInventoryAmount>
            </div>
          </div>
        </div>
        <div className="mask" onClick={() => setModalVisible(true)} />
      </StyledMerchandiseInventoryCard>

      <MerchandiseInventoryAdminModal
        merchandiseSpecId={merchandiseSpecId}
        coverUrl={coverUrl}
        merchandiseTitle={merchandiseTitle}
        merchandiseSpecTitle={merchandiseSpecTitle}
        merchandiseSpecInventoryStatus={merchandiseSpecInventoryStatus}
        merchandiseMemberShop={merchandiseMemberShop}
        isModalVisible={isModalVisible}
        setModalVisible={setModalVisible}
        refetch={refetch}
      />
    </>
  )
}

export default MerchandiseInventoryCard
