import { Element } from '@craftjs/core'
import {
  CraftCard,
  CraftCarousel,
  CraftSection,
  CraftTitle,
} from 'lodestar-app-element/src/components/common/CraftElement'
import React from 'react'
import { useIntl } from 'react-intl'
import craftMessages from '../translation'

const ReferrerSection: React.VFC<{
  variant?: 'default' | 'card'
}> = ({ variant = 'default' }) => {
  const { formatMessage } = useIntl()
  return (
    <Element
      id="CraftSection"
      is={CraftSection}
      // backgroundType="none"
      // padding={{ pt: '64', pb: '64' }}
      // margin={{ mb: '5' }}
      canvas
    >
      <CraftTitle
        title={formatMessage(craftMessages.ReferrerSection.title)}
        // fontSize={20}
        // margin={{ mb: '25' }}
        // textAlign="center"
        // fontWeight="bold"
        // color={'#585858'}
      />
      <Element
        id="CraftCarousel"
        is={CraftCarousel}
        canvas
        // mobile={{
        //   margin: { mt: '0', mb: '0', ml: '16', mr: '16' },
        //   swipeToSlide: true,
        //   slidesToShow: 1,
        //   slidesToScroll: 1,
        //   arrows: true,
        // }}
        // desktop={{
        //   margin: { mt: '0', mb: '0', ml: '20', mr: '20' },
        //   swipeToSlide: true,
        //   slidesToShow: 3,
        //   slidesToScroll: 1,
        //   arrows: true,
        // }}
      >
        <CraftCard
        // type={variant === 'card' ? 'referrer' : 'referrerReverse'}
        // imageType="none"
        // imageUrl=""
        // title="公務員"
        // titleStyle={{
        //   fontSize: 20,
        //   margin: { mb: '12', mt: variant === 'card' ? '0' : '16' },
        //   textAlign: variant === 'card' ? 'left' : 'center',
        //   fontWeight: 'bold',
        //   color: '#585858',
        // }}
        // paragraph="我原是從事公務人員的相關工作，在職訓局上過一期的網頁課，就開始從事網頁工作，覺得自己有很多不足之處，但又不知從何學起，自行看書也覺所學有限，學習網頁資源國外相對較多，但無奈英文不好，爬文的很累。好在看到這門課程，從基礎靜態網頁到進階的互動網頁，都有詳細又美觀的示範案例，很推薦所有對網頁有興趣的朋友。"
        // paragraphStyle={{
        //   fontSize: 16,
        //   margin: {},
        //   textAlign: 'left',
        //   lineHeight: 1.69,
        //   fontWeight: 'normal',
        //   color: '#9b9b9b',
        // }}
        // cardPadding={{ pt: '40', pb: '40', pr: '40', pl: '40' }}
        // cardMargin={{}}
        // variant={variant === 'card' ? 'backgroundColor' : 'none'}
        // backgroundType={variant === 'card' ? 'solidColor' : 'none'}
        // solidColor="white"
        // avatarName="阿公"
        // avatarType="image"
        />
        <CraftCard
        // type={variant === 'card' ? 'referrer' : 'referrerReverse'}
        // imageType="none"
        // imageUrl=""
        // title="行政助理"
        // titleStyle={{
        //   fontSize: 20,
        //   margin: { mb: '12', mt: variant === 'card' ? '0' : '16' },
        //   textAlign: variant === 'card' ? 'left' : 'center',
        //   fontWeight: 'bold',
        //   color: '#585858',
        // }}
        // paragraph="本身非本科畢業，對於設計的知識和技能都是靠零散的自學，但一直沒有融會貫通的感覺，經過老師由淺入深的講解和數個範例練習，重新幫我建構設計的觀念，很適合想踏入這個領遇卻不知道從何開始的人學習！"
        // paragraphStyle={{
        //   fontSize: 16,
        //   margin: {},
        //   textAlign: 'left',
        //   lineHeight: 1.69,
        //   fontWeight: 'normal',
        //   color: '#9b9b9b',
        // }}
        // cardPadding={{ pt: '40', pb: '40', pr: '40', pl: '40' }}
        // cardMargin={{}}
        // variant={variant === 'card' ? 'backgroundColor' : 'none'}
        // backgroundType={variant === 'card' ? 'solidColor' : 'none'}
        // solidColor="white"
        // avatarImageUrl="https://static.kolable.com/images/demo/home/icon-thumb.svg"
        // avatarName="熙雯"
        // avatarType="image"
        />
        <CraftCard
        // type={variant === 'card' ? 'referrer' : 'referrerReverse'}
        // imageType="none"
        // imageUrl=""
        // title="學生"
        // titleStyle={{
        //   fontSize: 20,
        //   margin: { mb: '12', mt: variant === 'card' ? '0' : '16' },
        //   textAlign: variant === 'card' ? 'left' : 'center',
        //   fontWeight: 'bold',
        //   color: '#585858',
        // }}
        // paragraph="前面程式的課程，經過老師由淺入深的講解和數個範例練習，重新幫我建構了網頁設計的觀念，讓我得以將以前那些片段的知識都串接起來並賦予意義，就好像建立了系統性的架構，瞬間有豁然開朗的感覺。"
        // paragraphStyle={{
        //   fontSize: 16,
        //   margin: {},
        //   textAlign: 'left',
        //   lineHeight: 1.69,
        //   fontWeight: 'normal',
        //   color: '#9b9b9b',
        // }}
        // cardPadding={{ pt: '40', pb: '40', pr: '40', pl: '40' }}
        // cardMargin={{}}
        // variant={variant === 'card' ? 'backgroundColor' : 'none'}
        // backgroundType={variant === 'card' ? 'solidColor' : 'none'}
        // solidColor="white"
        // avatarName="阿生"
        // avatarType="image"
        />
      </Element>
    </Element>
  )
}

export default ReferrerSection
