import { gql, useMutation } from '@apollo/client'
import { Button, Checkbox, DatePicker, Form, message } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import moment, { Moment } from 'moment'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages, merchandiseMessages } from '../../helpers/translation'
import { MerchandiseProps } from '../../types/merchandise'
import CurrencySelector from '../form/CurrencySelector'
import SaleInput, { SaleProps } from '../form/SaleInput'

type FieldProps = {
  startedAt: Moment
  endedAt: Moment
  sale: SaleProps
  currencyId: string
}

const MerchandiseSalesForm: React.FC<{
  merchandise: MerchandiseProps
  merchandiseId: string
  onRefetch?: () => void
}> = ({ merchandise, merchandiseId, onRefetch }) => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useApp()
  const [form] = useForm<FieldProps>()
  const [updateMerchandiseSales] = useMutation<
    hasura.UPDATE_MERCHANDISE_SALES,
    hasura.UPDATE_MERCHANDISE_SALESVariables
  >(UPDATE_MERCHANDISE_SALES)
  const [loading, setLoading] = useState(false)
  const [withSellingTime, setWithSellingTime] = useState(!!merchandise.startedAt || !!merchandise.endedAt)

  const merchandiseCurrentCurrencyId = merchandise.currencyId

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    updateMerchandiseSales({
      variables: {
        merchandiseId,
        startedAt: withSellingTime ? values.startedAt?.toDate() || null : null,
        endedAt: withSellingTime ? values.endedAt?.toDate() || null : null,
        soldAt: values.sale?.soldAt || null,
        isCountdownTimerVisible: values.sale?.isTimerVisible ?? false,
        currencyId: values?.currencyId,
      },
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
        onRefetch?.()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <Form
      form={form}
      hideRequiredMark
      colon={false}
      initialValues={{
        startedAt: merchandise.startedAt && moment(merchandise.startedAt),
        endedAt: merchandise.endedAt && moment(merchandise.endedAt),
        sale: merchandise.soldAt
          ? {
              price: 0,
              soldAt: merchandise.soldAt,
              isTimerVisible: merchandise.isCountdownTimerVisible,
            }
          : null,
      }}
      onFinish={handleSubmit}
    >
      <div className="mb-4">
        {enabledModules?.currency && (
          <Form.Item
            label={formatMessage(commonMessages.label.currency)}
            name="currencyId"
            initialValue={merchandiseCurrentCurrencyId}
            rules={[
              {
                required: true,
                message: formatMessage(errorMessages.form.isRequired, {
                  field: formatMessage(commonMessages.label.currency),
                }),
              },
            ]}
          >
            <CurrencySelector value={merchandiseCurrentCurrencyId} />
          </Form.Item>
        )}
        <Checkbox checked={withSellingTime} onChange={e => setWithSellingTime(e.target.checked)}>
          {formatMessage(merchandiseMessages.label.setSellingTime)}
        </Checkbox>
        <div className={`mt-2 pl-3 ${withSellingTime ? '' : 'd-none'}`}>
          <Form.Item name="startedAt" noStyle>
            <DatePicker
              format="YYYY-MM-DD HH:mm"
              showTime={{ format: 'HH:mm', defaultValue: moment('00:00:00', 'HH:mm:ss') }}
              className="mr-2"
            />
          </Form.Item>

          <Form.Item name="endedAt" noStyle>
            <DatePicker
              format="YYYY-MM-DD HH:mm"
              showTime={{ format: 'HH:mm', defaultValue: moment('23:59:00', 'HH:mm:ss') }}
            />
          </Form.Item>
        </div>
      </div>

      <Form.Item name="sale">
        <SaleInput noPrice withTimer />
      </Form.Item>

      <div>
        <Button onClick={() => form.resetFields()} className="mr-2">
          {formatMessage(commonMessages.ui.cancel)}
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          {formatMessage(commonMessages.ui.save)}
        </Button>
      </div>
    </Form>
  )
}

const UPDATE_MERCHANDISE_SALES = gql`
  mutation UPDATE_MERCHANDISE_SALES(
    $merchandiseId: uuid!
    $soldAt: timestamptz
    $startedAt: timestamptz
    $endedAt: timestamptz
    $isCountdownTimerVisible: Boolean
    $currencyId: String!
  ) {
    update_merchandise(
      where: { id: { _eq: $merchandiseId } }
      _set: {
        sold_at: $soldAt
        started_at: $startedAt
        ended_at: $endedAt
        is_countdown_timer_visible: $isCountdownTimerVisible
        currency_id: $currencyId
      }
    ) {
      affected_rows
    }
  }
`

export default MerchandiseSalesForm
