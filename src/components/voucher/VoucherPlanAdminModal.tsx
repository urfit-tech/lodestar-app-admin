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
import CategorySelector from '../form/CategorySelector'
import voucherMessages from './translation'

export type VoucherPlanFields = {
  title: string
  categoryId?: string
  voucherCodes?: PlanCodeProps[]
  voucherPlanProducts: string[]
  productQuantityLimit: number
  startedAt?: Date
  endedAt?: Date
  description: string
  isTransferable: boolean
  sale?: { amount: number; price: number }
  pinCode: string
  bonusCoins: { amount: number; endedAt?: Date | null }
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
          title: voucherPlan?.title || '',
          voucherPlanProducts: voucherPlan?.productIds || [],
          productQuantityLimit: voucherPlan?.productQuantityLimit || 1,
          startedAt: voucherPlan?.startedAt ? moment(voucherPlan.startedAt) : null,
          endedAt: voucherPlan?.endedAt ? moment(voucherPlan.endedAt) : null,
          description: voucherPlan?.description || '',
          isTransferable: !!voucherPlan?.isTransferable,
          sale: voucherPlan?.sale,
          pinCode: voucherPlan?.pinCode,
          bonusCoins: voucherPlan?.bonusCoins,
          categoryId: voucherPlan?.category?.id,
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

        <Form.Item label={formatMessage(voucherMessages.VoucherPlanAdminModal.voucherCategory)} name="categoryId">
          <CategorySelector classType="voucher" single={true} />
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
            allowTypes={[
              'ProgramPlan',
              'ProgramPackagePlan',
              'ActivityTicket',
              'PodcastProgram',
              'Card',
              'ProjectPlan',
              'GeneralVirtualMerchandiseSpec',
            ]}
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

        {enabledModules.voucher_pin_code ? (
          <Form.Item
            name="pinCode"
            rules={[
              {
                validator: async (_, pinCode) => {
                  if (typeof pinCode === 'string' && pinCode.length <= 0) {
                    return Promise.reject(
                      new Error(formatMessage(voucherMessages.VoucherPlanAdminModal.pinCodePlaceholder)),
                    )
                  }
                },
              },
              {
                min: 4,
                message: formatMessage(voucherMessages.VoucherPlanAdminModal.pinCodePlaceholder),
              },
              { max: 6, message: formatMessage(voucherMessages.VoucherPlanAdminModal.pinCodePlaceholder) },
            ]}
          >
            <PinCodeInput />
          </Form.Item>
        ) : null}

        {enabledModules.coin && enabledModules.coin_back ? (
          <Form.Item name="bonusCoins">
            <BonusCoinsInput />
          </Form.Item>
        ) : null}

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
            addonAfter={formatMessage(voucherMessages.VoucherPlanAdminModal.amount)}
          />
          <Input
            value={value.price}
            onChange={e => onChange?.({ ...value, price: Number(e.target.value) || 0 })}
            addonAfter={formatMessage(voucherMessages.VoucherPlanAdminModal.price)}
          />
        </Input.Group>
      )}
    </div>
  )
}

const PinCodeInput: React.VFC<{
  value?: string | null
  onChange?: (value?: string | null) => void
}> = ({ value, onChange }) => {
  const { formatMessage } = useIntl()

  return (
    <div>
      <Checkbox
        className="mb-2"
        checked={typeof value === 'string'}
        onChange={e => {
          if (e.target.checked) {
            onChange?.('')
          } else {
            onChange?.(undefined)
          }
        }}
      >
        {formatMessage(voucherMessages.VoucherPlanAdminModal.exchangePinCode)}
      </Checkbox>

      {typeof value === 'string' && (
        <Input
          placeholder={formatMessage(voucherMessages.VoucherPlanAdminModal.pinCodePlaceholder)}
          value={value}
          onChange={e => {
            if (isNaN(Number(e.target.value)) || e.target.value.length > 6) return
            onChange?.(e.target.value)
          }}
        />
      )}
    </div>
  )
}

const BonusCoinsInput: React.VFC<{
  value?: { amount: number; endedAt: Date } | null
  onChange?: (value?: { amount?: number; endedAt?: Date | null } | null) => void
}> = ({ value, onChange }) => {
  const { formatMessage } = useIntl()

  return (
    <div>
      <Checkbox
        className="mb-2"
        checked={value ? true : false}
        onChange={e => {
          if (e.target.checked) {
            onChange?.({})
          } else {
            onChange?.(null)
          }
        }}
      >
        {formatMessage(voucherMessages.VoucherPlanAdminModal.exchangeBonusCoins)}
      </Checkbox>

      {value ? (
        <div className="mt-2">
          <InputNumber
            className="d-inline-block mr-4"
            placeholder={formatMessage(voucherMessages.VoucherPlanAdminModal.bonusCoinAmount)}
            min={1}
            value={value.amount}
            onChange={v => {
              if (typeof v === 'number' && v > 0) {
                onChange?.({ ...value, amount: v })
              }
            }}
          />

          <DatePicker
            className="d-inline-block"
            value={value.endedAt ? moment(value.endedAt) : null}
            format="YYYY-MM-DD HH:mm"
            showTime={{ defaultValue: moment('23:59:59', 'HH:mm:ss') }}
            placeholder={formatMessage(voucherMessages.VoucherPlanAdminModal.bonusCoinsEndedAt)}
            onChange={v => {
              v ? onChange?.({ ...value, endedAt: v.toDate() }) : onChange?.({ ...value, endedAt: null })
            }}
          />
        </div>
      ) : null}
    </div>
  )
}

export default VoucherPlanAdminModal
