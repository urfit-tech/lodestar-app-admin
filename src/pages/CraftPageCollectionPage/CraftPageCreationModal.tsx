import { FileAddOutlined, QuestionCircleFilled } from '@ant-design/icons'
import { useApolloClient } from '@apollo/client'
import { Select } from '@chakra-ui/react'
import { Button, Form, Input, Radio, Tooltip } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router'
import styled from 'styled-components'
import { CHECK_APP_PAGE_PATH } from '.'
import { StyledTips } from '../../components/admin'
import AdminCard from '../../components/admin/AdminCard'
import AdminModal, { AdminModalProps } from '../../components/admin/AdminModal'
import { BREAK_POINT } from '../../components/common/Responsive'
import { SUPPORTED_LOCALES } from '../../contexts/LocaleContext'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import { useMutateAppPage } from '../../hooks/appPage'
import { GetAppPageLanguage } from '../../hooks/craft'
import { templateAImage, templateBImage, templateCImage } from '../../images/default'
import { PlusIcon } from '../../images/icon'
import { templateA, templateB, templateC, templateDefault } from './templatePage'
import craftPageCollectionPageMessages from './translation'

const StyledDemoUrl = styled.div`
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.4px;
  color: var(--gray-dark);
`
const StyledFormItemWrapper = styled.div<{ currentTemplate: string }>`
  .ant-card {
    padding-top: 80%;
    margin: 2px;
    border-radius: 4px;
  }
  .ant-row:nth-child(2) {
    .ant-card {
      background-image: url(${templateAImage});
      background-size: cover;
      border: ${props => (props.currentTemplate === 'A' ? `2px ${props.theme['@primary-color']} solid` : null)};
    }
  }
  .ant-row:nth-child(3) {
    .ant-card {
      background-image: url(${templateBImage});
      background-size: cover;
      border: ${props => (props.currentTemplate === 'B' ? `2px ${props.theme['@primary-color']} solid` : null)};
    }
  }
  .ant-row:nth-child(4) {
    .ant-card {
      background-image: url(${templateCImage});
      background-size: cover;
      border: ${props => (props.currentTemplate === 'C' ? `2px ${props.theme['@primary-color']} solid` : null)};
    }
  }
  // TODO: change row first child to last child when template enable
  .ant-row:nth-child(1) {
    .ant-card {
      background-image: none;
      position: relative;
      border: ${props => (props.currentTemplate === 'empty' ? `2px ${props.theme['@primary-color']} solid` : null)};
      .content {
        position: absolute;
        color: var(--gray-dark);
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        svg {
          display: block;
          margin: auto;
        }
        div {
          font-size: 14px;
          letter-spacing: 0.4px;
        }
      }
    }
  }
  @media (min-width: ${BREAK_POINT}px) {
    display: flex;
    justify-content: space-between;
  }
`
const StyledFormItem = styled(Form.Item)`
  @media (min-width: ${BREAK_POINT}px) {
    width: 23%;
  }
`

type FieldProps = {
  pageName: string
  path: string
  noHeader: boolean
  noFooter: boolean
  language: string
}

const CraftPageCreationModal: React.VFC<
  AdminModalProps & {
    defaultPageInfo?: { pageName: string; path: string; noHeader?: boolean; noFooter?: boolean; language?: string }
    defaultStep?: 'page' | 'template'
    setModalVisible: React.Dispatch<React.SetStateAction<boolean>>
    onRefetch?: () => Promise<any>
  }
> = ({ setModalVisible, onRefetch, defaultPageInfo, defaultStep, ...props }) => {
  const { id: appId, enabledModules } = useApp()
  const { currentMemberId } = useAuth()
  const { formatMessage } = useIntl()
  const client = useApolloClient()
  const history = useHistory()
  const [stepTwoForm] = useForm()
  const [stepOneForm] = useForm<FieldProps>()
  const { insertAppPage } = useMutateAppPage()
  const [loading, setLoading] = useState(false)
  const [currentTemplate, setCurrentTemplate] = useState<'A' | 'B' | 'C' | 'empty'>('empty')
  const [pageInfo, setPageInfo] = useState<{
    pageName: string
    path: string
    noHeader?: boolean
    noFooter?: boolean
    language?: string
  }>(defaultPageInfo || { pageName: '', path: '', noHeader: false, noFooter: false, language: 'none' })
  const [createStep, setCreateStep] = useState<'page' | 'template'>(defaultStep || 'page')

  const handleResetModal = () => {
    stepOneForm.resetFields()
    setCreateStep('page')
    setCurrentTemplate('A')
  }

  const handleStepOneSubmit = (values: FieldProps) => {
    stepOneForm
      .validateFields(['pageName', 'path', 'noHeader', 'noFooter', 'language'])
      .then(() => {
        setPageInfo({ ...values })
        setCreateStep('template')
      })
      .catch(err => {
        if (process.env.NODE_ENV === 'development') console.log(err)
      })
  }

  const handleStepTwoSubmit = async () => {
    if (!currentMemberId) {
      return
    }
    setLoading(true)
    try {
      const { path, pageName, noFooter, noHeader, language } = pageInfo
      const appPageLanguage = await client.query<hasura.GetAppPageLanguage, hasura.GetAppPageLanguageVariables>({
        query: GetAppPageLanguage,
        variables: {
          condition: {
            app_id: { _eq: appId },
            path: { _eq: stepOneForm.getFieldValue('path') },
            language: language === 'none' ? { _is_null: true } : { _eq: language },
          },
        },
      })
      if (appPageLanguage.data.app_page.length !== 0) {
        return language === 'none'
          ? formatMessage(craftPageCollectionPageMessages['*'].noneLocalePathIsExistWarning)
          : formatMessage(craftPageCollectionPageMessages['*'].localePathIsExistWarning, {
              locale: stepOneForm.getFieldValue('language'),
            })
      }
      const insertRes = await insertAppPage({
        path: path,
        title: pageName,
        editorId: currentMemberId,
        craftData: { empty: templateDefault, A: templateA, B: templateB, C: templateC }[currentTemplate],
        options: { white: true, noFooter, noHeader },
        language: language === 'none' ? null : language,
      })
      await onRefetch?.()
      setModalVisible(false)
      handleResetModal()
      history.push('/craft-page/' + insertRes?.data?.insert_app_page_one?.id)
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminModal
      title={
        createStep === 'template'
          ? formatMessage(craftPageCollectionPageMessages['*'].choiceTemplate)
          : formatMessage(craftPageCollectionPageMessages['*'].createPage)
      }
      renderTrigger={() => (
        <Button type="primary" icon={<FileAddOutlined />} onClick={() => setModalVisible(true)}>
          {formatMessage(craftPageCollectionPageMessages['*'].createPage)}
        </Button>
      )}
      maskClosable={false}
      footer={null}
      onCancel={() => {
        setModalVisible(false)
        handleResetModal()
      }}
      {...props}
    >
      {createStep === 'template' ? (
        <Form form={stepTwoForm} layout="vertical" colon={false} onFinish={handleStepTwoSubmit}>
          <StyledFormItemWrapper currentTemplate={currentTemplate}>
            <StyledFormItem>
              <AdminCard
                hoverable
                cover={''}
                onClick={() => {
                  setCurrentTemplate('empty')
                }}
              >
                <div className="content">
                  <PlusIcon />
                  <div>{formatMessage(craftPageCollectionPageMessages['*'].emptyPage)}</div>
                </div>
              </AdminCard>
            </StyledFormItem>
            <StyledFormItem>
              <AdminCard
                hoverable
                cover={''}
                onClick={() => {
                  setCurrentTemplate('A')
                }}
              />
            </StyledFormItem>
            <StyledFormItem>
              <AdminCard
                hoverable
                cover={''}
                onClick={() => {
                  setCurrentTemplate('B')
                }}
              />
            </StyledFormItem>
            <StyledFormItem>
              <AdminCard
                hoverable
                cover={''}
                onClick={() => {
                  setCurrentTemplate('C')
                }}
              />
            </StyledFormItem>
          </StyledFormItemWrapper>
          <div className="text-right">
            <Button className="mr-2" onClick={() => setCreateStep('page')}>
              {formatMessage(commonMessages.ui.previousStep)}
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {formatMessage(craftPageCollectionPageMessages['*'].create)}
            </Button>
          </div>
        </Form>
      ) : (
        <Form form={stepOneForm} layout="vertical" colon={false} onFinish={handleStepOneSubmit}>
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
                    enabledModules.locale
                      ? await client
                          .query<hasura.GetAppPageLanguage, hasura.GetAppPageLanguageVariables>({
                            query: GetAppPageLanguage,
                            variables: {
                              condition: {
                                app_id: { _eq: appId },
                                path: { _eq: stepOneForm.getFieldValue('path') },
                                language: value === 'none' ? { _is_null: true } : { _eq: value },
                              },
                            },
                          })
                          .then(res => {
                            if (value && res.data.app_page.length !== 0) {
                              return Promise.reject(
                                enabledModules.locale
                                  ? stepOneForm.getFieldValue('language') === 'none'
                                    ? formatMessage(craftPageCollectionPageMessages['*'].noneLocalePathIsExistWarning)
                                    : formatMessage(craftPageCollectionPageMessages['*'].localePathIsExistWarning, {
                                        locale: SUPPORTED_LOCALES.find(
                                          supportedLocale =>
                                            supportedLocale.locale === stepOneForm.getFieldValue('language'),
                                        )?.label,
                                      })
                                  : formatMessage(craftPageCollectionPageMessages['*'].pathIsExistWarning),
                              )
                            }
                            return Promise.resolve()
                          })
                      : await client
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
              name="noHeader"
              initialValue={false}
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
              <Radio.Group defaultValue={false} onChange={e => setPageInfo({ ...pageInfo, noHeader: e.target.value })}>
                <Radio value={false}>{formatMessage(craftPageCollectionPageMessages['*'].enable)}</Radio>
                <Radio value={true}>{formatMessage(craftPageCollectionPageMessages['*'].disable)}</Radio>
              </Radio.Group>
            </Form.Item>
          </Form.Item>
          <Form.Item label={formatMessage(craftPageCollectionPageMessages['*'].footer)}>
            <Form.Item
              name="noFooter"
              initialValue={false}
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
              <Radio.Group defaultValue={false} onChange={e => setPageInfo({ ...pageInfo, noFooter: e.target.value })}>
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
                              path: { _eq: stepOneForm.getFieldValue('path') },
                              language: value === 'none' ? { _is_null: true } : { _eq: value },
                            },
                          },
                        })
                        .then(res => {
                          if (value && res.data.app_page.length !== 0) {
                            return Promise.reject(
                              stepOneForm.getFieldValue('language') === 'none'
                                ? formatMessage(craftPageCollectionPageMessages['*'].noneLocalePathIsExistWarning)
                                : formatMessage(craftPageCollectionPageMessages['*'].localePathIsExistWarning, {
                                    locale: stepOneForm.getFieldValue('language'),
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

          <div className="text-right">
            <div>
              <Button
                className="mr-2"
                onClick={() => {
                  setModalVisible(false)
                  setPageInfo({ pageName: '', path: '', noHeader: false, noFooter: false, language: 'none' })
                  handleResetModal()
                }}
              >
                {formatMessage(craftPageCollectionPageMessages['*'].cancel)}
              </Button>
              <Button type="primary" htmlType="submit">
                {formatMessage(craftPageCollectionPageMessages['*'].nextStep)}
              </Button>
            </div>
          </div>
        </Form>
      )}
    </AdminModal>
  )
}

export default CraftPageCreationModal
