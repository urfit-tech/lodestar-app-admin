import { MoreOutlined, SearchOutlined } from '@ant-design/icons'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { Button, Dropdown, Input, Menu, message, Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import gql from 'graphql-tag'
import moment from 'moment-timezone'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import AdminModal from '../../components/admin/AdminModal'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages, questionLibraryMessage } from '../../helpers/translation'
import pageMessages from '../translation'
import QuestionGroupDuplicateAdminModal from './QuestionGroupDuplicateAdminModal'
import QuestionGroupRenameAdminModal from './QuestionGroupRenameAdminModal'

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

type QuestionGroupColumn = {
  id: string
  title: string
  count: number
  modifier: string
  lastModified: string
}

const QuestionGroupCollectionTable: React.VFC<{ questionLibraryId: string; currentMemberId: string }> = ({
  questionLibraryId,
  currentMemberId,
}) => {
  const { formatMessage } = useIntl()
  const [searchTitle, setSearchTitle] = useState<string | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const { loading, error, questionGroups, refetchQuestionGroups } = useQuestionGroups({
    title: searchTitle ? { _ilike: `%${searchTitle}%` } : undefined,
    deleted_at: { _is_null: true },
    question_library_id: { _eq: questionLibraryId },
  })
  const [archiveQuestionGroup] = useMutation<hasura.ARCHIVE_QUESTION_GROUP, hasura.ARCHIVE_QUESTION_GROUPVariables>(
    ARCHIVE_QUESTION_GROUP,
  )

  const handleDelete = (questionGroupId: string, setVisible: (visible: boolean) => void) => {
    setDetailLoading(true)
    archiveQuestionGroup({
      variables: {
        questionGroupId: questionGroupId,
        modifierId: currentMemberId,
        questionLibraryIdForArchive: questionLibraryId,
      },
    })
      .then(() => {
        refetchQuestionGroups()
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

  const columns: ColumnProps<QuestionGroupColumn>[] = [
    {
      key: 'title',
      title: formatMessage(pageMessages['*'].title),
      width: '50%',
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
      key: 'count',
      title: formatMessage(questionLibraryMessage.label.totalQuestions),
      width: '15%',
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
                  questionLibraryId={questionLibraryId}
                  questionGroupId={record.id}
                  currentMemberId={currentMemberId}
                  onRefetch={refetchQuestionGroups}
                />
              </DetailItem>
              <DetailItem>
                <QuestionGroupRenameAdminModal
                  questionLibraryId={questionLibraryId}
                  questionGroupId={record.id}
                  title={record.title}
                  currentMemberId={currentMemberId}
                  onRefetch={refetchQuestionGroups}
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
                          handleDelete(record.id, setVisible)
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

  return loading || questionGroups.length > 0 || searchTitle !== null ? (
    <StyledDiv>
      <Table<QuestionGroupColumn> loading={loading} rowKey="id" columns={columns} dataSource={questionGroups} />
    </StyledDiv>
  ) : (
    <NoQuestionGroupBlock>{formatMessage(questionLibraryMessage.label.noQuestionGroup)}</NoQuestionGroupBlock>
  )
}

export default QuestionGroupCollectionTable

const useQuestionGroups = (condition: hasura.GET_QUESTION_GROUPSVariables['condition']) => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_QUESTION_GROUPS>(GET_QUESTION_GROUPS, {
    variables: {
      condition,
    },
  })

  const questionGroups: QuestionGroupColumn[] =
    data?.question_group.map(v => ({
      id: v.id,
      title: v.title,
      count: v?.questions_aggregate?.aggregate?.count || 0,
      modifierId: v.modifier_id,
      modifier: v.modifier.name,
      lastModified: moment(v.updated_at).format('YYYY-MM-DD HH:mm:ss'),
    })) || []

  return {
    loading,
    error,
    questionGroups: questionGroups,
    refetchQuestionGroups: refetch,
  }
}

const GET_QUESTION_GROUPS = gql`
  query GET_QUESTION_GROUPS($condition: question_group_bool_exp!) {
    question_group(where: $condition, order_by: { updated_at: desc }) {
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
`

export const UPDATE_QUESTION_GROUP_TITLE = gql`
  mutation UPDATE_QUESTION_GROUP_TITLE(
    $questionGroupId: uuid!
    $title: String!
    $modifierId: String!
    $questionLibraryIdForUpdate: uuid!
  ) {
    update_question_group(_set: { title: $title, modifier_id: $modifierId }, where: { id: { _eq: $questionGroupId } }) {
      affected_rows
    }
    update_question_library(where: { id: { _eq: $questionLibraryIdForUpdate } }, _set: { updated_at: "now()" }) {
      affected_rows
    }
  }
`

export const ARCHIVE_QUESTION_GROUP = gql`
  mutation ARCHIVE_QUESTION_GROUP($questionGroupId: uuid!, $modifierId: String!, $questionLibraryIdForArchive: uuid!) {
    update_question_option(
      where: { question: { question_group: { id: { _eq: $questionGroupId } } } }
      _set: { deleted_at: "now()" }
    ) {
      affected_rows
    }
    update_question(where: { question_group: { id: { _eq: $questionGroupId } } }, _set: { deleted_at: "now()" }) {
      affected_rows
    }
    update_question_group(
      where: { id: { _eq: $questionGroupId } }
      _set: { modifier_id: $modifierId, deleted_at: "now()" }
    ) {
      affected_rows
    }
    update_question_library(
      where: { id: { _eq: $questionLibraryIdForArchive } }
      _set: { modifier_id: $modifierId, updated_at: "now()" }
    ) {
      affected_rows
    }
  }
`
