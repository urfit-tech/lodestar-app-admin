import { Button } from 'antd'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages, merchandiseMessages } from '../../helpers/translation'
import AdminModal from '../admin/AdminModal'
import AmountInput from '../admin/AmountInput'

const MerchandiseMeta = styled.div`
  color: var(--gray-darker);
  line-height: 1.5;
  letter-spacing: 0.2px;
`

const MerchandiseInventoryAdminModal: React.FC<{
  merchandiseId: string
  metaCollection: string[]
}> = ({ merchandiseId, metaCollection }) => {
  const { formatMessage } = useIntl()
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState(1)

  return (
    <AdminModal
      title={formatMessage(merchandiseMessages.ui.modifyInventory)}
      footer={null}
      renderTrigger={({ setVisible }) => (
        <Button type="primary" icon="file-add" disabled={metaCollection.length === 0} onClick={() => setVisible(true)}>
          {formatMessage(merchandiseMessages.ui.modifyInventory)}
        </Button>
      )}
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={() => setVisible(false)}>
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" loading={loading} onClick={() => {}}>
            {formatMessage(commonMessages.ui.confirm)}
          </Button>
        </>
      )}
      destroyOnClose
    >
      {metaCollection.map(meta => (
        <div key={meta} className="d-flex align-items-center justify-content-between mb-3">
          <MerchandiseMeta>{meta}</MerchandiseMeta>
          <AmountInput
            value={amount}
            onChange={value => typeof value === 'number' && setAmount(value)}
            onDecrease={async () => {
              setAmount(amount - 1)
              return amount - 1
            }}
            onIncrease={async () => {
              setAmount(amount + 1)
              return amount + 1
            }}
          />
        </div>
      ))}
    </AdminModal>
  )
}

export default MerchandiseInventoryAdminModal
