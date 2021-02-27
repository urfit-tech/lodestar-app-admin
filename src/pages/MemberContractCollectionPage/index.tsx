import Icon from '@ant-design/icons'
import { Tabs } from 'antd'
import { AdminPageTitle } from 'lodestar-app-admin/src/components/admin'
import AdminLayout from 'lodestar-app-admin/src/components/layout/AdminLayout'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { memberContractMessages } from '../../helpers/translation'
import { ReactComponent as UserCopyIcon } from '../../images/icons/user-copy.svg'
import { MemberContractCollectionBlock } from './MemberContractCollectionBlock'

const StyledIcon = styled(Icon)`
  font-size: 24px;
`

export const MemberContractCollectionPage: React.FC = () => {
  const { formatMessage } = useIntl()

  const tabContents: {
    key: 'agreed' | 'revoked'
    tab: string
  }[] = [
    {
      key: 'agreed',
      tab: formatMessage(memberContractMessages.label.agreed),
    },
    {
      key: 'revoked',
      tab: formatMessage(memberContractMessages.label.revoked),
    },
  ]

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <StyledIcon className="mr-3" component={() => <UserCopyIcon />} />
        <span>{formatMessage(memberContractMessages.menu.memberContracts)}</span>
      </AdminPageTitle>
      <Tabs>
        {tabContents.map(v => (
          <Tabs.TabPane key={v.key} tab={v.tab}>
            <MemberContractCollectionBlock variant={v.key} />
          </Tabs.TabPane>
        ))}
      </Tabs>
    </AdminLayout>
  )
}
