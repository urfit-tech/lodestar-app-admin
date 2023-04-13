import { gql, useMutation } from '@apollo/client'
import { Button, Checkbox, InputNumber, message } from 'antd'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { commonMessages, merchandiseMessages } from '../../helpers/translation'
import { MemberShopProps, ShippingMethodProps, ShippingMethodType } from '../../types/merchandise'
import CurrencyInput from '../form/CurrencyInput'

const ShippingMethodIds: ShippingMethodType[] = [
  'seven-eleven',
  'family-mart',
  'hi-life',
  'ok-mart',
  'home-delivery',
  'send-by-post',
  'other',
]

const ShippingMethodAdminBlock: React.FC<{
  memberShop: MemberShopProps
  onRefetch?: () => void
}> = ({ memberShop, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [updateShippingMethods] = useMutation<hasura.UPDATE_SHIPPING_METHODS, hasura.UPDATE_SHIPPING_METHODSVariables>(
    UPDATE_SHIPPING_METHODS,
  )

  const [values, setValues] = useState<ShippingMethodProps[]>(
    ShippingMethodIds.map(methodId => {
      const targetShippingMethod = memberShop.shippingMethods.find(shippingMethod => shippingMethod.id === methodId)
      return {
        id: methodId,
        enabled: targetShippingMethod ? targetShippingMethod.enabled : false,
        fee: targetShippingMethod ? targetShippingMethod.fee : 0,
        days: targetShippingMethod ? targetShippingMethod.days : 3,
      }
    }),
  )
  const [loading, setLoading] = useState(false)

  return (
    <div>
      {values.map((value, index) => (
        <ShippingMethodItem
          key={value.id}
          value={value}
          onChange={newValue => {
            const newShippingMethodValues = [...values]
            newShippingMethodValues.splice(index, 1, newValue)
            setValues(newShippingMethodValues)
          }}
        />
      ))}

      <div>
        <Button
          className="mr-2"
          onClick={() =>
            setValues(
              ShippingMethodIds.map(methodId => {
                const targetShippingMethod = memberShop.shippingMethods.find(
                  shippingMethod => shippingMethod.id === methodId,
                )
                return {
                  id: methodId,
                  enabled: targetShippingMethod ? targetShippingMethod.enabled : false,
                  fee: targetShippingMethod ? targetShippingMethod.fee : 0,
                  days: targetShippingMethod ? targetShippingMethod.days : 3,
                }
              }),
            )
          }
        >
          {formatMessage(commonMessages.ui.cancel)}
        </Button>
        <Button
          type="primary"
          loading={loading}
          onClick={() => {
            setLoading(true)
            updateShippingMethods({
              variables: {
                memberShopId: memberShop.id,
                shippingMethods: values
                  .filter(value => value.enabled)
                  .map(value => ({
                    id: value.id,
                    enabled: value.enabled,
                    fee: value.fee,
                    days: value.days,
                  })),
              },
            })
              .then(() => {
                message.success(formatMessage(commonMessages.event.successfullySaved))
                onRefetch?.()
              })
              .finally(() => setLoading(false))
          }}
        >
          {formatMessage(commonMessages.ui.save)}
        </Button>
      </div>
    </div>
  )
}

const ShippingMethodLabel: React.FC<{ shippingMethodId: string }> = ({ shippingMethodId }) => {
  const { formatMessage } = useIntl()

  switch (shippingMethodId) {
    case 'seven-eleven':
      return <>{formatMessage(merchandiseMessages.label.sevenEleven)}</>
    case 'family-mart':
      return <>{formatMessage(merchandiseMessages.label.familyMart)}</>
    case 'hi-life':
      return <>{formatMessage(merchandiseMessages.label.hiLife)}</>
    case 'ok-mart':
      return <>{formatMessage(merchandiseMessages.label.okMart)}</>
    case 'home-delivery':
      return <>{formatMessage(merchandiseMessages.label.homeDelivery)}</>
    case 'send-by-post':
      return <>{formatMessage(merchandiseMessages.label.sendByPost)}</>
    case 'other':
      return <>{formatMessage(merchandiseMessages.label.other)}</>
    default:
      return null
  }
}

const ShippingMethodItem: React.FC<{
  value?: ShippingMethodProps
  onChange?: (value: ShippingMethodProps) => void
}> = ({ value, onChange }) => {
  const { formatMessage } = useIntl()

  if (!value) {
    return null
  }

  return (
    <div className="mb-4">
      <Checkbox
        checked={value.enabled}
        onChange={e =>
          onChange &&
          onChange({
            ...value,
            enabled: e.target.checked,
          })
        }
        className="mr-3"
        style={{ width: '10rem' }}
      >
        <ShippingMethodLabel shippingMethodId={value.id} />
      </Checkbox>
      <CurrencyInput
        noLabel
        value={value.fee}
        onChange={newValue =>
          typeof newValue === 'number' &&
          onChange &&
          onChange({
            ...value,
            fee: newValue,
          })
        }
      />
      <span className="mr-3">
        {formatMessage(commonMessages.text.period)}
        {formatMessage(merchandiseMessages.text.estimatedShippingDays)}
      </span>
      <InputNumber
        min={0}
        value={value.days}
        onChange={newValue =>
          typeof newValue === 'number' &&
          onChange &&
          onChange({
            ...value,
            days: newValue,
          })
        }
        className="mr-3"
      />
      <span>{formatMessage(commonMessages.unit.day)}</span>
    </div>
  )
}

const UPDATE_SHIPPING_METHODS = gql`
  mutation UPDATE_SHIPPING_METHODS($memberShopId: uuid!, $shippingMethods: jsonb!) {
    update_member_shop(where: { id: { _eq: $memberShopId } }, _set: { shipping_methods: $shippingMethods }) {
      affected_rows
    }
  }
`

export default ShippingMethodAdminBlock
