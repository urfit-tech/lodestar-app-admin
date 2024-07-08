import Icon, { CloseOutlined, MoreOutlined } from '@ant-design/icons'
import { Button, Divider, Dropdown, Layout, Menu, message, Tabs } from 'antd'
import { UploadFile } from 'antd/lib/upload/interface'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { Link, useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import styled, { css } from 'styled-components'
import { v4 as uuid } from 'uuid'
import { AdminHeader, AdminHeaderTitle, AdminTabBarWrapper } from '../../components/admin'
import { routesProps } from '../../components/common/AdminRouter'
import { CustomRatioImage } from '../../components/common/Image'
import SingleUploader from '../../components/form/SingleUploader'
import { StyledLayoutContent } from '../../components/layout/DefaultLayout'
import { useCustomRenderer } from '../../contexts/CustomRendererContext'
import { currencyFormatter, handleError } from '../../helpers'
import { commonMessages, memberMessages } from '../../helpers/translation'
import { useMutateMember } from '../../hooks/member'
import DefaultAvatar from '../../images/default/avatar.svg'
import { ReactComponent as EmailIcon } from '../../images/icon/email.svg'
import { ReactComponent as PhoneIcon } from '../../images/icon/phone.svg'
import { AppProps } from '../../types/app'
import { MemberAdminProps, UserRole } from '../../types/member'
import DeleteMemberModal from './MemberDeleteAdminModel'
import MemberSmsModel from './MemberSmsModal'

export type renderMemberAdminLayoutProps = {
  activeKey?: string
  enabledModules?: AppProps['enabledModules']
  permissions?: { [key: string]: boolean }
  currentUserRole?: UserRole
  defaultTabPanes: (React.ReactElement | boolean | undefined)[]
  children?: React.ReactNode
}

const StyledSiderContent = styled.div`
  padding: 2.5rem 2rem;
  text-align: center;
`
const StyledName = styled.div`
  color: var(--gray-darker);
  font-size: 20px;
  font-weight: bold;
`
const StyledDescription = styled.div`
  margin-bottom: 0.75rem;
  color: var(--gray-darker);
  display: flex;
  align-items: center;
`
const StyledSpan = styled.span`
  width: 100%;
  text-align: left;
`
const StyledDelPhone = styled.span`
  color: var(--gray);
`
const StyledDescriptionLabel = styled.span`
  color: var(--gray-dark);
  font-size: 14px;
`
const StyledAvatarWrapper = styled.div`
  position: relative;
`
const StyledSingleUploader = styled(SingleUploader)`
  && {
    width: auto;
    margin-top: 50%;
    margin-left: 50%;
    transform: translate(-50%, -50%);
    & button {
      background: transparent;
      color: white;
    }
  }

  .ant-upload.ant-upload-select-picture-card {
    margin: 0;
    height: auto;
    width: 120px;
    border: none;
    background: none;

    .ant-upload {
      padding: 0;
    }
  }
`

const StyledMemberPageMoreOption = styled.div`
  margin-right: 16px;
`

const StyledImageHoverMask = styled.div<{ status?: string }>`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0);
  transform: translate(-50%, -50%);
  position: absolute;
  top: 50%;
  left: 50%;
  transition: all 0.4s;
  & ${StyledSingleUploader} {
    opacity: 0;
  }
  ${props =>
    props.status === 'loading' &&
    css`
      & ${StyledSingleUploader} {
        opacity: 1;
      }
      background-color: rgba(0, 0, 0, 0.5);
    `}
  &:hover {
    background-color: rgba(0, 0, 0, 0.5);
    & ${StyledSingleUploader} {
      opacity: 1;
    }
  }
`

const MemberAdminLayout: React.FC<{
  member: MemberAdminProps & {
    noAgreedContract?: boolean
  }
  tabPanes: (React.ReactElement | boolean | undefined)[]
  onRefetch: () => void
}> = ({ member, tabPanes, onRefetch, children }) => {
  const history = useHistory()
  const location = useLocation()
  const match = useRouteMatch(routesProps.member_admin.path)
  const { currentUserRole, permissions } = useAuth()
  const { enabledModules, settings, host, id: appId } = useApp()
  const { formatMessage } = useIntl()
  const [loading, setLoading] = useState(false)
  const [avatarFile, setAvatarFile] = useState<UploadFile | undefined>(undefined)
  const { renderMemberAdminLayout } = useCustomRenderer()
  const avatarId = uuid()
  const { updateMemberAvatar } = useMutateMember()

  const [visible, setVisible] = useState(false)

  const activeKey = match?.isExact ? 'profile' : location.pathname.replace(match?.url || '', '').substring(1)

  const handleUpdateAvatar = () => {
    setLoading(true)
    updateMemberAvatar({
      variables: {
        memberId: member.id,
        pictureUrl: `https://${process.env.REACT_APP_S3_BUCKET}/avatars/${appId}/${member.id}/${avatarId}`,
      },
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
        onRefetch?.()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <>
      <AdminHeader>
        <Link to="/members">
          <Button type="link" className="mr-3">
            <CloseOutlined />
          </Button>
        </Link>

        <AdminHeaderTitle>{member?.name || member?.username || member.id}</AdminHeaderTitle>

        <StyledMemberPageMoreOption>
          {currentUserRole === 'app-owner' && !!(settings['admin.app_owner.delete_member'] === '1') && (
            <Dropdown
              placement="bottomRight"
              overlay={
                <Menu>
                  <Menu.Item onClick={() => setVisible(true)}>
                    {formatMessage(memberMessages.ui.deleteMember)}
                  </Menu.Item>
                </Menu>
              }
              trigger={['click']}
            >
              <MoreOutlined />
            </Dropdown>
          )}
        </StyledMemberPageMoreOption>

        {(permissions.CHECK_MEMBER_PAGE_PROGRAM_INFO ||
          permissions.CHECK_MEMBER_PAGE_PROJECT_INFO ||
          permissions.CHECK_MEMBER_PAGE_ACTIVITY_INFO ||
          permissions.CHECK_MEMBER_PAGE_PODCAST_INFO ||
          permissions.CHECK_MEMBER_PAGE_APPOINTMENT_INFO ||
          permissions.CHECK_MEMBER_PAGE_MERCHANDISE_INFO) && (
          <a href={`//${host}/members/${member.id}`} target="_blank" rel="noopener noreferrer">
            <Button>{formatMessage(memberMessages.ui.memberPage)}</Button>
          </a>
        )}
      </AdminHeader>

      <Layout>
        <Layout.Sider width="320" breakpoint="lg" collapsedWidth="0">
          <StyledSiderContent>
            <StyledAvatarWrapper>
              <CustomRatioImage
                ratio={1}
                width="120px"
                src={member?.avatarUrl || DefaultAvatar}
                shape="circle"
                className="mx-auto"
              />
              <StyledImageHoverMask status={loading ? 'loading' : undefined}>
                <StyledSingleUploader
                  accept="image/*"
                  listType="picture-card"
                  showUploadList={false}
                  path={`avatars/${appId}/${member.id}/${avatarId}`}
                  onUploading={() => setLoading(true)}
                  onSuccess={() => {
                    setAvatarFile(undefined)
                    handleUpdateAvatar()
                  }}
                  onError={() => setLoading(false)}
                  uploadText={formatMessage(commonMessages.ui.upload)}
                  value={avatarFile}
                  onChange={(value: any) => setAvatarFile(value as UploadFile)}
                />
              </StyledImageHoverMask>
            </StyledAvatarWrapper>
            <StyledName className="mt-3 mb-4">{member?.name || member?.username}</StyledName>
          </StyledSiderContent>
          <StyledSiderContent className="pt-0">
            <StyledDescription>
              <Icon className="mr-2" component={() => <EmailIcon />} />
              <StyledSpan>{member?.email}</StyledSpan>
            </StyledDescription>
            {permissions['MEMBER_PHONE_ADMIN'] &&
              member?.phones.map((phone, index) => (
                <StyledDescription key={index}>
                  <Icon className="mr-2" component={() => <PhoneIcon />} />
                  {!phone.isValid ? (
                    <StyledDelPhone className="mr-2">
                      <del> {phone.phoneNumber} </del>
                    </StyledDelPhone>
                  ) : (
                    <span className="mr-2">{phone.phoneNumber}</span>
                  )}
                  {enabledModules.sms && (
                    <MemberSmsModel
                      memberId={member.id}
                      phone={phone.phoneNumber}
                      name={member.name || member.username}
                    />
                  )}
                </StyledDescription>
              ))}

            <Divider className="my-4" />

            <StyledDescription>
              <StyledDescriptionLabel className="mr-3">
                {formatMessage(commonMessages.label.consumption)}
              </StyledDescriptionLabel>
              <span>{currencyFormatter(member?.consumption || 0)}</span>
            </StyledDescription>
            {enabledModules.coin && (
              <StyledDescription>
                <StyledDescriptionLabel className="mr-3">
                  {formatMessage(commonMessages.label.ownedCoins)}
                </StyledDescriptionLabel>
                <span>
                  {member?.coins || 0} {settings['coin.unit']}
                </span>
              </StyledDescription>
            )}
            <StyledDescription>
              <StyledDescriptionLabel className="mr-3">
                {formatMessage(commonMessages.label.lastLogin)}
              </StyledDescriptionLabel>
              <span>{member?.loginedAt && moment(member.loginedAt).format('YYYY-MM-DD')}</span>
            </StyledDescription>
            <StyledDescription>
              <StyledDescriptionLabel className="mr-3">
                {formatMessage(commonMessages.label.createdDate)}
              </StyledDescriptionLabel>
              <span>{member?.createdAt && moment(member.createdAt).format('YYYY-MM-DD')}</span>
            </StyledDescription>
          </StyledSiderContent>
          <Divider className="my-4" />
        </Layout.Sider>

        <StyledLayoutContent variant="gray">
          <Tabs
            activeKey={activeKey}
            onChange={key => {
              history.push(`/members/${member.id}/${key}`)
            }}
            renderTabBar={(props, DefaultTabBar) => (
              <AdminTabBarWrapper>
                <DefaultTabBar {...props} className="mb-0" />
              </AdminTabBarWrapper>
            )}
          >
            {renderMemberAdminLayout?.content?.({
              enabledModules,
              permissions,
              currentUserRole,
              defaultTabPanes: tabPanes,
              children,
              activeKey,
            }) || tabPanes}
          </Tabs>
        </StyledLayoutContent>

        <DeleteMemberModal email={member.email} visible={visible} setVisible={setVisible} />
      </Layout>
    </>
  )
}

export default MemberAdminLayout
