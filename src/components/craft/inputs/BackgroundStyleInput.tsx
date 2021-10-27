import { Form, Radio } from 'antd'
import { defineMessages, useIntl } from 'react-intl'
import { CSSObject } from 'styled-components'
import EmptyCover from '../../../images/default/empty-cover.png'
import ColorPicker from './ColorPicker'
import ImageInput from './ImageInput'

export type BackgroundStyle = Pick<CSSObject, 'background'>
type BackgroundStyleInputProps = {
  value?: BackgroundStyle
  onChange?: (value: BackgroundStyle) => void
}

const messages = defineMessages({
  background: { id: 'craft.inputs.background', defaultMessage: '背景' },
  none: { id: 'craft.inputs.background.none', defaultMessage: '無' },
  solid: { id: 'craft.inputs.background.solid', defaultMessage: '純色' },
  image: { id: 'craft.inputs.background.image', defaultMessage: '圖片' },
})

const defaultColor = '#fff'
const defaultImage = EmptyCover

const BackgroundStyleInput: React.VFC<BackgroundStyleInputProps> = ({ value, onChange }) => {
  const { formatMessage } = useIntl()
  const color = value?.background && /#\w+/.exec(value.background.toString())?.[0]
  const imageUrl = value?.background && /url\('?([\w\W]+?)'?\)/.exec(value.background.toString())?.[1]
  const backgroundType = imageUrl ? 'image' : color ? 'solid' : 'none'
  const handleTypeChange = (type: typeof backgroundType) => {
    switch (type) {
      case 'none':
        onChange?.({ background: 'unset' })
        break
      case 'solid':
        onChange?.({ background: color || defaultColor })
        break
      case 'image':
        onChange?.({ background: `url(${imageUrl || defaultImage}) no-repeat center` })
        break
    }
  }
  return (
    <div>
      <Form.Item>
        <Radio.Group buttonStyle="solid" value={backgroundType} onChange={e => handleTypeChange(e.target.value)}>
          <Radio.Button value="none">{formatMessage(messages.none)}</Radio.Button>
          <Radio.Button value="solid">{formatMessage(messages.solid)}</Radio.Button>
          <Radio.Button value="image">{formatMessage(messages.image)}</Radio.Button>
        </Radio.Group>
      </Form.Item>

      {backgroundType === 'solid' && (
        <ColorPicker value={color || defaultColor} onChange={color => onChange?.({ background: color })} />
      )}

      {backgroundType === 'image' && (
        <Form.Item name="url" noStyle>
          <ImageInput
            value={imageUrl || defaultImage}
            onChange={url => onChange?.({ background: `url(${url}) no-repeat center` })}
          />
        </Form.Item>
      )}
    </div>
  )
}

export default BackgroundStyleInput
