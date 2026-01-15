import { Button, message, Tabs, Typography } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import axios from 'axios'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useEffect, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import { currencyFormatter, handleError } from '../../../helpers'
import { commonMessages } from '../../../helpers/translation'
import AdminModal from '../../admin/AdminModal'
import saleMessages from '../translation'
import DiscountsTab from './DiscountsTab'
import OrderStatusTab, { OrderStatusTabRef } from './OrderStatusTab'
import PaymentLogEditModal from './PaymentLogEditModal'
import PaymentLogsTab from './PaymentLogsTab'
import ProductsTab from './ProductsTab'
import { EditableOrderDiscount, EditableOrderProduct, EditablePaymentLog } from './types'

const CreateSubOrderModal: React.VFC<{
  parentOrderId: string
  orderProducts: Array<{
    id: string
    productId?: string
    name: string
    price: number
    type: string
    currencyId?: string
    currencyPrice?: number
    quantity?: number
    options?: any
  }>
  orderDiscounts: Array<{
    id: string
    name: string
    price: number
    type: string
    target?: string
    coins?: number
  }>
  paymentLogs: Array<{
    no?: string
    price: number
    status: string | null | undefined
    gateway?: string | null
    method?: string | null
  }>
  memberId: string
  onRefetch: () => void
  renderTrigger?: (props: { setVisible: React.Dispatch<React.SetStateAction<boolean>> }) => React.ReactElement
  // 订单状态变更相关 props
  defaultOrderStatus?: string
  parentTotalPrice?: number
  minPrice?: number
  targetPaymentNo?: string
  showBankAccountSelect?: boolean
  canModifyOperations?: string[]
  enableOrderStatusModification?: boolean
}> = ({
  parentOrderId,
  orderProducts,
  orderDiscounts,
  paymentLogs,
  memberId,
  onRefetch,
  renderTrigger,
  defaultOrderStatus,
  parentTotalPrice = 0,
  minPrice,
  targetPaymentNo,
  showBankAccountSelect = false,
  canModifyOperations,
  enableOrderStatusModification = false,
}) => {
  const { formatMessage } = useIntl()
  const { authToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [editableProducts, setEditableProducts] = useState<EditableOrderProduct[]>([])
  const [editableDiscounts, setEditableDiscounts] = useState<EditableOrderDiscount[]>([])
  const [editablePaymentLogs, setEditablePaymentLogs] = useState<EditablePaymentLog[]>([])
  const [editingProduct, setEditingProduct] = useState<EditableOrderProduct | null>(null)
  const [editingDiscount, setEditingDiscount] = useState<EditableOrderDiscount | null>(null)
  const [editingPaymentLog, setEditingPaymentLog] = useState<EditablePaymentLog | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const setVisibleRef = useRef<((visible: boolean) => void) | null>(null)
  const orderStatusTabRef = useRef<OrderStatusTabRef>(null)

  // Forms for editing
  const [productForm] = useForm()
  const [discountForm] = useForm()

  // 當模態框打開時，將原始訂單的 orderProducts 和 orderDiscounts 初始化為可編輯狀態
  useEffect(() => {
    if (isModalVisible && !isInitialized) {
      // 轉換 orderProducts 為 EditableOrderProduct
      const initialProducts: EditableOrderProduct[] = orderProducts.map(product => ({
        id: product.id,
        productId: product.productId,
        name: product.name,
        price: product.price,
        type: product.type || 'ProgramPlan',
        target: product.productId, // 使用 productId 作為 target
        currencyId: product.currencyId,
        currencyPrice: product.currencyPrice,
        quantity: product.quantity || 1,
        options: product.options,
        isNew: false,
      }))

      // 轉換 orderDiscounts 為 EditableOrderDiscount
      const initialDiscounts: EditableOrderDiscount[] = orderDiscounts.map(discount => ({
        id: discount.id,
        name: discount.name,
        price: discount.price,
        type: discount.type || 'Coupon',
        target: discount.target,
        coins: discount.coins,
        isNew: false,
      }))

      setEditableProducts(initialProducts)
      setEditableDiscounts(initialDiscounts)
      setIsInitialized(true)
    } else if (!isModalVisible) {
      // 當模態框關閉時，重置初始化狀態和數據
      setIsInitialized(false)
      setEditableProducts([])
      setEditableDiscounts([])
      setEditablePaymentLogs([])
      setEditingProduct(null)
      setEditingDiscount(null)
      setEditingPaymentLog(null)
      productForm.resetFields()
      discountForm.resetFields()
    }
  }, [isModalVisible, isInitialized, orderProducts, orderDiscounts, productForm, discountForm])

  const calculateTotalPrice = () => {
    // order_product 的 price 是單項總價，不需要再乘以數量
    const productsPrice = editableProducts.reduce((sum, p) => sum + (p.price || 0), 0)
    const discountsPrice = editableDiscounts.reduce((sum, d) => sum + (d.price || 0), 0)
    return productsPrice - discountsPrice
  }

  // Order Product CRUD
  const handleAddProduct = () => {
    const newProduct: EditableOrderProduct = {
      id: `new-${Date.now()}`,
      name: '',
      price: 0,
      type: 'ProgramPlan',
      target: undefined,
      quantity: 1,
      isNew: true,
    }
    setEditingProduct(newProduct)
  }

  const handleEditProduct = (product: EditableOrderProduct) => {
    setEditingProduct({ ...product })
  }

  const handleDeleteProduct = (id: string) => {
    setEditableProducts(products => products.filter(p => p.id !== id))
  }

  const handleSaveProduct = async () => {
    if (!editingProduct) return

    try {
      const values = await productForm.validateFields()
      const targetValue = Array.isArray(values.target) && values.target.length > 0 ? values.target[0] : undefined
      const updatedProduct: EditableOrderProduct = {
        ...editingProduct,
        name: values.name,
        price: values.price,
        quantity: values.quantity,
        type: values.type,
        target: targetValue,
      }

      if (updatedProduct.isNew) {
        setEditableProducts(products => [...products, { ...updatedProduct, isNew: false }])
      } else {
        setEditableProducts(products => products.map(p => (p.id === updatedProduct.id ? updatedProduct : p)))
      }
      setEditingProduct(null)
      productForm.resetFields()
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  const handleCancelProduct = () => {
    setEditingProduct(null)
    productForm.resetFields()
  }

  // Order Discount CRUD
  const handleAddDiscount = () => {
    const newDiscount: EditableOrderDiscount = {
      id: `new-${Date.now()}`,
      name: '',
      price: 0,
      type: 'Coupon',
      isNew: true,
    }
    setEditingDiscount(newDiscount)
  }

  const handleEditDiscount = (discount: EditableOrderDiscount) => {
    setEditingDiscount({ ...discount })
  }

  const handleDeleteDiscount = (id: string) => {
    setEditableDiscounts(discounts => discounts.filter(d => d.id !== id))
  }

  const handleSaveDiscount = async () => {
    if (!editingDiscount) return

    try {
      const values = await discountForm.validateFields()
      const updatedDiscount: EditableOrderDiscount = {
        ...editingDiscount,
        name: values.name,
        price: values.price,
        type: values.type,
        target: values.target,
      }

      if (updatedDiscount.isNew) {
        setEditableDiscounts(discounts => [...discounts, { ...updatedDiscount, isNew: false }])
      } else {
        setEditableDiscounts(discounts => discounts.map(d => (d.id === updatedDiscount.id ? updatedDiscount : d)))
      }
      setEditingDiscount(null)
      discountForm.resetFields()
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  const handleCancelDiscount = () => {
    setEditingDiscount(null)
    discountForm.resetFields()
  }

  // Payment Log CRUD
  const handleAddPaymentLog = () => {
    setEditingPaymentLog({
      id: `new-${Date.now()}`,
      price: 0,
      status: 'SUCCESS',
      gateway: 'lodestar',
      method: null,
      isNew: true,
    })
  }

  const handleEditPaymentLog = (paymentLog: EditablePaymentLog) => {
    setEditingPaymentLog({ ...paymentLog })
  }

  const handleDeletePaymentLog = (id: string) => {
    setEditablePaymentLogs(paymentLogs => paymentLogs.filter(p => p.id !== id))
  }

  const handleSavePaymentLog = (paymentLog: EditablePaymentLog) => {
    if (paymentLog.isNew) {
      setEditablePaymentLogs(paymentLogs => [...paymentLogs, { ...paymentLog, isNew: false }])
    } else {
      setEditablePaymentLogs(paymentLogs => paymentLogs.map(p => (p.id === paymentLog.id ? paymentLog : p)))
    }
    setEditingPaymentLog(null)
  }

  const handleCreateChildOrder = async () => {
    if (editableProducts.length === 0 && !enableOrderStatusModification) {
      message.error('請至少添加一個商品')
      return
    }

    // 如果只修改订单状态，不创建子订单
    if (enableOrderStatusModification && editableProducts.length === 0 && orderStatusTabRef.current) {
      setLoading(true)
      try {
        await orderStatusTabRef.current.handleSubmit()
        message.success(formatMessage(saleMessages.SaleCollectionExpandRow.childOrderCreated))
        onRefetch()
        setIsModalVisible(false)
        setVisibleRef.current?.(false)
        return
      } catch (error) {
        handleError(error)
      } finally {
        setLoading(false)
      }
    }

    if (editableProducts.length === 0) {
      message.error('請至少添加一個商品')
      return
    }

    setLoading(true)
    try {
      // 將原始訂單的商品作為負向項目（價格取負值）
      const originalProductIds = orderProducts.map(p => {
        // 優先使用 productId，如果沒有則根據 type 構建
        const productId = p.productId || `${p.type}_${p.id}`
        return productId
      })

      // 將新商品作為正向項目
      const newProductIds = editableProducts.map(p => {
        // 優先使用 target，然後是 productId，如果沒有則從 options 中獲取，最後才根據 type 構建
        const productId = p.target || p.productId || p.options?.productId || `${p.type}_${p.id}`
        return productId
      })

      // 合併原始訂單商品（負向）和新商品（正向）
      const productIds = [...originalProductIds, ...newProductIds]

      // 構建 discountId（如果有的話）
      const discountId = editableDiscounts.length > 0 ? editableDiscounts[0].target || undefined : undefined

      // 準備付款資訊
      const selectedPaymentLog = editablePaymentLogs.find(p => p.status === 'SUCCESS')
      const paymentData = selectedPaymentLog
        ? {
            price: selectedPaymentLog.price,
            status: selectedPaymentLog.status || 'SUCCESS',
            gateway: selectedPaymentLog.gateway || 'lodestar',
            method: selectedPaymentLog.method || null,
            no: selectedPaymentLog.no,
          }
        : null

      // 構建 options，包含原始訂單商品的負向價格和新商品的選項
      const options: any = {}

      // 原始訂單商品：標記為負向，價格取負值
      orderProducts.forEach(p => {
        const productId = p.productId || `${p.type}_${p.id}`
        options[productId] = {
          ...p.options,
          quantity: p.quantity || 1,
          isNegative: true, // 標記為負向項目
          negativePrice: -(p.price || 0), // 負向價格
        }
      })

      // 新商品：正向項目
      editableProducts.forEach(p => {
        const productId = p.target || p.productId || p.options?.productId || `${p.type}_${p.id}`
        if (p.options) {
          options[productId] = {
            ...p.options,
            quantity: p.quantity || 1,
          }
        } else {
          options[productId] = {
            quantity: p.quantity || 1,
          }
        }
      })

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_ROOT}/order/create`,
        {
          memberId,
          paymentModel: { type: 'perpetual' },
          productIds,
          discountId,
          parentOrderId,
          status: paymentData?.status === 'SUCCESS' ? 'SUCCESS' : 'UNPAID',
          isOrderSetSuccessByDefault: paymentData?.status === 'SUCCESS',
          isPaymentSetSuccessByDefault: paymentData?.status === 'SUCCESS',
          options,
        },
        {
          headers: {
            authorization: `Bearer ${authToken}`,
          },
        },
      )

      if (response.data.code === 'SUCCESS') {
        const newOrderId = response.data.result.orderId

        // 如果需要創建付款紀錄
        if (paymentData && paymentData.price > 0) {
          await axios.post(
            `${process.env.REACT_APP_API_BASE_ROOT}/payment-log`,
            {
              orderId: newOrderId,
              no: paymentData.no || `${Date.now()}`,
              price: paymentData.price,
              status: paymentData.status,
              gateway: paymentData.gateway,
              method: paymentData.method,
            },
            {
              headers: {
                authorization: `Bearer ${authToken}`,
              },
            },
          )
        }

        message.success(formatMessage(saleMessages.SaleCollectionExpandRow.childOrderCreated))
        onRefetch()
        setIsModalVisible(false)
        setVisibleRef.current?.(false)
      } else {
        throw new Error(response.data.message || '變更訂單失敗')
      }
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }

  const totalPrice = calculateTotalPrice()

  return (
    <>
      <AdminModal
        title={formatMessage(saleMessages.SaleCollectionExpandRow.createChildOrder)}
        footer={null}
        onCancel={() => {
          setIsModalVisible(false)
        }}
        renderTrigger={({ setVisible }) => {
          setVisibleRef.current = setVisible
          return (
            renderTrigger?.({
              setVisible: (visible: boolean | ((prev: boolean) => boolean)) => {
                const newVisible = typeof visible === 'function' ? visible(isModalVisible) : visible
                setIsModalVisible(newVisible)
                setVisible(newVisible)
              },
            }) || null
          )
        }}
        renderFooter={({ setVisible }) => {
          setVisibleRef.current = setVisible
          return (
            <>
              <Button
                onClick={() => {
                  setVisible(false)
                  setIsModalVisible(false)
                }}
                className="mr-2"
              >
                {formatMessage(commonMessages.ui.cancel)}
              </Button>
              <Button type="primary" loading={loading} onClick={handleCreateChildOrder}>
                {formatMessage(commonMessages.ui.confirm)}
              </Button>
            </>
          )
        }}
      >
        <div>
          <Tabs defaultActiveKey="products">
            <Tabs.TabPane key="products" tab={formatMessage(saleMessages.SaleCollectionExpandRow.selectOrderProducts)}>
              <ProductsTab
                products={editableProducts}
                editingProduct={editingProduct}
                productForm={productForm}
                onAdd={handleAddProduct}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                onSaveProduct={handleSaveProduct}
                onCancelProduct={handleCancelProduct}
              />
            </Tabs.TabPane>
            <Tabs.TabPane
              key="discounts"
              tab={formatMessage(saleMessages.SaleCollectionExpandRow.selectOrderDiscounts)}
            >
              <DiscountsTab
                discounts={editableDiscounts}
                products={editableProducts}
                editingDiscount={editingDiscount}
                discountForm={discountForm}
                onAdd={handleAddDiscount}
                onEdit={handleEditDiscount}
                onDelete={handleDeleteDiscount}
                onSaveDiscount={handleSaveDiscount}
                onCancelDiscount={handleCancelDiscount}
              />
            </Tabs.TabPane>
            <Tabs.TabPane key="paymentLogs" tab={formatMessage(saleMessages.SaleCollectionExpandRow.selectPaymentLog)}>
              <PaymentLogsTab
                paymentLogs={editablePaymentLogs}
                onAdd={handleAddPaymentLog}
                onEdit={handleEditPaymentLog}
                onDelete={handleDeletePaymentLog}
              />
            </Tabs.TabPane>
            <Tabs.TabPane
              key="orderStatus"
              tab={formatMessage({
                id: 'order.ui.modifyOrderStatus',
                defaultMessage: '變更訂單狀態',
              })}
            >
              <OrderStatusTab
                ref={orderStatusTabRef}
                orderLogId={parentOrderId}
                defaultOrderStatus={defaultOrderStatus || 'UNPAID'}
                paymentLogs={paymentLogs}
                totalPrice={parentTotalPrice}
                minPrice={minPrice}
                targetPaymentNo={targetPaymentNo}
                showBankAccountSelect={showBankAccountSelect}
                canModifyOperations={canModifyOperations}
                onStatusChange={status => {
                  onRefetch()
                }}
              />
            </Tabs.TabPane>
          </Tabs>

          <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            <Typography.Text strong>總金額: {currencyFormatter(totalPrice)}</Typography.Text>
          </div>
        </div>
      </AdminModal>

      {/* Edit Payment Log Modal */}
      {editingPaymentLog && (
        <PaymentLogEditModal
          paymentLog={editingPaymentLog}
          onSave={handleSavePaymentLog}
          onCancel={() => setEditingPaymentLog(null)}
        />
      )}
    </>
  )
}

export default CreateSubOrderModal
