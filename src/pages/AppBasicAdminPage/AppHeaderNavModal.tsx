import { EditOutlined, PlusOutlined } from '@ant-design/icons'
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

type ModalProps = {
  parentId?: string | null
  editId?: string
  hasSubMenu?: boolean
  block: 'header' | 'footer' | 'social_media'
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
}

const AppHeaderNavModal: React.FC<ModalProps> = ({ parentId, editId, hasSubMenu, block, navOptions, onRefetch }) => {
  const { formatMessage } = useIntl()
  const { id: appId } = useApp()
  const [form] = useForm<FieldProps>()
  const [loading, setLoading] = useState(false)
  const [upsertAppNav] = useMutation<hasura.UPSERT_APP_NAV, hasura.UPSERT_APP_NAVVariables>(UPSERT_APP_NAV)

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
            setVisible(false)
            onRefetch?.()
            message.success(formatMessage(commonMessages.event.successfullySaved))
          })
          .catch(handleError)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <AdminModal
      renderTrigger={({ setVisible }) => (
        <Button
          className="p-0"
          icon={editId ? <EditOutlined /> : <PlusOutlined />}
          type="link"
          onClick={() => setVisible(true)}
        >
          {parentId && !editId
            ? formatMessage(AppBasicAdminPageMessages.AppHeaderNavModal.subNav)
            : !editId
            ? formatMessage(AppBasicAdminPageMessages.AppHeaderNavModal.addNav)
            : ''}
        </Button>
      )}
      title={
        parentId
          ? editId
            ? formatMessage(AppBasicAdminPageMessages.AppHeaderNavModal.editSubNav)
            : formatMessage(AppBasicAdminPageMessages.AppHeaderNavModal.addSubNav)
          : editId
          ? formatMessage(AppBasicAdminPageMessages.AppHeaderNavModal.editNav)
          : formatMessage(AppBasicAdminPageMessages.AppHeaderNavModal.addNav)
      }
      footer={null}
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={() => setVisible(false)}>
            {formatMessage(commonMessages['ui'].cancel)}
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleSubmit(setVisible)}>
            {formatMessage(commonMessages['ui'].save)}
          </Button>
        </>
      )}
    >
      <Form
        form={form}
        layout="vertical"
        hideRequiredMark
        initialValues={{
          label: navOptions?.label
            ? navOptions?.label
            : parentId
            ? formatMessage(AppBasicAdminPageMessages.AppHeaderNavModal.untitledSubNav)
            : formatMessage(AppBasicAdminPageMessages.AppHeaderNavModal.untitledNav),
          external: navOptions?.external || 'false',
          href: navOptions?.href || '',
          locale: navOptions?.locale || 'zh-tw',
          tag: navOptions?.tag || '',
        }}
      >
        <Form.Item
          label={
            <StyledFormLabel>{formatMessage(AppBasicAdminPageMessages.AppHeaderNavModal.navLabel)}</StyledFormLabel>
          }
          name="label"
          rules={[
            { required: true, message: formatMessage(AppBasicAdminPageMessages.AppHeaderNavModal.navLabelIsRequired) },
          ]}
        >
          <Input />
        </Form.Item>
        {!hasSubMenu ? (
          <Form.Item
            label={
              <StyledFormLabel>{formatMessage(AppBasicAdminPageMessages.AppHeaderNavModal.navHref)}</StyledFormLabel>
            }
          >
            <Input.Group compact>
              <Form.Item className="col-3 mb-2" name="external">
                <Select
                  onChange={() => {}}
                  options={[
                    {
                      value: 'false',
                      label: formatMessage(AppBasicAdminPageMessages.AppHeaderNavModal.openInSamePage),
                    },
                    { value: 'true', label: formatMessage(AppBasicAdminPageMessages.AppHeaderNavModal.openInNewTab) },
                  ]}
                />
              </Form.Item>
              <Form.Item
                className="col-9 mb-2"
                name="href"
                rules={[
                  {
                    required: true,
                    message: formatMessage(AppBasicAdminPageMessages.AppHeaderNavModal.navHrefIsRequired),
                  },
                ]}
              >
                <Input placeholder={formatMessage(AppBasicAdminPageMessages.AppHeaderNavModal.pleaseFillInTheHref)} />
              </Form.Item>
            </Input.Group>
          </Form.Item>
        ) : null}

        <Input.Group compact>
          <Form.Item className="col-6" name="locale" label={<StyledFormLabel>顯示語系</StyledFormLabel>}>
            <Select
              disabled={parentId ? true : false}
              onChange={() => {}}
              options={[
                { value: 'zh-tw', label: formatMessage(AppBasicAdminPageMessages.AppHeaderNavModal.zhTw) },
                { value: 'zh-cn', label: formatMessage(AppBasicAdminPageMessages.AppHeaderNavModal.zhCn) },
                { value: 'en-us', label: formatMessage(AppBasicAdminPageMessages.AppHeaderNavModal.enUs) },
                { value: 'vi', label: formatMessage(AppBasicAdminPageMessages.AppHeaderNavModal.vi) },
              ]}
            />
          </Form.Item>
          {hasSubMenu !== undefined ? (
            <Form.Item
              className="col-6"
              name="tag"
              label={
                <StyledFormLabel>{formatMessage(AppBasicAdminPageMessages.AppHeaderNavModal.navTag)}</StyledFormLabel>
              }
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

export default AppHeaderNavModal
