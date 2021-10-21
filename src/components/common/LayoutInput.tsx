import { Form } from 'antd'
import { CollectionLayout } from 'lodestar-app-element/src/components/collections/Collection'
import ResponsiveInput, { ResponsiveInputValue } from './ResponsiveInput'

type LayoutInputProps = {
  value?: CollectionLayout
  onChange?: (layout: CollectionLayout) => void
}
const LayoutInput: React.FC<LayoutInputProps> = ({ value, onChange }) => {
  return (
    <>
      <Form.Item name="columns">
        <ResponsiveInput
          label="columns"
          value={value?.columns as ResponsiveInputValue}
          onChange={columns =>
            onChange?.({
              ...value,
              columns,
            })
          }
        />
      </Form.Item>
      <Form.Item name="gutter">
        <ResponsiveInput
          label="gutter"
          value={value?.gutter as ResponsiveInputValue}
          onChange={gutter =>
            onChange?.({
              ...value,
              gutter,
            })
          }
        />
      </Form.Item>
      <Form.Item name="gap">
        <ResponsiveInput
          label="gap"
          value={value?.gap as ResponsiveInputValue}
          onChange={gap =>
            onChange?.({
              ...value,
              gap,
            })
          }
        />
      </Form.Item>
    </>
  )
}

export default LayoutInput
