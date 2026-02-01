import { gql, useMutation } from '@apollo/client'
import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react'
import { DatePicker, Form, Input, InputNumber, message, Table } from 'antd'
import { useAppTheme } from 'lodestar-app-element/src/contexts/AppThemeContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import React, { useEffect, useRef, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { handleError } from '../../helpers'
import { useMemberAdmin } from '../../hooks/member'
import { ContractValue, ContractWithProducts } from '../../types/contract'

const messages = defineMessages({
  changeContract: { id: 'contract.ui.changeContract', defaultMessage: '變更合約' },
  startedAt: { id: 'contract.ui.startedAt', defaultMessage: '開始日期' },
  endedAt: { id: 'contract.ui.endedAt', defaultMessage: '結束日期' },
  productName: { id: 'contract.ui.productName', defaultMessage: '產品名稱' },
  productId: { id: 'contract.ui.productId', defaultMessage: '產品 ID' },
  price: { id: 'contract.ui.price', defaultMessage: '價格' },
  quantity: { id: 'contract.ui.quantity', defaultMessage: '數量' },
  totalPrice: { id: 'contract.ui.totalPrice', defaultMessage: '總價' },
  addProduct: { id: 'contract.ui.addProduct', defaultMessage: '新增產品' },
  deleteProduct: { id: 'contract.ui.deleteProduct', defaultMessage: '刪除' },
  save: { id: 'contract.ui.save', defaultMessage: '儲存' },
  cancel: { id: 'contract.ui.cancel', defaultMessage: '取消' },
  successfullyChanged: { id: 'contract.event.successfullyChanged', defaultMessage: '合約已成功更新！' },
})

type OrderProduct = {
  key: string
  name: string
  product_id: string
  price: number
  quantity: number
  totalPrice: number
  started_at?: string
  ended_at?: string
  delivered_at?: string
  options?: any
}

const MemberContractChangeModal: React.FC<{
  contract: ContractWithProducts
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}> = ({ contract, isOpen, onClose, onSuccess }) => {
  const theme = useAppTheme()
  const { formatMessage } = useIntl()
  const { currentMemberId } = useAuth()
  const { memberAdmin } = useMemberAdmin(currentMemberId || '')
  const [form] = Form.useForm()
  const [updateMemberContract] = useMutation(UPDATE_MEMBER_CONTRACT_VALUES)
  const [updateMemberContractOptions] = useMutation(UPDATE_MEMBER_CONTRACT_OPTIONS)
  const [updateMemberContractDates] = useMutation(UPDATE_MEMBER_CONTRACT_DATES)
  const [loading, setLoading] = useState(false)
  const [orderProducts, setOrderProducts] = useState<OrderProduct[]>([])
  const [startedAt, setStartedAt] = useState<moment.Moment | null>(null)
  const [endedAt, setEndedAt] = useState<moment.Moment | null>(null)
  const modalBodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      // 初始化日期
      if (contract.startedAt) {
        setStartedAt(moment(contract.startedAt))
      } else if (contract.values?.startedAt) {
        setStartedAt(moment(contract.values.startedAt))
      } else {
        setStartedAt(moment())
      }

      if (contract.endedAt) {
        setEndedAt(moment(contract.endedAt))
      } else if (contract.values?.endedAt) {
        setEndedAt(moment(contract.values.endedAt))
      } else {
        setEndedAt(moment().add(1, 'year'))
      }

      // 初始化产品列表
      if (contract.values?.orderProducts) {
        const products: OrderProduct[] = contract.values.orderProducts.map((product: any, index: number) => ({
          key: `product-${index}`,
          name: product.name || '',
          product_id: product.product_id || '',
          price: product.price || 0,
          quantity: product.options?.quantity || 1,
          totalPrice: product.totalPrice || product.price || 0,
          started_at: product.started_at,
          ended_at: product.ended_at,
          delivered_at: product.delivered_at,
          options: product.options || {},
        }))
        setOrderProducts(products)
      }
    }
  }, [isOpen, contract])

  const handleSave = async () => {
    try {
      setLoading(true)

      // 將當前合約的 values 保存到 options 中作為快照
      const existingOptions = contract.options || {}
      const existingSnapshots = Array.isArray(existingOptions.snapshots)
        ? existingOptions.snapshots
        : existingOptions.previousValues
        ? [{ values: existingOptions.previousValues, snapshotAt: existingOptions.snapshotAt }]
        : []

      const newSnapshot = {
        values: contract.values,
        snapshotAt: new Date().toISOString(),
        changedBy: {
          memberId: currentMemberId || '',
          name: memberAdmin?.name || '',
          email: memberAdmin?.email || '',
          username: memberAdmin?.username || '',
        },
      }

      const snapshotOptions = {
        ...existingOptions,
        snapshots: [...existingSnapshots, newSnapshot],
      }

      // 更新快照
      await updateMemberContractOptions({
        variables: {
          memberContractId: contract.id,
          options: snapshotOptions,
        },
      })

      // 構建新的 values
      const contractStartedAt = startedAt ? startedAt.format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')
      const contractEndedAt = endedAt ? endedAt.format('YYYY-MM-DD') : moment().add(1, 'year').format('YYYY-MM-DD')

      const newOrderProducts = orderProducts.map(product => ({
        name: product.name,
        product_id: product.product_id,
        price: product.price,
        totalPrice: product.totalPrice,
        started_at: product.started_at || contractStartedAt,
        ended_at: product.ended_at || contractEndedAt,
        delivered_at: product.delivered_at || new Date().toISOString(),
        options: {
          ...product.options,
          quantity: product.quantity,
        },
      }))

      const totalPrice = orderProducts.reduce((sum, product) => sum + product.totalPrice, 0)

      const newValues: ContractValue = {
        ...contract.values,
        orderProducts: newOrderProducts,
        price: totalPrice,
        startedAt: contractStartedAt,
        endedAt: contractEndedAt,
      }

      // 更新合約 values
      await updateMemberContract({
        variables: {
          memberContractId: contract.id,
          values: newValues,
        },
      })

      // 更新合約的 started_at 和 ended_at
      if (startedAt && endedAt) {
        await updateMemberContractDates({
          variables: {
            memberContractId: contract.id,
            startedAt: startedAt.toDate(),
            endedAt: endedAt.toDate(),
          },
        })
      }

      message.success(formatMessage(messages.successfullyChanged))
      onSuccess()
      onClose()
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = () => {
    const newProduct: OrderProduct = {
      key: `product-${Date.now()}`,
      name: '',
      product_id: '',
      price: 0,
      quantity: 1,
      totalPrice: 0,
      options: {},
    }
    setOrderProducts([...orderProducts, newProduct])
  }

  const handleDeleteProduct = (key: string) => {
    setOrderProducts(orderProducts.filter(product => product.key !== key))
  }

  const handleProductChange = (key: string, field: keyof OrderProduct, value: any) => {
    setOrderProducts(
      orderProducts.map(product => {
        if (product.key === key) {
          const updated = { ...product, [field]: value }
          if (field === 'price' || field === 'quantity') {
            updated.totalPrice = (updated.price || 0) * (updated.quantity || 1)
          }
          return updated
        }
        return product
      }),
    )
  }

  const columns = [
    {
      title: formatMessage(messages.productName),
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: OrderProduct) => (
        <Input
          value={text}
          onChange={e => handleProductChange(record.key, 'name', e.target.value)}
          placeholder={formatMessage(messages.productName)}
        />
      ),
    },
    {
      title: formatMessage(messages.productId),
      dataIndex: 'product_id',
      key: 'product_id',
      render: (text: string, record: OrderProduct) => (
        <Input
          value={text}
          onChange={e => handleProductChange(record.key, 'product_id', e.target.value)}
          placeholder={formatMessage(messages.productId)}
        />
      ),
    },
    {
      title: formatMessage(messages.price),
      dataIndex: 'price',
      key: 'price',
      render: (text: number, record: OrderProduct) => (
        <InputNumber
          value={text}
          onChange={value => handleProductChange(record.key, 'price', value || 0)}
          min={0}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: formatMessage(messages.quantity),
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text: number, record: OrderProduct) => (
        <InputNumber
          value={text}
          onChange={value => handleProductChange(record.key, 'quantity', value || 1)}
          min={1}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: formatMessage(messages.totalPrice),
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (text: number) => text.toLocaleString(),
    },
    {
      title: formatMessage(messages.deleteProduct),
      key: 'action',
      render: (_: any, record: OrderProduct) => (
        <Button size="sm" colorScheme="red" variant="ghost" onClick={() => handleDeleteProduct(record.key)}>
          {formatMessage(messages.deleteProduct)}
        </Button>
      ),
    },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{formatMessage(messages.changeContract)}</ModalHeader>
        <ModalCloseButton />
        <ModalBody ref={modalBodyRef}>
          <Flex direction="column" gap="1rem">
            <Form layout="vertical" form={form}>
              <Form.Item label={formatMessage(messages.startedAt)}>
                <DatePicker
                  value={startedAt}
                  onChange={value => setStartedAt(value)}
                  format="YYYY-MM-DD"
                  style={{ width: '100%' }}
                  getPopupContainer={() => modalBodyRef.current || document.body}
                />
              </Form.Item>
              <Form.Item label={formatMessage(messages.endedAt)}>
                <DatePicker
                  value={endedAt}
                  onChange={value => setEndedAt(value)}
                  format="YYYY-MM-DD"
                  style={{ width: '100%' }}
                  disabledDate={current => current && startedAt && current.isBefore(startedAt)}
                  getPopupContainer={() => modalBodyRef.current || document.body}
                />
              </Form.Item>
            </Form>
            <Button onClick={handleAddProduct} colorScheme="primary" variant="outline" size="sm">
              {formatMessage(messages.addProduct)}
            </Button>
            <Table dataSource={orderProducts} columns={columns} pagination={false} scroll={{ y: 400 }} size="small" />
          </Flex>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} mr={3}>
            {formatMessage(messages.cancel)}
          </Button>
          <Button colorScheme="primary" onClick={handleSave} isLoading={loading}>
            {formatMessage(messages.save)}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

const UPDATE_MEMBER_CONTRACT_VALUES = gql`
  mutation UPDATE_MEMBER_CONTRACT_VALUES($memberContractId: uuid!, $values: jsonb!) {
    update_member_contract(where: { id: { _eq: $memberContractId } }, _set: { values: $values }) {
      affected_rows
    }
  }
`

const UPDATE_MEMBER_CONTRACT_OPTIONS = gql`
  mutation UPDATE_MEMBER_CONTRACT_OPTIONS($memberContractId: uuid!, $options: jsonb!) {
    update_member_contract(where: { id: { _eq: $memberContractId } }, _set: { options: $options }) {
      affected_rows
    }
  }
`

const UPDATE_MEMBER_CONTRACT_DATES = gql`
  mutation UPDATE_MEMBER_CONTRACT_DATES($memberContractId: uuid!, $startedAt: timestamptz!, $endedAt: timestamptz!) {
    update_member_contract(
      where: { id: { _eq: $memberContractId } }
      _set: { started_at: $startedAt, ended_at: $endedAt }
    ) {
      affected_rows
    }
  }
`

export default MemberContractChangeModal
