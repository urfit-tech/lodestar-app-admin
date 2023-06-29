import { SearchOutlined } from '@ant-design/icons'
import { Button, Input, Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import { commonMessages } from '../../helpers/translation'
import EmptyCover from '../../images/default/empty-cover.png'
import { MarkedProjectRoleProps, ProjectPreviewProps } from '../../types/project'
import { AdminPageBlock, EmptyBlock } from '../admin'
import { CustomRatioImage } from '../common/Image'
import ProjectRejectMarkModal from './ProjectRejectMarkModal'
import projectMessages from './translation'

const StyledProjectTitle = styled.span`
  line-height: 1.5;
  color: var(--gray-darker);
  letter-spacing: 0.2px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const StyledAuthorName = styled.span`
  font-size: 16px;
  line-height: 1.5;
  letter-spacing: 0.2px;
  color: var(--gray-darker);
`

const filterIcon = (filtered: boolean) => <SearchOutlined style={{ color: filtered ? 'var(--primary)' : undefined }} />

type ProjectCollectionProps = Pick<ProjectPreviewProps, 'id' | 'title' | 'previewUrl' | 'author'>

const ProjectCollectionTable: React.FC<{
  projects: ProjectPreviewProps[]
  markedProjectRole: MarkedProjectRoleProps[]
  type: 'normal' | 'marked'
  onLoadMoreSubmit: (setLoadMoreLoading: (loading: boolean) => void) => boolean
  onSearch: (search: string) => void
  onRefetch?: () => void
}> = ({ projects, markedProjectRole, type, onLoadMoreSubmit, onSearch, onRefetch }) => {
  const { host } = useApp()
  const { formatMessage } = useIntl()
  const history = useHistory()
  const [loading, setLoading] = useState(false)
  const [loadMoreEnable, setLoadMoreEnable] = useState(true)
  const [search, setSearch] = useState<string | null>(null)

  const columns: ColumnProps<ProjectCollectionProps>[] = [
    {
      key: 'title',
      width: '70%',
      title: formatMessage(projectMessages.ProjectCollectionTable.title),
      render: (text, record, index) => (
        <div className="d-flex align-items-center justify-content-start">
          <CustomRatioImage width="74px" ratio={9 / 16} src={record.previewUrl || EmptyCover} />
          <StyledProjectTitle className="ml-3">{record.title}</StyledProjectTitle>
        </div>
      ),
    },
    {
      width: '10%',
      filterDropdown: () => (
        <div className="p-2">
          <Input
            autoFocus
            value={search || ''}
            onChange={e => {
              search && setSearch('')
              setSearch(e.target.value)
              onSearch(e.target.value)
            }}
          />
        </div>
      ),
      filterIcon,
    },
    {
      key: 'author',
      width: '20%',
      title: formatMessage(projectMessages.ProjectCollectionTable.author),
      render: (text, record, index) => <StyledAuthorName>{record.author?.name}</StyledAuthorName>,
    },
  ]

  const markedColumns: ColumnProps<MarkedProjectRoleProps>[] = [
    {
      key: 'title',
      width: '60%',
      title: formatMessage(projectMessages.ProjectCollectionTable.title),
      render: (text, record, index) => (
        <div
          className="d-flex align-items-center justify-content-start"
          onClick={() => window.open(`//${host}/projects/${record.id}`, '_blank')}
        >
          <CustomRatioImage width="74px" ratio={9 / 16} src={record.previewUrl || EmptyCover} />
          <StyledProjectTitle className="ml-3">{record.title}</StyledProjectTitle>
        </div>
      ),
    },
    {
      key: 'author',
      width: '15%',
      title: formatMessage(projectMessages.ProjectCollectionTable.author),
      render: (text, record, index) => <StyledAuthorName>{record.author?.name}</StyledAuthorName>,
    },
    {
      key: 'mark',
      width: '15%',
      title: formatMessage(projectMessages.ProjectCollectionTable.mark),
      render: (text, record, index) => (
        <StyledAuthorName>
          {record.identity.name === 'author' ? formatMessage(commonMessages.label.author) : record?.identity.name}
        </StyledAuthorName>
      ),
    },
    {
      width: '10%',
      render: (text, record, index) => <ProjectRejectMarkModal projectRoleId={record.id} onRefetch={onRefetch} />,
    },
  ]

  if (type === 'normal' && projects.length === 0 && search === '') {
    return <EmptyBlock>{formatMessage(projectMessages['*'].noProject)}</EmptyBlock>
  } else if (type === 'marked' && markedProjectRole.length === 0) {
    return <EmptyBlock>{formatMessage(projectMessages['*'].noMarkedPortfolio)}</EmptyBlock>
  }

  return (
    <AdminPageBlock>
      {type === 'normal' ? (
        <Table
          rowKey="id"
          rowClassName="cursor-pointer"
          loading={false}
          columns={columns}
          dataSource={projects}
          pagination={false}
          footer={
            loadMoreEnable
              ? data => (
                  <div className="text-center" style={{ width: '100%' }}>
                    <Button
                      loading={loading}
                      onClick={() => {
                        setLoading(true)
                        const loadMoreEnable = onLoadMoreSubmit(setLoading)
                        setLoadMoreEnable(loadMoreEnable)
                      }}
                    >
                      {formatMessage(commonMessages.ui.showMore)}
                    </Button>
                  </div>
                )
              : undefined
          }
          onRow={record => ({
            onClick: () => history.push(`/projects/${record.id}`),
          })}
        />
      ) : (
        <Table
          rowKey="id"
          rowClassName="cursor-pointer"
          loading={false}
          columns={markedColumns}
          dataSource={markedProjectRole}
          pagination={false}
          footer={
            loadMoreEnable
              ? data => (
                  <div className="text-center" style={{ width: '100%' }}>
                    <Button
                      loading={loading}
                      onClick={() => {
                        setLoading(true)
                        const loadMoreEnable = onLoadMoreSubmit(setLoading)
                        setLoadMoreEnable(loadMoreEnable)
                      }}
                    >
                      {formatMessage(commonMessages.ui.showMore)}
                    </Button>
                  </div>
                )
              : undefined
          }
        />
      )}
    </AdminPageBlock>
  )
}
export default ProjectCollectionTable
