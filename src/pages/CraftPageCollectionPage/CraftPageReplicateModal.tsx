import { QuestionCircleFilled } from '@ant-design/icons'
import { useApolloClient } from '@apollo/client'
import { Button, Form, Input, Radio, Tooltip } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import { CHECK_APP_PAGE_PATH } from '.'
import { StyledTips } from '../../components/admin'
import AdminModal, { AdminModalProps } from '../../components/admin/AdminModal'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { errorMessages } from '../../helpers/translation'
import { AppPageProps, useMutateAppPage } from '../../hooks/appPage'
import craftPageCollectionPageMessages from './translation'
import { Select } from '@chakra-ui/react'
import { GetAppPageLanguage } from '../../hooks/craft'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { SUPPORTED_LOCALES } from '../../contexts/LocaleContext'

const StyledDemoUrl = styled.div`
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.4px;
  color: var(--gray-dark);
`

type FieldProps = {
  pageName: string
  path: string
  noHeader: boolean
  noFooter: boolean
  language: string
}

const CraftPageReplicateModal: React.FC<
  AdminModalProps & {
    originCraftPage: Pick<AppPageProps, 'id' | 'path' | 'title' | 'options' | 'craftData' | 'language'>
    onRefetch?: () => Promise<any>
  }
> = ({ originCraftPage, onCancel, onRefetch, ...props }) => {
  const { id: appId, enabledModules } = useApp()
  const { formatMessage } = useIntl()
  const { currentMemberId } = useAuth()
  const client = useApolloClient()
  const history = useHistory()
  const [form] = useForm<FieldProps>()
  const [loading, setLoading] = useState(false)
  const [pageInfo, setPageInfo] = useState<{
    pageName: string
    path: string
    noHeader?: boolean
    noFooter?: boolean
    language: string
  }>({
    pageName: '',
    path: '',
    noHeader: originCraftPage?.options?.noHeader,
    noFooter: originCraftPage?.options?.noFooter,
    language: 'none',
  })
  const { insertAppPage } = useMutateAppPage()

  const handleResetModal = () => {
    form.resetFields()
    setPageInfo({ pageName: '', path: '', noHeader: false, noFooter: false, language: 'none' })
  }

  const handleSubmit = () => {
    setLoading(true)
    form
      .validateFields()
      .then(async value => {
        const { path, pageName, noHeader, noFooter, language } = value
        const insertRes = await insertAppPage({
          path: path,
          title: pageName,
          editorId: currentMemberId || '',
          craftData: originCraftPage.craftData,
          options: { white: true, noHeader, noFooter },
          language: language === 'none' ? null : language,
        })

        await onRefetch?.()
        const pageId = insertRes.data?.insert_app_page_one?.id
        history.push('/craft-page/' + pageId)
      })
      .catch(handleError)
      .finally(() => {
        setLoading(false)
        handleResetModal()
      })
  }

  return (
    <AdminModal
      title={formatMessage(craftPageCollectionPageMessages['*'].duplicateCraftPage)}
      maskClosable={false}
      footer={null}
      onCancel={() => {
        form.resetFields()
      }}
      renderFooter={({ setVisible }) => (
        <div>
          <Button
            className="mr-2"
            onClick={() => {
              setVisible(false)
              handleResetModal()
            }}
          >
            {formatMessage(craftPageCollectionPageMessages['*'].cancel)}
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleSubmit()}>
            {formatMessage(craftPageCollectionPageMessages['*'].duplicate)}
          </Button>
        </div>
      )}
      {...props}
    >
      <h2 className="mb-3">
        {`${formatMessage(craftPageCollectionPageMessages.CraftPageReplicateModal.originPageName)}： ${
          originCraftPage.title
        }`}
      </h2>

      <h2 className="mb-4">
        {`${formatMessage(craftPageCollectionPageMessages.CraftPageReplicateModal.originPath)}： ${
          originCraftPage.path
        }`}
      </h2>

      <Form form={form} layout="vertical" colon={false}>
        <Form.Item label={formatMessage(craftPageCollectionPageMessages['*'].pageName)}>
          <Form.Item
            className="mb-2"
            name="pageName"
            noStyle
            rules={[
              {
                required: true,
                message: formatMessage(craftPageCollectionPageMessages['*'].isRequired, {
                  field: formatMessage(craftPageCollectionPageMessages['*'].pageName),
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
              {formatMessage(craftPageCollectionPageMessages['*'].path)}
              <Tooltip
                placement="top"
                title={<StyledTips>{formatMessage(craftPageCollectionPageMessages['*'].pathTips)}</StyledTips>}
              >
                <QuestionCircleFilled className="ml-2" />
              </Tooltip>
            </span>
          }
        >
          <Form.Item
            name="path"
            noStyle
            validateTrigger={'onSubmit'}
            rules={[
              {
                required: true,
                message: formatMessage(craftPageCollectionPageMessages['*'].isRequired, {
                  field: formatMessage(craftPageCollectionPageMessages['*'].path),
                }),
              },
              {
                pattern: new RegExp(`/.*`),
                message: formatMessage(craftPageCollectionPageMessages['*'].slashIsRequest),
              },
              {
                validator: async (_, value, callback) => {
                  await client
                    .query<hasura.CHECK_APP_PAGE_PATH, hasura.CHECK_APP_PAGE_PATHVariables>({
                      query: CHECK_APP_PAGE_PATH,
                      variables: { path: value },
                    })
                    .then(res => {
                      if (value && res.data.app_page.length !== 0) {
                        return Promise.reject(
                          formatMessage(craftPageCollectionPageMessages['*'].localePathIsExistWarning),
                        )
                      }
                      return Promise.resolve()
                    })
                },
              },
            ]}
          >
            <Input
              className="mb-2"
              placeholder="/"
              onChange={e => setPageInfo({ ...pageInfo, path: e.target.value })}
            />
          </Form.Item>
          <StyledDemoUrl>{window.location.host + pageInfo.path}</StyledDemoUrl>
        </Form.Item>
        <Form.Item label={formatMessage(craftPageCollectionPageMessages['*'].header)}>
          <Form.Item
            initialValue={pageInfo.noHeader}
            name="noHeader"
            noStyle
            rules={[
              {
                required: true,
                message: formatMessage(errorMessages.form.isRequired, {
                  field: formatMessage(craftPageCollectionPageMessages['*'].header),
                }),
              },
            ]}
          >
            <Radio.Group
              defaultValue={pageInfo.noHeader}
              onChange={e => setPageInfo({ ...pageInfo, noHeader: e.target.value })}
            >
              <Radio value={false}>{formatMessage(craftPageCollectionPageMessages['*'].enable)}</Radio>
              <Radio value={true}>{formatMessage(craftPageCollectionPageMessages['*'].disable)}</Radio>
            </Radio.Group>
          </Form.Item>
        </Form.Item>
        <Form.Item label={formatMessage(craftPageCollectionPageMessages['*'].footer)}>
          <Form.Item
            initialValue={pageInfo.noFooter}
            name="noFooter"
            noStyle
            rules={[
              {
                required: true,
                message: formatMessage(errorMessages.form.isRequired, {
                  field: formatMessage(craftPageCollectionPageMessages['*'].footer),
                }),
              },
            ]}
          >
            <Radio.Group
              defaultValue={pageInfo.noFooter}
              onChange={e => setPageInfo({ ...pageInfo, noFooter: e.target.value })}
            >
              <Radio value={false}>{formatMessage(craftPageCollectionPageMessages['*'].enable)}</Radio>
              <Radio value={true}>{formatMessage(craftPageCollectionPageMessages['*'].disable)}</Radio>
            </Radio.Group>
          </Form.Item>
        </Form.Item>
        {enabledModules.locale ? (
          <Form.Item label={formatMessage(craftPageCollectionPageMessages['*'].displayLocale)}>
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
                        if (value && res.data.app_page.length !== 0) {
                          return Promise.reject(
                            form.getFieldValue('language') === 'none'
                              ? formatMessage(craftPageCollectionPageMessages['*'].noneLocalePathIsExistWarning)
                              : formatMessage(craftPageCollectionPageMessages['*'].localePathIsExistWarning, {
                                  locale: SUPPORTED_LOCALES.find(
                                    supportedLocale => supportedLocale.locale === form.getFieldValue('language'),
                                  )?.label,
                                }),
                          )
                        }
                        return Promise.resolve()
                      })
                  },
                },
              ]}
            >
              <Select>
                <option value="none">{formatMessage(craftPageCollectionPageMessages['*'].noSpecificLocale)}</option>
                {SUPPORTED_LOCALES.map(supportedLocale => (
                  <option value={supportedLocale.locale}>{supportedLocale.label}</option>
                ))}
              </Select>
            </Form.Item>
          </Form.Item>
        ) : null}
      </Form>
    </AdminModal>
  )
}

export default CraftPageReplicateModal
