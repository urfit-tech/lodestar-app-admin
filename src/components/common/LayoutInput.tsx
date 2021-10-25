import { Form } from 'antd'
import { CollectionLayout } from 'lodestar-app-element/src/components/collections/Collection'
import GridInput, { GridInputValue } from './GridInput'

type LayoutInputProps = {
  value?: CollectionLayout
  onChange?: (layout: CollectionLayout) => void
}
const LayoutInput: React.FC<LayoutInputProps> = ({ value, onChange }) => {
  return (
    <>
      <Form.Item name="columns">
        <GridInput
          label="columns"
          value={value?.columns as GridInputValue}
          onChange={columns =>
            onChange?.({
              ...value,
              columns,
            })
          }
        />
      </Form.Item>
      <Form.Item name="gutter">
        <GridInput
          label="gutter"
          value={value?.gutter as GridInputValue}
          onChange={gutter =>
            onChange?.({
              ...value,
              gutter,
            })
          }
        />
      </Form.Item>
      <Form.Item name="gap">
        <GridInput
          label="gap"
          value={value?.gap as GridInputValue}
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
