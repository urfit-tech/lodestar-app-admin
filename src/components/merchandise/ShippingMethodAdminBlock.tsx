import { useMutation } from '@apollo/react-hooks'
import { Button, Checkbox, InputNumber, message } from 'antd'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { commonMessages, merchandiseMessages } from '../../helpers/translation'
import types from '../../types'
import { MemberShopProps, ShippingMethodProps, ShippingMethodType } from '../../types/merchandise'
import CurrencyInput from '../admin/CurrencyInput'

const ShippingMethodIds: ShippingMethodType[] = ['sevenEleven', 'familyMart', 'hiLife', 'okMart', 'homeDelivery']

const ShippingMethodAdminBlock: React.FC<{
  memberShop: MemberShopProps
  refetch?: () => void
}> = ({ memberShop, refetch }) => {
  const { formatMessage } = useIntl()
  const [updateShippingMethods] = useMutation<types.UPDATE_SHIPPING_METHODS, types.UPDATE_SHIPPING_METHODSVariables>(
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
                refetch && refetch()
                message.success(formatMessage(commonMessages.event.successfullySaved))
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
        {formatMessage(merchandiseMessages.label[value.id])}
      </Checkbox>
      <CurrencyInput
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
      <span>{formatMessage(commonMessages.label.days)}</span>
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
