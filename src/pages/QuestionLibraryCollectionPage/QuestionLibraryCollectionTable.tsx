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
import pageMessages from '../translation'

const StyledDiv = styled.div`
  .ant-table-content {
    padding: 0.25rem 1.5rem 2.5rem;
  }
`

const NoQuestionLibraryBlock = styled.div`
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

type QuestionLibraryColumn = {
  id: string
  title: string
  count: number
  modifier: string
  lastModified: string
}

const QuestionLibraryCollectionTable: React.VFC<{ appId: string; currentMemberId: string }> = ({
  appId,
  currentMemberId,
}) => {
  const { formatMessage } = useIntl()
  const [searchTitle, setSearchTitle] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { loading, error, refetchQuestionLibrary, questionLibraries } = useQuestionLibraries({
    app_id: appId ? { _eq: appId } : undefined,
    title: searchTitle ? { _ilike: `%${searchTitle}%` } : undefined,
    deleted_at: { _is_null: true },
  })
  const [archiveQuestionLibrary] = useMutation<
    hasura.ARCHIVE_QUESTION_LIBRARY,
    hasura.ARCHIVE_QUESTION_LIBRARYVariables
  >(ARCHIVE_QUESTION_LIBRARY)

  const handleDelete = (id: string, setVisible: (visible: boolean) => void) => {
    setDeleteLoading(true)
    archiveQuestionLibrary({ variables: { questionLibraryId: id, modifierId: currentMemberId } })
      .then(() => {
        refetchQuestionLibrary()
        message.success(formatMessage(questionLibraryMessage.message.successDeletedQuestionLibrary), 3)
      })
      .catch(handleError)
      .finally(() => {
        setDeleteLoading(false)
        setVisible(false)
      })
  }

  const columns: ColumnProps<QuestionLibraryColumn>[] = [
    {
      key: 'title',
      title: formatMessage(pageMessages['*'].title),
      width: '50%',
      render: (_, record) => (
        <Link className="d-flex align-items-center justify-content-between" to={`/question-libraries/${record.id}`}>
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
      title: formatMessage(questionLibraryMessage.label.totalQuestionGroups),
      width: '10%',
      render: (_, record) => <div>{record.count}</div>,
    },
    {
      key: 'latestUpdatedAt',
      title: formatMessage(questionLibraryMessage.label.latestUpdatedAt),
      width: '25%',
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
                <AdminModal
                  renderTrigger={({ setVisible }) => (
                    <span onClick={() => setVisible(true)}>{formatMessage(commonMessages['ui'].delete)}</span>
                  )}
                  title={formatMessage(pageMessages['QuestionLibraryCollectionPage'].deleteQuestionLibraryMessage)}
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
                        loading={deleteLoading}
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

  return loading || questionLibraries.length > 0 || searchTitle !== null ? (
    <StyledDiv>
      <Table<QuestionLibraryColumn> loading={loading} rowKey="id" columns={columns} dataSource={questionLibraries} />
    </StyledDiv>
  ) : (
    <NoQuestionLibraryBlock>{formatMessage(questionLibraryMessage.label.noQuestionLibrary)}</NoQuestionLibraryBlock>
  )
}

export default QuestionLibraryCollectionTable

const useQuestionLibraries = (condition: hasura.GET_QUESTION_LIBRARIESVariables['condition']) => {
  const { loading, error, data, refetch } = useQuery<
    hasura.GET_QUESTION_LIBRARIES,
    hasura.GET_QUESTION_LIBRARIESVariables
  >(GET_QUESTION_LIBRARIES, {
    variables: {
      condition,
    },
  })
  const questionLibraries: QuestionLibraryColumn[] =
    data?.question_library.map(v => ({
      id: v.id,
      title: v.title || '',
      count: v?.question_groups_aggregate?.aggregate?.count || 0,
      modifierId: v.modifier_id,
      modifier: v.modifier.name,
      lastModified: moment(v.updated_at).format('YYYY-MM-DD HH:mm:ss'),
    })) || []

  return {
    questionLibraries: questionLibraries,
    refetchQuestionLibrary: refetch,
    loading,
    error,
  }
}

const GET_QUESTION_LIBRARIES = gql`
  query GET_QUESTION_LIBRARIES($condition: question_library_bool_exp!) {
    question_library(where: $condition, order_by: { updated_at: desc }) {
      id
      title
      modifier_id
      modifier {
        name
      }
      updated_at
      question_groups_aggregate {
        aggregate {
          count
        }
      }
    }
  }
`

const ARCHIVE_QUESTION_LIBRARY = gql`
  mutation ARCHIVE_QUESTION_LIBRARY($questionLibraryId: uuid!, $modifierId: String!) {
    update_question_option(
      where: { question: { question_group: { question_library: { id: { _eq: $questionLibraryId } } } } }
      _set: { deleted_at: "now()" }
    ) {
      affected_rows
    }
    update_question(
      where: { question_group: { question_library: { id: { _eq: $questionLibraryId } } } }
      _set: { deleted_at: "now()" }
    ) {
      affected_rows
    }
    update_question_group(
      where: { question_library: { id: { _eq: $questionLibraryId } } }
      _set: { modifier_id: $modifierId, deleted_at: "now()" }
    ) {
      affected_rows
    }
    update_question_library(
      where: { id: { _eq: $questionLibraryId } }
      _set: { modifier_id: $modifierId, deleted_at: "now()" }
    ) {
      affected_rows
    }
  }
`
