import { ArrowRightOutlined } from '@ant-design/icons'
import { Button, Input, Modal } from 'antd'
import { ModalProps } from 'antd/lib/modal'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { handleError } from '../../helpers'
import { commonMessages, merchandiseMessages } from '../../helpers/translation'
import { useArrangeProductInventory, useProductInventoryLog } from '../../hooks/data'
import QuantityInput from '../form/QuantityInput'
import {
  MerchandiseCover,
  MerchandiseInventoryCardProps,
  MerchandiseInventoryLabel,
  MerchandiseTitle,
} from './MerchandiseInventoryCard'
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
const MerchandiseInventoryAdminModal: React.FC<MerchandiseInventoryCardProps & ModalProps> = ({
  merchandiseSpecId,
  coverUrl,
  merchandiseTitle,
  merchandiseSpecTitle,
  merchandiseSpecInventoryStatus,
  merchandiseMemberShop,
  isPhysical,
  isCustomized,
  onCancel,
  onRefetch,
  ...props
}) => {
  const { formatMessage } = useIntl()
  const [loading, setLoading] = useState(false)
  const [quantity, setQuantity] = useState('0')
  const [comment, setComment] = useState('')
  const arrangeProductInventory = useArrangeProductInventory(`MerchandiseSpec_${merchandiseSpecId}`)
  const { inventoryLogs, refetchInventoryLogs } = useProductInventoryLog(`MerchandiseSpec_${merchandiseSpecId}`)

  const handleSubmit = (closeModal?: () => void) => {
    if (merchandiseSpecInventoryStatus.buyableQuantity + Number(quantity) < 0) {
      return
    }
    setLoading(true)
    arrangeProductInventory({
      specification: merchandiseSpecTitle,
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
              {merchandiseSpecTitle}
            </MerchandiseTitle>
            <MerchandiseInventoryLabel>{merchandiseMemberShop}</MerchandiseInventoryLabel>
          </div>
        </div>
        <div className="row mb-1 mb-sm-4">
          <div className="col-12 col-lg-3 mb-1">
            <StyledStatus className="p-4">
              <StatusCardTitle>{formatMessage(merchandiseMessages.status.currentInventory)}</StatusCardTitle>
              <div className="d-flex align-items-center">
                <StatusCardNumber className="mr-2">{merchandiseSpecInventoryStatus.buyableQuantity}</StatusCardNumber>
                <ArrowRightOutlined className="mr-2" style={{ fontSize: '16px' }} />
                <StatusCardQuantity>
                  {merchandiseSpecInventoryStatus.buyableQuantity + Number(quantity)}
                </StatusCardQuantity>
              </div>
            </StyledStatus>
          </div>
          <div className="col-12 col-lg-3 mb-1">
            <StyledStatus className="p-4">
              <StatusCardTitle>{formatMessage(merchandiseMessages.status.reserved)}</StatusCardTitle>
              <StatusCardNumber>{merchandiseSpecInventoryStatus.unpaidQuantity}</StatusCardNumber>
            </StyledStatus>
          </div>

          <div className="col-12 col-lg-3 mb-1">
            <StyledStatus className="p-4">
              <StatusCardTitle>{formatMessage(merchandiseMessages.status.shipping)}</StatusCardTitle>
              <StatusCardNumber>
                {!isPhysical && !isCustomized ? 0 : merchandiseSpecInventoryStatus.undeliveredQuantity}
              </StatusCardNumber>
            </StyledStatus>
          </div>

          <div className="col-12 col-lg-3 mb-1">
            <StyledStatus className="p-4">
              <StatusCardTitle>{formatMessage(merchandiseMessages.status.shipped)}</StatusCardTitle>
              <StatusCardNumber>
                {!isPhysical && !isCustomized
                  ? merchandiseSpecInventoryStatus.undeliveredQuantity +
                    merchandiseSpecInventoryStatus.deliveredQuantity
                  : merchandiseSpecInventoryStatus.deliveredQuantity}
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
              min={-merchandiseSpecInventoryStatus.buyableQuantity}
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
