import { gql, useMutation } from '@apollo/client'
import { Button, DatePicker, Form, Input, message, Radio, Select, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import pageMessages from '../translation'
import MembershipCardAdminPageMessages from './translation'

type MembershipCard = {
  id: string
  relativePeriodAmount: number | null
  relativePeriodType: string | null
  appId: string
  description: string
  template: string
  fixedStartDate: string | null
  fixedEndDate: string | null
  expiryType: string
  title: string
}

type FieldProps = Pick<
  MembershipCard,
  | 'id'
  | 'title'
  | 'relativePeriodAmount'
  | 'relativePeriodType'
  | 'description'
  | 'fixedStartDate'
  | 'fixedEndDate'
  | 'expiryType'
>

const MembershipCardBasicForm: React.FC<{
  membershipCard: MembershipCard | null
  onRefetch?: () => void
}> = ({ membershipCard, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const [updateMembershipCardBasicMutaion] = useMutation<
    hasura.UpdateMembershipCardBasic,
    hasura.UpdateMembershipCardBasicVariables
  >(UpdateMembershipCardBasic)
  const [loading, setLoading] = useState(false)
  const [effectiveDateType, setEffectiveDateType] = useState<'fixed' | 'relative'>('fixed')

  useEffect(() => {
    if (effectiveDateType === 'fixed') {
      form.setFieldsValue({
        relativePeriodAmount: null,
        relativePeriodType: null,
      })
    } else {
      form.setFieldsValue({
        fixedStartDate: null,
        fixedEndDate: null,
      })
    }
  }, [effectiveDateType, form])

  if (!membershipCard) {
    return <Skeleton active />
  }

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    updateMembershipCardBasicMutaion({
      variables: {
        id: membershipCard.id,
        title: values.title || '',
        expiryType: values.expiryType,
        relativePeriodType: values.relativePeriodType,
        relativePeriodAmount: values.relativePeriodAmount || 0,
        fixedStartDate: values.fixedStartDate,
        fixedEndDate: values.fixedEndDate,
      },
    })
      .then(() => {
        message.success(formatMessage(pageMessages['*'].successfullySaved))
        onRefetch?.()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <Form
      form={form}
      colon={false}
      labelAlign="left"
      labelCol={{ md: { span: 4 } }}
      wrapperCol={{ md: { span: 8 } }}
      initialValues={{
        title: membershipCard.title || '',
        template: membershipCard.template || '',
        relativePeriodAmount: membershipCard.relativePeriodAmount,
        relativePeriodType: membershipCard.relativePeriodType,
        description: membershipCard.description,
        fixedStartDate: membershipCard.fixedStartDate,
        fixedEndDate: membershipCard.fixedEndDate,
      }}
      onFinish={handleSubmit}
    >
      <Form.Item label={formatMessage(MembershipCardAdminPageMessages.basicForm.cardTitle)} name="title">
        <Input />
      </Form.Item>
      <Form.Item label={formatMessage(MembershipCardAdminPageMessages.basicForm.sku)} name="sku">
        <Input />
      </Form.Item>
      <Form.Item label={formatMessage(MembershipCardAdminPageMessages.basicForm.effectiveDate)}>
        <>
          <Form.Item name="expiryType">
            <Radio.Group
              onChange={e => setEffectiveDateType(e.target.value)}
              value={effectiveDateType}
              style={{ display: 'flex', gap: '10px' }}
            >
              <Radio value="fixed">
                {formatMessage(MembershipCardAdminPageMessages.basicForm.specifiedEffectiveDate)}
              </Radio>
              <Radio value="relative">
                {formatMessage(MembershipCardAdminPageMessages.basicForm.startCountingAfterHolding)}
              </Radio>
            </Radio.Group>
          </Form.Item>

          {effectiveDateType === 'fixed' && (
            <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
              <Form.Item name="fixedStartDate" style={{ flex: 1 }} valuePropName={'date'}>
                <DatePicker
                  placeholder={formatMessage(commonMessages.label.startedAt)}
                  format="YYYY-MM-DD HH:mm"
                  showTime={{ format: 'HH:mm', defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                />
              </Form.Item>
              <Form.Item name="fixedEndDate" style={{ flex: 1 }} valuePropName={'date'}>
                <DatePicker
                  placeholder={formatMessage(commonMessages.label.endedAt)}
                  format="YYYY-MM-DD HH:mm"
                  showTime={{ format: 'HH:mm', defaultValue: moment('23:59:00', 'HH:mm:ss') }}
                />
              </Form.Item>
            </div>
          )}

          {effectiveDateType === 'relative' && (
            <div style={{ marginTop: '10px' }}>
              <Input.Group compact>
                <Form.Item name="relativePeriodAmount" noStyle>
                  <Input style={{ width: '50%' }} />
                </Form.Item>
                <Form.Item name="relativePeriodType" noStyle>
                  <Select style={{ width: '50%' }}>
                    <Select.Option value="D">{formatMessage(pageMessages['*'].day)}</Select.Option>
                    <Select.Option value="W">{formatMessage(pageMessages['*'].week)}</Select.Option>
                    <Select.Option value="M">{formatMessage(pageMessages['*'].month)}</Select.Option>
                    <Select.Option value="Y">{formatMessage(pageMessages['*'].year)}</Select.Option>
                  </Select>
                </Form.Item>
              </Input.Group>
            </div>
          )}
        </>
      </Form.Item>

      <Form.Item wrapperCol={{ md: { offset: 4 } }}>
        <Button className="mr-2" onClick={() => form.resetFields()}>
          {formatMessage(pageMessages['*'].cancel)}
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          {formatMessage(pageMessages['*'].save)}
        </Button>
      </Form.Item>
    </Form>
  )
}

const UpdateMembershipCardBasic = gql`
  mutation UpdateMembershipCardBasic(
    $id: uuid!
    $title: String
    $description: String
    $template: String
    $creatorId: String
    $sku: String
    $fixedStartDate: timestamptz
    $relativePeriodAmount: Int
    $relativePeriodType: bpchar
    $fixedEndDate: timestamptz
    $expiryType: bpchar
  ) {
    update_card(
      where: { id: { _eq: $id } }
      _set: {
        title: $title
        description: $description
        template: $template
        creator_id: $creatorId
        sku: $sku
        fixed_start_date: $fixedStartDate
        relative_period_amount: $relativePeriodAmount
        relative_period_type: $relativePeriodType
        fixed_end_date: $fixedEndDate
        expiry_type: $expiryType
      }
    ) {
      affected_rows
      returning {
        id
        title
        description
        template
        creator_id
        sku
        fixed_start_date
        relative_period_type
        relative_period_amount
        expiry_type
        fixed_end_date
      }
    }
  }
`

export default MembershipCardBasicForm
