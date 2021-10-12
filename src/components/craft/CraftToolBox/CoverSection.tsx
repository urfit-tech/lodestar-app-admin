import { Element, useEditor } from '@craftjs/core'
import { Image } from 'antd'
import CraftCarousel from 'lodestar-app-element/src/components/craft/CraftCarousel'
import { StyledBoxWrapper } from '.'

const CoverSection: React.FC = () => {
  const { connectors } = useEditor()
  return (
    <>
      <StyledBoxWrapper
        className="mb-3"
        ref={ref =>
          ref &&
          connectors.create(
            ref,
            <Element
              is={CraftCarousel}
              type="normal"
              covers={[
                {
                  title: '換個方式說溝通更有效',
                  paragraph:
                    '生命的目的是盡可能多地成為你自己，將你天生的才能和能力與你生活經驗中的智慧結合起來，並將它們與你內在的精神融合在一起，然後把自己作為禮物送回世界。',
                  mobileCoverUrl: 'https://static.kolable.com/images/demo/cover-01-m.png',
                  desktopCoverUrl: 'https://static.kolable.com/images/demo/cover-01.png',
                  link: '/programs',
                  openNewTab: false,
                },
                {
                  title: '',
                  paragraph: '',
                  mobileCoverUrl: 'https://static.kolable.com/images/demo/cover-02-m.jpg',
                  desktopCoverUrl: 'https://static.kolable.com/images/demo/cover-02.jpg',
                  link: '',
                  openNewTab: false,
                },
              ]}
              titleStyle={{
                color: '#ffffff',
                margin: { mb: '0', ml: '0', mr: '0', mt: '0' },
                fontSize: 26,
                textAlign: 'center',
                fontWeight: 'bold',
              }}
              paragraphStyle={{
                color: '#ffffff',
                margin: { mb: '0', ml: '0', mr: '0', mt: '0' },
                fontSize: 16,
                textAlign: 'center',
                fontWeight: 'normal',
                lineHeight: 1.5,
              }}
            />,
          )
        }
      >
        <Image preview={false} src="https://static.kolable.com/images/default/craft/banner-title-dark.png" />
      </StyledBoxWrapper>

      <StyledBoxWrapper
        className="mb-3"
        ref={ref =>
          ref &&
          connectors.create(
            ref,
            <Element
              is={CraftCarousel}
              type="normal"
              covers={[
                {
                  title: '',
                  paragraph: '',
                  mobileCoverUrl: 'https://static.kolable.com/images/demo/cover-02-m.jpg',
                  desktopCoverUrl: 'https://static.kolable.com/images/demo/cover-02.jpg',
                  link: '',
                  openNewTab: false,
                },
                {
                  title: '',
                  paragraph: '',
                  mobileCoverUrl: 'https://static.kolable.com/images/demo/cover-01-m.png',
                  desktopCoverUrl: 'https://static.kolable.com/images/demo/cover-01.png',
                  link: '',
                  openNewTab: false,
                },
              ]}
              titleStyle={{
                color: '#ffffff',
                margin: { mb: '0', ml: '0', mr: '0', mt: '0' },
                fontSize: 26,
                textAlign: 'center',
                fontWeight: 'bold',
              }}
              paragraphStyle={{
                color: '#ffffff',
                margin: { mb: '0', ml: '0', mr: '0', mt: '0' },
                fontSize: 16,
                textAlign: 'center',
                fontWeight: 'normal',
                lineHeight: 1.5,
              }}
            />,
          )
        }
      >
        <Image preview={false} src="https://static.kolable.com/images/default/craft/banner-image.png" />
      </StyledBoxWrapper>
    </>
  )
}

export default CoverSection
