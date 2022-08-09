import { CloseOutlined } from '@ant-design/icons'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { Button } from 'antd'
import gql from 'graphql-tag'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { useHistory, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { AdminHeader, AdminHeaderTitle } from '../../components/admin'
import hasura from '../../hasura'
import { PlusIcon } from '../../images/icon'
import { Question } from '../../types/questionLibrary'
import LoadingPage from '../LoadingPage'
import QuestionCollapse, { AddButton } from './QuestionCollapse'

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
  .ant-collapse > .ant-collapse-item > .ant-collapse-header {
    padding: 16px 24px;
  }
  .ant-collapse > .ant-collapse-item.ant-collapse-item-active .ant-collapse-header {
    padding-bottom: 0;
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

const PreviewOptions = styled.div<{ layoutOption: string }>``

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

const GridOption = styled.div<{ imgSrc: string }>`
  position: relative;
  border: 1px solid var(--gray);
  border-radius: 4px;
  .image-container {
    width: 100%;
  }
  .image-container:before {
    content: '';
    display: block;
    width: 100%;
    padding-top: 100%;
  }
  .image-container .option-image {
    background-image: url(${props => (props.imgSrc ? props.imgSrc : '')});
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;

    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
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
  const [questions, setQuestions] = useState<Array<Question>>()
  const { insertQuestion, updateQuestion } = useQuestionMutation()
  const { questionGroupLoading, questionGroupError, questionGroup, refetchQuestionGroup } =
    useQuestionGroup(questionGroupId)

  const handleSaveQuestion = () => {
    // insertQuestion({
    //   variables: {
    //     subject: '超強題目456',
    //     layout: 'column',
    //     font: 'auto',
    //     position: 1,
    //     questionGroupId: questionGroupId,
    //   },
    // }).then(data => {
    //   console.log(data)
    //   refetchQuestionGroup()
    // })
    // updateQuestion({
    //   variables: {
    //     questionId: '5fd797e4-167e-4450-9121-5e0f2a422a67',
    //     subject: '超強題目456',
    //     layout: 'column',
    //     font: 'auto',
    //     position: 1,
    //   },
    // })
  }

  useEffect(() => {
    document.body.style.overflowY = 'hidden'
  }, [])

  useEffect(() => {
    if (!questions && questionGroup.length > 0) {
      setQuestions(questionGroup)
    } else if (!questions && !questionGroupLoading && questionGroup.length === 0) {
      setQuestions([{ id: 'default', type: 'single', subject: '', layout: 'column', font: 'auto', position: 1 }])
    }
  }, [questionGroup, questionGroupLoading, questions])

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

          {/* {loading ? (
          <>
            <Spinner />
            <span className="flex-grow-1" />
          </>
        ) : ( */}
          <AdminHeaderTitle>超強題庫123</AdminHeaderTitle>
          {/* )} */}
        </div>
        <div className="header-right">
          <Button className="ml-3">取消</Button>
          <Button className="ml-3" type="primary" onClick={handleSaveQuestion}>
            儲存
          </Button>
        </div>
      </StyledAdminHeader>
      <StyledContent>
        {questions?.length}
        <QuestionGroupBlock>
          <QuestionCollapse questions={questions} />
          <AddQuestionBlock>
            <AddButton
              type="link"
              icon={<PlusIcon />}
              className="align-items-center"
              onClick={() => {
                console.log(questions)
                const copyQuestionsArr = questions
                copyQuestionsArr?.push({
                  id: 'default',
                  type: 'single',
                  subject: '',
                  layout: 'column',
                  font: 'auto',
                  position: 1,
                })
                setQuestions(copyQuestionsArr)
              }}
            >
              <span>新增題目</span>
            </AddButton>
          </AddQuestionBlock>
        </QuestionGroupBlock>
        <PreviewBlock>
          <PreviewQuestion>
            <ExamName>課後測驗</ExamName>
            <CurrentQuestionIndex>
              <p>1 / 2</p>
            </CurrentQuestionIndex>
            <PreviewSubject>
              小陳正在考慮使用付費搜尋廣告為自己的商家放送廣告。
              <br />
              你認為付費搜尋廣告這種行銷方式如此有效的原因何在？
            </PreviewSubject>
            {/* <PreviewOptions layoutOption={layoutOption}>
              {layoutOption === 'column' ? (
                <>
                  <ColumnOption>選項一</ColumnOption>
                  <ColumnOption>選項二</ColumnOption>
                  <ColumnOption>選項三</ColumnOption>
                  <ColumnOption>選項四</ColumnOption>
                </>
              ) : (
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <GridItem colSpan={1} w="100%">
                    <GridOption imgSrc="https://i.ytimg.com/vi/_ranO9lNH7A/maxresdefault.jpg">
                      <div className="image-container">
                        <div className="option-image"></div>
                      </div>
                    </GridOption>
                  </GridItem>
                  <GridItem colSpan={1} w="100%">
                    <GridOption imgSrc="https://i.ytimg.com/vi/_ranO9lNH7A/maxresdefault.jpg">
                      <div className="image-container">
                        <div className="option-image"></div>
                      </div>
                    </GridOption>
                  </GridItem>
                  <GridItem colSpan={1} w="100%">
                    <GridOption imgSrc="https://i.ytimg.com/vi/_ranO9lNH7A/maxresdefault.jpg">
                      <div className="image-container">
                        <div className="option-image"></div>
                      </div>
                    </GridOption>
                  </GridItem>
                  <GridItem colSpan={1} w="100%">
                    <GridOption imgSrc="https://i.ytimg.com/vi/_ranO9lNH7A/maxresdefault.jpg">
                      <div className="image-container">
                        <div className="option-image"></div>
                      </div>
                    </GridOption>
                  </GridItem>
                </Grid>
              )}
            </PreviewOptions> */}
          </PreviewQuestion>
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
    data?.question.map(v => ({
      id: v.id,
      type: v.type,
      subject: v.subject,
      layout: v.layout,
      font: v.font,
      position: v.position,
    })) || []

  return {
    questionGroup: questions,
    refetchQuestionGroup: refetch,
    questionGroupLoading: loading,
    questionGroupError: error,
  }
}

const GET_QUESTIONS = gql`
  query GET_QUESTIONS($questionGroupId: uuid!) {
    question(where: { question_group_id: { _eq: $questionGroupId }, deleted_at: { _is_null: true } }) {
      id
      type
      subject
      layout
      font
      position
    }
  }
`
