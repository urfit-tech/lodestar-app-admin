import { AreaChartOutlined, FileAddOutlined, MoreOutlined } from '@ant-design/icons'
import { Box, Flex } from '@chakra-ui/react'
import { Button, Dropdown, Menu, Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { AdminBlock, AdminPageTitle } from '../../components/admin'
import AdminLayout from '../../components/layout/AdminLayout'
import ReportAdminModal from '../../components/report/ReportAdminModal'
import { handleError } from '../../helpers'
import { useMemberPermissionGroups } from '../../hooks/member'
import { useMutateReport, useMutateReportPermissionGroup, useReportCollection } from '../../hooks/report'
import { ReportProps } from '../../types/report'
import ForbiddenPage from '../ForbiddenPage'
import pageMessages from '../translation'

const StyledTitle = styled.span`
  color: var(--gray-darker);
  font-weight: bold;
`

const ReportCollectionPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { permissions, currentMemberId } = useAuth()
  const { enabledModules } = useApp()
  const { reports, loadingReports, refetchReports } = useReportCollection()
  const { memberPermissionGroups } = useMemberPermissionGroups(currentMemberId || '')
  const { deleteReport } = useMutateReport()
  const { deleteReportPermissionGroupByReportId } = useMutateReportPermissionGroup()
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
        // check permission
        window.open(`${process.env.PUBLIC_URL}/report/${record.id}`)
      },
    }
  }
  const columns: ColumnProps<ReportProps>[] = [
    {
      dataIndex: 'title',
      width: '45%',
      title: `${formatMessage(pageMessages.ReportCollectionPage.title)}`,
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
      title: `${formatMessage(pageMessages.ReportCollectionPage.type)}`,
      render: (text, record, index) => (
        <div>
          <StyledTitle className="mr-2"> {record.type}</StyledTitle>
        </div>
      ),
      onCell: onCellClick,
    },
    {
      dataIndex: 'options',
      width: enabledModules.permission_group ? '20%' : '45%',
      title: `${formatMessage(pageMessages.ReportCollectionPage.options)}`,
      render: (text, record, index) => (
        <div>
          <StyledTitle className="mr-2">{getReportOptions(record)}</StyledTitle>
        </div>
      ),
      onCell: onCellClick,
    },
    {
      dataIndex: 'viewingPermission',
      width: enabledModules.permission_group ? '25%' : '0%',
      title:
        enabledModules.permission_group && permissions.REPORT_ADMIN
          ? `${formatMessage(pageMessages.ReportCollectionPage.viewingPermission)}`
          : '',
      render: (text, record, index) =>
        enabledModules.permission_group && permissions.REPORT_ADMIN ? (
          <div>
            <StyledTitle className="mr-2">
              <Flex flexWrap="wrap">
                {record.viewingPermissions?.map(viewingPermission => (
                  <Box p="4px" m="4px" color="#9b9b9b" outline="solid 1px #cdcdcd" borderRadius="4px" bg="#fff">
                    {viewingPermission.name}
                  </Box>
                ))}
              </Flex>
            </StyledTitle>
          </div>
        ) : null,
    },
    {
      width: '5%',
      render: (text, record, index) => (
        <div>
          {permissions.REPORT_ADMIN ? (
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item className="cursor-pointer">
                    <ReportAdminModal
                      report={record}
                      onRefetch={refetchReports}
                      renderTrigger={({ setVisible }) => (
                        <span onClick={() => setVisible(true)}>{formatMessage(pageMessages['*'].edit)}</span>
                      )}
                    />
                  </Menu.Item>
                  <Menu.Item
                    className="cursor-pointer"
                    onClick={async () => {
                      try {
                        if (enabledModules.permission_group) {
                          await deleteReportPermissionGroupByReportId({ variables: { reportId: record.id } })
                        }
                        await deleteReport({ variables: { id: record.id } }).catch(handleError)
                        refetchReports?.()
                      } catch (error) {
                        handleError(error)
                      }
                    }}
                  >
                    {formatMessage(pageMessages['*'].delete)}
                  </Menu.Item>
                </Menu>
              }
            >
              <Button type="link" icon={<MoreOutlined />} />
            </Dropdown>
          ) : null}
        </div>
      ),
    },
  ]

  if (!enabledModules.report || (!permissions.REPORT_ADMIN && !permissions.REPORT_VIEW)) return <ForbiddenPage />

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <AreaChartOutlined className="mr-3" />
        <span>{formatMessage(pageMessages.ReportCollectionPage.pageTitle)}</span>
      </AdminPageTitle>
      {permissions.REPORT_ADMIN ? (
        <div className="d-flex align-item-center justify-content-between mb-4">
          <ReportAdminModal
            onRefetch={refetchReports}
            renderTrigger={({ setVisible }) => (
              <Button type="primary" icon={<FileAddOutlined />} onClick={() => setVisible(true)}>
                {formatMessage(pageMessages.ReportCollectionPage.addReport)}
              </Button>
            )}
          />
        </div>
      ) : null}
      <AdminBlock>
        <Table
          columns={columns}
          dataSource={reports.filter(report =>
            !permissions.REPORT_ADMIN && report.viewingPermissions?.length !== 0
              ? memberPermissionGroups.filter(memberPermissionGroup =>
                  report.viewingPermissions
                    ?.map((viewingPermission: { id: string }) => viewingPermission.id)
                    .includes(memberPermissionGroup.permission_group_id),
                ).length !== 0
              : true,
          )}
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

export default ReportCollectionPage
