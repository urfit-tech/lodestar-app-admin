import { FileAddOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Checkbox, Form, Input, message, Radio } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import BraftEditor from 'braft-editor'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { v4 as uuid } from 'uuid'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages, programMessages } from '../../helpers/translation'
import types from '../../types'
import { ProgramPlanProps } from '../../types/program'
import AdminBraftEditor from '../admin/AdminBraftEditor'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import CurrencyInput from '../admin/CurrencyInput'
import CurrencySelector from '../admin/CurrencySelector'
import SaleInput from '../admin/SaleInput'
import PeriodSelector from '../common/PeriodSelector'

const StyledNotation = styled.div`
  line-height: 1.5;
  letter-spacing: 0.4px;
  font-size: 14px;
  font-weight: 500;
  color: #9b9b9b;
  white-space: pre-line;
`

const messages = defineMessages({
  isPublished: { id: 'program.label.isPublished', defaultMessage: '是否顯示方案' },
  published: { id: 'program.label.published', defaultMessage: '發售，上架後立即開賣' },
  unpublished: { id: 'program.label.unpublished', defaultMessage: '停售，此方案暫停對外銷售並隱藏' },
  subscriptionPlan: { id: 'program.label.subscriptionPlan', defaultMessage: '訂閱付費方案' },
  permissionType: { id: 'program.label.permissionType', defaultMessage: '選擇內容觀看權限' },
  availableForPastContent: { id: 'program.label.availableForPastContent', defaultMessage: '可看過去內容' },
  unavailableForPastContent: { id: 'program.label.unavailableForPastContent', defaultMessage: '不可看過去內容' },
  availableForAllContent: { id: 'program.label.availableForAllContent', defaultMessage: '可看所有內容' },
  subscriptionPeriodType: { id: 'program.label.subscriptionPeriodType', defaultMessage: '訂閱週期' },
  planDescription: { id: 'program.label.planDescription', defaultMessage: '方案描述' },
})

const ProgramPlanAdminModal: React.FC<
  AdminModalProps & {
    programId: string
    programPlan?: ProgramPlanProps
    onRefetch?: () => void
  }
> = ({ programId, programPlan, onRefetch, ...modalProps }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm()
  const [upsertProgramPlan] = useMutation<types.UPSERT_PROGRAM_PLAN, types.UPSERT_PROGRAM_PLANVariables>(
    UPSERT_PROGRAM_PLAN,
  )

  const [withDiscountDownPrice, setWithDiscountDownPrice] = useState(!!programPlan?.discountDownPrice)
  const [withPeriod, setWithPeriod] = useState(!!(programPlan?.periodAmount && programPlan?.periodType))
  const [withAutoRenewed, setWithAutoRenewed] = useState(!!programPlan?.autoRenewed)
  const [currencyId, setCurrencyId] = useState(programPlan?.currencyId || '')

  const [loading, setLoading] = useState(false)

  const handleSubmit = (setVisible: React.Dispatch<React.SetStateAction<boolean>>) => {
    form
      .validateFields()
      .then(values => {
        setLoading(true)
        upsertProgramPlan({
          variables: {
            id: programPlan ? programPlan.id : uuid(),
            programId,
            type: values.type || 1,
            title: values.title,
            description: values.description.toRAW(),
            listPrice: values.listPrice,
            salePrice: values.sale ? values.sale.price : null,
            soldAt: values.sale ? values.sale.soldAt : null,
            discountDownPrice: withDiscountDownPrice ? values.discountDownPrice : 0,
            periodAmount: withPeriod ? values.period.amount : null,
            periodType: withPeriod ? values.period.type : null,
            currencyId: values.currencyId,
            autoRenewed: withPeriod ? values.autoRenewed || false : false,
            publishedAt: values.isPublished ? new Date() : null,
          },
        })
          .then(() => {
            onRefetch && onRefetch()
            message.success(formatMessage(commonMessages.event.successfullySaved))
            setVisible(false)
          })
          .catch(handleError)
          .finally(() => setLoading(false))
      })
      .catch(() => {})
  }

  return (
    <AdminModal
      title={formatMessage(commonMessages.label.salesPlan)}
      icon={<FileAddOutlined />}
      footer={null}
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={() => setVisible(false)}>
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleSubmit(setVisible)}>
            {formatMessage(commonMessages.ui.confirm)}
          </Button>
        </>
      )}
      {...modalProps}
    >
      <Form
        form={form}
        layout="vertical"
        colon={false}
        hideRequiredMark
        initialValues={{
          title: programPlan?.title,
          isPublished: !!programPlan?.publishedAt,
          currencyId: programPlan?.currencyId,
          listPrice: programPlan?.listPrice,
          sale: programPlan?.soldAt
            ? {
                price: programPlan.salePrice,
                soldAt: programPlan.soldAt,
              }
            : null,
          period: { amount: programPlan?.periodAmount || 1, type: programPlan?.periodType || 'M' },
          type: programPlan?.type || 1,
          discountDownPrice: programPlan?.discountDownPrice,
          description: BraftEditor.createEditorState(programPlan ? programPlan.description : null),
        }}
        onValuesChange={(values: any) => {
          values.currencyId !== currencyId && setCurrencyId(values.currencyId)
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

        <Form.Item label={formatMessage(messages.isPublished)} name="isPublished">
          <Radio.Group>
            <Radio value={true} className="d-block">
              {formatMessage(messages.published)}
            </Radio>
            <Radio value={false} className="d-block">
              {formatMessage(messages.unpublished)}
            </Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label={formatMessage(commonMessages.term.currency)}
          name="currencyId"
          rules={[
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(commonMessages.term.listPrice),
              }),
            },
          ]}
        >
          <CurrencySelector />
        </Form.Item>

        <Form.Item label={formatMessage(commonMessages.term.listPrice)} name="listPrice">
          <CurrencyInput noLabel currencyId={currencyId} />
        </Form.Item>

        <Form.Item
          name="sale"
          rules={[{ validator: (rule, value, callback) => callback(value && !value.soldAt ? '' : undefined) }]}
        >
          <SaleInput currencyId={currencyId} />
        </Form.Item>

        <div className="mb-4">
          <Checkbox defaultChecked={withPeriod} onChange={e => setWithPeriod(e.target.checked)}>
            {formatMessage(commonMessages.label.period)}
          </Checkbox>
        </div>
        {withPeriod && (
          <Form.Item name="period">
            <PeriodSelector />
          </Form.Item>
        )}
        {withPeriod && (
          <Form.Item label={formatMessage(messages.permissionType)} name="type" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value={1} className="d-block">
                {formatMessage(messages.availableForPastContent)}
              </Radio>
              <Radio value={2} className="d-block">
                {formatMessage(messages.unavailableForPastContent)}
              </Radio>
              <Radio value={3} className="d-block">
                {formatMessage(messages.availableForAllContent)}
              </Radio>
            </Radio.Group>
          </Form.Item>
        )}
        {withPeriod && (
          <div className="mb-4">
            <Checkbox checked={withAutoRenewed} onChange={e => setWithAutoRenewed(e.target.checked)}>
              {formatMessage(commonMessages.label.autoRenewed)}
            </Checkbox>
          </div>
        )}
        {withPeriod && withAutoRenewed && (
          <div className="mb-4">
            <Checkbox defaultChecked={withDiscountDownPrice} onChange={e => setWithDiscountDownPrice(e.target.checked)}>
              {formatMessage(commonMessages.label.discountDownPrice)}
            </Checkbox>
            {withDiscountDownPrice && (
              <StyledNotation>{formatMessage(commonMessages.text.discountDownNotation)}</StyledNotation>
            )}
          </div>
        )}
        {withPeriod && withAutoRenewed && withDiscountDownPrice && (
          <Form.Item name="discountDownPrice">
            <CurrencyInput noLabel currencyId={currencyId} />
          </Form.Item>
        )}

        <Form.Item label={formatMessage(messages.planDescription)} name="description">
          <AdminBraftEditor variant="short" />
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

const UPSERT_PROGRAM_PLAN = gql`
  mutation UPSERT_PROGRAM_PLAN(
    $programId: uuid!
    $id: uuid!
    $type: Int!
    $title: String!
    $description: String!
    $listPrice: numeric!
    $salePrice: numeric
    $soldAt: timestamptz
    $discountDownPrice: numeric!
    $periodAmount: numeric
    $periodType: String
    $currencyId: String!
    $autoRenewed: Boolean!
    $publishedAt: timestamptz
  ) {
    insert_program_plan(
      objects: {
        id: $id
        type: $type
        title: $title
        description: $description
        list_price: $listPrice
        sale_price: $salePrice
        period_amount: $periodAmount
        period_type: $periodType
        discount_down_price: $discountDownPrice
        sold_at: $soldAt
        program_id: $programId
        currency_id: $currencyId
        auto_renewed: $autoRenewed
        published_at: $publishedAt
      }
      on_conflict: {
        constraint: program_plan_pkey
        update_columns: [
          type
          title
          description
          list_price
          sale_price
          discount_down_price
          period_amount
          period_type
          sold_at
          currency_id
          auto_renewed
          published_at
        ]
      }
    ) {
      affected_rows
    }
  }
`
export default ProgramPlanAdminModal
