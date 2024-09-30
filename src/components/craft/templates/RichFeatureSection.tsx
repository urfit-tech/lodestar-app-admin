import { Element } from '@craftjs/core'
import {
  CraftCard,
  CraftLayout,
  CraftSection,
  CraftTitle,
} from 'lodestar-app-element/src/components/common/CraftElement'
import React from 'react'
import { useIntl } from 'react-intl'
import craftMessages from '../translation'

const RichFeatureSection: React.VFC<{
  variant?: 'default' | 'dark'
}> = ({ variant = 'default' }) => {
  const { formatMessage } = useIntl()
  return (
    <Element
      id="CraftSection"
      is={CraftSection}
      // backgroundType={variant === 'dark' ? 'backgroundImage' : 'none'}
      // padding={{ pt: '64', pb: '64' }}
      // margin={{ mb: '5' }}
      // coverUrl={
      //   variant === 'dark'
      //     ? 'https://i.picsum.photos/id/166/1920/1080.jpg?hmac=jxymCPYDSY6wglfW8ri3zwn-OgzKS9Kj5XdTHcbpnCk'
      //     : undefined
      // }
      canvas
    >
      <CraftTitle
        title={formatMessage(craftMessages.RichFeatureSection.title)}
        // fontSize={20}
        // margin={{ mb: '40' }}
        // textAlign="center"
        // fontWeight="bold"
        // color={variant === 'dark' ? 'white' : '#585858'}
      />
      <Element
        id="CraftLayout"
        is={CraftLayout}
        ratios={[12]}
        canvas
        // mobile={{
        //   margin: { ml: '16', mr: '16' },
        //   columnAmount: 1,
        //   columnRatio: [12],
        //   displayAmount: 6,
        // }}
        // desktop={{ margin: { ml: '120', mr: '120' }, columnAmount: 3, columnRatio: [4, 4, 4], displayAmount: 6 }}
      >
        <CraftCard
        // type="featureWithParagraph"
        // imageType="image"
        // imageUrl={`https://static.kolable.com/images/demo/home/icon-thumb-${
        //   variant === 'dark' ? 'white' : 'blue'
        // }.svg`}
        // imageMargin={{ mb: '16' }}
        // title="特色標題 1"
        // titleStyle={{
        //   fontSize: 16,
        //   margin: {},
        //   textAlign: 'left',
        //   fontWeight: 'bold',
        //   color: variant === 'dark' ? 'white' : '#585858',
        // }}
        // paragraph={'遠程也能參與互動，用超低成本造成內容的最大效能，讓粉絲隨時隨地主動互動'}
        // paragraphStyle={{
        //   fontSize: 14,
        //   margin: { mr: '20' },
        //   textAlign: 'left',
        //   fontWeight: 'lighter',
        //   lineHeight: 1.57,
        //   color: variant === 'dark' ? 'white' : '#585858',
        // }}
        // cardPadding={{ pt: '32', pb: '32', pl: '32', pr: '32' }}
        // cardMargin={{}}
        // variant={variant === 'dark' ? 'outline' : 'backgroundColor'}
        // backgroundType={variant === 'dark' ? 'none' : 'solidColor'}
        // solidColor="white"
        // outlineColor={variant === 'dark' ? 'white' : undefined}
        />
        <CraftCard
        // type="featureWithParagraph"
        // imageType="image"
        // imageUrl={`https://static.kolable.com/images/demo/home/icon-thumb-${
        //   variant === 'dark' ? 'white' : 'blue'
        // }.svg`}
        // imageMargin={{ mb: '16' }}
        // title="特色標題 2"
        // titleStyle={{
        //   fontSize: 16,
        //   margin: {},
        //   textAlign: 'left',
        //   fontWeight: 'bold',
        //   color: variant === 'dark' ? 'white' : '#585858',
        // }}
        // paragraph="遠程也能參與互動，用超低成本造成內容的最大效能，讓粉絲隨時隨地主動互動"
        // paragraphStyle={{
        //   fontSize: 14,
        //   margin: { mr: '20' },
        //   textAlign: 'left',
        //   fontWeight: 'lighter',
        //   lineHeight: 1.57,
        //   color: variant === 'dark' ? 'white' : '#585858',
        // }}
        // cardPadding={{ pt: '32', pb: '32', pl: '32', pr: '32' }}
        // cardMargin={{}}
        // variant={variant === 'dark' ? 'outline' : 'backgroundColor'}
        // backgroundType={variant === 'dark' ? 'none' : 'solidColor'}
        // solidColor="white"
        // outlineColor={variant === 'dark' ? 'white' : undefined}
        />
        <CraftCard
        // type="featureWithParagraph"
        // imageType="image"
        // imageUrl={`https://static.kolable.com/images/demo/home/icon-thumb-${
        //   variant === 'dark' ? 'white' : 'blue'
        // }.svg`}
        // imageMargin={{ mb: '16' }}
        // title="特色標題 3"
        // titleStyle={{
        //   fontSize: 16,
        //   margin: {},
        //   textAlign: 'left',
        //   fontWeight: 'bold',
        //   color: variant === 'dark' ? 'white' : '#585858',
        // }}
        // paragraph="遠程也能參與互動，用超低成本造成內容的最大效能，讓粉絲隨時隨地主動互動"
        // paragraphStyle={{
        //   fontSize: 14,
        //   margin: { mr: '20' },
        //   textAlign: 'left',
        //   fontWeight: 'lighter',
        //   lineHeight: 1.57,
        //   color: variant === 'dark' ? 'white' : '#585858',
        // }}
        // cardPadding={{ pt: '32', pb: '32', pl: '32', pr: '32' }}
        // cardMargin={{}}
        // variant={variant === 'dark' ? 'outline' : 'backgroundColor'}
        // backgroundType={variant === 'dark' ? 'none' : 'solidColor'}
        // solidColor="white"
        // outlineColor={variant === 'dark' ? 'white' : undefined}
        />
        <CraftCard
        // type="featureWithParagraph"
        // imageType="image"
        // imageUrl={`https://static.kolable.com/images/demo/home/icon-thumb-${
        //   variant === 'dark' ? 'white' : 'blue'
        // }.svg`}
        // imageMargin={{ mb: '16' }}
        // title="特色標題 4"
        // titleStyle={{
        //   fontSize: 16,
        //   margin: {},
        //   textAlign: 'left',
        //   fontWeight: 'bold',
        //   color: variant === 'dark' ? 'white' : '#585858',
        // }}
        // paragraph="遠程也能參與互動，用超低成本造成內容的最大效能，讓粉絲隨時隨地主動互動"
        // paragraphStyle={{
        //   fontSize: 14,
        //   margin: { mr: '20' },
        //   textAlign: 'left',
        //   fontWeight: 'lighter',
        //   lineHeight: 1.57,
        //   color: variant === 'dark' ? 'white' : '#585858',
        // }}
        // cardPadding={{ pt: '32', pb: '32', pl: '32', pr: '32' }}
        // cardMargin={{}}
        // variant={variant === 'dark' ? 'outline' : 'backgroundColor'}
        // backgroundType={variant === 'dark' ? 'none' : 'solidColor'}
        // solidColor="white"
        // outlineColor={variant === 'dark' ? 'white' : undefined}
        />

        <CraftCard
        // type="featureWithParagraph"
        // backgroundImageUrl=""
        // imageType="image"
        // imageUrl={`https://static.kolable.com/images/demo/home/icon-thumb-${
        //   variant === 'dark' ? 'white' : 'blue'
        // }.svg`}
        // imageMargin={{ mb: '16' }}
        // title="特色標題 5"
        // titleStyle={{
        //   fontSize: 16,
        //   margin: {},
        //   textAlign: 'left',
        //   fontWeight: 'bold',
        //   color: variant === 'dark' ? 'white' : '#585858',
        // }}
        // paragraph="遠程也能參與互動，用超低成本造成內容的最大效能，讓粉絲隨時隨地主動互動"
        // paragraphStyle={{
        //   fontSize: 14,
        //   margin: { mr: '20' },
        //   textAlign: 'left',
        //   fontWeight: 'lighter',
        //   lineHeight: 1.57,
        //   color: variant === 'dark' ? 'white' : '#585858',
        // }}
        // cardPadding={{ pt: '32', pb: '32', pl: '32', pr: '32' }}
        // cardMargin={{}}
        // variant={variant === 'dark' ? 'outline' : 'backgroundColor'}
        // backgroundType={variant === 'dark' ? 'none' : 'solidColor'}
        // solidColor="white"
        // outlineColor={variant === 'dark' ? 'white' : undefined}
        />
        <CraftCard
        // type="featureWithParagraph"
        // imageType="image"
        // imageUrl={`https://static.kolable.com/images/demo/home/icon-thumb-${
        //   variant === 'dark' ? 'white' : 'blue'
        // }.svg`}
        // imageMargin={{ mb: '16' }}
        // title="特色標題 6"
        // titleStyle={{
        //   fontSize: 16,
        //   margin: {},
        //   textAlign: 'left',
        //   fontWeight: 'bold',
        //   color: variant === 'dark' ? 'white' : '#585858',
        // }}
        // paragraph="遠程也能參與互動，用超低成本造成內容的最大效能，讓粉絲隨時隨地主動互動"
        // paragraphStyle={{
        //   fontSize: 14,
        //   margin: { mr: '20' },
        //   textAlign: 'left',
        //   fontWeight: 'lighter',
        //   lineHeight: 1.57,
        //   color: variant === 'dark' ? 'white' : '#585858',
        // }}
        // cardPadding={{ pt: '32', pb: '32', pl: '32', pr: '32' }}
        // cardMargin={{}}
        // variant={variant === 'dark' ? 'outline' : 'backgroundColor'}
        // backgroundType={variant === 'dark' ? 'none' : 'solidColor'}
        // solidColor="white"
        // outlineColor={variant === 'dark' ? 'white' : undefined}
        />
      </Element>
    </Element>
  )
}

export default RichFeatureSection
