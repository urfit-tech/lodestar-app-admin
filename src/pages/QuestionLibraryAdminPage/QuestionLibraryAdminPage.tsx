import { ArrowLeftOutlined, FileAddOutlined } from '@ant-design/icons'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { Spinner } from '@chakra-ui/react'
import { Button, Form, Input, message, Select, Tabs } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { Link, useHistory, useParams } from 'react-router-dom'
import { StringParam, useQueryParam } from 'use-query-params'
import {
  AdminBlock,
  AdminBlockTitle,
  AdminHeader,
  AdminHeaderTitle,
  AdminPaneTitle,
  AdminTabBarWrapper,
} from '../../components/admin'
import AdminModal from '../../components/admin/AdminModal'
import { StyledLayoutContent } from '../../components/layout/DefaultLayout'
import hasura from '../../hasura'
import { commonMessages, questionLibraryMessage } from '../../helpers/translation'
import { QuestionLibrary } from '../../types/questionLibrary'
import LoadingPage from '../LoadingPage'
import pageMessages from '../translation'
import QuestionLibraryAdminTable from './QuestionLibraryAdminTable'
import QuestionLibraryBasicForm from './QuestionLibraryBasicForm'

type FieldProps = {
  title: string
}

type QuestionLibraryAdmin = Pick<QuestionLibrary, 'id' | 'title' | 'abstract'>

const QuestionLibraryAdminPage: React.VFC = () => {
  const history = useHistory()
  const { currentMemberId } = useAuth()
  const { enabledModules } = useApp()
  const { formatMessage } = useIntl()
  const { questionLibraryId } = useParams<{ questionLibraryId: string }>()
  const [activeKey, setActiveKey] = useQueryParam('tab', StringParam)
  const [questionGroupType, setQuestionGroupType] = useState<string>('new')
  const [savingLoading, setSavingLoading] = useState<boolean>(false)
  const [form] = useForm<FieldProps>()
  const { loading, error, refetchQuestionLibrary, questionLibrary } = useQuestionLibrary(questionLibraryId)
  const [createQuestionGroup] = useMutation<hasura.INSERT_QUESTION_GROUP, hasura.INSERT_QUESTION_GROUPVariables>(
    INSERT_QUESTION_GROUP,
  )

  const handleSubmit = () => {
    setSavingLoading(true)
    if (!currentMemberId) {
      message.error(formatMessage(pageMessages['QuestionLibraryAdminPage'].noMemberId))
      setSavingLoading(false)
      return
    }
    form.validateFields().then(() => {
      const values = form.getFieldsValue()
      createQuestionGroup({
        variables: { title: values.title, modifierId: currentMemberId, questionLibraryId: questionLibraryId },
      })
        .then(({ data }) => {
          const questionGroupId = data?.insert_question_group?.returning[0]?.id
          setSavingLoading(false)
          questionGroupId && history.push(`/question-groups/${questionGroupId}`)
        })
        .catch(err => {
          message.error(formatMessage(questionLibraryMessage.message.failAddQuestionGroup), 3)
        })
    })
  }

  useEffect(() => {
    refetchQuestionLibrary()
  }, [refetchQuestionLibrary])

  if (Object.keys(enabledModules).length === 0 || loading) {
    return <LoadingPage />
  }

  return (
    <>
      <AdminHeader>
        <Link to="/question-libraries">
          <Button type="link" className="mr-3">
            <ArrowLeftOutlined />
          </Button>
        </Link>

        {loading ? (
          <>
            <Spinner />
            <span className="flex-grow-1" />
          </>
        ) : (
          <AdminHeaderTitle>{questionLibrary.title}</AdminHeaderTitle>
        )}
      </AdminHeader>

      <StyledLayoutContent variant="gray">
        {!loading && error ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: '80%' }}>
            {formatMessage(pageMessages['*'].fetchDataError)}
          </div>
        ) : (
          <Tabs
            activeKey={activeKey || 'question-group-management'}
            onChange={key => setActiveKey(key)}
            renderTabBar={(props, DefaultTabBar) => (
              <AdminTabBarWrapper>
                <DefaultTabBar {...props} className="mb-0" />
              </AdminTabBarWrapper>
            )}
          >
            <Tabs.TabPane
              key="question-group-management"
              tab={formatMessage(pageMessages['QuestionLibraryAdminPage'].questionGroupManagement)}
            >
              <div className="container py-5">
                <AdminPaneTitle className="d-flex align-items-center justify-content-between">
                  {formatMessage(pageMessages['QuestionLibraryAdminPage'].questionGroupManagement)}
                </AdminPaneTitle>
                <div className="mb-4">
                  <AdminModal
                    renderTrigger={({ setVisible }) => (
                      <Button
                        className="mb-4"
                        type="primary"
                        icon={<FileAddOutlined />}
                        onClick={() => setVisible(true)}
                      >
                        {formatMessage(questionLibraryMessage.input.addQuestionGroup)}
                      </Button>
                    )}
                    title={formatMessage(questionLibraryMessage.input.addQuestionGroup)}
                    okText={formatMessage(commonMessages.ui.save)}
                    onOk={handleSubmit}
                    confirmLoading={savingLoading}
                  >
                    <Form
                      form={form}
                      layout="vertical"
                      colon={false}
                      hideRequiredMark
                      initialValues={{
                        title: formatMessage(questionLibraryMessage.input.untitledQuestionGroup),
                        groupType: 'new',
                      }}
                    >
                      <Form.Item name="title">
                        <Input defaultValue={formatMessage(questionLibraryMessage.input.untitledQuestionGroup)} />
                      </Form.Item>
                      <Form.Item name="groupType">
                        <Select
                          defaultValue="new"
                          style={{
                            width: '100%',
                          }}
                          onChange={v => setQuestionGroupType(v)}
                        >
                          <Select.Option value="new">
                            {formatMessage(questionLibraryMessage.label.createNewQuestionGroup)}
                          </Select.Option>
                          <Select.Option value="import">
                            {formatMessage(questionLibraryMessage.label.importFromQuestionLibrary)}
                          </Select.Option>
                          <Select.Option value="random">
                            {formatMessage(questionLibraryMessage.label.randomlySelectFromQuestionLibrary)}
                          </Select.Option>
                        </Select>
                        {questionGroupType === 'import' && (
                          <Form.Item name="importQuestion">{/* <QuestionLibraryTreeTransfer /> */}</Form.Item>
                        )}
                      </Form.Item>
                    </Form>
                  </AdminModal>
                </div>
                {currentMemberId && (
                  <QuestionLibraryAdminTable questionLibraryId={questionLibraryId} currentMemberId={currentMemberId} />
                )}
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane
              key="setting"
              tab={formatMessage(pageMessages['QuestionLibraryAdminPage'].questionLibrarySettings)}
            >
              <div className="container py-5">
                <AdminPaneTitle>
                  {formatMessage(pageMessages['QuestionLibraryAdminPage'].questionLibrarySettings)}
                </AdminPaneTitle>
                <AdminBlock>
                  <AdminBlockTitle>{formatMessage(questionLibraryMessage.label.basicSettings)}</AdminBlockTitle>
                  <QuestionLibraryBasicForm
                    questionLibrary={questionLibrary}
                    currentMemberId={currentMemberId}
                    onRefetch={refetchQuestionLibrary}
                  />
                </AdminBlock>
              </div>
            </Tabs.TabPane>
          </Tabs>
        )}
      </StyledLayoutContent>
    </>
  )
}
export default QuestionLibraryAdminPage

const useQuestionLibrary = (questionLibraryId: string) => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_QUESTION_LIBRARY, hasura.GET_QUESTION_LIBRARYVariables>(
    GET_QUESTION_LIBRARY,
    {
      variables: {
        questionLibraryId,
      },
    },
  )

  const questionLibrary: QuestionLibraryAdmin = {
    id: data?.question_library_by_pk?.id,
    title: data?.question_library_by_pk?.title || '',
    abstract: data?.question_library_by_pk?.abstract,
  }

  return {
    questionLibrary: questionLibrary,
    refetchQuestionLibrary: refetch,
    loading,
    error,
  }
}

const GET_QUESTION_LIBRARY = gql`
  query GET_QUESTION_LIBRARY($questionLibraryId: uuid!) {
    question_library_by_pk(id: $questionLibraryId) {
      id
      title
      abstract
    }
  }
`

const INSERT_QUESTION_GROUP = gql`
  mutation INSERT_QUESTION_GROUP($title: String!, $modifierId: String!, $questionLibraryId: uuid!) {
    insert_question_group(
      objects: { title: $title, modifier_id: $modifierId, question_library_id: $questionLibraryId }
    ) {
      affected_rows
      returning {
        id
      }
    }
    update_question_library(_set: { updated_at: "now()" }, where: { id: { _eq: $questionLibraryId } }) {
      affected_rows
    }
  }
`
