import { AreaChartOutlined, FileAddOutlined, MoreOutlined } from '@ant-design/icons'
import { gql, useMutation, useQuery } from '@apollo/client'
import { Button, Dropdown, Menu, Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { AdminBlock, AdminPageTitle } from '../../components/admin'
import AdminLayout from '../../components/layout/AdminLayout'
import ReportAdminModal from '../../components/report/ReportAdminModal'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages, reportMessages } from '../../helpers/translation'
import { ReportProps } from '../../types/report'

const StyledTitle = styled.span`
  color: var(--gray-darker);
  font-weight: bold;
`

const ReportCollectionPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { reports, loadingReports, refetchReports } = useReportCollection()
  const [deleteReport] = useMutation<hasura.DELETE_REPORT, hasura.DELETE_REPORTVariables>(DELETE_REPORT)
  const getReportOptions = (report: ReportProps) => {
    const { options, type } = report
    switch (type) {
      case 'metabase':
        const key = Object.keys(options.metabase.resource)[0]
        const value = Object.values(options.metabase.resource)[0]
        return `${key}:${value}`
      default:
        return null
    }
  }
  const onCellClick = (record: ReportProps) => {
    return {
      onClick: () => {
        window.open(`${process.env.PUBLIC_URL}/report/${record.id}`)
      },
    }
  }
  const columns: ColumnProps<ReportProps>[] = [
    {
      dataIndex: 'title',
      width: '45%',
      title: `${formatMessage(reportMessages.label.title)}`,
      render: (text, record, index) => (
        <div>
          <StyledTitle className="mr-2">{record.title}</StyledTitle>
        </div>
      ),
      onCell: onCellClick,
    },
    {
      dataIndex: 'type',
      width: '5%',
      title: `${formatMessage(reportMessages.label.type)}`,
      render: (text, record, index) => (
        <div>
          <StyledTitle className="mr-2"> {record.type}</StyledTitle>
        </div>
      ),
      onCell: onCellClick,
    },
    {
      dataIndex: 'options',
      width: '45%',
      title: `${formatMessage(reportMessages.label.options)}`,
      render: (text, record, index) => (
        <div>
          <StyledTitle className="mr-2">{getReportOptions(record)}</StyledTitle>
        </div>
      ),
      onCell: onCellClick,
    },
    {
      width: '5%',
      render: (text, record, index) => (
        <div>
          <Dropdown
            trigger={['hover']}
            overlay={
              <Menu>
                <Menu.Item
                  className="cursor-pointer"
                  onClick={async () => {
                    await deleteReport({ variables: { reportId: record.id } }).catch(handleError)
                    refetchReports?.()
                  }}
                >
                  {formatMessage(commonMessages.ui.delete)}
                </Menu.Item>
              </Menu>
            }
          >
            <Button type="link" icon={<MoreOutlined />} />
          </Dropdown>
        </div>
      ),
    },
  ]
  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <AreaChartOutlined className="mr-3" />
        <span>{formatMessage(reportMessages['*'].pageTitle)}</span>
      </AdminPageTitle>
      <div className="d-flex align-item-center justify-content-between mb-4">
        <ReportAdminModal
          onRefetch={refetchReports}
          renderTrigger={({ setVisible }) => (
            <Button type="primary" icon={<FileAddOutlined />} onClick={() => setVisible(true)}>
              {formatMessage(reportMessages['*'].addReport)}
            </Button>
          )}
        />
      </div>
      <AdminBlock>
        <Table
          columns={columns}
          dataSource={reports}
          rowKey="id"
          loading={loadingReports}
          showSorterTooltip={false}
          rowClassName="cursor-pointer"
          pagination={false}
        />
      </AdminBlock>
    </AdminLayout>
  )
}

const useReportCollection = () => {
  const { loading, error, data, refetch } = useQuery<
    hasura.GET_REPORTS_COLLECTION,
    hasura.GET_REPORTS_COLLECTIONVariables
  >(
    gql`
      query GET_REPORTS_COLLECTION {
        report {
          id
          title
          type
          options
        }
      }
    `,
  )

  const reports: ReportProps[] =
    data?.report.map(r => {
      return {
        id: r.id,
        title: r.title,
        type: r.type || '',
        options: r.options,
      }
    }) || []

  return {
    reports,
    loadingReports: loading,
    errorReports: error,
    refetchReports: refetch,
  }
}

const DELETE_REPORT = gql`
  mutation DELETE_REPORT($reportId: uuid!) {
    delete_report(where: { id: { _eq: $reportId } }) {
      affected_rows
    }
  }
`

export default ReportCollectionPage
