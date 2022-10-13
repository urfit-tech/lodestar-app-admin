import { SearchOutlined } from '@ant-design/icons'
import { Input, Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import EmptyCover from '../../images/default/empty-cover.png'
import { ProjectPreviewProps } from '../../types/project'
import { AdminPageBlock } from '../admin'
import { CustomRatioImage } from '../common/Image'
import projectMessages from './translation'

const StyledProjectTitle = styled.span`
  max-width: 10em;
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

type ProjectCollectionProps = Pick<ProjectPreviewProps, 'id' | 'title' | 'previewUrl' | 'creator'>

const ProjectCollectionTable: React.FC<{ projects: ProjectPreviewProps[]; onSearch: (search: string) => void }> = ({
  projects,
  onSearch,
}) => {
  const { formatMessage } = useIntl()
  const history = useHistory()
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
      key: 'author',
      width: '20%',
      title: formatMessage(projectMessages.ProjectCollectionTable.author),
      render: (text, record, index) => <StyledAuthorName>{record.creator?.name}</StyledAuthorName>,
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
  ]
  return (
    <AdminPageBlock>
      <Table
        rowKey="id"
        rowClassName="cursor-pointer"
        loading={false}
        columns={columns}
        dataSource={projects}
        onRow={record => ({
          onClick: () => history.push(`/projects/${record.id}`),
        })}
      />
    </AdminPageBlock>
  )
}
export default ProjectCollectionTable
