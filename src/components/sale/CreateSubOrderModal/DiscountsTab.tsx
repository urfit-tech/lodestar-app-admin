import { EditOutlined } from '@ant-design/icons'
import { Button, Form, Typography } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React from 'react'
import { useIntl } from 'react-intl'
import { currencyFormatter } from '../../../helpers'
import { PlusIcon, TrashOIcon } from '../../../images/icon'
import saleMessages from '../translation'
import DiscountEditForm from './DiscountEditForm'
import { EditableOrderDiscount, EditableOrderProduct } from './types'

const DiscountsTab: React.VFC<{
  discounts: EditableOrderDiscount[]
  products: EditableOrderProduct[]
  editingDiscount: EditableOrderDiscount | null
  discountForm: ReturnType<typeof Form.useForm>[0]
  onAdd: () => void
  onEdit: (discount: EditableOrderDiscount) => void
  onDelete: (id: string) => void
  onSaveDiscount: () => void
  onCancelDiscount: () => void
}> = ({
  discounts,
  products,
  editingDiscount,
  discountForm,
  onAdd,
  onEdit,
  onDelete,
  onSaveDiscount,
  onCancelDiscount,
}) => {
  const { formatMessage } = useIntl()
  const { settings } = useApp()

  return (
    <div>
      {discounts.map(discount => (
        <div
          key={discount.id}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px',
            marginBottom: '4px',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
          }}
        >
          <div>
            <span>{discount.name}</span>
            {' - '}
            {currencyFormatter(
              products.length === 1 && products[0].type === 'MerchandiseSpec' && products[0]?.currencyId === 'LSC'
                ? discount?.coins
                : discount.price,
              products.length === 1 && products[0].type === 'MerchandiseSpec' && discount.type === 'Coin'
                ? 'LSC'
                : discount.type,
              settings['coin.unit'],
            )}
          </div>
          <div>
            {!editingDiscount && (
              <>
                <Button type="link" size="small" icon={<EditOutlined />} onClick={() => onEdit(discount)} />
                <Button type="link" size="small" danger icon={<TrashOIcon />} onClick={() => onDelete(discount.id)} />
              </>
            )}
          </div>
        </div>
      ))}
      {discounts.length === 0 && !editingDiscount && (
        <Typography.Text type="secondary">暫無折扣，請點擊「新增折扣」添加</Typography.Text>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '8px' }}>
        {!editingDiscount && (
          <Button type="link" size="small" icon={<PlusIcon />} onClick={onAdd}>
            {formatMessage(saleMessages.SaleCollectionExpandRow.addOrderDiscount)}
          </Button>
        )}
      </div>
      {editingDiscount && (
        <DiscountEditForm
          discount={editingDiscount}
          form={discountForm}
          onSave={onSaveDiscount}
          onCancel={onCancelDiscount}
        />
      )}
    </div>
  )
}

export default DiscountsTab
