import { gql, useMutation } from '@apollo/client'
import { Button, Form, Input, message, Select } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { handleError } from 'lodestar-app-element/src/helpers'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { v4 as uuid } from 'uuid'
import AdminModal from '../../components/admin/AdminModal'
import hasura from '../../hasura'
import { commonMessages } from '../../helpers/translation'
import AppBasicAdminPageMessages from './translation'

type FieldProps = {
  label: string
  href: string
  locale: string
  tag: string
  external: string
}

const StyledFormLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  line-height: 1.71;
  letter-spacing: 0.4px;
  color: var(--gray-darker);
`

export type AppNavModalProps = {
  parentId?: string | null
  editId?: string
  hasSubMenu?: boolean
  block: 'header' | 'footer' | 'social_media'
  type: 'addNav' | 'editNav' | 'addSubNav' | 'editSubNav'
  navOptions?: {
    id?: string
    position?: number
    label?: string
    icon?: string | null
    href?: string
    external?: string
    locale?: string
    tag?: string | null
    parentId?: string | null
  }
  onRefetch?: () => void
  onCancel?: () => void
}

const AppNavModal: React.FC<AppNavModalProps> = ({
  parentId,
  editId,
  hasSubMenu,
  block,
  type,
  navOptions,
  onRefetch,
  onCancel,
}) => {
  const { formatMessage } = useIntl()
  const { id: appId } = useApp()
  const [form] = useForm<FieldProps>()
  const [loading, setLoading] = useState(false)
  const [upsertAppNav] = useMutation<hasura.UPSERT_APP_NAV, hasura.UPSERT_APP_NAVVariables>(UPSERT_APP_NAV)
  const [updateParentNav] = useMutation<hasura.UPDATE_PARENT_NAV, hasura.UPDATE_PARENT_NAVVariables>(UPDATE_PARENT_NAV)

  const handleSubmit = (setVisible: React.Dispatch<React.SetStateAction<boolean>>) => {
    setLoading(true)
    form
      .validateFields()
      .then(() => {
        const values = form.getFieldsValue()
        upsertAppNav({
          variables: {
            navId: editId || uuid(),
            appId: appId,
            block: block,
            label: values.label,
            external: values.external === 'true' ? true : false,
            href: values.href || navOptions?.href || '',
            locale: values.locale,
            tag: values.tag || navOptions?.tag || '',
            position: navOptions?.position || 0,
            parentId: parentId,
          },
        })
          .then(() => {
            if (type === 'addSubNav') {
              updateParentNav({ variables: { parentId: parentId } }).then(() => {
                setVisible(false)
                onRefetch?.()
                message.success(formatMessage(commonMessages.event.successfullySaved))
              })
            } else {
              setVisible(false)
              onRefetch?.()
              message.success(formatMessage(commonMessages.event.successfullySaved))
            }
          })
          .catch(handleError)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <AdminModal
      title={
        type === 'addNav'
          ? formatMessage(AppBasicAdminPageMessages.AppNavModal.addNav)
          : type === 'editNav'
          ? formatMessage(AppBasicAdminPageMessages.AppNavModal.editNav)
          : type === 'addSubNav'
          ? formatMessage(AppBasicAdminPageMessages.AppNavModal.addSubNav)
          : formatMessage(AppBasicAdminPageMessages.AppNavModal.editSubNav)
      }
      footer={null}
      visible
      renderFooter={({ setVisible }) => (
        <>
          <Button
            className="mr-2"
            onClick={() => {
              setVisible(false)
              onCancel?.()
            }}
          >
            {formatMessage(commonMessages['ui'].cancel)}
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleSubmit(setVisible)}>
            {formatMessage(commonMessages['ui'].save)}
          </Button>
        </>
      )}
      onCancel={onCancel}
    >
      <Form
        form={form}
        layout="vertical"
        hideRequiredMark
        initialValues={{
          label: navOptions?.label
            ? navOptions?.label
            : block === 'social_media'
            ? 'facebook'
            : type === 'addNav'
            ? formatMessage(AppBasicAdminPageMessages.AppNavModal.untitledNav)
            : formatMessage(AppBasicAdminPageMessages.AppNavModal.untitledSubNav),
          external: navOptions?.external || 'false',
          href: navOptions?.href || '',
          locale: navOptions?.locale || 'zh-tw',
          tag: navOptions?.tag || '',
        }}
      >
        <Form.Item
          label={<StyledFormLabel>{formatMessage(AppBasicAdminPageMessages.AppNavModal.navLabel)}</StyledFormLabel>}
          name="label"
          rules={[{ required: true, message: formatMessage(AppBasicAdminPageMessages.AppNavModal.navLabelIsRequired) }]}
        >
          {block === 'social_media' ? (
            <Select
              options={[
                { value: 'facebook', label: 'facebook' },
                { value: 'line', label: 'line' },
                { value: 'instagram', label: 'instagram' },
                { value: 'youtube', label: 'youtube' },
                { value: 'group', label: 'group' },
              ]}
            />
          ) : (
            <Input />
          )}
        </Form.Item>
        {!hasSubMenu ? (
          <Form.Item
            label={<StyledFormLabel>{formatMessage(AppBasicAdminPageMessages.AppNavModal.navHref)}</StyledFormLabel>}
          >
            <Input.Group compact>
              <Form.Item className="col-3 mb-2" name="external">
                <Select
                  options={[
                    {
                      value: 'false',
                      label: formatMessage(AppBasicAdminPageMessages.AppNavModal.openInSamePage),
                    },
                    { value: 'true', label: formatMessage(AppBasicAdminPageMessages.AppNavModal.openInNewTab) },
                  ]}
                />
              </Form.Item>
              <Form.Item className="col-9 mb-2" name="href">
                <Input placeholder={formatMessage(AppBasicAdminPageMessages.AppNavModal.pleaseFillInTheHref)} />
              </Form.Item>
            </Input.Group>
          </Form.Item>
        ) : null}

        <Input.Group compact>
          <Form.Item
            className="col-6"
            name="locale"
            label={<StyledFormLabel>{formatMessage(AppBasicAdminPageMessages.AppNavModal.locale)}</StyledFormLabel>}
          >
            <Select
              disabled={parentId ? true : false}
              onChange={() => {}}
              options={[
                { value: 'zh-tw', label: formatMessage(AppBasicAdminPageMessages.AppNavModal.zhTw) },
                { value: 'zh-cn', label: formatMessage(AppBasicAdminPageMessages.AppNavModal.zhCn) },
                { value: 'en-us', label: formatMessage(AppBasicAdminPageMessages.AppNavModal.enUs) },
                { value: 'ja', label: formatMessage(AppBasicAdminPageMessages.AppNavModal.ja) },
                { value: 'vi', label: formatMessage(AppBasicAdminPageMessages.AppNavModal.vi) },
              ]}
            />
          </Form.Item>
          {hasSubMenu !== undefined && block === 'header' ? (
            <Form.Item
              className="col-6"
              name="tag"
              label={<StyledFormLabel>{formatMessage(AppBasicAdminPageMessages.AppNavModal.navTag)}</StyledFormLabel>}
            >
              <Input />
            </Form.Item>
          ) : null}
        </Input.Group>
      </Form>
    </AdminModal>
  )
}

const UPSERT_APP_NAV = gql`
  mutation UPSERT_APP_NAV(
    $navId: uuid!
    $appId: String!
    $block: String!
    $label: String!
    $external: Boolean
    $href: String
    $locale: String!
    $tag: String
    $position: Int!
    $parentId: uuid
  ) {
    insert_app_nav_one(
      object: {
        id: $navId
        app_id: $appId
        block: $block
        label: $label
        external: $external
        href: $href
        locale: $locale
        tag: $tag
        position: $position
        parent_id: $parentId
      }
      on_conflict: { constraint: app_nav_pkey, update_columns: [label, external, href, locale, tag] }
    ) {
      id
    }
    update_app_nav(where: { parent_id: { _eq: $navId } }, _set: { locale: $locale }) {
      affected_rows
    }
  }
`

const UPDATE_PARENT_NAV = gql`
  mutation UPDATE_PARENT_NAV($parentId: uuid!) {
    update_app_nav(where: { id: { _eq: $parentId } }, _set: { href: "", external: false }) {
      affected_rows
    }
  }
`

export default AppNavModal
