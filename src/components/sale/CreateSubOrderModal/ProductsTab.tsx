import { EditOutlined } from '@ant-design/icons'
import { Button, Typography } from 'antd'
import { Form } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { currencyFormatter } from '../../../helpers'
import { PlusIcon, TrashOIcon } from '../../../images/icon'
import saleMessages from '../translation'
import ProductEditForm from './ProductEditForm'
import { EditableOrderProduct } from './types'

const ProductsTab: React.VFC<{
  products: EditableOrderProduct[]
  editingProduct: EditableOrderProduct | null
  productForm: ReturnType<typeof Form.useForm>[0]
  onAdd: () => void
  onEdit: (product: EditableOrderProduct) => void
  onDelete: (id: string) => void
  onSaveProduct: () => void
  onCancelProduct: () => void
}> = ({ products, editingProduct, productForm, onAdd, onEdit, onDelete, onSaveProduct, onCancelProduct }) => {
  const { formatMessage } = useIntl()
  const { settings } = useApp()

  return (
    <div>
      {products.map(product => (
        <div
          key={product.id}
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
            <span>{product.name}</span>
            {product.quantity && <span> X {product.quantity}</span>}
            {' - '}
            {currencyFormatter(
              product.type === 'MerchandiseSpec' && product?.currencyId === 'LSC'
                ? product.currencyPrice
                : product.price,
              product?.currencyId,
              settings['coin.unit'],
            )}
          </div>
          <div>
            {!editingProduct && (
              <>
                <Button type="link" size="small" icon={<EditOutlined />} onClick={() => onEdit(product)} />
                <Button type="link" size="small" danger icon={<TrashOIcon />} onClick={() => onDelete(product.id)} />
              </>
            )}
          </div>
        </div>
      ))}
      {products.length === 0 && !editingProduct && (
        <Typography.Text type="secondary">暫無商品，請點擊「新增商品」添加</Typography.Text>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '8px' }}>
        {!editingProduct && (
          <Button type="link" size="small" icon={<PlusIcon />} onClick={onAdd}>
            {formatMessage(saleMessages.SaleCollectionExpandRow.addOrderProduct)}
          </Button>
        )}
      </div>
      {editingProduct && (
        <ProductEditForm
          product={editingProduct}
          form={productForm}
          onSave={onSaveProduct}
          onCancel={onCancelProduct}
        />
      )}
    </div>
  )
}

export default ProductsTab
