import { ArrowRightOutlined } from '@ant-design/icons'
import { Button, Input, Modal } from 'antd'
import { ModalProps } from 'antd/lib/modal'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { handleError } from '../../helpers'
import { commonMessages, merchandiseMessages } from '../../helpers/translation'
import { useArrangeProductInventory, useProductInventoryLog } from '../../hooks/data'
import { MerchandiseSpec } from '../../types/merchandise'
import QuantityInput from '../form/QuantityInput'
import { MerchandiseCover, MerchandiseInventoryLabel, MerchandiseTitle } from './MerchandiseInventoryCard'
import MerchandiseInventoryTable from './MerchandiseInventoryTable'

const StyledLabel = styled.div`
  color: var(--gray-darker);
  font-size: 14px;
  line-height: 1.57;
  letter-spacing: 0.18px;
`
const MerchandiseModalTitle = styled.div`
  font-size: 18px;
  letter-spacing: 0.8px;
  color: var(--gray-darker);
  font-weight: bold;
`
const StyledStatus = styled.div`
  background: var(--gray-lighter);
  border-radius: 4px;
`
const StatusCardTitle = styled.div`
  margin-bottom: 0.75rem;
  color: var(--gray-darker);
  font-size: 14px;
  line-height: 1.57;
  letter-spacing: 0.18px;
`
const StatusCardNumber = styled.div`
  color: var(--gray-darker);
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 0.2px;
`
const StatusCardQuantity = styled.div`
  font-size: 16px;
  line-height: 24px;
  color: var(--gray-darker);
`
const MerchandiseInventoryAdminModal: React.FC<
  ModalProps &
    Pick<
      MerchandiseSpec,
      | 'id'
      | 'title'
      | 'coverUrl'
      | 'inventoryStatus'
      | 'isPhysical'
      | 'isCustomized'
      | 'merchandiseTitle'
      | 'memberShop'
    > & {
      onRefetch?: () => void
    }
> = ({
  id,
  title,
  coverUrl,
  inventoryStatus,
  isPhysical,
  isCustomized,
  merchandiseTitle,
  memberShop,
  onCancel,
  onRefetch,
  ...props
}) => {
  const { formatMessage } = useIntl()
  const [loading, setLoading] = useState(false)
  const [quantity, setQuantity] = useState('0')
  const [comment, setComment] = useState('')
  const arrangeProductInventory = useArrangeProductInventory(`MerchandiseSpec_${id}`)
  const { inventoryLogs, refetchInventoryLogs } = useProductInventoryLog(`MerchandiseSpec_${id}`)

  const handleSubmit = (closeModal?: () => void) => {
    if (inventoryStatus.buyableQuantity + Number(quantity) < 0) {
      return
    }
    setLoading(true)
    arrangeProductInventory({
      specification: title,
      quantity: Number(quantity),
      comment: comment || null,
    })
      .then(() => {
        onRefetch?.()
        refetchInventoryLogs?.()
        closeModal?.()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <Modal width="70vw" footer={null} onCancel={onCancel} {...props}>
      <div className="container py-2">
        <MerchandiseModalTitle>{formatMessage(merchandiseMessages.status.arrange)}</MerchandiseModalTitle>
        <div className="d-flex align-items-center my-sm-4 mb-1">
          <MerchandiseCover src={coverUrl} className="mr-3" />
          <div>
            <MerchandiseTitle>
              {merchandiseTitle}
              <span>|</span>
              {title}
            </MerchandiseTitle>
            <MerchandiseInventoryLabel>{memberShop}</MerchandiseInventoryLabel>
          </div>
        </div>
        <div className="row mb-1 mb-sm-4">
          <div className="col-12 col-lg-3 mb-1">
            <StyledStatus className="p-4">
              <StatusCardTitle>{formatMessage(merchandiseMessages.status.currentInventory)}</StatusCardTitle>
              <div className="d-flex align-items-center">
                <StatusCardNumber className="mr-2">{inventoryStatus.buyableQuantity}</StatusCardNumber>
                <ArrowRightOutlined className="mr-2" style={{ fontSize: '16px' }} />
                <StatusCardQuantity>{inventoryStatus.buyableQuantity + Number(quantity)}</StatusCardQuantity>
              </div>
            </StyledStatus>
          </div>
          <div className="col-12 col-lg-3 mb-1">
            <StyledStatus className="p-4">
              <StatusCardTitle>{formatMessage(merchandiseMessages.status.reserved)}</StatusCardTitle>
              <StatusCardNumber>{inventoryStatus.unpaidQuantity}</StatusCardNumber>
            </StyledStatus>
          </div>

          <div className="col-12 col-lg-3 mb-1">
            <StyledStatus className="p-4">
              <StatusCardTitle>{formatMessage(merchandiseMessages.status.shipping)}</StatusCardTitle>
              <StatusCardNumber>
                {!isPhysical && !isCustomized ? 0 : inventoryStatus.undeliveredQuantity}
              </StatusCardNumber>
            </StyledStatus>
          </div>

          <div className="col-12 col-lg-3 mb-1">
            <StyledStatus className="p-4">
              <StatusCardTitle>{formatMessage(merchandiseMessages.status.shipped)}</StatusCardTitle>
              <StatusCardNumber>
                {!isPhysical && !isCustomized
                  ? inventoryStatus.undeliveredQuantity + inventoryStatus.deliveredQuantity
                  : inventoryStatus.deliveredQuantity}
              </StatusCardNumber>
            </StyledStatus>
          </div>
        </div>
        <div className="d-sm-flex mb-sm-4">
          <div className="mr-2">
            <StyledLabel className="mb-1">{formatMessage(merchandiseMessages.ui.modifyInventory)}</StyledLabel>
            <QuantityInput
              setInputValue={setQuantity}
              value={Number(quantity)}
              min={-inventoryStatus.buyableQuantity}
              onChange={value => typeof value === 'number' && setQuantity(`${value}`)}
            />
          </div>
          <div className="flex-sm-grow-1 mr-sm-2">
            <StyledLabel className="mb-1">{formatMessage(merchandiseMessages.label.comment)}</StyledLabel>
            <Input value={comment} onChange={e => setComment(e.target.value)} />
          </div>
          <div className="d-flex align-items-end flex-sm-end">
            <Button
              className="mr-2"
              onClick={e => {
                setQuantity('0')
                setComment('')
                onCancel?.(e)
              }}
            >
              {formatMessage(commonMessages.ui.cancel)}
            </Button>
            <Button
              loading={loading}
              type="primary"
              onClick={() =>
                handleSubmit(() => {
                  setQuantity('0')
                  setComment('')
                })
              }
            >
              {formatMessage(commonMessages.ui.save)}
            </Button>
          </div>
        </div>
        <div>
          <MerchandiseInventoryTable inventoryLogs={inventoryLogs} />
        </div>
      </div>
    </Modal>
  )
}

export default MerchandiseInventoryAdminModal
