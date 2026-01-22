import { Button, Form, Input, InputNumber, Select, Typography } from 'antd'
import React, { useEffect, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import { commonMessages } from '../../../helpers/translation'
import saleMessages from '../translation'
import ProductSelectWithoutParent from './ProductSelectWithoutParent'
import { EditableOrderProduct } from './types'

const ProductEditForm: React.VFC<{
  product: EditableOrderProduct
  form: ReturnType<typeof Form.useForm>[0]
  onSave: () => void
  onCancel: () => void
}> = ({ product, form, onSave, onCancel }) => {
  const { formatMessage } = useIntl()
  const [productType, setProductType] = useState<string>(product.type || 'ProgramPlan')

  useEffect(() => {
    form.setFieldsValue({
      name: product.name,
      price: product.price,
      quantity: product.quantity || 1,
      type: product.type,
      target: product.target ? [product.target] : undefined,
    })
    setProductType(product.type || 'ProgramPlan')
  }, [product, form])

  // 根據商品類型獲取對應的 allowTypes
  const getAllowTypesForProductType = (type: string): string[] => {
    switch (type) {
      case 'ProgramPlan':
        return ['ProgramPlan']
      case 'ProgramPackagePlan':
        return ['ProgramPackagePlan']
      case 'MerchandiseSpec':
        return [
          'MerchandiseSpec',
          'GeneralPhysicalMerchandiseSpec',
          'GeneralVirtualMerchandiseSpec',
          'CustomizedPhysicalMerchandiseSpec',
          'CustomizedVirtualMerchandiseSpec',
        ]
      case 'ActivityTicket':
        return ['ActivityTicket']
      case 'PodcastProgram':
        return ['PodcastProgram']
      case 'AppointmentPlan':
        return ['AppointmentPlan']
      case 'ProjectPlan':
        return ['ProjectPlan']
      case 'PodcastPlan':
        return ['PodcastPlan']
      case 'Card':
        return ['Card']
      default:
        return ['ProgramPlan']
    }
  }

  const handleProductTypeChange = (type: string) => {
    setProductType(type)
    form.setFieldsValue({ target: undefined })
  }

  const productAllowTypes = useMemo(() => getAllowTypesForProductType(productType), [productType])

  return (
    <div
      style={{
        marginBottom: '24px',
        padding: '16px',
        border: '1px solid #d9d9d9',
        borderRadius: '4px',
        backgroundColor: '#fafafa',
      }}
    >
      <Typography.Text strong style={{ display: 'block', marginBottom: '16px' }}>
        {formatMessage(saleMessages.SaleCollectionExpandRow.editOrderProduct)}
      </Typography.Text>
      <Form form={form} layout="vertical">
        <Form.Item
          label={formatMessage(saleMessages.SaleCollectionExpandRow.productName)}
          name="name"
          rules={[{ required: true, message: '請輸入商品名稱' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={formatMessage(saleMessages.SaleCollectionExpandRow.productPrice)}
          name="price"
          rules={[{ required: true, message: '請輸入商品價格' }]}
          tooltip="此為該商品的總價（已包含數量）"
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          label={formatMessage(saleMessages.SaleCollectionExpandRow.productQuantity)}
          name="quantity"
          rules={[{ required: true, message: '請輸入數量' }]}
        >
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="商品類型" name="type" rules={[{ required: true, message: '請選擇商品類型' }]}>
          <Select onChange={handleProductTypeChange}>
            <Select.Option value="ProgramPlan">課程方案</Select.Option>
            <Select.Option value="ProgramPackagePlan">課程包方案</Select.Option>
            <Select.Option value="MerchandiseSpec">商品規格</Select.Option>
            <Select.Option value="ActivityTicket">活動票券</Select.Option>
            <Select.Option value="PodcastProgram">Podcast</Select.Option>
            <Select.Option value="AppointmentPlan">預約</Select.Option>
            <Select.Option value="ProjectPlan">專案方案</Select.Option>
            <Select.Option value="PodcastPlan">Podcast 方案</Select.Option>
            <Select.Option value="Card">會員卡</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="商品目標"
          name="target"
          tooltip="根據商品類型選擇對應的商品"
          normalize={value => (Array.isArray(value) ? value : value ? [value] : undefined)}
          getValueFromEvent={value => (Array.isArray(value) ? value : value ? [value] : [])}
        >
          <ProductSelectWithoutParent
            allowTypes={productAllowTypes}
            onlyValid={true}
            onProductChange={(productId, productTitle) => {
              const currentName = form.getFieldValue('name')
              if (productId && productTitle && !currentName) {
                form.setFieldsValue({ name: productTitle })
              }
            }}
          />
        </Form.Item>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <Button onClick={onCancel}>{formatMessage(commonMessages.ui.cancel)}</Button>
          <Button type="primary" onClick={onSave}>
            {formatMessage(commonMessages.ui.confirm)}
          </Button>
        </div>
      </Form>
    </div>
  )
}

export default ProductEditForm
