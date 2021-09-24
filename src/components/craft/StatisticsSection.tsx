import { Element, useEditor } from '@craftjs/core'
import { Image } from 'antd'
import CraftBackground from 'lodestar-app-element/src/components/craft/CraftBackground'
import CraftContainer from 'lodestar-app-element/src/components/craft/CraftContainer'
import CraftImage from 'lodestar-app-element/src/components/craft/CraftImage'
import CraftLayout from 'lodestar-app-element/src/components/craft/CraftLayout'
import CraftStatistics from 'lodestar-app-element/src/components/craft/CraftStatistics'
import CraftTitle from 'lodestar-app-element/src/components/craft/CraftTitle'
import React from 'react'
import { StyledBoxWrapper } from '../../pages/CraftPage/CraftToolbox'

const Statistics: React.VFC<{
  variant?: 'default' | 'dark' | 'image'
}> = ({ variant = 'default' }) => {
  const { connectors } = useEditor()

  const defaultCraftStatistics = (
    <Element
      id="CraftLayout"
      is={CraftLayout}
      canvas
      mobile={{ margin: {}, columnAmount: 1, columnRatio: [12], displayAmount: 4 }}
      desktop={{ margin: {}, columnAmount: 4, columnRatio: [3, 3, 3, 3], displayAmount: 4 }}
    >
      <CraftStatistics
        type="image"
        padding={{ pt: '10', pb: '10' }}
        margin={{}}
        coverUrl={`https://static.kolable.com/images/demo/home/icon-savetime${variant === 'dark' ? '-white' : ''}.svg`}
        title={{
          titleContent: '814+',
          fontSize: 40,
          margin: { mb: '16' },
          textAlign: 'center',
          fontWeight: 'normal',
          color: variant === 'dark' ? 'white' : '#4C5B8F',
        }}
        paragraph={{
          paragraphContent: '覺得超有效',
          fontSize: 14,
          margin: {},
          textAlign: 'center',
          fontWeight: 'lighter',
          color: variant === 'dark' ? 'white' : '#585858',
        }}
      />
      <CraftStatistics
        type="image"
        padding={{ pt: '10', pb: '10' }}
        margin={{}}
        coverUrl={`https://static.kolable.com/images/demo/home/icon-thumb${variant === 'dark' ? '-white' : ''}.svg`}
        title={{
          titleContent: '999+',
          fontSize: 40,
          margin: { mb: '16' },
          textAlign: 'center',
          fontWeight: 'normal',
          color: variant === 'dark' ? 'white' : '#4C5B8F',
        }}
        paragraph={{
          paragraphContent: '覺得超省時間',
          fontSize: 14,
          margin: {},
          textAlign: 'center',
          fontWeight: 'lighter',
          color: variant === 'dark' ? 'white' : '#585858',
        }}
      />
      <CraftStatistics
        type="image"
        padding={{ pt: '10', pb: '10' }}
        margin={{}}
        coverUrl={`https://static.kolable.com/images/demo/home/icon-savetime${variant === 'dark' ? '-white' : ''}.svg`}
        title={{
          titleContent: '353+',
          fontSize: 40,
          margin: { mb: '16' },
          textAlign: 'center',
          fontWeight: 'normal',
          color: variant === 'dark' ? 'white' : '#4C5B8F',
        }}
        paragraph={{
          paragraphContent: '覺得超有效',
          fontSize: 14,
          margin: {},
          textAlign: 'center',
          fontWeight: 'lighter',
          color: variant === 'dark' ? 'white' : '#585858',
        }}
      />
      <CraftStatistics
        type="image"
        padding={{ pt: '10', pb: '10' }}
        margin={{}}
        coverUrl={`https://static.kolable.com/images/demo/home/icon-thumb${variant === 'dark' ? '-white' : ''}.svg`}
        title={{
          titleContent: '666+',
          fontSize: 40,
          margin: { mb: '16' },
          textAlign: 'center',
          fontWeight: 'normal',
          color: variant === 'dark' ? 'white' : '#4C5B8F',
        }}
        paragraph={{
          paragraphContent: '覺得超省時間',
          fontSize: 14,
          margin: {},
          textAlign: 'center',
          fontWeight: 'lighter',
          color: variant === 'dark' ? 'white' : '#585858',
        }}
      />
    </Element>
  )

  const imageCraftStatistics = (
    <Element
      id="CraftLayout"
      is={CraftLayout}
      canvas
      mobile={{ margin: {}, columnAmount: 1, columnRatio: [12], displayAmount: 2 }}
      desktop={{ margin: { ml: '200', mr: '200' }, columnAmount: 2, columnRatio: [4, 8], displayAmount: 2 }}
    >
      <CraftImage
        desktop={{
          type: 'image',
          width: '100%',
          padding: {},
          margin: {},
          coverUrl: 'https://static.kolable.com/images/demo/home/feature-img2.jpg',
        }}
        mobile={{
          type: 'image',
          width: '100%',
          padding: {},
          margin: {},
          coverUrl: 'https://static.kolable.com/images/demo/home/feature-img2.jpg',
        }}
      />
      <Element is={CraftContainer} margin={{}}>
        <CraftTitle
          titleContent="提供完善的服務"
          fontSize={20}
          margin={{ mb: '15' }}
          textAlign="center"
          fontWeight="bold"
          color="#585858"
        />
        <Element
          id="CraftLayout"
          is={CraftLayout}
          canvas
          mobile={{ margin: {}, columnAmount: 1, columnRatio: [12], displayAmount: 3 }}
          desktop={{ margin: { ml: '30', mr: '30' }, columnAmount: 3, columnRatio: [4, 4, 4], displayAmount: 3 }}
        >
          <CraftStatistics
            type="image"
            padding={{ pt: '10', pb: '10' }}
            margin={{ mr: '30' }}
            title={{
              titleContent: '814+',
              fontSize: 40,
              margin: { mb: '16' },
              textAlign: 'center',
              fontWeight: 'normal',
              color: '#4C5B8F',
            }}
            paragraph={{
              paragraphContent: '覺得超有效',
              fontSize: 14,
              margin: {},
              textAlign: 'center',
              fontWeight: 'lighter',
              color: '#585858',
            }}
          />
          <CraftStatistics
            type="image"
            padding={{ pt: '10', pb: '10' }}
            margin={{}}
            title={{
              titleContent: '999+',
              fontSize: 40,
              margin: { mb: '16' },
              textAlign: 'center',
              fontWeight: 'normal',
              color: '#4C5B8F',
            }}
            paragraph={{
              paragraphContent: '覺得超省時間',
              fontSize: 14,
              margin: {},
              textAlign: 'center',
              fontWeight: 'lighter',
              color: '#585858',
            }}
          />
          <CraftStatistics
            type="image"
            padding={{ pt: '10', pb: '10' }}
            margin={{}}
            title={{
              titleContent: '353+',
              fontSize: 40,
              margin: { mb: '16' },
              textAlign: 'center',
              fontWeight: 'normal',
              color: '#4C5B8F',
            }}
            paragraph={{
              paragraphContent: '覺得超有效',
              fontSize: 14,
              margin: {},
              textAlign: 'center',
              fontWeight: 'lighter',
              color: '#585858',
            }}
          />
        </Element>
      </Element>
    </Element>
  )

  return (
    <StyledBoxWrapper
      className="mb-3"
      ref={ref =>
        ref &&
        connectors.create(
          ref,
          <Element
            id="CraftBackground"
            is={CraftBackground}
            backgroundType={variant === 'dark' ? 'backgroundImage' : 'none'}
            padding={{ pt: '64', pb: '64' }}
            margin={{ mb: '5' }}
            coverUrl={
              variant === 'dark'
                ? 'https://i.picsum.photos/id/166/1920/1080.jpg?hmac=jxymCPYDSY6wglfW8ri3zwn-OgzKS9Kj5XdTHcbpnCk'
                : undefined
            }
            canvas
          >
            {variant !== 'image' && (
              <CraftTitle
                titleContent="提供完善的服務"
                fontSize={20}
                margin={{ mb: '25' }}
                textAlign="center"
                fontWeight="bold"
                color={variant === 'dark' ? 'white' : '#585858'}
              />
            )}
            {variant !== 'image' ? defaultCraftStatistics : imageCraftStatistics}
          </Element>,
        )
      }
    >
      {variant === 'default' && (
        <Image preview={false} src="https://static.kolable.com/images/default/craft/statistics.png" />
      )}
      {variant === 'dark' && (
        <Image preview={false} src="https://static.kolable.com/images/default/craft/statistics-dark.png" />
      )}
      {variant === 'image' && (
        <Image preview={false} src="https://static.kolable.com/images/default/craft/statistics-image.png" />
      )}
    </StyledBoxWrapper>
  )
}

export default Statistics
