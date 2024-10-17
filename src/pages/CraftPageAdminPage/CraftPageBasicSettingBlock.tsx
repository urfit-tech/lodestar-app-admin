import { QuestionCircleFilled } from '@ant-design/icons'
import { useApolloClient } from '@apollo/client'
import { Select } from '@chakra-ui/react'
import { Button, Form, Input, message, Radio, Skeleton, Tooltip } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import { AdminBlock, AdminBlockTitle, AdminPaneTitle, StyledTips } from '../../components/admin'
import AdminModal from '../../components/admin/AdminModal'
import OpenGraphSettingsBlock from '../../components/form/OpenGraphSettingsBlock'
import SeoSettingsBlock from '../../components/form/SeoSettingsBlock'
import { SUPPORTED_LOCALES } from '../../contexts/LocaleContext'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages, craftPageMessages, errorMessages } from '../../helpers/translation'
import { useMutateAppPage } from '../../hooks/appPage'
import { GetAppPageLanguage } from '../../hooks/craft'
import { CraftPageAdminProps } from '../../types/craft'
import { CraftSettingLabel } from './CraftSettingsPanel'
import CraftPageAdminPage from './translation'

type FieldProps = {
  pageName: string
  path: string
  noHeader: boolean
  noFooter: boolean
  language: string
}

const CraftPageBasicSettingBlock: React.VFC<{
  pageAdmin: CraftPageAdminProps | null
  onRefetch?: () => void
}> = ({ pageAdmin, onRefetch }) => {
  const { enabledModules, id: appId } = useApp()
  const { currentMemberId } = useAuth()
  const { formatMessage } = useIntl()
  const client = useApolloClient()
  const { updateAppPage, updateAppPageMetaTag } = useMutateAppPage()
  const [form] = useForm<FieldProps>()
  const [path, setPath] = useState(pageAdmin?.path || '')
  const [loading, setLoading] = useState(false)

  if (!pageAdmin) {
    return <Skeleton active />
  }

  const handleSubmit = (values: FieldProps) => {
    if (!currentMemberId) {
      return
    }
    setLoading(true)
    updateAppPage({
      pageId: pageAdmin.id,
      path: values.path,
      title: values.pageName,
      language: values.language === 'none' ? null : values.language,
      options: { ...pageAdmin.options, noHeader: values.noHeader, noFooter: values.noFooter },
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
        onRefetch?.()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <div className="container py-5">
      <AdminPaneTitle>{formatMessage(commonMessages.label.basicSettings)}</AdminPaneTitle>
      <AdminBlock>
        <AdminBlockTitle>{formatMessage(craftPageMessages.label.generalSettings)}</AdminBlockTitle>
        <Form
          form={form}
          colon={false}
          requiredMark={false}
          labelAlign="left"
          labelCol={{ md: { span: 4 } }}
          wrapperCol={{ md: { span: 8 } }}
          initialValues={{
            pageName: pageAdmin?.title || '',
            path: pageAdmin?.path,
            noHeader: pageAdmin?.options?.noHeader,
            noFooter: pageAdmin?.options?.noFooter,
            language: pageAdmin.language,
          }}
          onFinish={handleSubmit}
        >
          <Form.Item label={formatMessage(craftPageMessages.label.pageName)}>
            <Form.Item
              name="pageName"
              noStyle
              rules={[
                {
                  required: true,
                  message: formatMessage(errorMessages.form.isRequired, {
                    field: formatMessage(craftPageMessages.label.pageName),
                  }),
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Form.Item>
          <Form.Item
            label={
              <span className="d-flex align-items-center">
                {formatMessage(craftPageMessages.label.path)}
                <Tooltip
                  placement="top"
                  title={
                    <StyledTips>
                      {
                        // TODO: fill the url tip, zeplin didn't labeled
                      }
                    </StyledTips>
                  }
                >
                  <QuestionCircleFilled className="ml-2" />
                </Tooltip>
              </span>
            }
          >
            <Form.Item
              name="path"
              noStyle
              rules={[
                {
                  required: true,
                  message: formatMessage(errorMessages.form.isRequired, {
                    field: formatMessage(craftPageMessages.label.path),
                  }),
                },
                {
                  validator: async (_, value, callback) => {
                    await client
                      .query<hasura.GetAppPageLanguage, hasura.GetAppPageLanguageVariables>({
                        query: GetAppPageLanguage,
                        variables: {
                          condition: {
                            app_id: { _eq: appId },
                            path: { _eq: form.getFieldValue('path') },
                            language: value === 'none' ? { _is_null: true } : { _eq: value },
                          },
                        },
                      })
                      .then(res => {
                        const appPages = res.data.app_page.filter(v => v.id !== pageAdmin.id)
                        if (value && appPages.length !== 0) {
                          return Promise.reject(
                            enabledModules.locale
                              ? form.getFieldValue('language') === 'none'
                                ? formatMessage(
                                    CraftPageAdminPage.CraftPageBasicSettingBlock.noneLocalePathIsExistWarning,
                                  )
                                : formatMessage(
                                    CraftPageAdminPage.CraftPageBasicSettingBlock.localePathIsExistWarning,
                                    {
                                      locale: SUPPORTED_LOCALES.find(
                                        supportedLocale => supportedLocale.locale === form.getFieldValue('language'),
                                      )?.label,
                                    },
                                  )
                              : formatMessage(CraftPageAdminPage.CraftPageBasicSettingBlock.pathIsExistWarning),
                          )
                        }
                        return Promise.resolve()
                      })
                  },
                },
              ]}
            >
              <Input className="mb-2" onChange={e => setPath(e.target.value)} />
            </Form.Item>
            <CraftSettingLabel>{window.location.host + path}</CraftSettingLabel>
          </Form.Item>
          <Form.Item label={formatMessage(craftPageMessages.label.header)}>
            <Form.Item
              name="noHeader"
              noStyle
              rules={[
                {
                  required: true,
                  message: formatMessage(errorMessages.form.isRequired, {
                    field: formatMessage(craftPageMessages.label.header),
                  }),
                },
              ]}
            >
              <Radio.Group>
                <Radio value={false}>{formatMessage(craftPageMessages.label.enable)}</Radio>
                <Radio value={true}>{formatMessage(craftPageMessages.label.disable)}</Radio>
              </Radio.Group>
            </Form.Item>
          </Form.Item>
          <Form.Item label={formatMessage(craftPageMessages.label.footer)}>
            <Form.Item
              name="noFooter"
              noStyle
              rules={[
                {
                  required: true,
                  message: formatMessage(errorMessages.form.isRequired, {
                    field: formatMessage(craftPageMessages.label.footer),
                  }),
                },
              ]}
            >
              <Radio.Group>
                <Radio value={false}>{formatMessage(craftPageMessages.label.enable)}</Radio>
                <Radio value={true}>{formatMessage(craftPageMessages.label.disable)}</Radio>
              </Radio.Group>
            </Form.Item>
          </Form.Item>
          {enabledModules.locale ? (
            <Form.Item
              label={
                <span className="d-flex align-items-center">
                  {formatMessage(CraftPageAdminPage.CraftPageBasicSettingBlock.displayLocale)}
                  <Tooltip
                    placement="top"
                    title={
                      <StyledTips>
                        {formatMessage(CraftPageAdminPage.CraftPageBasicSettingBlock.displayLocaleTooltip)}
                      </StyledTips>
                    }
                  >
                    <QuestionCircleFilled className="ml-2" />
                  </Tooltip>
                </span>
              }
            >
              <Form.Item
                name="language"
                initialValue="none"
                noStyle
                rules={[
                  {
                    validator: async (_, value, callback) => {
                      await client
                        .query<hasura.GetAppPageLanguage, hasura.GetAppPageLanguageVariables>({
                          query: GetAppPageLanguage,
                          variables: {
                            condition: {
                              app_id: { _eq: appId },
                              path: { _eq: form.getFieldValue('path') },
                              language: value === 'none' ? { _is_null: true } : { _eq: value },
                            },
                          },
                        })
                        .then(res => {
                          const appPages = res.data.app_page.filter(v => v.id !== pageAdmin.id)
                          if (value && appPages.length !== 0) {
                            return Promise.reject(
                              form.getFieldValue('language') === 'none'
                                ? formatMessage(
                                    CraftPageAdminPage.CraftPageBasicSettingBlock.noneLocalePathIsExistWarning,
                                  )
                                : formatMessage(
                                    CraftPageAdminPage.CraftPageBasicSettingBlock.localePathIsExistWarning,
                                    {
                                      locale: SUPPORTED_LOCALES.find(
                                        supportedLocale => supportedLocale.locale === form.getFieldValue('language'),
                                      )?.label,
                                    },
                                  ),
                            )
                          }
                          return Promise.resolve()
                        })
                    },
                  },
                ]}
              >
                <Select>
                  <option value="none">
                    {formatMessage(CraftPageAdminPage.CraftPageBasicSettingBlock.noSpecificLocale)}
                  </option>
                  {SUPPORTED_LOCALES.map(supportedLocale => (
                    <option value={supportedLocale.locale}>{supportedLocale.label}</option>
                  ))}
                </Select>
              </Form.Item>
            </Form.Item>
          ) : null}
          <Form.Item wrapperCol={{ md: { offset: 4 } }}>
            <Button
              className="mr-2"
              onClick={() => {
                form.resetFields()
              }}
            >
              {formatMessage(commonMessages.ui.cancel)}
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {formatMessage(commonMessages.ui.save)}
            </Button>
          </Form.Item>
        </Form>
      </AdminBlock>
      <SeoSettingsBlock
        id={pageAdmin.id}
        metaTag={pageAdmin.metaTag}
        updateMetaTag={updateAppPageMetaTag}
        onRefetch={onRefetch}
      />
      <OpenGraphSettingsBlock
        id={pageAdmin.id}
        type="page"
        metaTag={pageAdmin.metaTag}
        updateMetaTag={updateAppPageMetaTag}
        onRefetch={onRefetch}
      />
      <AdminBlock>
        <AdminBlockTitle>{formatMessage(craftPageMessages.label.deletePage)}</AdminBlockTitle>
        <CraftPageDeletionAdminCard
          page={pageAdmin}
          // onRefetch={refetchCraftPage}
        />
      </AdminBlock>
    </div>
  )
}

const StyledConfirmation = styled.div`
  line-height: 24px;
`

const CraftPageDeletionAdminCard: React.FC<{
  page: CraftPageAdminProps | null
  onRefetch?: () => void
}> = ({ page }) => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const { updateAppPage } = useMutateAppPage()

  if (!page) {
    return <Skeleton active />
  }

  const handleArchive = (pageId: string) => {
    updateAppPage({
      pageId,
      isDeleted: true,
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullyDeleted))
        history.push('/craft-page')
      })
      .catch(handleError)
  }

  return (
    <div className="d-flex align-items-center justify-content-between">
      <div>{formatMessage(craftPageMessages.text.deletePageWarning)}</div>
      <AdminModal
        className="mb-2"
        title={formatMessage(craftPageMessages.ui.deletePage)}
        renderTrigger={({ setVisible }) => (
          <Button type="primary" danger onClick={() => setVisible(true)}>
            {formatMessage(craftPageMessages.ui.deletePage)}
          </Button>
        )}
        okText={formatMessage(commonMessages.ui.delete)}
        okButtonProps={{ danger: true }}
        cancelText={formatMessage(commonMessages.ui.back)}
        onOk={() => handleArchive(page.id)}
      >
        <StyledConfirmation>{formatMessage(craftPageMessages.text.deletePageConfirmation)}</StyledConfirmation>
      </AdminModal>
    </div>
  )
}

export default CraftPageBasicSettingBlock
