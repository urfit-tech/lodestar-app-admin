import { Form, Radio } from 'antd'
import { useIntl } from 'react-intl'
import { CSSObject } from 'styled-components'
import EmptyCover from '../../../images/default/empty-cover.png'
import craftMessages from '../translation'
import ColorPicker from './ColorPicker'
import ImageInput from './ImageInput'

export type BackgroundStyle = Pick<CSSObject, 'background' | 'backgroundImage' | 'backgroundColor' | 'width' | 'height'>
type BackgroundStyleInputProps = {
  value?: BackgroundStyle
  onChange?: (value: BackgroundStyle & { customStyle: CSSObject }) => void
}

const defaultColor = '#fff'
const defaultImage = EmptyCover

const BackgroundStyleInput: React.VFC<BackgroundStyleInputProps> = ({ value, onChange }) => {
  const { formatMessage } = useIntl()
  const backgroundType = value?.backgroundImage ? 'image' : value?.backgroundColor ? 'solid' : 'none'
  const handleTypeChange = (type: typeof backgroundType) => {
    switch (type) {
      case 'none':
        onChange?.({
          customStyle: { ...value, background: 'unset', backgroundColor: undefined, backgroundImage: undefined },
        })
        break
      case 'solid':
        onChange?.({
          customStyle: {
            ...value,
            background: undefined,
            backgroundColor: value?.backgroundColor || defaultColor,
            backgroundImage: undefined,
          },
        })
        break
      case 'image':
        onChange?.({
          customStyle: {
            ...value,
            background: undefined,
            backgroundColor: undefined,
            backgroundImage: value?.backgroundImage || `url()`,
          },
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
            onChange={color => onChange?.({ customStyle: { ...value, backgroundColor: color } })}
          />
        </Form.Item>
      )}

      {backgroundType === 'image' && (
        <Form.Item noStyle>
          <ImageInput
            value={value?.backgroundImage?.slice(4, -1).replace(/"/g, '') || defaultImage}
            onChange={url => {
              let urlImg = new Image()
              urlImg.src = url
              urlImg.onload = () => {
                let urlImgWidth = urlImg.src !== '' ? urlImg.naturalWidth : 1
                let urlImgHeight = urlImg.src !== '' ? urlImg.naturalHeight : 1
                onChange?.({
                  width: `${urlImgWidth}px`,
                  height: `${urlImgHeight}px`,
                  customStyle: {
                    ...value,
                    backgroundImage: `url(${url})`,
                    width: `${urlImgWidth}px`,
                    height: `${urlImgHeight}px`,
                  },
                })
              }
            }}
          />
        </Form.Item>
      )}
    </div>
  )
}

export default BackgroundStyleInput
