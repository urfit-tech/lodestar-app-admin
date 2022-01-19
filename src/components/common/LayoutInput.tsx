import { Form, InputNumber } from 'antd'
import { CollectionLayout } from 'lodestar-app-element/src/components/collections/Collection'
import { defineMessages, useIntl } from 'react-intl'
import { CraftSettingLabel } from '../../pages/craft/CraftPageAdminPage/CraftSettingsPanel'

const labelMessages = defineMessages({
  columns: { id: 'common.ui.columns', defaultMessage: '欄數' },
  gutter: { id: 'common.ui.gutter', defaultMessage: '間距' },
  gap: { id: 'common.ui.gap', defaultMessage: '行距' },
})

type LayoutInputProps = {
  value?: CollectionLayout
  onChange?: (layout: CollectionLayout) => void
}
const LayoutInput: React.FC<LayoutInputProps> = ({ value, onChange }) => {
  const { formatMessage } = useIntl()
  return (
    <>
      <Form.Item label={<CraftSettingLabel>{formatMessage(labelMessages.columns)}</CraftSettingLabel>}>
        <InputNumber value={Number(value?.columns)} onChange={v => onChange?.({ ...value, columns: Number(v) })} />
      </Form.Item>
      <Form.Item label={<CraftSettingLabel>{formatMessage(labelMessages.gutter)}</CraftSettingLabel>}>
        <InputNumber value={Number(value?.gutter)} onChange={v => onChange?.({ ...value, gutter: Number(v) })} />
      </Form.Item>
      <Form.Item label={<CraftSettingLabel>{formatMessage(labelMessages.gap)}</CraftSettingLabel>}>
        <InputNumber value={Number(value?.gap)} onChange={v => onChange?.({ ...value, gap: Number(v) })} />
      </Form.Item>
    </>
  )
}

export default LayoutInput
