import { useMutation } from '@apollo/react-hooks'
import { Button, Checkbox, DatePicker, Icon, Input, InputNumber, Radio } from 'antd'
import Form, { FormComponentProps } from 'antd/lib/form'
import BraftEditor from 'braft-editor'
import gql from 'graphql-tag'
import moment from 'moment-timezone'
import React, { useContext, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import AppContext from '../../contexts/AppContext'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages, programMessages } from '../../helpers/translation'
import types from '../../types'
import { ProgramPackagePlanProps } from '../../types/programPackage'
import AdminBraftEditor from '../admin/AdminBraftEditor'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import ProgramPeriodTypeDropdown from '../program/ProgramPeriodTypeDropdown'

const messages = defineMessages({
  allowTempoDelivery: { id: 'programPackage.ui.allowTempoDelivery', defaultMessage: '啟用節奏交付' },
  isPublished: { id: 'programPackage.label.isPublished', defaultMessage: '是否開賣' },
  publish: { id: 'programPackage.ui.publish', defaultMessage: '發售，課程組合上架後立即開賣' },
  unpublish: { id: 'programPackage.ui.unpublish', defaultMessage: '停售，此方案暫停對外銷售，並從課程組合中隱藏' },
  paymentType: { id: 'programPackage.label.paymentType', defaultMessage: '付費類型' },
  perpetual: { id: 'programPackage.label.perpetual', defaultMessage: '單次' },
  subscription: { id: 'programPackage.ui.subscription', defaultMessage: '訂閱' },
  perpetualPeriod: { id: 'programPackage.label.perpetualPeriod', defaultMessage: '觀看期限' },
  subscriptionPeriod: { id: 'programPackage.lable.subscriptionPeriod', defaultMessage: '訂閱週期' },

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
})

const StyledForm = styled(Form)`
  .ant-form-item-label {
    line-height: 2;
  }

  .notation {
    line-height: 1.5;
    letter-spacing: 0.4px;
    font-size: 14px;
    font-weight: 500;
    color: #9b9b9b;
    white-space: pre-line;

    span {
      display: block;
    }
  }
`
const StyledIcon = styled(Icon)`
  color: #ff7d62;
`

const radioStyle = {
  display: 'block',
  height: '30px',
  lineHeight: '30px',
}

type ProgramPackagePlanAdminModalProps = AdminModalProps &
  FormComponentProps & {
    programPackageId: string
    plan?: ProgramPackagePlanProps
    onRefetch?: () => void
  }

const ProgramPackagePlanAdminModal: React.FC<ProgramPackagePlanAdminModalProps> = ({
  programPackageId,
  plan,
  onRefetch,
  form: { validateFields, getFieldDecorator, resetFields, getFieldValue },
  ...modalProps
}) => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useContext(AppContext)
  const [insertProgramPackagePlan] = useMutation<
    types.INSERT_PROGRAM_PACKAGE_PLAN,
    types.INSERT_PROGRAM_PACKAGE_PLANVariables
  >(INSERT_PROGRAM_PACKAGE_PLAN)

  const [withSalePrice, setWithSalePrice] = useState(typeof plan?.salePrice === 'number')
  const [withDiscountDownPrice, setWithDiscountDownPrice] = useState(typeof plan?.discountDownPrice === 'number')
  const [isSubscription, setSubscription] = useState(!!plan?.isSubscription)
  const [isLoading, setLoading] = useState(false)

  const handleSubmit = (onVisible: React.Dispatch<React.SetStateAction<boolean>>) => {
    validateFields(
      (
        error,
        {
          title,
          isTempoDelivery,
          isPublish,
          isSubscription,
          periodAmount,
          periodType,
          listPrice,
          salePrice,
          soldAt,
          discountDownPrice,
          description,
        },
      ) => {
        if (error) {
          return
        }

        setLoading(true)

        insertProgramPackagePlan({
          variables: {
            data: {
              id: plan?.id,
              title,
              is_tempo_delivery: isTempoDelivery,
              published_at: isPublish ? new Date() : null,
              is_subscription: isSubscription,
              period_amount: periodAmount,
              period_type: periodType,
              list_price: listPrice,
              sale_price: withSalePrice ? salePrice : null,
              sold_at: withSalePrice ? soldAt.toDate() : null,
              discount_down_price: withDiscountDownPrice ? discountDownPrice : null,
              description: description.toRAW(),
              position: plan?.position || -1,
              program_package_id: programPackageId,
            },
          },
        })
          .then(() => {
            onRefetch && onRefetch()
            onVisible && onVisible(false)
            resetFields()
          })
          .catch(handleError)
          .finally(() => setLoading(false))
      },
    )
  }

  return (
    <AdminModal
      icon={<Icon type="file-add" />}
      footer={null}
      destroyOnClose
      renderFooter={({ setVisible }) => (
        <div>
          <Button
            onClick={() => {
              setVisible(false)
              resetFields()
            }}
            className="mr-2"
          >
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" loading={isLoading} onClick={() => handleSubmit(setVisible)}>
            {formatMessage(commonMessages.ui.save)}
          </Button>
        </div>
      )}
      {...modalProps}
    >
      <StyledForm hideRequiredMark>
        <Form.Item label={formatMessage(programMessages.label.planTitle)} className="mb-0">
          {getFieldDecorator('title', {
            initialValue: plan?.title ?? '',
            rules: [
              {
                required: true,
                message: formatMessage(errorMessages.form.isRequired, {
                  field: formatMessage(programMessages.label.planTitle),
                }),
              },
            ],
          })(<Input />)}
        </Form.Item>

        {enabledModules.tempo_delivery && (
          <Form.Item>
            {getFieldDecorator('isTempoDelivery', { initialValue: !!plan?.isTempoDelivery, valuePropName: 'checked' })(
              <Checkbox>{formatMessage(messages.allowTempoDelivery)}</Checkbox>,
            )}
          </Form.Item>
        )}

        <Form.Item label={formatMessage(messages.isPublished)}>
          {getFieldDecorator('isPublish', {
            initialValue: plan ? !!plan.publishedAt : true,
          })(
            <Radio.Group>
              <Radio value={true} style={radioStyle}>
                {formatMessage(messages.publish)}
              </Radio>
              <Radio value={false} style={radioStyle}>
                {formatMessage(messages.unpublish)}
              </Radio>
            </Radio.Group>,
          )}
        </Form.Item>

        <Form.Item label={formatMessage(messages.paymentType)}>
          {getFieldDecorator('isSubscription', {
            initialValue: !!plan?.isSubscription,
            rules: [{ required: true }],
          })(
            <Radio.Group onChange={e => setSubscription(e.target.value)}>
              <Radio value={false} style={radioStyle}>
                {formatMessage(messages.perpetual)}
              </Radio>
              <Radio value={true} style={radioStyle}>
                {formatMessage(messages.subscription)}
              </Radio>
            </Radio.Group>,
          )}
        </Form.Item>

        <Form.Item
          label={isSubscription ? formatMessage(messages.subscriptionPeriod) : formatMessage(messages.perpetualPeriod)}
          className="mb-0"
        >
          <Form.Item className="d-inline-block mr-2">
            {getFieldDecorator('periodAmount', { initialValue: plan?.periodAmount || 1 })(
              <InputNumber min={0} parser={value => (value ? value.replace(/\D/g, '') : '')} />,
            )}
          </Form.Item>
          <Form.Item className="d-inline-block mr-2">
            {getFieldDecorator('periodType', { initialValue: plan?.periodType || 'M' })(
              <ProgramPeriodTypeDropdown isShortenPeriodType />,
            )}
          </Form.Item>
        </Form.Item>

        <Form.Item label={formatMessage(commonMessages.term.listPrice)}>
          {getFieldDecorator('listPrice', { initialValue: plan?.listPrice || 0 })(
            <InputNumber
              min={0}
              formatter={value => `NT$ ${value}`}
              parser={value => (value ? value.replace(/\D/g, '') : '')}
            />,
          )}
        </Form.Item>

        <div className="mb-4">
          <Checkbox defaultChecked={withSalePrice} onChange={e => setWithSalePrice(e.target.checked)}>
            {formatMessage(commonMessages.term.salePrice)}
          </Checkbox>
        </div>
        <Form.Item className={withSalePrice ? 'm-0' : 'd-none'}>
          <Form.Item className="d-inline-block mr-2">
            {getFieldDecorator('salePrice', { initialValue: plan?.salePrice || 0 })(
              <InputNumber
                min={0}
                formatter={value => `NT$ ${value}`}
                parser={value => (value ? value.replace(/\D/g, '') : '')}
              />,
            )}
          </Form.Item>
          <Form.Item className="d-inline-block mr-2">
            {getFieldDecorator('soldAt', {
              initialValue: plan?.soldAt ? moment(plan.soldAt) : null,
              rules: [
                {
                  required: withSalePrice,
                  message: formatMessage(errorMessages.form.date),
                },
              ],
            })(<DatePicker placeholder={formatMessage(commonMessages.label.salePriceEndTime)} />)}
          </Form.Item>
          {getFieldValue('soldAt') && moment(getFieldValue('soldAt')).isBefore(moment()) && (
            <div className="d-inline-block">
              <StyledIcon type="exclamation-circle" theme="filled" className="mr-1" />
              <span>{formatMessage(commonMessages.label.outdated)}</span>
            </div>
          )}
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
            </div>

            <Form.Item className={withDiscountDownPrice ? 'm-0' : 'd-none'}>
              <Form.Item className="d-inline-block mr-2">
                {getFieldDecorator('discountDownPrice', { initialValue: plan?.discountDownPrice || 0 })(
                  <InputNumber
                    min={0}
                    formatter={value => `NT$ ${value}`}
                    parser={value => (value ? value.replace(/\D/g, '') : '')}
                  />,
                )}
              </Form.Item>
            </Form.Item>
          </>
        )}

        <Form.Item label={formatMessage(messages.planDescription)}>
          {getFieldDecorator('description', {
            initialValue: BraftEditor.createEditorState(plan?.description || ''),
          })(<AdminBraftEditor variant="short" />)}
        </Form.Item>
      </StyledForm>
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
    }
  }
`

export default Form.create<ProgramPackagePlanAdminModalProps>()(ProgramPackagePlanAdminModal)
