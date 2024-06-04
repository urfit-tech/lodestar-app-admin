import { Button, DatePicker, Form, Input, message, Radio, Select, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { commonMessages } from '../../helpers/translation'
import { useUpdateMembershipCard } from '../../hooks/membershipCard'
import { MembershipCard } from '../../types/membershipCard'
import pageMessages from '../translation'
import MembershipCardAdminPageMessages from './translation'

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
  | 'sku'
>

const MembershipCardBasicForm: React.FC<{
  membershipCard: MembershipCard | null
  onRefetch?: () => void
}> = ({ membershipCard, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const [loading, setLoading] = useState(false)
  const [effectiveDateType, setEffectiveDateType] = useState<'fixed' | 'relative'>(
    membershipCard?.expiryType || 'fixed',
  )
  const { updateMembershipCard } = useUpdateMembershipCard()

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
    updateMembershipCard(membershipCard.id, values)
      .then(() => {
        message.success(formatMessage(pageMessages['*'].successfullySaved))
        onRefetch?.()
      })
      .catch(error => {
        console.error(error)
        message.error(formatMessage(pageMessages['*'].fetchDataError))
      })
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
        fixedStartDate: membershipCard.fixedStartDate ? moment(membershipCard.fixedStartDate) : null,
        fixedEndDate: membershipCard.fixedEndDate ? moment(membershipCard.fixedEndDate) : null,
        sku: membershipCard.sku,
        expiryType: membershipCard.expiryType,
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
              <Form.Item name="fixedStartDate" style={{ flex: 1 }} valuePropName="value">
                <DatePicker
                  placeholder={formatMessage(commonMessages.label.startedAt)}
                  format="YYYY-MM-DD HH:mm"
                  showTime={{ format: 'HH:mm', defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                />
              </Form.Item>
              <Form.Item name="fixedEndDate" style={{ flex: 1 }} valuePropName="value">
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

export default MembershipCardBasicForm
