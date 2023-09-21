import { gql, useQuery } from '@apollo/client'
import { Element, SerializedNodes, useEditor, UserComponent } from '@craftjs/core'
import { Select } from 'antd'
import * as CraftElement from 'lodestar-app-element/src/components/common/CraftElement'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React, { useCallback, useMemo, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import CraftTool from '../../components/craft/CraftTool'
import * as hasura from '../../hasura'

const messages = defineMessages({
  selector: { id: 'craft.toolbox.selector', defaultMessage: '選擇元件類型' },
  basic: { id: 'craft.toolbox.basic', defaultMessage: '基本元件' },
  product: { id: 'craft.toolbox.product', defaultMessage: '產品元件' },
  template: { id: 'craft.toolbox.template', defaultMessage: '樣板元件' },
})
const CraftToolbox: React.FC = () => {
  const [selected, setSelected] = useState<'basic' | 'product' | 'template'>()
  const { formatMessage } = useIntl()
  return (
    <div className="p-3" style={{ height: '100%', overflow: 'auto' }}>
      <Select
        className="mb-3"
        style={{ width: '100%' }}
        allowClear
        placeholder={formatMessage(messages.selector)}
        value={selected}
        onChange={v => setSelected(v)}
      >
        <Select.Option value="basic">{formatMessage(messages.basic)}</Select.Option>
        <Select.Option value="product">{formatMessage(messages.product)}</Select.Option>
        <Select.Option value="template">{formatMessage(messages.template)}</Select.Option>
      </Select>
      {(!selected || selected === 'basic') && <BasicToolbox />}
      {(!selected || selected === 'product') && <ProductToolbox />}
      {(!selected || selected === 'template') && <TemplateToolbox />}
    </div>
  )
}
const BasicToolbox: React.FC = () => {
  const { enabledModules } = useApp()
  const img = new Image()
  img.src = 'https://static.kolable.com/images/default/craft/image.png'
  return (
    <div>
      <CraftTool
        as={CraftElement.CraftSection}
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
        width={img.width}
        height={img.height}
        customStyle={{ backgroundImage: `url(${img.src})` }}
      />
      <CraftTool
        as={CraftElement.CraftButton}
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
      <CraftTool as={CraftElement.CraftEmbedded} iframe="" customStyle={{ margin: 0 }} />
      {enabledModules.openai && (
        <CraftTool
          as={CraftElement.CraftAIBot}
          displayName="AI Bot"
          temperature={1}
          system=""
          assistants={[]}
          submitText="submit"
          customStyle={{ margin: 0 }}
        />
      )}
      {/* <CraftTool as={CraftElement.CraftCarousel} canvas>
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
      <CraftTool as={CraftElement.CraftCollapse} list={[]} /> */}
    </div>
  )
}

const ProductToolbox: React.FC = () => {
  const { enabledModules } = useApp()
  return (
    <div>
      <CraftTool
        as={CraftElement.CraftActivityCollection}
        coverUrl="https://static.kolable.com/images/default/craft/activity.png"
        variant="card"
        source={{ from: 'publishedAt', limit: 4 }}
        customStyle={{ width: '100%' }}
      />
      <CraftTool
        as={CraftElement.CraftProgramCollection}
        coverUrl="https://static.kolable.com/images/default/craft/program.png"
        variant="primary"
        source={{ from: 'publishedAt', limit: 4 }}
        customStyle={{ width: '100%' }}
      />
      {/* <CraftTool
        as={CraftElement.CraftProgramContentCollection}
        coverUrl="https://static.kolable.com/images/default/craft/program.png"
        variant="card"
        source={{ from: 'recentWatched', limit: 3 }}
        customStyle={{ width: '100%' }}
      /> */}
      <CraftTool
        as={CraftElement.CraftProgramPackageCollection}
        coverUrl="https://static.kolable.com/images/default/craft/program.png"
        variant="card"
        source={{ from: 'publishedAt', limit: 4 }}
        customStyle={{ width: '100%' }}
      />
      <CraftTool
        as={CraftElement.CraftProjectCollection}
        coverUrl="https://static.kolable.com/images/default/craft/program.png"
        variant="card"
        source={{ from: 'publishedAt', limit: 4 }}
        customStyle={{ width: '100%' }}
      />
      {enabledModules.blog && (
        <CraftTool
          as={CraftElement.CraftPostCollection}
          coverUrl="https://static.kolable.com/images/default/craft/program.png"
          source={{ from: 'publishedAt', limit: 4 }}
          customStyle={{ width: '100%' }}
        />
      )}
      <CraftTool
        as={CraftElement.CraftMemberCollection}
        coverUrl="https://static.kolable.com/images/default/craft/program.png"
        source={{ from: 'role', role: 'content-creator', limit: 4 }}
        customStyle={{ width: '100%' }}
      />
    </div>
  )
}

const TemplateToolbox: React.FC = () => {
  const { templateElements, refetch } = useTemplateElement()
  return (
    <div>
      {templateElements?.map(templateElement => (
        <CraftTool
          key={templateElement.id}
          as={templateElement.node.type}
          canvas={templateElement.node.children.length > 0}
          displayName={templateElement.name}
          coverUrl={templateElement.coverUrl}
          {...templateElement.node.props}
        >
          {templateElement.node.children}
        </CraftTool>
      ))}
      {/* <CraftTool as={ContentSection} coverUrl="https://static.kolable.com/images/default/craft/description.png" />
      <CraftTool as={FeatureSection} coverUrl="https://static.kolable.com/images/default/craft/feature-title.png" />
      <CraftTool
        as={FeatureSection}
        coverUrl="https://static.kolable.com/images/default/craft/feature-title-dark.png"
        variant="dark"
      />
      <CraftTool as={FeatureSection} coverUrl="https://static.kolable.com/images/default/craft/feature.png" />
      <CraftTool
        as={FeatureSection}
        coverUrl="https://static.kolable.com/images/default/craft/feature-dark.png"
        variant="dark"
      />
      <CraftTool as={CTASection} coverUrl="https://static.kolable.com/images/default/craft/cta.png" />
      <CraftTool
        as={CTASection}
        coverUrl="https://static.kolable.com/images/default/craft/cta-dark.png"
        variant="dark"
      />
      <CraftTool as={VerticalCTASection} coverUrl="https://static.kolable.com/images/default/craft/cta-vertical.png" />
      <CraftTool
        as={VerticalCTASection}
        coverUrl="https://static.kolable.com/images/default/craft/cta-vertical-dark.png"
        variant="dark"
      />
      <CraftTool as={FAQSection} coverUrl="https://static.kolable.com/images/default/craft/faq-column.png" />
      <CraftTool
        as={FAQSection}
        coverUrl="https://static.kolable.com/images/default/craft/faq-accordion.png"
        variant="accordion"
      />
      <CraftTool as={ReferrerSection} coverUrl="https://static.kolable.com/images/default/craft/recommend.png" />
      <CraftTool
        as={ReferrerSection}
        coverUrl="https://static.kolable.com/images/default/craft/recommend-dialogue.png"
        variant="card"
      />
      <CraftTool as={StatisticsSection} coverUrl="https://static.kolable.com/images/default/craft/statistics.png" />
      <CraftTool
        as={StatisticsSection}
        coverUrl="https://static.kolable.com/images/default/craft/statistics-dark.png"
        variant="dark"
      />
      <CraftTool
        as={StatisticsSection}
        coverUrl="https://static.kolable.com/images/default/craft/statistics-image.png"
        variant="image"
      /> */}
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
          cover_url
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
          type: node.data.type as UserComponent,
          props: node.data.props,
          children: node.data.nodes.map(nodeId => {
            const childNode = nodeToElement(nodeId)
            return (
              <Element key={nodeId} is={childNode.type} {...childNode.props} canvas={childNode.children.length > 0}>
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
        coverUrl: apt.cover_url || null,
        node: generateTemplateElement(apt.root_node_id, apt.data),
      })) || [],
    [data, generateTemplateElement],
  )
  return { templateElements, refetch }
}

export default CraftToolbox
