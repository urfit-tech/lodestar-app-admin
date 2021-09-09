import { CardProps } from 'antd/lib/card'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import EmptyCover from '../../images/default/empty-cover.png'
import { MerchandiseSpec } from '../../types/merchandise'
import AdminCard from '../admin/AdminCard'
import MerchandiseInventoryAdminModal from './MerchandiseInventoryAdminModal'

const messages = defineMessages({
  sold: { id: 'merchandiseInventory.label.sold', defaultMessage: '已售' },
  currentInventory: { id: 'merchandiseInventory.label.currentInventory', defaultMessage: '庫存' },
})

const StyledMerchandiseInventoryCard = styled(AdminCard)`
  position: relative;
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
export type MerchandiseInventoryCardProps = CardProps &
  Pick<
    MerchandiseSpec,
    'id' | 'title' | 'coverUrl' | 'inventoryStatus' | 'isPhysical' | 'isCustomized' | 'merchandiseTitle' | 'memberShop'
  > & {
    onRefetch?: () => void
  }

const MerchandiseInventoryCard: React.FC<MerchandiseInventoryCardProps> = ({
  id,
  title,
  coverUrl,
  inventoryStatus,
  isPhysical,
  isCustomized,
  merchandiseTitle,
  memberShop,
  onRefetch,
  ...cardProps
}) => {
  const { formatMessage } = useIntl()
  const [visible, setVisible] = useState(false)

  return (
    <>
      <StyledMerchandiseInventoryCard className="mb-3" {...cardProps} onClick={() => setVisible(true)}>
        <div className="d-flex align-items-center">
          <MerchandiseCover src={coverUrl} className="mr-sm-3 mr-2" />
          <div>
            <MerchandiseTitle>
              {merchandiseTitle}
              <span>|</span>
              {title}
            </MerchandiseTitle>
            <MerchandiseInventoryLabel>{memberShop}</MerchandiseInventoryLabel>
          </div>
          <div className="d-flex flex-fill justify-content-end">
            <div className="mr-sm-5 mr-1">
              <MerchandiseInventoryLabel className="d-flex justify-content-center">
                {formatMessage(messages.sold)}
              </MerchandiseInventoryLabel>
              <MerchandiseInventoryAmount className="d-flex justify-content-center">
                {inventoryStatus.deliveredQuantity + inventoryStatus.undeliveredQuantity}
              </MerchandiseInventoryAmount>
            </div>
            <div>
              <MerchandiseInventoryLabel className="d-flex justify-content-center">
                {formatMessage(messages.currentInventory)}
              </MerchandiseInventoryLabel>
              <MerchandiseInventoryAmount className="d-flex justify-content-center">
                {inventoryStatus.buyableQuantity}
              </MerchandiseInventoryAmount>
            </div>
          </div>
        </div>
      </StyledMerchandiseInventoryCard>

      <MerchandiseInventoryAdminModal
        id={id}
        title={title}
        coverUrl={coverUrl}
        inventoryStatus={inventoryStatus}
        isPhysical={isPhysical}
        isCustomized={isCustomized}
        merchandiseTitle={merchandiseTitle}
        memberShop={memberShop}
        visible={visible}
        onCancel={() => setVisible(false)}
        onRefetch={onRefetch}
      />
    </>
  )
}

export default MerchandiseInventoryCard
