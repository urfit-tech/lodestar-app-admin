import { AddIcon, EditIcon } from '@chakra-ui/icons'
import { useEditor } from '@craftjs/core'
import { Button, Collapse, Input, message, Slider, Tabs } from 'antd'
import { PropsWithCraft } from 'lodestar-app-element/src/components/common/Craftize'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { handleError } from 'lodestar-app-element/src/helpers'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages } from '../../../helpers/translation'
import { useMutateAppPage } from '../../../hooks/appPage'
import { PageIcon } from '../../../images/icon'
import CraftResponsiveSelector from './CraftResponsiveSelector'
import CraftToolbox from './CraftToolBox'

export type CraftSettingsProps<P> = Omit<PropsWithCraft<P>, 'responsive'>
export type CraftElementSettings<P = any> = React.ElementType<{
  props: CraftSettingsProps<P>
  onPropsChange?: (changedProps: CraftSettingsProps<P>) => void
}>

const StyledTabs = styled(Tabs)`
  width: 100%;
  height: 100%;
  min-width: 300px;
  position: relative;
  .ant-tabs-content {
    height: 100%;
  }
  .ant-tabs-content-holder {
    background: #ffffff;
  }
`
const StyledPageIcon = styled(PageIcon)<{ active?: boolean }>`
  font-size: 21px;
  g {
    fill: ${props => (props.active ? props.theme['@primary-color'] : '#585858')};
  }
`

const StyledTabsPane = styled(Tabs.TabPane)`
  background: #ffffff;
  overflow-y: scroll;
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
export const CraftSettingLabel = styled.span`
  color: var(--gray-dark);
  font-size: 14px;
  letter-spacing: 0.4px;
  font-weight: 500;
  margin-bottom: 4px;
`
export const CraftSlider = styled(Slider)`
  .ant-slider-track {
    background-color: ${props => props.theme['@primary-color'] || '#000'};
  }
`
export const StyledSettingButtonWrapper = styled.div`
  position: absolute;
  top: 0.5em;
  right: 0.5em;
`
export const StyledUnderLineInput = styled(Input)`
  border-color: #d8d8d8;
  border-style: solid;
  border-top-width: 0px;
  border-right-width: 0px;
  border-bottom-width: 1px;
  border-left-width: 0px;
  :hover {
    border-right-width: 0px !important;
    border-color: #d8d8d8;
  }
`

export const StyledCollapsePanel = styled(Collapse.Panel)`
  .ant-collapse-header {
    padding-left: 0px !important;
  }
  /* .ant-collapse-content-box {
    padding: 0px !important;
  } */
`

const CraftSettingsPanel: React.VFC<{ pageId: string; onSave?: () => void }> = ({ pageId, onSave }) => {
  const { formatMessage } = useIntl()
  const editor = useEditor(state => ({
    currentNode: state.events.selected ? state.nodes[state.events.selected] : null,
  }))
  const { currentMemberId } = useAuth()
  const { updateAppPage } = useMutateAppPage()
  const [loading, setLoading] = useState(false)
  const handleSave = (serializedData: string) => {
    if (!currentMemberId || !pageId) {
      return
    }
    setLoading(true)
    updateAppPage({
      pageId,
      editorId: currentMemberId,
      craftData: JSON.parse(serializedData),
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
        onSave?.()
        editor.actions.history.clear()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }
  return (
    <StyledTabs
      renderTabBar={(props, DefaultTabBar) => (
        <StyledTabBarWrapper>
          <DefaultTabBar {...props} className="mb-0" />
          <Button
            disabled={!editor.query.history.canUndo()}
            loading={loading}
            type="primary"
            onClick={() => handleSave?.(editor.query.serialize())}
          >
            {formatMessage({ id: 'craft.setting.saveAndUpdate', defaultMessage: '儲存並更新' })}
          </Button>
        </StyledTabBarWrapper>
      )}
    >
      <StyledTabsPane key="toolbox" tab={<AddIcon />}>
        <CraftToolbox />
      </StyledTabsPane>
      <StyledTabsPane key="settings" tab={<EditIcon />}>
        <div className="p-3" style={{ height: '100%' }}>
          <CraftResponsiveSelector />
          {editor.currentNode?.related.settings
            ? React.createElement(editor.currentNode?.related.settings)
            : 'Please select an element.'}
        </div>
      </StyledTabsPane>
    </StyledTabs>
  )
}

export default CraftSettingsPanel
