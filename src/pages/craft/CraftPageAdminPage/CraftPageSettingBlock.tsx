import { Editor, Element, Frame, useEditor } from '@craftjs/core'
import { Button, message, Tabs } from 'antd'
import { CraftContainer } from 'lodestar-app-element/src/components/craft'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { configureResolver, CraftToolBox } from '../../../components/craft'
import { handleError } from '../../../helpers'
import { commonMessages, craftPageMessages } from '../../../helpers/translation'
import { useMutateAppPage } from '../../../hooks/appPage'
import { BrushIcon, PageIcon } from '../../../images/icon'
import { CraftPageAdminProps } from '../../../types/craft'

const messages = defineMessages({
  saveAndUpdate: { id: 'project.ui.saveAndUpdate', defaultMessage: '儲存並更新' },
})

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
`
const StyledContent = styled.div`
  /* padding: 20px;
  background: #eee; */
`
const StyledTabs = styled(Tabs)`
  width: 100%;
  height: 100vh;
  min-width: 300px;
  position: relative;
`
const StyledPageIcon = styled(PageIcon)<{ active: string }>`
  font-size: 21px;
  g {
    fill: ${props => (props.active === 'component' ? props.theme['@primary-color'] : '#585858')};
  }
`
const StyledBrushIcon = styled(BrushIcon)<{ active: string }>`
  font-size: 21px;
  path {
    fill: ${props => (props.active === 'settings' ? props.theme['@primary-color'] : '#585858')};
  }
`

const StyledTabsPane = styled(Tabs.TabPane)`
  height: calc(100vh - 64px - 49px - 60px);
  overflow-y: scroll;
  background: #ffffff;
  .ant-tabs-content-holder {
    background: #ffffff;
  }
`
const StyledTabBarWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 1rem;
  background: #ffffff;

  .ant-tabs-tab {
    margin: 1em 1.5em;
    padding: 0 0;
  }
`

const CraftPageSettingBlock: React.VFC<{
  pageAdmin: CraftPageAdminProps | null
  onRefetch?: () => void
}> = ({ pageAdmin, onRefetch }) => {
  const [activeKey, setActiveKey] = useState('component')

  return (
    <Editor resolver={configureResolver()}>
      <div className="d-flex">
        <StyledScrollBar>
          <StyledContent>
            <div style={{ height: 'auto', background: 'white' }} onClick={() => setActiveKey('settings')}>
              <Frame data={pageAdmin?.craftData ? JSON.stringify(pageAdmin.craftData) : undefined}>
                <Element is={CraftContainer} margin={{}} padding={{ pb: '40', pt: '40', pr: '40', pl: '40' }} canvas />
              </Frame>
            </div>
          </StyledContent>
        </StyledScrollBar>
        <SettingBlock pageId={pageAdmin?.id} activeKey={activeKey} setActiveKey={setActiveKey} onRefetch={onRefetch} />
      </div>
    </Editor>
  )
}

const SettingBlock: React.VFC<{
  pageId?: string
  activeKey: string
  setActiveKey: React.Dispatch<React.SetStateAction<string>>
  onRefetch?: () => void
}> = ({ pageId, activeKey, setActiveKey, onRefetch }) => {
  const { currentMemberId } = useAuth()
  const { formatMessage } = useIntl()
  const { updateAppPage } = useMutateAppPage()
  const { isDataChanged, actions, query } = useEditor((state, query) => ({
    isDataChanged: query.history.canUndo(),
  }))
  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    if (!currentMemberId || !pageId) {
      return
    }
    setLoading(true)
    updateAppPage({
      pageId,
      editorId: currentMemberId,
      craftData: JSON.parse(query.serialize()),
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
        onRefetch?.()
        actions.history.clear()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <StyledSettingBlock>
      <StyledTabs
        activeKey={activeKey || 'component'}
        onChange={key => setActiveKey(key)}
        renderTabBar={(props, DefaultTabBar) => (
          <StyledTabBarWrapper>
            <DefaultTabBar {...props} className="mb-0" />
            <Button disabled={!isDataChanged} loading={loading} type="primary" onClick={handleSubmit}>
              {formatMessage(messages.saveAndUpdate)}
            </Button>
          </StyledTabBarWrapper>
        )}
      >
        <StyledTabsPane key="component" tab={<StyledPageIcon active={activeKey} />}>
          <CraftToolBox />
        </StyledTabsPane>
        <StyledTabsPane key="settings" tab={<StyledBrushIcon active={activeKey} />}>
          <CraftSettingsPanel onDelete={() => setActiveKey('component')} />
        </StyledTabsPane>
      </StyledTabs>
    </StyledSettingBlock>
  )
}

const CraftSettingsPanel: React.VFC<{ onDelete?: () => void }> = ({ onDelete }) => {
  const { formatMessage } = useIntl()
  const {
    query: { node },
    selected,
    actions,
  } = useEditor(state => {
    const currentNodeId = state.events.selected
    let selected
    if (currentNodeId) {
      selected = {
        id: currentNodeId,
        name: state.nodes[currentNodeId].data.name,
        settings: state.nodes[currentNodeId].related && state.nodes[currentNodeId].related.settings,
        labelName: state.nodes[currentNodeId].data?.custom?.button?.label,
      }
    }
    return {
      selected,
    }
  })

  return (
    <div className="px-3 mb-4">
      {selected && selected.settings && React.createElement(selected.settings)}
      {selected && selected.labelName && (
        <Button
          block
          onClick={() => {
            if (node(selected.id).isRoot()) {
              return
            }
            if (window.confirm(formatMessage(craftPageMessages.text.deleteWarning))) {
              actions.delete(selected.id)
              onDelete?.()
            }
          }}
        >
          {selected.labelName === 'deleteBlock'
            ? formatMessage(craftPageMessages.ui.deleteBlock)
            : formatMessage(craftPageMessages.ui.deleteAllBlock)}
        </Button>
      )}
    </div>
  )
}

export default CraftPageSettingBlock
