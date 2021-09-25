import { Editor, Element, Frame, useEditor } from '@craftjs/core'
import { Button, message, Tabs } from 'antd'
import {
  CraftActivity,
  CraftBackground,
  CraftButton,
  CraftCard,
  CraftCarousel,
  CraftCarouselContainer,
  CraftCollapse,
  CraftContainer,
  CraftImage,
  CraftInstructor,
  CraftLayout,
  CraftParagraph,
  CraftPodcastProgram,
  CraftProgram,
  CraftProject,
  CraftStatistics,
  CraftTitle,
  CraftTitleAndParagraph,
} from 'lodestar-app-element/src/components/craft'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import {
  ActivitySettings,
  BackgroundSettings,
  ButtonSettings,
  CardSettings,
  CarouselContainerSettings,
  CarouselSettings,
  CollapseSettings,
  ContainerSettings,
  ImageSettings,
  InstructorSettings,
  LayoutSettings,
  ParagraphSettings,
  PodcastProgramSettings,
  ProgramSettings,
  ProjectSettings,
  StatisticsSettings,
  TitleAndParagraphSettings,
  TitleSettings,
} from '../../components/craftSetting'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { useMutateAppPage } from '../../hooks/appPage'
import { ReactComponent as PageIcon } from '../../images/icon/page.svg'
import { ReactComponent as BrushIcon } from '../../images/icon/paintbrush.svg'
import { CraftPageAdminProps } from '../../types/craft'
import CraftSettingsPanel from './CraftSettingsPanel'
import CraftToolbox from './CraftToolbox'

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
          <CraftToolbox />
        </StyledTabsPane>
        <StyledTabsPane key="settings" tab={<StyledBrushIcon active={activeKey} />}>
          <CraftSettingsPanel onDelete={() => setActiveKey('component')} />
        </StyledTabsPane>
      </StyledTabs>
    </StyledSettingBlock>
  )
}

const configureResolver = () => {
  CraftActivity.craft = {
    related: {
      settings: ActivitySettings,
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftBackground.craft = {
    related: {
      settings: BackgroundSettings,
    },
    custom: {
      button: {
        label: 'deleteAllBlock',
      },
    },
  }
  CraftButton.craft = {
    related: {
      settings: ButtonSettings,
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftCard.craft = {
    related: {
      settings: CardSettings,
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftCarousel.craft = {
    related: {
      settings: CarouselSettings,
    },
    custom: {
      button: {
        label: 'deleteAllBlock',
      },
    },
  }
  CraftCarouselContainer.craft = {
    related: {
      settings: CarouselContainerSettings,
    },
    custom: {
      button: {
        label: 'deleteAllBlock',
      },
    },
  }
  CraftCollapse.craft = {
    related: {
      settings: CollapseSettings,
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftContainer.craft = {
    related: {
      settings: ContainerSettings,
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftImage.craft = {
    related: {
      settings: ImageSettings,
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftInstructor.craft = {
    related: {
      settings: InstructorSettings,
    },
  }
  CraftLayout.craft = {
    related: {
      settings: LayoutSettings,
    },
    custom: {
      button: {
        label: 'deleteAllBlock',
      },
    },
  }
  CraftParagraph.craft = {
    related: {
      settings: ParagraphSettings,
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftPodcastProgram.craft = {
    related: {
      settings: PodcastProgramSettings,
    },
  }
  CraftProgram.craft = {
    related: {
      settings: ProgramSettings,
    },
  }
  CraftProject.craft = {
    related: {
      settings: ProjectSettings,
    },
  }
  CraftStatistics.craft = {
    related: {
      settings: StatisticsSettings,
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftTitle.craft = {
    related: {
      settings: TitleSettings,
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftTitleAndParagraph.craft = {
    related: {
      settings: TitleAndParagraphSettings,
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }

  return {
    CraftContainer,
    CraftLayout,
    CraftTitle,
    CraftParagraph,
    CraftTitleAndParagraph,
    CraftButton,
    CraftCarousel,
    CraftStatistics,
    CraftImage,
    CraftCard,
    CraftCollapse,
    CraftBackground,
    CraftProgram,
    CraftProject,
    CraftActivity,
    CraftPodcastProgram,
    CraftInstructor,
    CraftCarouselContainer,
  }
}

export default CraftPageSettingBlock
