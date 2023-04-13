import { MoreOutlined, SearchOutlined } from '@ant-design/icons'
import { gql, useMutation, useQuery } from '@apollo/client'
import { Button, Dropdown, Input, Menu, message, Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import moment from 'moment-timezone'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import AdminModal from '../../components/admin/AdminModal'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages, questionLibraryMessage } from '../../helpers/translation'
import QuestionGroupDuplicateAdminModal from '../QuestionLibraryAdminPage/QuestionGroupDuplicateAdminModal'
import QuestionGroupRenameAdminModal from '../QuestionLibraryAdminPage/QuestionGroupRenameAdminModal'
import { ARCHIVE_QUESTION_GROUP } from '../QuestionLibraryAdminPage/QuestionLibraryAdminTable'
import pageMessages from '../translation'

const StyledDiv = styled.div`
  .ant-table-content {
    padding: 0.25rem 1.5rem 2.5rem;
  }
`

const NoQuestionGroupBlock = styled.div`
  width: 100%;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--gray-darker);
  font-size: 16px;
`

const StyledTitle = styled.div`
  color: var(--gray-darker);
  line-height: normal;
  letter-spacing: 0.2px;
  cursor: pointer;
`

const DetailItem = styled(Menu.Item)`
  padding: 0.5rem 1rem;
`

const filterIcon = (filtered: boolean) => <SearchOutlined style={{ color: filtered ? 'var(--primary)' : undefined }} />

type QuestionGroupListColumn = {
  id: string
  title: string
  questionLibraryId: string
  questionLibraryTitle: string
  count: number
  modifierId: string
  modifier: string
  lastModified: string
}

const QuestionGroupCollectionTable: React.VFC<{ appId: string; currentMemberId: string }> = ({
  appId,
  currentMemberId,
}) => {
  const { formatMessage } = useIntl()
  const [searchTitle, setSearchTitle] = useState<string | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const { loading, error, questionGroupList, refetchQuestionGroupList } = useQuestionGroupList(appId, {
    title: searchTitle ? { _ilike: `%${searchTitle}%` } : undefined,
    deleted_at: { _is_null: true },
  })
  const [archiveQuestionGroup] = useMutation<hasura.ARCHIVE_QUESTION_GROUP, hasura.ARCHIVE_QUESTION_GROUPVariables>(
    ARCHIVE_QUESTION_GROUP,
  )

  const handleDelete = (questionLibraryId: string, questionGroupId: string, setVisible: (visible: boolean) => void) => {
    setDetailLoading(true)
    archiveQuestionGroup({
      variables: {
        questionGroupId: questionGroupId,
        modifierId: currentMemberId,
        questionLibraryIdForArchive: questionLibraryId,
      },
    })
      .then(() => {
        refetchQuestionGroupList()
          .then(() => {
            message.success(formatMessage(questionLibraryMessage.message.successDeletedQuestionGroup), 3)
          })
          .catch(handleError)
      })
      .catch(handleError)
      .finally(() => {
        setDetailLoading(false)
        setVisible(false)
      })
  }

  const columns: ColumnProps<QuestionGroupListColumn>[] = [
    {
      key: 'title',
      title: formatMessage(pageMessages['*'].title),
      width: '35%',
      render: (_, record) => (
        <Link className="d-flex align-items-center justify-content-between" to={`/question-groups/${record.id}`}>
          <StyledTitle className="flex-grow-1">{record.title}</StyledTitle>
        </Link>
      ),
      filterDropdown: () => (
        <div className="p-2">
          <Input
            autoFocus
            value={searchTitle || ''}
            onChange={e => {
              searchTitle && setSearchTitle('')
              setSearchTitle(e.target.value)
            }}
          />
        </div>
      ),
      filterIcon,
    },
    {
      key: 'questionLibrary',
      title: formatMessage(questionLibraryMessage.label.questionLibrary),
      width: '20%',
      render: (_, record) => (
        <Link
          className="d-flex align-items-center justify-content-between"
          to={`/question-libraries/${record.questionLibraryId}`}
        >
          <StyledTitle className="flex-grow-1">{record.questionLibraryTitle}</StyledTitle>
        </Link>
      ),
    },
    {
      key: 'count',
      title: formatMessage(questionLibraryMessage.label.totalQuestions),
      width: '10%',
      render: (_, record) => <div>{record.count}</div>,
    },
    {
      key: 'latestUpdatedAt',
      title: formatMessage(questionLibraryMessage.label.latestUpdatedAt),
      width: '20%',
      render: (_, record) => (
        <div>
          <p>{record.lastModified}</p>
          <p>{record.modifier}</p>
        </div>
      ),
    },
    {
      key: '',
      title: '',
      width: '5%',
      render: (_, record) => (
        <Dropdown
          placement="bottomRight"
          overlay={
            <Menu>
              <DetailItem>
                <QuestionGroupDuplicateAdminModal
                  questionLibraryId={record.questionLibraryId}
                  questionGroupId={record.id}
                  currentMemberId={currentMemberId}
                  onRefetch={refetchQuestionGroupList}
                />
              </DetailItem>
              <DetailItem>
                <QuestionGroupRenameAdminModal
                  questionLibraryId={record.questionLibraryId}
                  questionGroupId={record.id}
                  title={record.title}
                  currentMemberId={currentMemberId}
                  onRefetch={refetchQuestionGroupList}
                />
              </DetailItem>
              <DetailItem>
                <AdminModal
                  renderTrigger={({ setVisible }) => (
                    <div onClick={() => setVisible(true)}>{formatMessage(commonMessages['ui'].delete)}</div>
                  )}
                  title={formatMessage(pageMessages['QuestionLibraryAdminPage'].deleteQuestionGroupMessage)}
                  footer={null}
                  renderFooter={({ setVisible }) => (
                    <div>
                      <Button
                        className="mr-2"
                        onClick={() => {
                          setVisible(false)
                        }}
                      >
                        {formatMessage(commonMessages['ui'].cancel)}
                      </Button>
                      <Button
                        type="primary"
                        danger={true}
                        loading={detailLoading}
                        onClick={() => {
                          handleDelete(record.questionLibraryId, record.id, setVisible)
                        }}
                      >
                        {formatMessage(commonMessages['ui'].confirm)}
                      </Button>
                    </div>
                  )}
                />
              </DetailItem>
            </Menu>
          }
          trigger={['click']}
        >
          <MoreOutlined style={{ fontSize: '20px' }} onClick={e => e.stopPropagation()} />
        </Dropdown>
      ),
    },
  ]

  if (error) {
    return <div>{formatMessage(pageMessages['*'].fetchDataError)}</div>
  }

  return loading || questionGroupList.length > 0 || searchTitle !== null ? (
    <StyledDiv>
      <Table<QuestionGroupListColumn> loading={loading} rowKey="id" columns={columns} dataSource={questionGroupList} />
    </StyledDiv>
  ) : (
    <NoQuestionGroupBlock>{formatMessage(questionLibraryMessage.label.noQuestionGroup)}</NoQuestionGroupBlock>
  )
}

export default QuestionGroupCollectionTable

const useQuestionGroupList = (appId: string, condition: hasura.GET_QUESTION_GROUP_LISTVariables['condition']) => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_QUESTION_GROUP_LIST>(GET_QUESTION_GROUP_LIST, {
    variables: {
      appId,
      condition,
    },
  })

  let questionGroupList: QuestionGroupListColumn[] = []

  data?.question_library.forEach(v => {
    v.question_groups.forEach(w => {
      questionGroupList.push({
        id: w.id,
        title: w.title || '',
        questionLibraryId: v.id,
        questionLibraryTitle: v.title || '',
        count: w.questions_aggregate?.aggregate?.count || 0,
        modifierId: w.modifier_id,
        modifier: w.modifier.name,
        lastModified: moment(w.updated_at).format('YYYY-MM-DD HH:mm:ss'),
      })
    })
  })

  return {
    loading,
    error,
    questionGroupList: questionGroupList,
    refetchQuestionGroupList: refetch,
  }
}

const GET_QUESTION_GROUP_LIST = gql`
  query GET_QUESTION_GROUP_LIST($appId: String!, $condition: question_group_bool_exp!) {
    question_library(where: { app_id: { _eq: $appId } }, order_by: { updated_at: desc }) {
      id
      title
      question_groups(where: $condition, order_by: { updated_at: desc }) {
        id
        title
        modifier_id
        modifier {
          name
        }
        updated_at
        questions_aggregate {
          aggregate {
            count
          }
        }
      }
    }
  }
`
