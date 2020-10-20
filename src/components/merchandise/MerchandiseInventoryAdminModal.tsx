import { ArrowRightOutlined } from '@ant-design/icons'
import { Button, Input, Modal } from 'antd'
import { ModalProps } from 'antd/lib/modal'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { handleError } from '../../helpers'
import { commonMessages, merchandiseMessages } from '../../helpers/translation'
import { useArrangeProductInventory, useProductInventoryLog } from '../../hooks/data'
import { AdminBlock } from '../admin'
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
  MerchandiseInventoryCardProps &
    ModalProps & {
      setVisible: React.Dispatch<React.SetStateAction<boolean>>
    }
> = ({
  merchandiseSpecId,
  coverUrl,
  merchandiseTitle,
  merchandiseSpecTitle,
  merchandiseSpecInventoryStatus,
  merchandiseMemberShop,
  visible,
  setVisible,
  onRefetch,
}) => {
  const { formatMessage } = useIntl()
  const [loading, setLoading] = useState(false)
  const [quantity, setQuantity] = useState(0)
  const [comment, setComment] = useState('')
  const arrangeProductInventory = useArrangeProductInventory(`MerchandiseSpec_${merchandiseSpecId}`)
  const { inventoryLogs, refetchInventoryLogs } = useProductInventoryLog(`MerchandiseSpec_${merchandiseSpecId}`)

  const handleSubmit = (closeModal: () => void) => {
    setLoading(true)
    if (merchandiseSpecInventoryStatus.buyableQuantity + quantity < 0) setLoading(false)
    arrangeProductInventory({
      specification: merchandiseSpecTitle,
      quantity: quantity,
      comment: comment || null,
    })
      .then(() => {
        onRefetch && onRefetch()
        closeModal()
      })
      .catch(handleError)
      .finally(() => {
        setLoading(false)
        refetchInventoryLogs && refetchInventoryLogs()
      })
  }

  return (
    <Modal width="70vw" footer={null} visible={visible} onCancel={() => setVisible(false)}>
      <div className="container py-2">
        <MerchandiseModalTitle>{formatMessage(merchandiseMessages.status.arrange)}</MerchandiseModalTitle>
        <div className="d-flex align-items-center my-sm-4">
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
        <div className="row mb-1">
          <div className="col-12 col-lg-4">
            <AdminBlock className="p-4">
              <StatusCardTitle>{formatMessage(merchandiseMessages.status.currentInventory)}</StatusCardTitle>
              <div className="d-flex align-items-center">
                <StatusCardNumber className="mr-2">{merchandiseSpecInventoryStatus.buyableQuantity}</StatusCardNumber>
                <ArrowRightOutlined className="mr-2" style={{ fontSize: '16px' }} />
                <StatusCardQuantity>{merchandiseSpecInventoryStatus.buyableQuantity + quantity}</StatusCardQuantity>
              </div>
            </AdminBlock>
          </div>
          <div className="col-12 col-lg-4">
            <AdminBlock className="p-4">
              <StatusCardTitle>{formatMessage(merchandiseMessages.status.shipping)}</StatusCardTitle>
              <StatusCardNumber>{merchandiseSpecInventoryStatus.undeliveredQuantity}</StatusCardNumber>
            </AdminBlock>
          </div>
          <div className="col-12 col-lg-4">
            <AdminBlock className="p-4">
              <StatusCardTitle>{formatMessage(merchandiseMessages.status.shipped)}</StatusCardTitle>
              <StatusCardNumber>{merchandiseSpecInventoryStatus.deliveredQuantity}</StatusCardNumber>
            </AdminBlock>
          </div>
        </div>
        <div className="d-sm-flex">
          <div className="mr-2">
            <StyledLabel className="mb-1">{formatMessage(merchandiseMessages.ui.modifyInventory)}</StyledLabel>
            <QuantityInput
              value={quantity}
              min={-merchandiseSpecInventoryStatus.buyableQuantity}
              onChange={value => typeof value === 'number' && setQuantity(value)}
            />
          </div>
          <div className="flex-sm-grow-1 mr-2">
            <StyledLabel className="mb-1">{formatMessage(merchandiseMessages.label.comment)}</StyledLabel>
            <Input onBlur={e => setComment(e.target.value)} />
          </div>
          <div className="d-flex align-items-end flex-sm-end">
            <Button
              className="mr-2"
              onClick={() => {
                setVisible(false)
                setQuantity(0)
              }}
            >
              {formatMessage(commonMessages.ui.cancel)}
            </Button>
            <Button loading={loading} type="primary" onClick={() => handleSubmit(() => setVisible(false))}>
              {formatMessage(commonMessages.ui.save)}
            </Button>
          </div>
        </div>
        <AdminBlock>
          <MerchandiseInventoryTable inventoryLogs={inventoryLogs} />
        </AdminBlock>
      </div>
    </Modal>
  )
}

export default MerchandiseInventoryAdminModal
