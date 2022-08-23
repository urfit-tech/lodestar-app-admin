import { ExportOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { Button, Skeleton, Table } from 'antd'
import { ColumnsType } from 'antd/es/table'
import gql from 'graphql-tag'
import { AdminBlock, AdminBlockTitle } from '../../components/admin'
import { ProgramTreeSelector } from '../../components/program/ProgramSelector'
import { dateFormatter, downloadCSV, toCSV } from '../../helpers'
import moment from 'moment'
import React, { useState } from 'react'
import hasura from '../../hasura'

type ImplementPracticeProps = {
  id: string
  title: string
  createdAt: Date
  updatedAt: Date
  name: string
  email: string
  issues: string[]
}

const DeadlinePracticesBlock: React.VFC = () => {
  const [programContentId, setProgramContentId] = useState('')

  return (
    <AdminBlock>
      <AdminBlockTitle>實戰營作業</AdminBlockTitle>
      <ProgramTreeSelector
        allowContentType="practice"
        treeNodeSelectable={false}
        className="mb-4"
        value={programContentId}
        onChange={value => setProgramContentId(value)}
      />

      {programContentId !== 'all' && programContentId && <ResultBlock programContentId={programContentId} />}
    </AdminBlock>
  )
}

const ResultBlock: React.VFC<{
  programContentId: string
}> = ({ programContentId }) => {
  const { loadingPractices, errorPractices, practices } = useImplementPractices(programContentId)

  if (loadingPractices) {
    return <Skeleton active />
  }

  if (errorPractices) {
    return <div>讀取錯誤</div>
  }

  const columns: ColumnsType<ImplementPracticeProps> = [
    {
      title: '作業名稱',
      dataIndex: 'title',
    },
    {
      title: '建立日期',
      dataIndex: 'createdAt',
      render: createdAt => dateFormatter(createdAt),
    },
    {
      title: '更新日期',
      dataIndex: 'updatedAt',
      render: updatedAt => dateFormatter(updatedAt),
    },
    {
      title: '學員名稱',
      dataIndex: 'name',
    },
    {
      title: 'email',
      dataIndex: 'email',
    },
    {
      title: '創作者留言',
      dataIndex: 'issues',
      render: issues => issues.join('\n'),
    },
  ]

  const handleExport = () => {
    const data: string[][] = [
      columns.map(column => column.title?.toString() || ''),
      ...practices.map(practice => [
        practice.title,
        moment(practice.createdAt).format('YYYY-MM-DD HH:mm:ss'),
        moment(practice.updatedAt).format('YYYY-MM-DD HH:mm:ss'),
        practice.name,
        practice.email,
        practice.issues.join(','),
      ]),
    ]
    downloadCSV('deadline-practices.csv', toCSV(data))
  }

  return (
    <>
      <Button type="primary" icon={<ExportOutlined />} onClick={handleExport}>
        匯出
      </Button>
      <Table<ImplementPracticeProps>
        rowKey={practice => practice.id}
        rowClassName="no-wrap"
        columns={columns}
        dataSource={practices}
        pagination={false}
        scroll={{ x: true }}
      />
    </>
  )
}

const useImplementPractices = (programContentId: string) => {
  const { loading, error, data, refetch } = useQuery<
    hasura.GET_IMPLEMENT_PRACTICES,
    hasura.GET_IMPLEMENT_PRACTICESVariables
  >(
    gql`
      query GET_IMPLEMENT_PRACTICES($programContentId: uuid!) {
        practice(
          where: { program_content_id: { _eq: $programContentId }, is_deleted: { _eq: false } }
          order_by: [{ created_at: asc }]
        ) {
          id
          program_content {
            id
            title
          }
          created_at
          updated_at
          member {
            id
            name
            username
            email
          }
          practice_issues(
            where: { issue: { member: { role: { _eq: "content-creator" } } } }
            order_by: [{ issue: { created_at: asc } }]
          ) {
            issue {
              id
              description
            }
          }
        }
      }
    `,
    {
      variables: { programContentId },
      fetchPolicy: 'no-cache',
    },
  )

  const practices: ImplementPracticeProps[] =
    data?.practice.map(v => ({
      id: v.id,
      title: v.program_content.title,
      createdAt: new Date(v.created_at),
      updatedAt: new Date(v.updated_at),
      name: v.member.name || v.member.username,
      email: v.member.email,
      issues: v.practice_issues.map(p =>
        JSON.parse(p.issue?.description || '{}')
          .blocks?.map((b: any) => b.text)
          .join(''),
      ),
    })) || []

  return {
    loadingPractices: loading,
    errorPractices: error,
    practices,
    refetchPractices: refetch,
  }
}

export default DeadlinePracticesBlock
