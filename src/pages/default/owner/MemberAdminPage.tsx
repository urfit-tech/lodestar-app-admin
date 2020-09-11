import { CloseOutlined } from '@ant-design/icons'
import { Button, Layout, Tabs } from 'antd'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { Link, useParams } from 'react-router-dom'
import {
  AdminBlock,
  AdminBlockTitle,
  AdminHeader,
  AdminHeaderTitle,
  AdminTabBarWrapper,
} from '../../../components/admin'
import { StyledLayoutContent } from '../../../components/layout/DefaultLayout'
import MemberProfileBasicForm from '../../../components/profile/MemberProfileBasicForm'
import { useMemberAdmin } from '../../../hooks/member'

const messages = defineMessages({
  profile: { id: 'profile.label.profile', defaultMessage: '個人' },
  basic: { id: 'profile.label.basic', defaultMessage: '基本資料' },
  property: { id: 'profile.label.property', defaultMessage: '自訂欄位' },
})

const MemberAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { memberId } = useParams<{ memberId: string }>()
  const { memberAdmin, refetchMemberAdmin } = useMemberAdmin(memberId)

  return (
    <>
      <AdminHeader>
        <Link to="/programs">
          <Button type="link" className="mr-3">
            <CloseOutlined />
          </Button>
        </Link>

        <AdminHeaderTitle>{memberAdmin?.name || memberAdmin?.username || memberId}</AdminHeaderTitle>
      </AdminHeader>

      <Layout>
        <Layout.Sider width="320">Sider</Layout.Sider>
        <StyledLayoutContent variant="gray">
          <Tabs
            defaultActiveKey="profile"
            renderTabBar={(props, DefaultTabBar) => (
              <AdminTabBarWrapper>
                <DefaultTabBar {...props} className="mb-0" />
              </AdminTabBarWrapper>
            )}
          >
            <Tabs.TabPane key="profile" tab={formatMessage(messages.profile)}>
              <div className="container py-5">
                <AdminBlock>
                  <AdminBlockTitle>{formatMessage(messages.basic)}</AdminBlockTitle>
                  <MemberProfileBasicForm memberAdmin={memberAdmin} onRefetch={refetchMemberAdmin} />
                </AdminBlock>
                <AdminBlock>
                  <AdminBlockTitle>{formatMessage(messages.property)}</AdminBlockTitle>
                </AdminBlock>
              </div>
            </Tabs.TabPane>
          </Tabs>
        </StyledLayoutContent>
      </Layout>
    </>
  )
}

export default MemberAdminPage
