import { Button, Checkbox, DatePicker, Form, Input, InputNumber, message } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import moment from 'moment'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import ProductSelector from '../../components/form/ProductSelector'
import { handleError } from '../../helpers'
import { useMutateVoucherPlan } from '../../hooks/checkout'
import { VoucherPlanProps } from '../../types/checkout'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import PlanCodeSelector, { PlanCodeProps } from '../checkout/PlanCodeSelector'
import voucherMessages from './translation'

export type VoucherPlanFields = {
  title: string
  voucherCodes?: PlanCodeProps[]
  voucherPlanProducts: string[]
  productQuantityLimit: number
  startedAt?: Date
  endedAt?: Date
  description: string
  isTransferable: boolean
  sale?: { amount: number; price: number }
  editorId: string
}

const VoucherPlanAdminModal: React.FC<
  AdminModalProps & {
    voucherPlan?: VoucherPlanProps
    onRefetch?: () => void
  }
> = ({ voucherPlan, onRefetch, ...props }) => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useApp()
  const [form] = useForm<VoucherPlanFields>()
  const [loading, setLoading] = useState(false)
  const { insertVoucherPlan, updateVoucherPlan } = useMutateVoucherPlan()

  const handleSubmit = (setVisible: React.Dispatch<React.SetStateAction<boolean>>) => {
    form
      .validateFields()
      .then(() => {
        setLoading(true)
        const values = form.getFieldsValue()
        if (voucherPlan) {
          updateVoucherPlan(values, voucherPlan.id)
            .then(() => {
              message.success(formatMessage(voucherMessages.VoucherPlanAdminModal.successfullySaved))
              setVisible(false)
              onRefetch?.()
            })
            .catch(handleError)
            .finally(() => setLoading(false))
        } else {
          insertVoucherPlan(values)
            .then(() => {
              message.success(formatMessage(voucherMessages.VoucherPlanAdminModal.successfullyCreated))
              setVisible(false)
              onRefetch?.()
            })
            .catch(error => {
              if (/^GraphQL error: Uniqueness violation/.test(error.message)) {
                message.error(formatMessage(voucherMessages.VoucherPlanAdminModal.duplicateVoucherCode))
              } else {
                handleError(error)
              }
            })
            .finally(() => setLoading(false))
        }
      })
      .catch(() => {})
  }

  return (
    <AdminModal
      destroyOnClose
      footer={null}
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={() => setVisible(false)}>
            {formatMessage(voucherMessages['*'].cancel)}
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleSubmit(setVisible)}>
            {formatMessage(voucherMessages['*'].confirm)}
          </Button>
        </>
      )}
      maskClosable={false}
      {...props}
    >
      <Form
        form={form}
        layout="vertical"
        colon={false}
        hideRequiredMark
        initialValues={{
          title: voucherPlan?.title,
          voucherPlanProducts: voucherPlan?.productIds || [],
          productQuantityLimit: voucherPlan?.productQuantityLimit || 1,
          startedAt: voucherPlan?.startedAt ? moment(voucherPlan.startedAt) : null,
          endedAt: voucherPlan?.endedAt ? moment(voucherPlan.endedAt) : null,
          description: voucherPlan?.description,
          isTransferable: !!voucherPlan?.isTransferable,
          sale: voucherPlan?.sale,
        }}
      >
        <Form.Item
          label={formatMessage(voucherMessages.VoucherPlanAdminModal.voucherPlanTitle)}
          name="title"
          rules={[
            {
              required: true,
              message: formatMessage(voucherMessages['*'].isRequired, {
                field: formatMessage(voucherMessages.VoucherPlanAdminModal.voucherPlanTitle),
              }),
            },
          ]}
        >
          <Input />
        </Form.Item>

        {!voucherPlan && (
          <Form.Item
            label={formatMessage(voucherMessages.VoucherPlanAdminModal.voucherCodes)}
            name="voucherCodes"
            rules={[
              {
                required: true,
                message: formatMessage(voucherMessages.VoucherPlanAdminModal.errorVoucherCodes),
              },
            ]}
          >
            <PlanCodeSelector planType="voucher" />
          </Form.Item>
        )}

        <Form.Item
          label={formatMessage(voucherMessages.VoucherPlanAdminModal.exchangeItems)}
          name="voucherPlanProducts"
          rules={[
            {
              required: true,
              message: formatMessage(voucherMessages.VoucherPlanAdminModal.errorExchangeItems),
            },
          ]}
        >
          <ProductSelector
            multiple
            allowTypes={['ProgramPlan', 'ProgramPackagePlan', 'ActivityTicket', 'PodcastProgram', 'Card']}
          />
        </Form.Item>

        <Form.Item
          label={formatMessage(voucherMessages.VoucherPlanAdminModal.exchangeItemsAmount)}
          name="productQuantityLimit"
          rules={[
            {
              required: true,
              message: formatMessage(voucherMessages.VoucherPlanAdminModal.errorExchangeItemsAmount),
            },
          ]}
        >
          <InputNumber min={1} />
        </Form.Item>
        <Form.Item name="isTransferable" valuePropName="checked" noStyle={!enabledModules.transfer_voucher}>
          {enabledModules.transfer_voucher && (
            <Checkbox>{formatMessage(voucherMessages.VoucherPlanAdminModal.isTransferable)}</Checkbox>
          )}
        </Form.Item>

        {enabledModules.sale_voucher && (
          <Form.Item name="sale" noStyle={!enabledModules.sale_voucher}>
            <SaleVoucherInput />
          </Form.Item>
        )}
        <Form.Item label={formatMessage(voucherMessages.VoucherPlanAdminModal.availableDateRange)}>
          <Form.Item className="d-inline-block m-0" name="startedAt">
            <DatePicker
              format="YYYY-MM-DD HH:mm"
              showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
              placeholder={formatMessage(voucherMessages.VoucherPlanAdminModal.startedAt)}
            />
          </Form.Item>
          <span className="d-inline-block px-2">-</span>
          <Form.Item className="d-inline-block m-0" name="endedAt">
            <DatePicker
              format="YYYY-MM-DD HH:mm"
              showTime={{ defaultValue: moment('23:59:59', 'HH:mm:ss') }}
              placeholder={formatMessage(voucherMessages.VoucherPlanAdminModal.endedAt)}
            />
          </Form.Item>
        </Form.Item>
        <Form.Item label={formatMessage(voucherMessages.VoucherPlanAdminModal.description)} name="description">
          <Input.TextArea rows={4} placeholder={formatMessage(voucherMessages.VoucherPlanAdminModal.optional)} />
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

const SaleVoucherInput: React.VFC<{
  value?: { amount: number; price: number }
  onChange?: (value?: { amount: number; price: number }) => void
}> = ({ value, onChange }) => {
  const { formatMessage } = useIntl()
  const saleable = !!value?.amount
  return (
    <div>
      <Checkbox
        className="mb-2"
        checked={saleable}
        onChange={e => onChange?.(e.target.checked ? { amount: 1, price: 0 } : undefined)}
      >
        {formatMessage(voucherMessages.VoucherPlanAdminModal.isSaleable)}
      </Checkbox>
      {saleable && (
        <Input.Group>
          <Input
            value={value.amount}
            onChange={e => onChange?.({ ...value, amount: Number(e.target.value) || 1 })}
            addonAfter="張"
          />
          <Input
            value={value.price}
            onChange={e => onChange?.({ ...value, price: Number(e.target.value) || 0 })}
            addonAfter="元"
          />
        </Input.Group>
      )}
    </div>
  )
}

export default VoucherPlanAdminModal
