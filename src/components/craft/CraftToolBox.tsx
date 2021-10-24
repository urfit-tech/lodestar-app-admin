import * as CraftElement from 'lodestar-app-element/src/components/craft'
import React from 'react'
import { useIntl } from 'react-intl'
import CraftTool from './CraftTool'
import ContentSection from './templates/ContentSection'
import CTASection from './templates/CTASection'
import FAQSection from './templates/FAQSection'
import FeatureSection from './templates/FeatureSection'
import ReferrerSection from './templates/ReferrerSection'
import StatisticsSection from './templates/StatisticsSection'
import VerticalCTASection from './templates/VerticalCTASection'

export type CraftToolboxCategory = 'basic' | 'product' | 'template'
const CraftToolbox: React.VFC<{ category: CraftToolboxCategory }> = ({ category }) => {
  const { formatMessage } = useIntl()
  return (
    <div className="px-3 mt-4">
      {category === 'basic' && (
        <>
          <CraftTool
            as={CraftElement.CraftBackground}
            message={{ id: 'craft.toolbox.section', defaultMessage: '區塊' }}
            backgroundType="none"
            padding={{ pt: '64', pb: '64' }}
            margin={{ mb: '5' }}
            canvas
          />
          <CraftTool
            as={CraftElement.CraftLayout}
            message={{ id: 'craft.toolbox.layout', defaultMessage: '佈局' }}
            mobile={{
              padding: { p: '20' },
              columnAmount: 1,
              columnRatio: [12],
              displayAmount: 3,
            }}
            desktop={{
              padding: { p: '200' },
              columnAmount: 3,
              columnRatio: [4, 4, 4],
              displayAmount: 3,
            }}
            canvas
          />
          <CraftTool
            as={CraftElement.CraftTitle}
            message={{ id: 'craft.toolbox.title', defaultMessage: '標題' }}
            titleContent="Write down your incredible title!"
            fontSize={28}
            margin={{ mt: '25', mb: '25', ml: '25', mr: '25' }}
            textAlign="center"
            fontWeight="normal"
            color="#585858"
          />
          <CraftTool
            as={CraftElement.CraftParagraph}
            message={{ id: 'craft.toolbox.paragraph', defaultMessage: '段落' }}
            paragraphContent="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
            fontSize={16}
            margin={{ mt: '25', mb: '25', ml: '25', mr: '25' }}
            lineHeight={1.69}
            textAlign="center"
            fontWeight="normal"
            color="#585858"
          />
          <CraftTool
            as={CraftElement.CraftImage}
            message={{ id: 'craft.toolbox.message', defaultMessage: '圖片' }}
            desktop={{
              width: '100%',
              padding: {},
              margin: {},
              coverUrl: 'https://static.kolable.com/images/default/craft/image.png',
            }}
            mobile={{
              width: '100%',
              padding: {},
              margin: {},
              coverUrl: 'https://static.kolable.com/images/default/craft/image.png',
            }}
          />
          <CraftTool
            as={CraftElement.CraftButton}
            message={{ id: 'craft.toolbox.button', defaultMessage: '按鈕' }}
            title="馬上查看"
            link=""
            openNewTab={false}
            size="lg"
            block={false}
            variant="solid"
            color="#fff"
            backgroundType="solidColor"
            backgroundColor="#4c5b8f"
          />
          <CraftTool
            as={CraftElement.CraftEmbed}
            message={{ id: 'craft.toolbox.embedded', defaultMessage: '嵌入元素' }}
            iframe=""
            margin="0;0;0;0"
          />
          <CraftTool
            as={CraftElement.CraftCarousel}
            message={{ id: 'craft.toolbox.carousel', defaultMessage: '輪播' }}
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
          />
        </>
      )}
      {category === 'product' && (
        <>
          <CraftTool
            as={CraftElement.CraftActivityCollection}
            message={{ id: 'craft.toolbox.activity', defaultMessage: '活動' }}
            coverUrl="https://static.kolable.com/images/default/craft/activity.png"
            variant="card"
            sourceOptions={{ source: 'publishedAt', limit: 4 }}
          />
          <CraftTool
            as={CraftElement.CraftProgramCollection}
            message={{ id: 'craft.toolbox.program', defaultMessage: '課程' }}
            coverUrl="https://static.kolable.com/images/default/craft/program.png"
            variant="card"
            sourceOptions={{ source: 'publishedAt', limit: 4 }}
          />
          <CraftTool
            as={CraftElement.CraftProgramContentCollection}
            message={{ id: 'craft.toolbox.programContent', defaultMessage: '課程單元' }}
            coverUrl="https://static.kolable.com/images/default/craft/program.png"
            variant="card"
            sourceOptions={{ source: 'recentWatched', limit: 3 }}
          />
          <CraftTool
            as={CraftElement.CraftProgramPackageCollection}
            message={{ id: 'craft.toolbox.activity', defaultMessage: '課程組合' }}
            coverUrl="https://static.kolable.com/images/default/craft/program.png"
            variant="card"
            sourceOptions={{ source: 'publishedAt', limit: 4 }}
          />
        </>
      )}
      {category === 'template' && (
        <>
          <CraftTool
            as={ContentSection}
            message={{ id: 'craft.toolbox.feature-1', defaultMessage: '內容區塊' }}
            coverUrl="https://static.kolable.com/images/default/craft/description.png"
          />
          <CraftTool
            as={FeatureSection}
            message={{ id: 'craft.toolbox.feature-1', defaultMessage: '特色區塊' }}
            coverUrl="https://static.kolable.com/images/default/craft/feature-title.png"
          />
          <CraftTool
            as={FeatureSection}
            message={{ id: 'craft.toolbox.feature-2', defaultMessage: '特色區塊' }}
            coverUrl="https://static.kolable.com/images/default/craft/feature-title-dark.png"
            variant="dark"
          />
          <CraftTool
            as={FeatureSection}
            message={{ id: 'craft.toolbox.feature-3', defaultMessage: '特色區塊' }}
            coverUrl="https://static.kolable.com/images/default/craft/feature.png"
          />
          <CraftTool
            as={FeatureSection}
            message={{ id: 'craft.toolbox.feature-4', defaultMessage: '特色區塊' }}
            coverUrl="https://static.kolable.com/images/default/craft/feature-dark.png"
            variant="dark"
          />
          <CraftTool
            as={CTASection}
            message={{ id: 'craft.toolbox.cta-1', defaultMessage: '行動呼籲區塊' }}
            coverUrl="https://static.kolable.com/images/default/craft/cta.png"
          />
          <CraftTool
            as={CTASection}
            message={{ id: 'craft.toolbox.cta-2', defaultMessage: '行動呼籲區塊' }}
            coverUrl="https://static.kolable.com/images/default/craft/cta-dark.png"
            variant="dark"
          />
          <CraftTool
            as={VerticalCTASection}
            message={{ id: 'craft.toolbox.cta-3', defaultMessage: '行動呼籲區塊' }}
            coverUrl="https://static.kolable.com/images/default/craft/cta-vertical.png"
          />
          <CraftTool
            as={VerticalCTASection}
            message={{ id: 'craft.toolbox.cta-4', defaultMessage: '行動呼籲區塊' }}
            coverUrl="https://static.kolable.com/images/default/craft/cta-vertical-dark.png"
            variant="dark"
          />
          <CraftTool
            as={FAQSection}
            message={{ id: 'craft.toolbox.faq-1', defaultMessage: '常見問題區塊' }}
            coverUrl="https://static.kolable.com/images/default/craft/faq-column.png"
          />
          <CraftTool
            as={FAQSection}
            message={{ id: 'craft.toolbox.faq-2', defaultMessage: '常見問題區塊' }}
            coverUrl="https://static.kolable.com/images/default/craft/faq-accordion.png"
            variant="accordion"
          />
          <CraftTool
            as={ReferrerSection}
            message={{ id: 'craft.toolbox.referrer-1', defaultMessage: '推薦區塊' }}
            coverUrl="https://static.kolable.com/images/default/craft/recommend.png"
          />
          <CraftTool
            as={ReferrerSection}
            message={{ id: 'craft.toolbox.referrer-2', defaultMessage: '推薦區塊' }}
            coverUrl="https://static.kolable.com/images/default/craft/recommend-dialogue.png"
            variant="card"
          />
          <CraftTool
            as={StatisticsSection}
            message={{ id: 'craft.toolbox.statistics-1', defaultMessage: '統計區塊' }}
            coverUrl="https://static.kolable.com/images/default/craft/statistics.png"
          />
          <CraftTool
            as={StatisticsSection}
            message={{ id: 'craft.toolbox.statistics-2', defaultMessage: '統計區塊' }}
            coverUrl="https://static.kolable.com/images/default/craft/statistics-dark.png"
            variant="dark"
          />
          <CraftTool
            as={StatisticsSection}
            message={{ id: 'craft.toolbox.statistics-3', defaultMessage: '統計區塊' }}
            coverUrl="https://static.kolable.com/images/default/craft/statistics-image.png"
            variant="image"
          />
        </>
      )}
    </div>
  )
}

export default CraftToolbox
