import { Button } from 'antd'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { handleError } from '../../helpers'
import { commonMessages, merchandiseMessages } from '../../helpers/translation'
import { useArrangeMerchandiseInventory } from '../../hooks/merchandise'
import AdminModal from '../admin/AdminModal'
import QuantityInput from '../admin/QuantityInput'

const MerchandiseSpecification = styled.div`
  color: var(--gray-darker);
  line-height: 1.5;
  letter-spacing: 0.2px;
`

const MerchandiseInventoryAdminModal: React.FC<{
  merchandiseId: string
  inventories: {
    specification: string
    buyableQuantity: number
  }[]
  refetch?: () => void
}> = ({ merchandiseId, inventories, refetch }) => {
  const { formatMessage } = useIntl()
  const arrangeMerchandiseInventory = useArrangeMerchandiseInventory(merchandiseId)
  const [loading, setLoading] = useState(false)
  const [quantities, setQuantities] = useState<number[]>(Array(inventories.length).fill(0))

  const handleSubmit = (closeModal: () => void) => {
    setLoading(true)
    arrangeMerchandiseInventory(
      inventories.map((inventory, index) => ({
        specification: inventory.specification,
        quantity: quantities[index],
      })),
    )
      .then(() => {
        refetch && refetch()
        closeModal()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <AdminModal
      title={formatMessage(merchandiseMessages.ui.modifyInventory)}
      footer={null}
      renderTrigger={({ setVisible }) => (
        <Button type="primary" icon="file-add" disabled={inventories.length === 0} onClick={() => setVisible(true)}>
          {formatMessage(merchandiseMessages.ui.modifyInventory)}
        </Button>
      )}
      renderFooter={({ setVisible }) => (
        <div className="mt-4">
          <Button className="mr-2" onClick={() => setVisible(false)}>
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button
            type="primary"
            loading={loading}
            disabled={inventories.some((inventory, index) => quantities[index] + inventory.buyableQuantity < 0)}
            onClick={() => handleSubmit(() => setVisible(false))}
          >
            {formatMessage(commonMessages.ui.confirm)}
          </Button>
        </div>
      )}
      destroyOnClose
      maskClosable={false}
    >
      {inventories.map((inventory, index) => (
        <div key={inventory.specification} className="d-flex align-items-center justify-content-between mb-3">
          <MerchandiseSpecification>{inventory.specification}</MerchandiseSpecification>
          <QuantityInput
            value={quantities[index]}
            onChange={value =>
              typeof value === 'number' && setQuantities(quantities.map((q, i) => (i === index ? value : q)))
            }
          />
        </div>
      ))}
    </AdminModal>
  )
}

export default MerchandiseInventoryAdminModal
