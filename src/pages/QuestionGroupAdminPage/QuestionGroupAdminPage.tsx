import { CloseOutlined } from '@ant-design/icons'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { Grid, GridItem, Spinner } from '@chakra-ui/react'
import { Button, Collapse } from 'antd'
import gql from 'graphql-tag'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { useHistory, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { v4 as uuid } from 'uuid'
import { AdminHeader, AdminHeaderTitle } from '../../components/admin'
import hasura from '../../hasura'
import { PlusIcon, TrashOIcon } from '../../images/icon'
import { Question } from '../../types/questionLibrary'
import LoadingPage from '../LoadingPage'
import QuestionBlock from './QuestionBlock'

const StyledAdminHeader = styled(AdminHeader)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #ececec;
  .header-left {
    display: flex;
    align-items: center;
  }
  .header-right {
    button {
      border-radius: 4px;
    }
  }
`

const StyledContent = styled.div`
  display: flex;
  height: 100vh;
  padding: 16px;
`

const QuestionGroupBlock = styled.div`
  width: 50%;
  padding: 0 24px 0 40px;
  overflow-y: scroll;
  .ant-collapse-header {
    font-size: 18px;
    font-weight: bold;
    letter-spacing: 0.8px;
    color: var(--gray-darker);
  }
  .ant-collapse > .ant-collapse-item.ant-collapse-no-arrow > .ant-collapse-header,
  .ant-collapse-content > .ant-collapse-content-box {
    padding: 16px 24px;
  }
  .ant-collapse > .ant-collapse-item.ant-collapse-item-active .ant-collapse-header {
    padding-bottom: 0;
  }
`

const StyledCollapse = styled(Collapse)`
  background-color: #fff;
  margin-bottom: 20px;
  .ant-collapse-header {
    background-color: #fff;
  }
  .ant-collapse-content {
    background-color: #fff;
    border: none;
  }
  .ant-collapse-content-active {
    height: auto;
  }
`

const StyledPanel = styled(Collapse.Panel)`
  .ant-collapse-content-box {
    padding: 16px 24px;
  }
`

const QuestionTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

export const AddButton = styled(Button)`
  padding: 0;
  span {
    margin-left: 8px;
  }
`

const AddQuestionBlock = styled.div`
  position: relative;
  text-align: center;
  &:before {
    content: '';
    display: block;
    position: absolute;
    left: 0;
    top: 50%;
    width: 40%;
    height: 2px;
    background-color: #ececec;
  }
  &:after {
    content: '';
    display: block;
    position: absolute;
    right: 0;
    top: 50%;
    width: 40%;
    height: 2px;
    background-color: #ececec;
  }
`

const PreviewBlock = styled.div`
  width: 50%;
  background-color: #f7f8f8;
  overflow-y: scroll;
`

const PreviewQuestion = styled.div`
  margin: 24px;
  padding: 40px;
  background-color: #fff;
`

const CurrentQuestionIndex = styled.div`
  padding-bottom: 12px;
  p {
    margin: 0;
    color: var(--gray-dark);
  }
`

const PreviewSubject = styled.div`
  font-size: 16px;
  font-weight: 500;
  line-height: 1.69;
  letter-spacing: 0.2px;
  color: var(--gray-darker);
  padding-bottom: 24px;
`

const PreviewOptions = styled.div<{ previewMode: string }>``

const ColumnOption = styled.div`
  padding: 16px;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.5;
  letter-spacing: 0.2px;
  color: #585858;
  border: 1px solid var(--gray);
  border-radius: 4px;
`

const GridOption = styled.div`
  border: 1px solid var(--gray);
  border-radius: 4px;
  padding: 16px;
`

const ExamName = styled.p`
  font-size: 18px;
  color: var(--gray-darker);
  font-weight: bold;
  letter-spacing: 0.8px;
  padding-bottom: 24px;
`

const QuestionGroupAdminPage: React.VFC = () => {
  const history = useHistory()
  const { currentMemberId } = useAuth()
  const { enabledModules } = useApp()
  const { formatMessage } = useIntl()
  const { questionGroupId } = useParams<{ questionGroupId: string }>()
  const [savingLoading, setSavingLoading] = useState<boolean>(false)
  const [questionList, setQuestionList] = useState<Question[]>([])
  const [preview, setPreview] = useState<object & { question: Question; idx: number; mode: string }>({
    question: { id: '', type: 'single', subject: '', layout: 'column', font: 'auto', explanation: '', position: 1 },
    idx: 0,
    mode: '',
  })
  const [currentExpandedQuestionId, setCurrentExpandedQuestionId] = useState<string>('')
  const { insertQuestion, updateQuestion, insertQuestionOption } = useQuestionMutation()
  const { questionGroupLoading, questionGroupError, questionGroupTitle, questionGroup, refetchQuestionGroup } =
    useQuestionGroup(questionGroupId)

  const handleSaveQuestionList = () => {}

  const handleAddQuestion = () => {
    setQuestionList([
      ...questionList,
      { id: uuid(), type: 'single', subject: '', layout: 'column', font: 'auto', explanation: '', position: 1 },
    ])
  }

  const handleQuestionDelete = (questionId: string) => {
    setQuestionList(questionList.filter(q => q.id !== questionId))
  }

  const handleQuestionChange = (newQuestion: Question) => {
    const newQuestionList = questionList.map(question => (question.id === newQuestion.id ? newQuestion : question))
    setPreview({ ...preview, question: newQuestion, mode: newQuestion.layout })
    setQuestionList(newQuestionList)
  }

  const handleChangeQuestionPanel = (questionId: string) => {
    if (questionId === undefined) {
      setPreview({
        question: { id: '', type: 'single', subject: '', layout: 'column', font: 'auto', explanation: '', position: 1 },
        idx: 0,
        mode: '',
      })
      setCurrentExpandedQuestionId('')
      return
    }

    questionList.forEach((question, idx) => {
      if (question.id === questionId) {
        setPreview({ question: question, idx: idx + 1, mode: question.layout })
        setCurrentExpandedQuestionId(questionId)
      }
    })
  }

  useEffect(() => {
    document.body.style.overflowY = 'hidden'
  }, [])

  useEffect(() => {
    if (questionList.length === 0 && questionGroup.length > 0) {
      setQuestionList(questionGroup)
    } else if (questionList.length === 0 && !questionGroupLoading && questionGroup.length === 0) {
      setQuestionList([
        { id: uuid(), type: 'single', subject: '', layout: 'column', font: 'auto', explanation: '', position: 1 },
      ])
    }
  }, [questionGroup, questionGroupLoading, questionList])

  if (Object.keys(enabledModules).length === 0 || questionGroupLoading) {
    return <LoadingPage />
  }

  return (
    <>
      <StyledAdminHeader>
        <div className="header-left">
          <Button type="link" className="mr-2" onClick={() => history.goBack()}>
            <CloseOutlined />
          </Button>
          {questionGroupLoading ? (
            <>
              <Spinner />
              <span className="flex-grow-1" />
            </>
          ) : (
            <AdminHeaderTitle>{questionGroupTitle}</AdminHeaderTitle>
          )}
        </div>
        <div className="header-right">
          <Button className="ml-3">取消</Button>
          <Button className="ml-3" type="primary" onClick={handleSaveQuestionList}>
            儲存
          </Button>
        </div>
      </StyledAdminHeader>
      <StyledContent>
        {!questionGroupLoading && (
          <QuestionGroupBlock>
            <StyledCollapse
              accordion={true}
              onChange={v => {
                if (typeof v === 'string' || v === undefined) {
                  handleChangeQuestionPanel(v)
                }
              }}
            >
              {questionList?.map((question, idx) => {
                return (
                  <StyledPanel
                    header={
                      <QuestionTitle>
                        題目 {idx + 1}
                        {questionList.length > 1 && (
                          <TrashOIcon
                            style={{ zIndex: 99999 }}
                            onClick={e => {
                              e.preventDefault()
                              handleQuestionDelete(question.id)
                            }}
                          />
                        )}
                      </QuestionTitle>
                    }
                    key={question.id}
                    showArrow={false}
                  >
                    <QuestionBlock question={question} onQuestionChange={handleQuestionChange} />
                  </StyledPanel>
                )
              })}
            </StyledCollapse>
            <AddQuestionBlock>
              <AddButton type="link" icon={<PlusIcon />} className="align-items-center" onClick={handleAddQuestion}>
                <span>新增題目</span>
              </AddButton>
            </AddQuestionBlock>
          </QuestionGroupBlock>
        )}
        <PreviewBlock>
          {preview.question.id !== '' && (
            <PreviewQuestion>
              <ExamName>課後測驗</ExamName>
              <CurrentQuestionIndex>
                <p>{`${preview.idx} / ${questionList.length}`}</p>
              </CurrentQuestionIndex>
              <PreviewSubject dangerouslySetInnerHTML={{ __html: preview.question.subject }} />
              <PreviewOptions previewMode={preview.mode}>
                {preview.mode === 'column' &&
                  preview.question.options?.map(option => (
                    <ColumnOption key={`preview_${option.id}`} dangerouslySetInnerHTML={{ __html: option.value }} />
                  ))}
                {preview.mode === 'grid' && (
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    {preview.question.options?.map(option => (
                      <GridItem key={`preview_${option.id}`} colSpan={1} w="100%">
                        <GridOption dangerouslySetInnerHTML={{ __html: option.value }} />
                      </GridItem>
                    ))}
                  </Grid>
                )}
              </PreviewOptions>
            </PreviewQuestion>
          )}
        </PreviewBlock>
      </StyledContent>
    </>
  )
}

export default QuestionGroupAdminPage

const useQuestionMutation = () => {
  const [insertQuestion] = useMutation<hasura.INSERT_QUESTION, hasura.INSERT_QUESTIONVariables>(gql`
    mutation INSERT_QUESTION(
      $subject: String!
      $layout: String!
      $font: String!
      $position: Int!
      $questionGroupId: uuid!
    ) {
      insert_question(
        objects: {
          subject: $subject
          layout: $layout
          font: $font
          position: $position
          question_group_id: $questionGroupId
        }
      ) {
        affected_rows
        returning {
          id
        }
      }
    }
  `)
  const [insertQuestionOption] = useMutation<hasura.INSERT_QUESTION_OPTION, hasura.INSERT_QUESTION_OPTIONVariables>(gql`
    mutation INSERT_QUESTION_OPTION($value: String!, $isAnswer: Boolean!, $position: Int!, $questionId: uuid!) {
      insert_question_option(
        objects: { value: $value, is_answer: $isAnswer, position: $position, question_id: $questionId }
      ) {
        affected_rows
        returning {
          id
        }
      }
    }
  `)
  const [updateQuestion] = useMutation<hasura.UPDATE_QUESTION, hasura.UPDATE_QUESTIONVariables>(gql`
    mutation UPDATE_QUESTION($questionId: uuid!, $subject: String!, $layout: String!, $font: String!, $position: Int!) {
      update_question(
        where: { id: { _eq: $questionId } }
        _set: { subject: $subject, layout: $layout, font: $font, position: $position }
      ) {
        affected_rows
      }
    }
  `)
  return {
    insertQuestion,
    updateQuestion,
    insertQuestionOption,
  }
}

const useQuestionGroup = (questionGroupId: string) => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_QUESTIONS, hasura.GET_QUESTIONSVariables>(
    GET_QUESTIONS,
    {
      variables: {
        questionGroupId,
      },
    },
  )

  const questions: Question[] =
    data?.question_group_by_pk?.questions.map(v => ({
      id: v.id,
      type: v.type,
      subject: v.subject,
      layout: v.layout,
      font: v.font,
      explanation: v.explanation,
      position: v.position,
      options: v.question_options.map(w => {
        return {
          id: String(w.id),
          value: w.value,
          isAnswer: w.is_answer || false,
          position: w.position,
        }
      }),
    })) || []

  return {
    questionGroupTitle: data?.question_group_by_pk?.title,
    questionGroup: questions,
    refetchQuestionGroup: refetch,
    questionGroupLoading: loading,
    questionGroupError: error,
  }
}

const GET_QUESTIONS = gql`
  query GET_QUESTIONS($questionGroupId: uuid!) {
    question_group_by_pk(id: $questionGroupId) {
      title
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
