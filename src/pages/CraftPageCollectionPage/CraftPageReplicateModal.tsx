import { QuestionCircleFilled } from '@ant-design/icons'
import { useApolloClient } from '@apollo/client'
import { Button, Form, Input, Tooltip } from 'antd'
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
import { AppPageProps, useMutateAppPage } from '../../hooks/appPage'
import craftPageCollectionPageMessages from './translation'

const StyledDemoUrl = styled.div`
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.4px;
  color: var(--gray-dark);
`

type FieldProps = {
  pageName: string
  path: string
}

const CraftPageReplicateModal: React.FC<
  AdminModalProps & {
    originCraftPage: Pick<AppPageProps, 'id' | 'path' | 'title' | 'craftData'>
    onRefetch?: () => Promise<any>
  }
> = ({ originCraftPage, onCancel, onRefetch, ...props }) => {
  const { formatMessage } = useIntl()
  const { currentMemberId } = useAuth()
  const client = useApolloClient()
  const history = useHistory()
  const [form] = useForm<FieldProps>()
  const [loading, setLoading] = useState(false)
  const [pageInfo, setPageInfo] = useState<{ pageName: string; path: string }>({ pageName: '', path: '' })
  const { insertAppPage } = useMutateAppPage()

  const handleResetModal = () => {
    form.resetFields()
    setPageInfo({ pageName: '', path: '' })
  }

  const handleSubmit = () => {
    setLoading(true)
    form
      .validateFields()
      .then(value => {
        insertAppPage({
          path: value.path,
          title: value.pageName,
          editorId: currentMemberId || '',
          craftData: originCraftPage.craftData,
        })
          .then(res => {
            onRefetch?.().then(() => {
              const pageId = res.data?.insert_app_page_one?.id
              history.push('/craft-page/' + pageId)
            })
          })
          .catch(handleError)
      })
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
                        return Promise.reject(formatMessage(craftPageCollectionPageMessages['*'].pathIsExistWarning))
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
      </Form>
    </AdminModal>
  )
}

export default CraftPageReplicateModal
