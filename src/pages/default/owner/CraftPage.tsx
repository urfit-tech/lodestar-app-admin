import Icon from '@ant-design/icons'
import { Editor, Element, Frame } from '@craftjs/core'
import React from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle } from '../../../components/admin'
import CraftActionsPanel from '../../../components/craft/CraftActionsPannel'
import CraftCard from '../../../components/craft/CraftCard'
import CraftContainer from '../../../components/craft/CraftContainer'
import CraftSettingsPanel from '../../../components/craft/CraftSettingsPanel'
import CraftToolbox from '../../../components/craft/CraftToolbox'
import AdminLayout from '../../../components/layout/AdminLayout'
import { commonMessages } from '../../../helpers/translation'
import { ReactComponent as PageIcon } from '../../../images/icon/page.svg'

const CraftPage: React.VFC = () => {
  const { formatMessage } = useIntl()

  return (
    <AdminLayout>
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <AdminPageTitle className="d-flex align-items-center mb-0">
          <Icon className="mr-3" component={() => <PageIcon />} />
          <span>{formatMessage(commonMessages.menu.pageSetup)}</span>
        </AdminPageTitle>
      </div>
      <Editor resolver={{ CraftCard, CraftContainer }}>
        <div className="d-flex mb-3">
          <div style={{ width: '70%' }}>
            <Frame>
              <Element is={CraftContainer} padding={5} background="#eee" canvas>
                <CraftCard text="TEST" programId="7ca21659-f825-4220-8cad-2d5b93dc42b7" />
                <Element is={CraftContainer} padding={5} background="#eee" canvas>
                  <CraftCard text="TEST inner" programId="403a6927-4b36-448e-9260-606d2a4a2b0e" />
                </Element>
              </Element>
            </Frame>
          </div>
          <div style={{ width: '30%' }}>
            <CraftToolbox />
            <CraftSettingsPanel />
          </div>
        </div>
        <CraftActionsPanel />
      </Editor>
    </AdminLayout>
  )
}

export default CraftPage
