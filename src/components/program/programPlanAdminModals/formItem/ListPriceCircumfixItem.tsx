import { Checkbox, Form, Input } from 'antd'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import programMessages from '../../translation'

export type ListPriceCircumfix = {
  listPricePrefix?: string
  listPriceSuffix?: string
} | null

const ListPriceCircumfixBlock: React.FC<{
  value?: ListPriceCircumfix
  onChange?: (value: any) => void
}> = ({ value, onChange }) => {
  const { formatMessage } = useIntl()
  const [listPriceCircumfixActive, setListPriceCircumfixActive] = useState(
    Boolean(value?.listPricePrefix && value.listPricePrefix !== '') ||
      Boolean(value?.listPriceSuffix && value.listPriceSuffix !== ''),
  )

  return (
    <div>
      <Checkbox
        checked={listPriceCircumfixActive}
        className="mb-2"
        onChange={e => {
          setListPriceCircumfixActive(e.target.checked)
          onChange?.({
            ...value,
            listPricePrefix: undefined,
            listPriceSuffix: undefined,
          })
        }}
      >
        {formatMessage(programMessages.ListPriceItem.listPriceCircumfix)}
      </Checkbox>
      {listPriceCircumfixActive ? (
        <>
          <Form.Item label={formatMessage(programMessages.ListPriceItem.listPricePrefix)}>
            <Input
              value={value?.listPricePrefix}
              onChange={v => onChange?.({ ...value, listPricePrefix: v.target.value })}
            />
          </Form.Item>
          <Form.Item label={formatMessage(programMessages.ListPriceItem.listPriceSuffix)}>
            <Input
              value={value?.listPriceSuffix}
              onChange={v => onChange?.({ ...value, listPriceSuffix: v.target.value })}
            />
          </Form.Item>
        </>
      ) : null}
    </div>
  )
}

const ListPriceCircumfixItem: React.FC<{
  name: string
}> = ({ name }) => {
  return (
    <Form.Item name={name}>
      <ListPriceCircumfixBlock />
    </Form.Item>
  )
}

export default ListPriceCircumfixItem
