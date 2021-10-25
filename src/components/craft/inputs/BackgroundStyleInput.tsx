import { Form, Radio } from 'antd'
import { defineMessages, useIntl } from 'react-intl'
import { CSSObject } from 'styled-components'
import EmptyCover from '../../../images/default/empty-cover.png'
import ColorPicker from './ColorPicker'
import ImageInput from './ImageInput'

type BackgroundStyleInputProps = {
  value?: CSSObject
  onChange?: (value: CSSObject) => void
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
  const color = value?.background && /#\w+/.exec(value.background.toString())?.[1]
  const imageUrl = value?.background && /url\('?([\w\W]+?)'?\)/.exec(value.background.toString())?.[1]
  const backgroundType = imageUrl ? 'image' : color ? 'solid' : 'none'
  const handleTypeChange = (type: typeof backgroundType) => {
    switch (type) {
      case 'none':
        onChange?.({ background: 'unset' })
        break
      case 'solid':
        onChange?.({ background: defaultColor })
        break
      case 'image':
        onChange?.({ background: `url(${defaultImage})` })
        break
    }
  }
  return (
    <div>
      <Form.Item label={formatMessage(messages.background)} noStyle>
        <Radio.Group buttonStyle="solid" onChange={e => handleTypeChange(e.target.value)}>
          <Radio.Button value="none">{formatMessage(messages.none)}</Radio.Button>
          <Radio.Button value="solid">{formatMessage(messages.solid)}</Radio.Button>
          <Radio.Button value="image">{formatMessage(messages.image)}</Radio.Button>
        </Radio.Group>
      </Form.Item>

      {backgroundType === 'solid' && (
        <Form.Item noStyle>
          <ColorPicker value={color || defaultColor} onChange={color => onChange?.({ background: color })} />
        </Form.Item>
      )}

      {backgroundType === 'image' && (
        <Form.Item name="url" noStyle>
          <ImageInput value={imageUrl || defaultImage} onChange={url => onChange?.({ background: url })} />
        </Form.Item>
      )}
    </div>
  )
}

export default BackgroundStyleInput
