import { Editor, Element, Frame } from '@craftjs/core'
import { CraftSection } from 'lodestar-app-element/src/components/common/CraftElement'
import React, { useContext, useEffect, useState } from 'react'
import ReactStyledFrame from 'react-styled-frame'
import styled from 'styled-components'
import { useResolver } from '../../../components/craft/CraftResolver'
import { CraftPageAdminProps } from '../../../types/craft'
import { Device } from '../../../types/general'
import CraftPageBuilderContext, { CraftPageBuilderProvider } from './CraftPageBuilderContext'
import CraftPageBuilderController from './CraftPageBuilderController'
import CraftPageBuilderLayer from './CraftPageBuilderLayer'
import CraftSettingsPanel from './CraftSettingsPanel'
import CraftToolbox from './CraftToolBox'

const StyledContent = styled.div`
  display: flex;
  height: calc(100vh - 64px - 49px);
`
const StyledPreviewBlock = styled.div`
  flex: 1;
`
const StyledSettingBlock = styled.div`
  display: flex;
  flex-direction: column;
  width: 320px;
  height: 100%;
  border-right: 1px solid var(--gray);
`
const StyledFrame = styled(ReactStyledFrame)<{ device?: Device }>`
  width: ${props => (props.device === 'mobile' ? '420px' : props.device === 'tablet' ? '720px' : '100%')};
  height: 100%;
  margin: auto;
  background-color: white;
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

const CraftPageBuilderBlock: React.VFC<{
  pageAdmin: CraftPageAdminProps
  onAppPageUpdate?: () => void
}> = ({ pageAdmin, onAppPageUpdate }) => {
  const resolver = useResolver()
  return (
    <Editor resolver={resolver}>
      <CraftPageBuilderProvider>
        <StyledContent>
          <StyledSettingBlock>
            <CraftPageBuilderController pageId={pageAdmin.id} />
            <CraftToolbox />
            <CraftSettingsPanel />
            <CraftPageBuilderLayer />
          </StyledSettingBlock>
          <StyledPreviewBlock>
            <PreviewFrame data={pageAdmin?.craftData} />
          </StyledPreviewBlock>
        </StyledContent>
      </CraftPageBuilderProvider>
    </Editor>
  )
}

const PreviewFrame: React.VFC<{ data: { [key: string]: string } | null }> = ({ data }) => {
  const { device } = useContext(CraftPageBuilderContext)
  // FIXME: turn into event trigger
  const [headInnerHTML, setHeadInnerHTML] = useState<string>()
  useEffect(() => {
    setTimeout(() => setHeadInnerHTML(document.head.innerHTML), 500)
  }, [])
  return (
    <StyledFrame device={device}>
      {headInnerHTML && <div dangerouslySetInnerHTML={{ __html: headInnerHTML }}></div>}
      <Frame data={data ? JSON.stringify(data) : undefined}>
        <Element is={CraftSection} customStyle={{ padding: 40 }} canvas />
      </Frame>
    </StyledFrame>
  )
}

export default CraftPageBuilderBlock
