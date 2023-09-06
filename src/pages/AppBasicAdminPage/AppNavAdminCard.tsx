import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { gql, useMutation, useQuery } from '@apollo/client'
import { Button, message } from 'antd'
import { CardProps } from 'antd/lib/card'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { AppNavProps, NavProps } from 'lodestar-app-element/src/types/app'
import { useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import { ReactSortable } from 'react-sortablejs'
import styled from 'styled-components'
import AdminCard from '../../components/admin/AdminCard'
import DraggableItem from '../../components/common/DraggableItem'
import * as hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import AppNavModal, { AppNavModalProps } from './AppNavModal'
import AppBasicAdminPageMessages from './translation'

type ItemProps = AppNavProps

const StyledBlockTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  line-height: 1.5;
  letter-spacing: 0.2px;
  color: var(--gray-darker);
`

const StyledAppNavHref = styled.p`
  font-size: 14px;
  font-weight: 500;
  color: var(--gray-dark);
  margin-left: 8px;
`

const StyledDraggableMainItem = styled(DraggableItem)`
  width: 100%;
  background-color: #fff;
  padding: 12px 16px;
  border-radius: 4px;
  border: solid 1px #d8d8d8;
  &:not(:first-of-type) {
    margin-top: 12px;
  }
`

const StyledDraggableSubItem = styled(StyledDraggableMainItem)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
`

const StyleMainMenuBlock = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const StyleSubMenuBlock = styled(StyleMainMenuBlock)``

const StyledMainMenuActionBlock = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const StyledDeleteBlock = styled.div`
  display: flex;
  align-items: center;
  align-self: stretch;
  margin-left: 16px;
`

const blocks = ['header', 'footer', 'social_media'] as const

type AppNavAdminCardProps = CardProps
const AppNavAdminCard: React.VFC<AppNavAdminCardProps> = ({ ...cardProps }) => {
  const { id: appId } = useApp()
  const { formatMessage } = useIntl()
  const { navs, appNavListLoading, refetchAppNavList } = useAppNavList()
  const [updateAppNavs] = useMutation<hasura.UPDATE_APP_NAVS, hasura.UPDATE_APP_NAVSVariables>(UPDATE_APP_NAVS)
  const [deleteAppNav] = useMutation<hasura.DELETE_APP_NAV, hasura.DELETE_APP_NAVVariables>(DELETE_APP_NAV)
  const isSortingMainMenuRef = useRef(false)
  const isSortingSubMenuRef = useRef(false)
  const [loading, setLoading] = useState(false)
  const [appNavModalProps, setAppNavModalProps] = useState<AppNavModalProps | null>(null)

  const handleMenuSort: (newAppNavs: ItemProps[]) => void = newAppNavs => {
    setLoading(true)
    updateAppNavs({
      variables: {
        appNavs:
          newAppNavs.map((nav, idx) => ({
            id: nav.id,
            app_id: appId,
            block: nav.block,
            position: idx,
            label: nav.label,
            icon: nav.icon,
            href: nav.href,
            external: nav.external,
            locale: nav.locale,
            tag: nav.tag,
            parent_id: nav.parentId,
            sub_app_navs: {
              data: [],
            },
          })) || [],
      },
    })
      .then(() => {
        refetchAppNavList().then(() => {
          setTimeout(() => {
            const access = document.getElementById(`${newAppNavs[0].block}`)
            access?.scrollIntoView(true)
            message.success(formatMessage(AppBasicAdminPageMessages.AppNavAdminCard.updateAppNavOrderSuccessfully))
          }, 0)
        })
      })
      .catch(handleError)
      .finally(() => {
        setLoading(false)
      })
  }

  const updateMainMenuOrder = (updatedList: ItemProps[]) => {
    if (!isSortingMainMenuRef.current) return
    isSortingMainMenuRef.current = false
    handleMenuSort(updatedList)
  }

  const updateSubMenuOrder = (updatedList: ItemProps[]) => {
    if (!isSortingSubMenuRef.current) return
    isSortingSubMenuRef.current = false
    handleMenuSort(updatedList)
  }

  const handleDelete = (block: 'header' | 'footer' | 'social_media', appNavId: string) => {
    deleteAppNav({ variables: { appNavId: appNavId } })
      .then(() => {
        refetchAppNavList()
          .then(() => {
            setTimeout(() => {
              const access = document.getElementById(block)
              access?.scrollIntoView(true)
              message.success(formatMessage(AppBasicAdminPageMessages.AppNavAdminCard.deleteAppNavSuccessfully))
            }, 0)
          })
          .catch(handleError)
      })
      .catch(handleError)
  }

  const handleRefetch = (block: 'header' | 'footer' | 'social_media') => {
    setAppNavModalProps(null)
    refetchAppNavList().then(() => {
      setTimeout(() => {
        const access = document.getElementById(block)
        access?.scrollIntoView(true)
      }, 0)
    })
  }

  return (
    <AdminCard {...cardProps} className={loading ? 'mask' : ''}>
      {!appNavListLoading &&
        blocks.map(block => (
          <div id={block} className="mb-5" key={block}>
            <StyledBlockTitle className="mb-3">
              {block === 'header'
                ? formatMessage(AppBasicAdminPageMessages.AppNavAdminCard.headerTitle)
                : block === 'footer'
                ? formatMessage(AppBasicAdminPageMessages.AppNavAdminCard.footerTitle)
                : formatMessage(AppBasicAdminPageMessages.AppNavAdminCard.socialLinkTitle)}
            </StyledBlockTitle>
            <ReactSortable
              className="mb-4"
              handle=".draggable-main-item"
              ghostClass="hover-background"
              list={navs?.filter(nav => nav.block === block && !nav.parentId) || []}
              onUpdate={() => (isSortingMainMenuRef.current = true)}
              setList={updatedList => updateMainMenuOrder(updatedList)}
            >
              {navs
                ?.filter(nav => nav.block === block && !nav.parentId)
                ?.map(nav => {
                  return (
                    <StyledDraggableMainItem
                      handlerClassName="draggable-main-item"
                      dataId={nav.id}
                      key={nav.id}
                      dragStyle={{ width: '100%' }}
                    >
                      <StyleMainMenuBlock>
                        <div className="d-flex align-items-center">
                          <span>{nav.label}</span>
                          <StyledAppNavHref>
                            {nav.href} ({nav.locale})
                          </StyledAppNavHref>
                        </div>
                        <StyledMainMenuActionBlock>
                          {block === 'header' ? (
                            <Button
                              className="p-0"
                              icon={<PlusOutlined />}
                              type="link"
                              onClick={() =>
                                setAppNavModalProps({
                                  block: block,
                                  type: 'addSubNav',
                                  parentId: nav.id,
                                  navOptions: {
                                    locale: nav.locale,
                                    position: (navs?.length || 0) + 1,
                                  },
                                })
                              }
                            >
                              {formatMessage(AppBasicAdminPageMessages.AppNavModal.subNav)}
                            </Button>
                          ) : null}
                          <StyledDeleteBlock>
                            <DeleteOutlined
                              key="delete"
                              onClick={() => {
                                window.confirm(formatMessage(commonMessages.text.deleteAppNav)) &&
                                  handleDelete(block, nav.id)
                              }}
                            />
                          </StyledDeleteBlock>
                          <Button
                            className="p-0"
                            icon={<EditOutlined />}
                            type="link"
                            onClick={() =>
                              setAppNavModalProps({
                                block: nav.block,
                                type: 'editNav',
                                editId: nav.id,
                                navOptions: {
                                  ...nav,
                                  external: nav.external.toString(),
                                },
                                hasSubMenu: nav.subNavs.length > 0,
                              })
                            }
                          />
                        </StyledMainMenuActionBlock>
                      </StyleMainMenuBlock>
                      {block === 'header' ? (
                        <ReactSortable
                          handle=".draggable-sub-item"
                          ghostClass="hover-background"
                          list={nav.subNavs.map(subNav => ({ ...subNav, subNavs: [] }))}
                          onUpdate={() => (isSortingSubMenuRef.current = true)}
                          setList={updatedList => updateSubMenuOrder(updatedList)}
                        >
                          {nav.subNavs.map(subNav => {
                            return (
                              <StyledDraggableSubItem
                                handlerClassName="draggable-sub-item"
                                dataId={subNav.id}
                                key={subNav.id}
                                dragStyle={{ width: '100%' }}
                              >
                                <StyleSubMenuBlock>
                                  <div className="d-flex align-items-center">
                                    <span>{subNav.label}</span>
                                    <StyledAppNavHref>{subNav.href}</StyledAppNavHref>
                                  </div>
                                  <StyledMainMenuActionBlock>
                                    <StyledDeleteBlock>
                                      <DeleteOutlined
                                        key="delete"
                                        onClick={() => {
                                          window.confirm(formatMessage(commonMessages.text.deleteAppNav)) &&
                                            handleDelete(block, subNav.id)
                                        }}
                                      />
                                    </StyledDeleteBlock>
                                    <Button
                                      className="p-0"
                                      icon={<EditOutlined />}
                                      type="link"
                                      onClick={() =>
                                        setAppNavModalProps({
                                          block: block,
                                          type: 'editSubNav',
                                          parentId: nav.id,
                                          editId: subNav.id,
                                          navOptions: {
                                            label: subNav.label,
                                            external: subNav.external.toString(),
                                            href: subNav.href,
                                            locale: subNav.locale,
                                            tag: subNav.tag,
                                            position: subNav.position,
                                          },
                                        })
                                      }
                                    />
                                  </StyledMainMenuActionBlock>
                                </StyleSubMenuBlock>
                              </StyledDraggableSubItem>
                            )
                          })}
                        </ReactSortable>
                      ) : null}
                    </StyledDraggableMainItem>
                  )
                })}
            </ReactSortable>
            <Button
              className="p-0"
              icon={<PlusOutlined />}
              type="link"
              onClick={() =>
                setAppNavModalProps({
                  block: block,
                  type: 'addNav',
                  hasSubMenu: false,
                  navOptions: { position: (navs?.length || 0) + 1 },
                })
              }
            >
              {formatMessage(AppBasicAdminPageMessages.AppNavModal.addNav)}
            </Button>
          </div>
        ))}
      {appNavModalProps ? (
        <AppNavModal
          parentId={appNavModalProps.parentId}
          editId={appNavModalProps.editId}
          hasSubMenu={appNavModalProps.hasSubMenu}
          block={appNavModalProps.block}
          type={appNavModalProps.type}
          navOptions={appNavModalProps.navOptions}
          onRefetch={() => {
            handleRefetch(appNavModalProps.block)
          }}
          onCancel={() => setAppNavModalProps(null)}
        />
      ) : null}
    </AdminCard>
  )
}

const useAppNavList = () => {
  const { data, loading, refetch } = useQuery<hasura.GET_APP_NAV_LIST>(GET_APP_NAV_LIST)
  const navs = data?.app_nav.map(nav => ({
    id: nav.id,
    block: nav.block as NavProps['block'],
    position: nav.position,
    label: nav.label,
    icon: nav.icon || null,
    href: nav.href,
    external: nav.external,
    locale: nav.locale,
    tag: nav.tag || null,
    parentId: nav.parent_id || null,
    subNavs: nav.sub_app_navs.map(v => ({
      id: v.id,
      block: v.block as NavProps['block'],
      position: v.position,
      label: v.label,
      icon: v.icon || null,
      href: v.href,
      external: v.external,
      locale: v.locale,
      tag: v.tag || null,
      parentId: v.parent_id || null,
    })),
  }))

  return {
    navs,
    appNavListLoading: loading,
    refetchAppNavList: refetch,
  }
}

const GET_APP_NAV_LIST = gql`
  query GET_APP_NAV_LIST {
    app_nav(order_by: { position: asc }, where: { parent_id: { _is_null: true } }) {
      id
      block
      position
      label
      icon
      href
      external
      locale
      tag
      parent_id
      sub_app_navs(order_by: { position: asc }) {
        id
        block
        position
        label
        icon
        href
        external
        locale
        tag
        parent_id
      }
    }
  }
`

const UPDATE_APP_NAVS = gql`
  mutation UPDATE_APP_NAVS($appNavs: [app_nav_insert_input!]!) {
    insert_app_nav(objects: $appNavs, on_conflict: { constraint: app_nav_pkey, update_columns: [position] }) {
      affected_rows
    }
  }
`

const DELETE_APP_NAV = gql`
  mutation DELETE_APP_NAV($appNavId: uuid!) {
    delete_app_nav(where: { parent_id: { _eq: $appNavId } }) {
      affected_rows
    }
    delete_app_nav_by_pk(id: $appNavId) {
      id
    }
  }
`

export default AppNavAdminCard
