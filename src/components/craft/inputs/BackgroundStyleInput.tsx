import { Form, Radio } from 'antd'
import { useIntl } from 'react-intl'
import { CSSObject } from 'styled-components'
import EmptyCover from '../../../images/default/empty-cover.png'
import craftMessages from '../translation'
import ColorPicker from './ColorPicker'
import ImageInput from './ImageInput'

export type BackgroundStyle = Pick<CSSObject, 'background' | 'backgroundImage' | 'backgroundColor'>
type BackgroundStyleInputProps = {
  value?: BackgroundStyle
  onChange?: (value: BackgroundStyle) => void
}

const defaultColor = '#fff'
const defaultImage = EmptyCover

const BackgroundStyleInput: React.VFC<BackgroundStyleInputProps> = ({ value, onChange }) => {
  const { formatMessage } = useIntl()
  const backgroundType = value?.backgroundImage ? 'image' : value?.backgroundColor ? 'solid' : 'none'
  const handleTypeChange = (type: typeof backgroundType) => {
    switch (type) {
      case 'none':
        onChange?.({ background: 'unset', backgroundColor: undefined, backgroundImage: undefined })
        break
      case 'solid':
        onChange?.({
          background: undefined,
          backgroundColor: value?.backgroundColor || defaultColor,
          backgroundImage: undefined,
        })
        break
      case 'image':
        onChange?.({
          background: undefined,
          backgroundColor: undefined,
          backgroundImage: value?.backgroundImage || `url()`,
        })
        break
    }
  }

  return (
    <div>
      <Form.Item>
        <Radio.Group buttonStyle="solid" value={backgroundType} onChange={e => handleTypeChange(e.target.value)}>
          <Radio.Button value="none">{formatMessage(craftMessages.BackgroundStyleInput.none)}</Radio.Button>
          <Radio.Button value="solid">{formatMessage(craftMessages.BackgroundStyleInput.solid)}</Radio.Button>
          <Radio.Button value="image">{formatMessage(craftMessages.BackgroundStyleInput.image)}</Radio.Button>
        </Radio.Group>
      </Form.Item>

      {backgroundType === 'solid' && (
        <Form.Item noStyle>
          <ColorPicker
            value={value?.backgroundColor || defaultColor}
            onChange={color => onChange?.({ backgroundColor: color })}
          />
        </Form.Item>
      )}

      {backgroundType === 'image' && (
        <Form.Item noStyle>
          <ImageInput
            value={value?.backgroundImage?.slice(4, -1).replace(/"/g, '') || defaultImage}
            onChange={url => {
              onChange?.({ backgroundImage: `url(${url})` })
            }}
          />
        </Form.Item>
      )}
    </div>
  )
}

export default BackgroundStyleInput
