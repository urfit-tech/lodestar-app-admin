import { FileAddOutlined, InfoCircleFilled } from '@ant-design/icons'
import { Box, Flex, HStack, Text } from '@chakra-ui/react'
import { Button, Form } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import { v4 } from 'uuid'
import { handleError } from '../../helpers'
import { useUpsertCardDiscount } from '../../hooks/membershipCard'
import { Card, MembershipCardDiscountModalFieldProps, MembershipCardDiscountProps } from '../../types/membershipCard'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import DiscountFormItem from '../common/FormItem/DiscountFormItem'
import ProductSelector from '../form/ProductSelector'
import membershipCardMessages from './translation'

const MemberShipCardDiscountModal: React.FC<
  AdminModalProps & {
    membershipCardId: string
    model: 'create' | 'update'
    membershipCardDiscount?: MembershipCardDiscountProps
    cardDiscounts: Card['cardDiscounts']
    onRefetch: () => void
  }
> = ({ membershipCardId, model, membershipCardDiscount, cardDiscounts, onRefetch, ...props }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<MembershipCardDiscountModalFieldProps>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<'duplicate' | ''>('')
  const { upsertCardDiscount } = useUpsertCardDiscount()

  const handleSubmit = async (setVisible: React.Dispatch<React.SetStateAction<boolean>>) => {
    const values = form.getFieldsValue()

    if (model === 'update') {
      const found = cardDiscounts?.find(discount => discount.product.productId === values.productId)
      if (found) {
        setError('duplicate')
        return
      }
      setLoading(true)
      try {
        await upsertCardDiscount({
          variables: {
            cardDiscounts: [
              {
                id: membershipCardDiscount?.id,
                card_id: membershipCardId,
                product_id: values.productId,
                type: values?.discount?.type,
                amount: values?.discount?.amount,
              },
            ],
          },
        })
        setError('')
      } catch (err) {
        handleError(err)
      }
    } else if (model === 'create') {
      const found = values.productIds.some(productId =>
        cardDiscounts.some(discount => discount.product.productId === productId),
      )
      if (found) {
        setError('duplicate')
        return
      }
      setLoading(true)
      try {
        values.productIds.map(async productId => {
          await upsertCardDiscount({
            variables: {
              cardDiscounts: [
                {
                  id: v4(),
                  card_id: membershipCardId,
                  product_id: productId,
                  type: values?.discount?.type,
                  amount: values?.discount?.amount,
                },
              ],
            },
          })
        })
        setError('')
        form.resetFields()
      } catch (err) {
        handleError(err)
      }
    }
    onRefetch()
    setLoading(false)
    setVisible(false)
  }

  return (
    <AdminModal
      maskClosable={false}
      footer={null}
      onCancel={() => {
        form.resetFields()
      }}
      renderFooter={({ setVisible }) => (
        <Flex justifyContent={error !== '' ? 'space-between' : 'flex-end'} alignItems="center">
          {error === 'duplicate' && (
            <HStack color={'var(--error)'} spacing="8px" alignItems="center">
              <InfoCircleFilled />
              <Text fontSize="sm">{formatMessage(membershipCardMessages.MembershipCardDiscount.duplicateError)}</Text>
            </HStack>
          )}
          <Box>
            <Button
              className="mr-2"
              onClick={() => {
                form.resetFields()
                setVisible(false)
              }}
            >
              {formatMessage(membershipCardMessages.MembershipCardDiscount.cancel)}
            </Button>
            <Button type="primary" loading={loading} onClick={() => handleSubmit(setVisible)}>
              {formatMessage(membershipCardMessages.MembershipCardDiscount.confirm)}
            </Button>
          </Box>
        </Flex>
      )}
      icon={<FileAddOutlined />}
      title={formatMessage(membershipCardMessages.MembershipCardDiscount.discountTerms)}
      {...props}
    >
      <Form
        form={form}
        layout="vertical"
        colon={false}
        hideRequiredMark
        initialValues={{
          discount: {
            type: membershipCardDiscount?.type || 'cash',
            amount: membershipCardDiscount?.amount || 0,
          },
          productId: membershipCardDiscount?.product.productId,
          scope: {
            productIds: membershipCardDiscount?.product.productId ? [membershipCardDiscount?.product.productId] : [],
          },
        }}
      >
        <DiscountFormItem displayMode={'membershipCard'} />
        <Form.Item
          label={formatMessage(membershipCardMessages.MembershipCardDiscount.discountScope)}
          name={model === 'create' ? 'productIds' : 'productId'}
        >
          <ProductSelector
            onlyValid={true}
            multiple={model === 'create' ? true : false}
            allowTypes={[
              'ProgramPlan',
              'ProgramPackagePlan',
              'ActivityTicket',
              'PodcastProgram',
              'PodcastPlan',
              'AppointmentPlan',
              'MerchandiseSpec',
              'ProjectPlan',
            ]}
            onChange={value => {
              if (error === 'duplicate' && !!Array.isArray(value)) {
                if (!value.some(v => cardDiscounts.some(discount => discount.product.productId === v))) {
                  setError('')
                }
              } else if (error === 'duplicate' && typeof value === 'string') {
                if (!cardDiscounts?.find(discount => discount.product.productId === value)) {
                  setError('')
                }
              }
            }}
          />
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

export default MemberShipCardDiscountModal
