import { FileAddOutlined } from '@ant-design/icons'
import { gql, useMutation } from '@apollo/client'
import { Spinner } from '@chakra-ui/react'
import { Button, Checkbox, Form, Input, InputNumber, Radio } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { ModalProps } from 'antd/lib/modal'
import BraftEditor, { EditorState } from 'braft-editor'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages, programMessages } from '../../helpers/translation'
import { useMutateProductLevel, useProductLevel } from '../../hooks/data'
import { PeriodType } from '../../types/general'
import { ProgramPackagePlanProps } from '../../types/programPackage'
import AdminModal from '../admin/AdminModal'
import AdminBraftEditor from '../form/AdminBraftEditor'
import PeriodSelector from '../form/PeriodSelector'
import SaleInput, { SaleProps } from '../form/SaleInput'
import ProgramPeriodTypeDropdown from '../program/ProgramPeriodTypeDropdown'
import programPackageMessages from './translation'

const messages = defineMessages({
  allowTempoDelivery: { id: 'programPackage.ui.allowTempoDelivery', defaultMessage: '啟用節奏交付' },
  isPublished: { id: 'programPackage.label.isPublished', defaultMessage: '是否開賣' },
  publish: { id: 'programPackage.ui.publish', defaultMessage: '發售，課程組合上架後立即開賣' },
  unpublish: { id: 'programPackage.ui.unpublish', defaultMessage: '停售，此方案暫停對外銷售，並從課程組合中隱藏' },
  isParticipantsVisible: { id: 'programPackage.ui.isParticipantsVisible', defaultMessage: '購買人數' },
  visible: { id: 'programPackage.ui.visible', defaultMessage: '顯示' },
  invisible: { id: 'programPackage.ui.invisible', defaultMessage: '隱藏' },
  paymentType: { id: 'programPackage.label.paymentType', defaultMessage: '付費類型' },
  perpetual: { id: 'programPackage.label.perpetual', defaultMessage: '單次' },
  subscription: { id: 'programPackage.ui.subscription', defaultMessage: '訂閱' },
  perpetualPeriod: { id: 'programPackage.label.perpetualPeriod', defaultMessage: '觀看期限' },
  subscriptionPeriod: { id: 'programPackage.label.subscriptionPeriod', defaultMessage: '訂閱週期' },

  permissionType: { id: 'program.label.permissionType', defaultMessage: '選擇內容觀看權限' },
  availableForPastContent: { id: 'program.label.availableForPastContent', defaultMessage: '可看過去內容' },
  unavailableForPastContent: { id: 'program.label.unavailableForPastContent', defaultMessage: '不可看過去內容' },
  subscriptionPeriodType: { id: 'program.label.subscriptionPeriodType', defaultMessage: '訂閱週期' },
  salePriceNotation: {
    id: 'program.text.salePriceNotation',
    defaultMessage: '購買到優惠價的會員，往後每期皆以優惠價收款',
  },
  discountDownNotation: {
    id: 'program.text.discountDownNotation',
    defaultMessage: '定價或優惠價 - 首期折扣 = 首期支付金額\nEX：100 - 20 = 80，此欄填入 20',
  },
  planDescription: { id: 'program.label.planDescription', defaultMessage: '方案描述' },
  programPackageExpirationNotice: {
    id: 'program.ProgramPlanAdminModal.programExpirationNotice',
    defaultMessage: '課程到期通知',
  },
})

type FieldProps = {
  title: string
  isTempoDelivery: boolean
  isPublished: boolean
  isParticipantsVisible: boolean
  isSubscription: boolean
  periodAmount: number
  periodType: PeriodType
  listPrice: number
  sale: SaleProps
  discountDownPrice?: number
  description: EditorState
  productLevel?: number
  remindPeriod: { type: PeriodType; amount: number }
}

type ProgramPackagePlanType = 'perpetual' | 'period' | 'subscription'
const ProgramPackagePlanAdminModal: React.FC<
  ModalProps & {
    programPackageId: string
    plan?: ProgramPackagePlanProps
    onRefetch?: () => void
    renderTrigger?: React.FC<{
      setVisible?: React.Dispatch<React.SetStateAction<boolean>>
      setProgramPackagePlanType?: (programPackagePlanType: ProgramPackagePlanType) => void
    }>
  }
> = ({ programPackageId, plan, onRefetch, renderTrigger, ...modalProps }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { enabledModules } = useApp()
  const [insertProgramPackagePlan] = useMutation<
    hasura.INSERT_PROGRAM_PACKAGE_PLAN,
    hasura.INSERT_PROGRAM_PACKAGE_PLANVariables
  >(INSERT_PROGRAM_PACKAGE_PLAN)
  const { loading: loadingProductLevel, productLevel } = useProductLevel(`ProgramPackagePlan_${plan?.id}`)
  const { updateProductLevel } = useMutateProductLevel()

  const [loading, setLoading] = useState(false)

  const [programPackagePlanType, setProgramPackagePlanType] = useState<ProgramPackagePlanType>(
    plan?.isSubscription ? 'subscription' : plan?.periodType && plan?.periodAmount ? 'period' : 'perpetual',
  )
  const [withDiscountDownPrice, setWithDiscountDownPrice] = useState(!!plan?.discountDownPrice)
  const [withRemindToggle, setWithRemindToggle] = useState(!!plan?.remindPeriodType)

  const withPeriod = programPackagePlanType === 'period' || programPackagePlanType === 'subscription'
  const withRemind = programPackagePlanType === 'period' || programPackagePlanType === 'subscription'
  const isSubscription = programPackagePlanType === 'subscription'

  const handleSubmit = (setVisible: React.Dispatch<React.SetStateAction<boolean>>) => {
    form
      .validateFields()
      .then(() => {
        setLoading(true)
        const values: FieldProps = form.getFieldsValue()

        insertProgramPackagePlan({
          variables: {
            data: {
              id: plan?.id,
              title: values.title || '',
              is_tempo_delivery: values.isTempoDelivery,
              published_at: values.isPublished ? new Date() : null,
              is_subscription: isSubscription,
              is_participants_visible: values.isParticipantsVisible,
              period_amount: values.periodAmount,
              period_type: values.periodType,
              list_price: values.listPrice,
              sale_price: values.sale ? values.sale.price : null,
              sold_at: values.sale?.soldAt || null,
              discount_down_price: withDiscountDownPrice ? values.discountDownPrice : null,
              description: values.description?.getCurrentContent().hasText() ? values.description.toRAW() : null,
              position: plan?.position || -1,
              program_package_id: programPackageId,
              remind_period_amount: withRemind && withRemindToggle ? values.remindPeriod.amount : null,
              remind_period_type: withRemind && withRemindToggle ? values.remindPeriod.type : null,
            },
          },
        })
          .then(res => {
            const programPackagePlanId = res.data?.insert_program_package_plan?.returning?.[0].id
            if (enabledModules.product_level && programPackagePlanId) {
              updateProductLevel({
                variables: { productId: `ProgramPackagePlan_${programPackagePlanId}`, level: values.productLevel },
              }).catch(e => handleError(e))
            }

            setVisible && setVisible(false)
            onRefetch?.()
          })
          .catch(handleError)
          .finally(() => setLoading(false))
      })
      .catch(() => {})
  }

  return (
    <AdminModal
      icon={<FileAddOutlined />}
      footer={null}
      renderFooter={({ setVisible }) => (
        <div>
          <Button
            className="mr-2"
            onClick={() => {
              setVisible(false)
              form.resetFields()
            }}
          >
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleSubmit(setVisible)}>
            {formatMessage(commonMessages.ui.save)}
          </Button>
        </div>
      )}
      renderTrigger={({ setVisible }) => {
        return (
          renderTrigger?.({
            setProgramPackagePlanType: programPackagePlanType => setProgramPackagePlanType(programPackagePlanType),
            setVisible: setVisible,
          }) || null
        )
      }}
      {...modalProps}
    >
      <Form
        form={form}
        layout="vertical"
        colon={false}
        hideRequiredMark
        initialValues={{
          title: plan?.title || '',
          isTempoDelivery: !!plan?.isTempoDelivery,
          isPublished: !!plan?.publishedAt,
          isParticipantsVisible: !!plan?.isParticipantsVisible,
          periodAmount: plan?.periodAmount || 1,
          periodType: plan?.periodType || 'M',
          listPrice: plan?.listPrice || 0,
          sale: plan?.soldAt
            ? {
                price: plan.salePrice,
                soldAt: plan.soldAt,
              }
            : null,

          discountDownPrice: plan?.discountDownPrice || null,
          description: BraftEditor.createEditorState(plan?.description),
          productLevel: productLevel,
          remindPeriod: { amount: plan?.remindPeriodAmount || 1, type: plan?.remindPeriodType || 'D' },
        }}
      >
        <Form.Item
          label={formatMessage(programMessages.label.planTitle)}
          name="title"
          rules={[
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(programMessages.label.planTitle),
              }),
            },
          ]}
        >
          <Input />
        </Form.Item>

        {enabledModules.tempo_delivery && (
          <Form.Item name="isTempoDelivery" valuePropName="checked">
            <Checkbox>{formatMessage(messages.allowTempoDelivery)}</Checkbox>
          </Form.Item>
        )}

        <Form.Item label={formatMessage(messages.isPublished)} name="isPublished">
          <Radio.Group>
            <Radio value={true} className="d-flex">
              {formatMessage(messages.publish)}
            </Radio>
            <Radio value={false} className="d-flex">
              {formatMessage(messages.unpublish)}
            </Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item label={formatMessage(messages.isParticipantsVisible)} name="isParticipantsVisible">
          <Radio.Group>
            <Radio value={true} className="d-block">
              {formatMessage(messages.visible)}
            </Radio>
            <Radio value={false} className="d-block">
              {formatMessage(messages.invisible)}
            </Radio>
          </Radio.Group>
        </Form.Item>

        {withRemind && (
          <div>
            <Checkbox checked={withRemindToggle} className="mb-2" onChange={e => setWithRemindToggle(e.target.checked)}>
              {formatMessage(messages.programPackageExpirationNotice)}
            </Checkbox>
            {withRemindToggle && (
              <Form.Item name="remindPeriod">
                <PeriodSelector />
              </Form.Item>
            )}
          </div>
        )}

        {withPeriod && (
          <Form.Item
            label={
              isSubscription ? formatMessage(messages.subscriptionPeriod) : formatMessage(messages.perpetualPeriod)
            }
            className="mb-0"
          >
            <Form.Item className="d-inline-block mr-2" name="periodAmount">
              <InputNumber min={0} parser={value => (value ? value.replace(/\D/g, '') : '')} />
            </Form.Item>
            <Form.Item className="d-inline-block mr-2" name="periodType">
              <ProgramPeriodTypeDropdown isShortenPeriodType />
            </Form.Item>
          </Form.Item>
        )}

        {enabledModules.product_level ? (
          loadingProductLevel ? (
            <Spinner />
          ) : (
            <Form.Item
              label={formatMessage(programPackageMessages.ProgramPackagePlanAdminModal.productLevel)}
              name="productLevel"
            >
              <InputNumber />
            </Form.Item>
          )
        ) : null}

        <Form.Item label={formatMessage(commonMessages.label.listPrice)} name="listPrice">
          <InputNumber
            min={0}
            formatter={value => `NT$ ${value}`}
            parser={value => (value ? value.replace(/\D/g, '') : '')}
          />
        </Form.Item>

        <Form.Item
          name="sale"
          rules={[{ validator: (rule, value, callback) => callback(value && !value.soldAt ? '' : undefined) }]}
        >
          <SaleInput />
        </Form.Item>

        {isSubscription && (
          <>
            <div className="mb-4">
              <Checkbox
                defaultChecked={withDiscountDownPrice}
                onChange={e => setWithDiscountDownPrice(e.target.checked)}
              >
                {formatMessage(commonMessages.label.discountDownPrice)}
              </Checkbox>
              {withDiscountDownPrice && (
                <div className="notation">{formatMessage(commonMessages.text.discountDownNotation)}</div>
              )}
            </div>

            <Form.Item className={withDiscountDownPrice ? 'm-0' : 'd-none'}>
              <Form.Item name="discountDownPrice" className="d-inline-block mr-2">
                <InputNumber
                  min={0}
                  formatter={value => `NT$ ${value}`}
                  parser={value => (value ? value.replace(/\D/g, '') : '')}
                />
              </Form.Item>
            </Form.Item>
          </>
        )}

        <Form.Item label={formatMessage(messages.planDescription)} name="description">
          <AdminBraftEditor variant="short" />
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

const INSERT_PROGRAM_PACKAGE_PLAN = gql`
  mutation INSERT_PROGRAM_PACKAGE_PLAN($data: program_package_plan_insert_input!) {
    insert_program_package_plan(
      objects: [$data]
      on_conflict: {
        constraint: program_package_plan_pkey
        update_columns: [
          title
          is_tempo_delivery
          is_subscription
          is_participants_visible
          published_at
          period_amount
          period_type
          list_price
          sale_price
          sold_at
          discount_down_price
          description
          position
        ]
      }
    ) {
      affected_rows
      returning {
        id
      }
    }
  }
`

export default ProgramPackagePlanAdminModal
