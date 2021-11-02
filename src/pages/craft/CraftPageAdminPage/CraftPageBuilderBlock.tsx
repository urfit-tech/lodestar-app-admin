import { useApolloClient } from '@apollo/react-hooks'
import { Editor, Element, Frame } from '@craftjs/core'
import { Layers } from '@craftjs/layers'
import gql from 'graphql-tag'
import { CraftSection } from 'lodestar-app-element/src/components/common/CraftElement'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { useResolver } from '../../../components/craft/CraftResolver'
import * as hasura from '../../../hasura'
import { CraftPageAdminProps } from '../../../types/craft'
import CraftSettingsPanel from './CraftSettingsPanel'

const StyledScrollBar = styled.div`
  flex: 12;
  height: calc(100vh - 64px - 49px);
  overflow-x: hidden;
  overflow-y: scroll;
  ::-webkit-scrollbar {
    -webkit-appearance: none;
  }
  ::-webkit-scrollbar:vertical {
    width: 11px;
  }
  ::-webkit-scrollbar-thumb {
    border-radius: 8px;
    border: 2px solid white;
    background-color: rgba(0, 0, 0, 0.5);
  }
`
const StyledSettingBlock = styled.div`
  flex: 4;
  height: calc(100vh - 113px);
  border-left: 1px solid var(--gray);
`
const StyledContent = styled.div`
  /* padding: 20px;
  background: #eee; */
`

const CraftPageBuilderBlock: React.VFC<{
  pageAdmin: CraftPageAdminProps | null
  onAppPageUpdate?: () => void
}> = ({ pageAdmin, onAppPageUpdate }) => {
  const { currentMemberId } = useAuth()
  const { formatMessage } = useIntl()
  const apolloClient = useApolloClient()
  const resolver = useResolver({
    onSave: template => {
      const templateName = window.prompt(
        formatMessage({ id: 'pages.craft.promptTemplateName', defaultMessage: '請輸入樣板名稱' }),
      )
      currentMemberId &&
        templateName &&
        apolloClient
          .mutate<hasura.INSERT_APP_PAGE_TEMPLATE, hasura.INSERT_APP_PAGE_TEMPLATEVariables>({
            mutation: gql`
              mutation INSERT_APP_PAGE_TEMPLATE(
                $currentMemberId: String!
                $templateName: String!
                $rootNodeId: String!
                $serializedNodes: jsonb!
              ) {
                insert_app_page_template_one(
                  object: {
                    author_id: $currentMemberId
                    name: $templateName
                    root_node_id: $rootNodeId
                    data: $serializedNodes
                  }
                ) {
                  id
                }
              }
            `,
            variables: {
              currentMemberId,
              templateName,
              rootNodeId: template.rootNodeId,
              serializedNodes: template.serializedNodes,
            },
          })
          .then(() => alert('add into template'))
          .catch(() => alert('template already exists'))
    },
  })
  return (
    <Editor resolver={resolver}>
      <div className="d-flex">
        <StyledScrollBar>
          <StyledContent>
            <div style={{ height: 'auto', background: 'white' }}>
              <Frame data={pageAdmin?.craftData ? JSON.stringify(pageAdmin.craftData) : undefined}>
                <Element is={CraftSection} customStyle={{ padding: 40 }} canvas />
              </Frame>
            </div>
          </StyledContent>
        </StyledScrollBar>
        {pageAdmin?.id && (
          <StyledSettingBlock>
            <div style={{ height: '70%', overflow: 'auto' }}>
              <CraftSettingsPanel pageId={pageAdmin.id} onSave={onAppPageUpdate} />
            </div>
            <div className="p-3" style={{ height: '30%', overflow: 'auto', backgroundColor: 'white' }}>
              <Layers expandRootOnLoad />
            </div>
          </StyledSettingBlock>
        )}
      </div>
    </Editor>
  )
}

export default CraftPageBuilderBlock
