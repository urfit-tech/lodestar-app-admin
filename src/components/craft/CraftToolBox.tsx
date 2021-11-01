import { useQuery } from '@apollo/react-hooks'
import { Element, SerializedNodes, useEditor } from '@craftjs/core'
import gql from 'graphql-tag'
import * as CraftElement from 'lodestar-app-element/src/components/common/CraftElement'
import React, { useCallback, useMemo } from 'react'
import * as hasura from '../../hasura'
import CraftTool from './CraftTool'
import ContentSection from './templates/ContentSection'
import CTASection from './templates/CTASection'
import FAQSection from './templates/FAQSection'
import FeatureSection from './templates/FeatureSection'
import ReferrerSection from './templates/ReferrerSection'
import StatisticsSection from './templates/StatisticsSection'
import VerticalCTASection from './templates/VerticalCTASection'

const BasicToolbox: React.FC = () => {
  return (
    <div className="px-3 mt-4">
      <CraftTool
        as={CraftElement.CraftSection}
        message={{ id: 'craft.toolbox.section', defaultMessage: '區塊' }}
        customStyle={{
          padding: '64px 0px',
          margin: '0 0 5px 0',
          background: '#fff',
        }}
        canvas
      >
        <Element is={CraftElement.CraftTitle} title="Sample Title" />
      </CraftTool>
      <CraftTool
        as={CraftElement.CraftLayout}
        message={{ id: 'craft.toolbox.layout', defaultMessage: '佈局' }}
        ratios={[12]}
        customStyle={{
          padding: 20,
        }}
        responsive={{
          desktop: {
            ratios: [4, 4, 4],
            customStyle: {
              padding: 200,
            },
          },
        }}
        canvas
      >
        <Element is={CraftElement.CraftTitle} title="Sample Title" />
        <Element is={CraftElement.CraftTitle} title="Sample Title" />
        <Element is={CraftElement.CraftTitle} title="Sample Title" />
      </CraftTool>
      <CraftTool
        as={CraftElement.CraftTitle}
        message={{ id: 'craft.toolbox.title', defaultMessage: '標題' }}
        customStyle={{
          fontSize: 28,
          margin: 25,
          textAlign: 'center',
          fontWeight: 'normal',
          color: '#585858',
        }}
        title="Write down your incredible title!"
      />
      <CraftTool
        as={CraftElement.CraftParagraph}
        message={{ id: 'craft.toolbox.paragraph', defaultMessage: '段落' }}
        customStyle={{
          fontSize: 16,
          margin: 25,
          lineHeight: 1.69,
          textAlign: 'center',
          fontWeight: 'normal',
          color: '#585858',
        }}
        content="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
          industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into
          electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of
          Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like
          Aldus PageMaker including versions of Lorem Ipsum."
      />
      <CraftTool
        as={CraftElement.CraftImage}
        message={{ id: 'craft.toolbox.message', defaultMessage: '圖片' }}
        width={400}
        customStyle={{ backgroundImage: `url("https://static.kolable.com/images/default/craft/image.png")` }}
      />
      <CraftTool
        as={CraftElement.CraftButton}
        message={{ id: 'craft.toolbox.button', defaultMessage: '按鈕' }}
        link=""
        openNewTab={false}
        size="lg"
        block={false}
        variant="solid"
        customStyle={{
          color: '#fff',
          backgroundColor: '#4c5b8f',
        }}
        title="馬上查看"
      />
      <CraftTool
        as={CraftElement.CraftEmbedded}
        message={{ id: 'craft.toolbox.embedded', defaultMessage: '嵌入元素' }}
        iframe=""
        customStyle={{ margin: 0 }}
      />
      <CraftTool
        as={CraftElement.CraftCarousel}
        message={{ id: 'craft.toolbox.carousel', defaultMessage: '輪播' }}
        canvas
      >
        <Element is={CraftElement.CraftSection} canvas customStyle={{ padding: '40px 0', background: 'yellow' }}>
          <Element is={CraftElement.CraftTitle} title="Sample Title 1" />
        </Element>
        <Element is={CraftElement.CraftSection} canvas customStyle={{ padding: '40px 0', background: 'yellow' }}>
          <Element is={CraftElement.CraftTitle} title="Sample Title 2" />
        </Element>
        <Element is={CraftElement.CraftSection} canvas customStyle={{ padding: '40px 0', background: 'yellow' }}>
          <Element is={CraftElement.CraftTitle} title="Sample Title 3" />
        </Element>
      </CraftTool>
      <CraftTool
        as={CraftElement.CraftCollapse}
        message={{ id: 'craft.toolbox.collapse', defaultMessage: '折疊面板' }}
        list={[]}
      />
    </div>
  )
}

const ProductToolbox: React.FC = () => {
  return (
    <div>
      {/* <CraftTool
            as={CraftElement.CraftActivityCollection}
            message={{ id: 'craft.toolbox.activity', defaultMessage: '活動' }}
            coverUrl="https://static.kolable.com/images/default/craft/activity.png"
            variant="card"
            sourceOptions={{ source: 'publishedAt', limit: 4 }}
          /> */}
      <CraftTool
        as={CraftElement.CraftProgramCollection}
        message={{ id: 'craft.toolbox.program', defaultMessage: '課程' }}
        coverUrl="https://static.kolable.com/images/default/craft/program.png"
        variant="card"
        sourceOptions={{ source: 'publishedAt', limit: 4 }}
      />
      {/* <CraftTool
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
          /> */}
    </div>
  )
}

const TemplateToolbox: React.FC = () => {
  const { templateElements, refetch } = useTemplateElement()
  return (
    <div className="px-3 mt-4">
      {templateElements?.map((templateElement, idx) => (
        <CraftTool
          key={templateElement.id}
          as={templateElement.node.type}
          message={{ id: `craft.template.${templateElement.id}`, defaultMessage: templateElement.name }}
          canvas={templateElement.node.children.length > 0}
          {...templateElement.node.props}
        >
          {templateElement.node.children}
        </CraftTool>
      ))}
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
    </div>
  )
}

const useTemplateElement = () => {
  const { query } = useEditor()
  const { data, refetch } = useQuery<hasura.GET_APP_PAGE_TEMPLATES>(
    gql`
      query GET_APP_PAGE_TEMPLATES {
        app_page_template {
          id
          name
          root_node_id
          data
        }
      }
    `,
  )
  const generateTemplateElement = useCallback(
    (rootNodeId: string, data: SerializedNodes) => {
      // FIXME: use UserComponent type
      const nodeToElement = (nodeId: string) => {
        const serializedNode = data[nodeId]
        const node = query.parseSerializedNode(serializedNode).toNode()
        return {
          type: node.data.type,
          props: node.data.props,
          children: node.data.nodes.map(nodeId => {
            const childNode = nodeToElement(nodeId)
            return (
              <Element is={childNode.type} {...childNode.props} canvas={childNode.children.length > 0}>
                {childNode.children}
              </Element>
            )
          }),
        }
      }
      return nodeToElement(rootNodeId)
    },
    [query],
  )
  const templateElements = useMemo(
    () =>
      data?.app_page_template.map(apt => ({
        id: apt.id,
        name: apt.name,
        node: generateTemplateElement(apt.root_node_id, apt.data),
      })),
    [data, generateTemplateElement],
  )
  return { templateElements, refetch }
}

const CraftToolbox = {
  BasicToolbox,
  ProductToolbox,
  TemplateToolbox,
}
export default CraftToolbox
