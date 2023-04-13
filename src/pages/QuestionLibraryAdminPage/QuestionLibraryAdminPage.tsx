import { ArrowLeftOutlined, FileAddOutlined } from '@ant-design/icons'
import { gql, useMutation, useQuery } from '@apollo/client'
import { Spinner } from '@chakra-ui/react'
import { Button, Form, Input, InputNumber, message, Select, Tabs } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { sampleSize } from 'lodash'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import { Link, useHistory, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { StringParam, useQueryParam } from 'use-query-params'
import { v4 as uuid } from 'uuid'
import {
  AdminBlock,
  AdminBlockTitle,
  AdminHeader,
  AdminHeaderTitle,
  AdminPaneTitle,
  AdminTabBarWrapper,
} from '../../components/admin'
import AdminModal from '../../components/admin/AdminModal'
import TreeTransfer from '../../components/common/TreeTransfer'
import { StyledLayoutContent } from '../../components/layout/DefaultLayout'
import hasura from '../../hasura'
import { commonMessages, questionLibraryMessage } from '../../helpers/translation'
import { QuestionLibrary } from '../../types/questionLibrary'
import LoadingPage from '../LoadingPage'
import pageMessages from '../translation'
import QuestionLibraryAdminTable from './QuestionLibraryAdminTable'
import QuestionLibraryBasicForm from './QuestionLibraryBasicForm'

const NumberOfDrawsInputBlock = styled.div`
  display: flex;
  align-items: baseline;
  padding-bottom: 24px;
  .ant-form-item {
    margin: 0;
  }
  .ant-input-number {
    margin: 0 12px;
  }
`

type FieldProps = {
  title: string
  questionGroupType: string
  transferredQuestions?: string[]
  drawAmount?: number
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
  const [selectedQuestionGroupIdList, setSelectedQuestionGroupIdList] = useState<string[]>([])
  const [form] = useForm<FieldProps>()
  const { loading, error, refetchQuestionLibrary, questionLibrary } = useQuestionLibrary(questionLibraryId)
  const { questionLibraryList, refetchQuestionLibraryList } = useQuestionLibraryList()
  const [createQuestionGroup] = useMutation<hasura.INSERT_QUESTION_GROUP, hasura.INSERT_QUESTION_GROUPVariables>(
    INSERT_QUESTION_GROUP,
  )
  const [importQuestionGroup] = useMutation<
    hasura.INSERT_IMPORT_QUESTION_GROUP,
    hasura.INSERT_IMPORT_QUESTION_GROUPVariables
  >(INSERT_IMPORT_QUESTION_GROUP)
  const { data: questionList } = useQuery<hasura.GET_QUESTION_LIST, hasura.GET_QUESTION_LISTVariables>(
    GET_QUESTION_LIST,
    {
      variables: {
        questionGroupIdList: selectedQuestionGroupIdList,
      },
    },
  )

  const handleQuestionGroupChange = () => {
    refetchQuestionLibraryList()
  }

  const handleQuestionGroupTypeChange = (type: string) => {
    form.setFieldsValue({
      questionGroupType: type,
    })
    setQuestionGroupType(type)
  }

  const handleSubmit = () => {
    setSavingLoading(true)
    if (!currentMemberId) {
      message.error(formatMessage(pageMessages['QuestionLibraryAdminPage'].noMemberId))
      setSavingLoading(false)
      return
    }
    form
      .validateFields()
      .then(() => {
        const values = form.getFieldsValue()
        switch (values.questionGroupType) {
          case 'import':
            let importQuestionListData: any[] = []
            let importQuestionPositionCounter = 0
            questionList?.question_group.forEach(v => {
              v.questions.forEach(question => {
                importQuestionListData.push({
                  id: uuid(),
                  type: question.type,
                  subject: question.subject,
                  layout: question.layout,
                  font: question.font,
                  explanation: question.explanation,
                  position: (importQuestionPositionCounter += 1),
                  question_options: {
                    data:
                      question.question_options.map(options => ({
                        id: uuid(),
                        value: options.value,
                        is_answer: options.is_answer,
                        position: options.position,
                      })) || [],
                  },
                })
              })
            })

            importQuestionGroup({
              variables: {
                importQuestionGroupData: [
                  {
                    id: uuid(),
                    question_library_id: questionLibraryId,
                    title: values.title || '',
                    modifier_id: currentMemberId,
                    questions: { data: importQuestionListData },
                  },
                ],
                questionLibraryId: questionLibraryId,
              },
            })
              .then(({ data }) => {
                const questionGroupId = data?.insert_question_group?.returning[0].id
                setSavingLoading(false)
                questionGroupId && history.push(`/question-groups/${questionGroupId}`)
              })
              .catch(err => {
                message.error(formatMessage(questionLibraryMessage.message.failAddQuestionGroup), 3)
              })
            break
          case 'random':
            let questionListData: any[] = []
            questionList?.question_group.forEach(v => {
              v.questions.forEach(question => {
                questionListData.push({
                  id: uuid(),
                  type: question.type,
                  subject: question.subject,
                  layout: question.layout,
                  font: question.font,
                  explanation: question.explanation,
                  question_options: {
                    data:
                      question.question_options.map(options => ({
                        id: uuid(),
                        value: options.value,
                        is_answer: options.is_answer,
                        position: options.position,
                      })) || [],
                  },
                })
              })
            })
            let randomSelectQuestionList = sampleSize(questionListData, values.drawAmount)
            let questionPositionCounter = 0
            randomSelectQuestionList = randomSelectQuestionList.map(question => ({
              ...question,
              position: (questionPositionCounter += 1),
            }))

            importQuestionGroup({
              variables: {
                importQuestionGroupData: [
                  {
                    id: uuid(),
                    question_library_id: questionLibraryId,
                    title: values.title || '',
                    modifier_id: currentMemberId,
                    questions: { data: randomSelectQuestionList },
                  },
                ],
                questionLibraryId: questionLibraryId,
              },
            })
              .then(({ data }) => {
                const questionGroupId = data?.insert_question_group?.returning[0].id
                setSavingLoading(false)
                questionGroupId && history.push(`/question-groups/${questionGroupId}`)
              })
              .catch(err => {
                message.error(formatMessage(questionLibraryMessage.message.failAddQuestionGroup), 3)
              })
            break
          default:
            createQuestionGroup({
              variables: {
                title: values.title || '',
                modifierId: currentMemberId,
                questionLibraryId: questionLibraryId,
              },
            })
              .then(({ data }) => {
                const questionGroupId = data?.insert_question_group?.returning[0]?.id
                setSavingLoading(false)
                questionGroupId && history.push(`/question-groups/${questionGroupId}`)
              })
              .catch(err => {
                message.error(formatMessage(questionLibraryMessage.message.failAddQuestionGroup), 3)
              })
            break
        }
      })
      .finally(() => {
        setSavingLoading(false)
      })
  }

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
                        questionGroupType: 'new',
                        transferredQuestions: [],
                        drawAmount: 10,
                      }}
                    >
                      <Form.Item name="title">
                        <Input />
                      </Form.Item>
                      <Form.Item name="questionGroupType">
                        <Select
                          value={questionGroupType}
                          style={{
                            width: '100%',
                          }}
                          onChange={v => handleQuestionGroupTypeChange(v)}
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
                      </Form.Item>
                      {questionGroupType === 'random' && (
                        <NumberOfDrawsInputBlock>
                          {formatMessage(questionLibraryMessage.label.draw)}
                          <Form.Item
                            name="drawAmount"
                            rules={[
                              ({ getFieldValue }) => ({
                                validator(_, value) {
                                  let questionCount = 0
                                  questionList?.question_group.forEach(v => {
                                    questionCount += v.questions.length
                                  })
                                  if (getFieldValue('drawAmount') > questionCount) {
                                    return Promise.reject(
                                      new Error(formatMessage(questionLibraryMessage.message.exceededQuantityOfDraws)),
                                    )
                                  }
                                  return Promise.resolve()
                                },
                              }),
                            ]}
                          >
                            <InputNumber
                              min={1}
                              onChange={v => {
                                if (typeof v === 'number') {
                                  form.setFieldsValue({
                                    drawAmount: v,
                                  })
                                }
                              }}
                            />
                          </Form.Item>
                          {formatMessage(questionLibraryMessage.label.questions)}
                        </NumberOfDrawsInputBlock>
                      )}
                      {questionGroupType !== 'new' && (
                        <Form.Item
                          name="transferredQuestions"
                          rules={[
                            {
                              required: true,
                              message: formatMessage(questionLibraryMessage.message.atLeastChooseOneQuestionGroup),
                            },
                          ]}
                        >
                          <TreeTransfer
                            dataSource={questionLibraryList}
                            targetKeys={selectedQuestionGroupIdList}
                            onChange={v => {
                              let isParentNode = false
                              questionLibraryList.forEach((questionLibrary, idx) => {
                                if (questionLibrary.key === v[0]) {
                                  isParentNode = true
                                  setSelectedQuestionGroupIdList(questionLibrary.children.map(w => w.key))
                                }
                              })
                              if (!isParentNode) {
                                setSelectedQuestionGroupIdList(v)
                              }
                            }}
                          />
                        </Form.Item>
                      )}
                    </Form>
                  </AdminModal>
                </div>
                {currentMemberId && (
                  <QuestionLibraryAdminTable
                    questionLibraryId={questionLibraryId}
                    currentMemberId={currentMemberId}
                    onQuestionGroupChange={handleQuestionGroupChange}
                  />
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
    abstract: data?.question_library_by_pk?.abstract || '',
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

const useQuestionLibraryList = () => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_QUESTION_LIBRARY_LIST>(GET_QUESTION_LIBRARY_LIST)

  const questionLibraryList =
    data?.question_library.map(v => ({
      key: v.id,
      title: v.title || '',
      selectable: v.question_groups.length >= 1,
      disabled: v.question_groups.length < 1,
      disableCheckbox: v.question_groups.length < 1,
      children: v.question_groups.map(w => ({
        key: w.id,
        title: w.title || '',
        isLeaf: true,
      })),
    })) || []

  return {
    questionLibraryList: questionLibraryList,
    refetchQuestionLibraryList: refetch,
    questionLibraryListLoading: loading,
    questionLibraryListError: error,
  }
}

const GET_QUESTION_LIBRARY_LIST = gql`
  query GET_QUESTION_LIBRARY_LIST {
    question_library {
      id
      title
      question_groups(order_by: { title: asc }) {
        id
        title
      }
    }
  }
`

const GET_QUESTION_LIST = gql`
  query GET_QUESTION_LIST($questionGroupIdList: [uuid!]) {
    question_group(where: { id: { _in: $questionGroupIdList } }) {
      questions(order_by: { position: asc }) {
        id
        type
        subject
        layout
        font
        explanation
        position
        question_options(order_by: { position: asc }) {
          id
          value
          is_answer
          position
        }
      }
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

const INSERT_IMPORT_QUESTION_GROUP = gql`
  mutation INSERT_IMPORT_QUESTION_GROUP(
    $importQuestionGroupData: [question_group_insert_input!]!
    $questionLibraryId: uuid!
  ) {
    insert_question_group(objects: $importQuestionGroupData) {
      affected_rows
      returning {
        id
      }
    }
    update_question_library(where: { id: { _eq: $questionLibraryId } }, _set: { updated_at: "now()" }) {
      affected_rows
    }
  }
`
