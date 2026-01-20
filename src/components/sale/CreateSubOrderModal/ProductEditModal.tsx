import { Button, Form, Input, InputNumber, Select } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import React, { useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import { commonMessages } from '../../../helpers/translation'
import AdminModal from '../../admin/AdminModal'
import saleMessages from '../translation'
import ProductSelectWithoutParent from './ProductSelectWithoutParent'
import { EditableOrderProduct } from './types'

const ProductEditModal: React.VFC<{
  product: EditableOrderProduct
  onSave: (product: EditableOrderProduct) => void
  onCancel: () => void
}> = ({ product, onSave, onCancel }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm()
  const [isOpen, setIsOpen] = useState(true)
  const [productType, setProductType] = useState<string>(product.type || 'ProgramPlan')

  React.useEffect(() => {
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

  const handleTypeChange = (type: string) => {
    setProductType(type)
    form.setFieldsValue({ target: undefined })
  }

  // 使用 useMemo 穩定 allowTypes，避免無限渲染
  const allowTypes = useMemo(() => getAllowTypesForProductType(productType), [productType])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const targetValue = Array.isArray(values.target) && values.target.length > 0 ? values.target[0] : undefined
      onSave({
        ...product,
        name: values.name,
        price: values.price,
        quantity: values.quantity,
        type: values.type,
        target: targetValue,
      })
      setIsOpen(false)
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  return (
    <AdminModal
      title={formatMessage(saleMessages.SaleCollectionExpandRow.editOrderProduct)}
      footer={null}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      onCancel={onCancel}
      renderFooter={() => (
        <>
          <Button onClick={onCancel} className="mr-2">
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" onClick={handleSubmit}>
            {formatMessage(commonMessages.ui.confirm)}
          </Button>
        </>
      )}
    >
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
          <Select onChange={handleTypeChange}>
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
            allowTypes={allowTypes}
            onlyValid={true}
            onProductChange={(productId, productTitle) => {
              // 当商品目标改变时，如果商品名称为空，自动填充
              const currentName = form.getFieldValue('name')
              if (productId && productTitle && !currentName) {
                form.setFieldsValue({ name: productTitle })
              }
            }}
          />
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

export default ProductEditModal
