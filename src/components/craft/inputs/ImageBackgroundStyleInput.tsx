import { Form, Radio } from 'antd'
import { ImageProps } from 'lodestar-app-element/src/components/common/Image'
import { useIntl } from 'react-intl'
import EmptyCover from '../../../images/default/empty-cover.png'
import { CraftElementSettings } from '../../../pages/CraftPageAdminPage/CraftSettingsPanel'
import craftMessages from '../translation'
import ColorPicker from './ColorPicker'
import ImageInput from './ImageInput'

const defaultColor = '#fff'
const defaultImage = EmptyCover

const ImageBackgroundStyleInput: CraftElementSettings<ImageProps> = ({ props, onPropsChange }) => {
    const { formatMessage } = useIntl()
    const backgroundType = props?.customStyle?.backgroundImage && props?.customStyle?.backgroundImage !== 'unset' ? 'image' : props?.customStyle?.backgroundColor && props?.customStyle?.backgroundColor !== 'unset' ? 'solid' : 'none'
    const handleTypeChange = (type: typeof backgroundType) => {
        switch (type) {
            case 'none':
                onPropsChange?.({ ...props, customStyle: { ...props?.customStyle, background: 'unset', backgroundColor: 'unset', backgroundImage: 'unset' } })
                break
            case 'solid':
                onPropsChange?.({
                    ...props,
                    customStyle: {
                        ...props?.customStyle,
                        background: 'unset',
                        backgroundColor: props?.customStyle?.backgroundColor && props?.customStyle?.backgroundColor !== 'unset' ? props?.customStyle?.backgroundColor : defaultColor,
                        backgroundImage: 'unset',
                    }
                })
                break
            case 'image':
                onPropsChange?.({
                    ...props,
                    customStyle: {
                        ...props?.customStyle,
                        background: 'unset',
                        backgroundColor: 'unset',
                        backgroundImage: props?.customStyle?.backgroundImage && props?.customStyle?.backgroundImage !== 'unset' ? props?.customStyle?.backgroundImage : 'url()',
                    }
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
                        value={props?.customStyle?.backgroundColor || defaultColor}
                        onChange={color => onPropsChange?.({ ...props, customStyle: { ...props?.customStyle, backgroundColor: color } })}
                    />
                </Form.Item>
            )}

            {backgroundType === 'image' && (
                <Form.Item noStyle>
                    <ImageInput
                        value={props?.customStyle?.backgroundImage?.slice(4, -1).replace(/"/g, '') || defaultImage}
                        onChange={url => {
                            let urlImg = new Image()
                            urlImg.src = url
                            urlImg.onload = () => {
                                let urlImgWidth = urlImg.src !== '' ? urlImg.naturalWidth : 1
                                let urlImgHeight = urlImg.src !== '' ? urlImg.naturalHeight : 1
                                onPropsChange?.({
                                    ...props,
                                    width: `${urlImgWidth}px`,
                                    height: `${urlImgHeight}px`,
                                    customStyle: {
                                        ...props?.customStyle,
                                        backgroundImage: `url(${url})`,
                                        width: `${urlImgWidth}px`,
                                        height: `${urlImgHeight}px`
                                    },
                                })
                            }
                        }
                        }
                    />
                </Form.Item>
            )}
        </div>
    )
}

export default ImageBackgroundStyleInput
