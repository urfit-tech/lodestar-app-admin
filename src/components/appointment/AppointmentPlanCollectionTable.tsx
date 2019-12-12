import { Icon, Input, Table } from 'antd'
import React, { useState } from 'react'
import styled from 'styled-components'
import useRouter from 'use-react-router'
import { currencyFormatter } from '../../helpers'
import { AvatarImage } from '../common/Image'

const StyledCreatorName = styled.span`
  max-width: 10em;
  overflow: hidden;
  line-height: 1.5;
  color: var(--gray-darker);
  letter-spacing: 0.2px;
  white-space: nowrap;
  text-overflow: ellipsis;
`
const StyledPlanTitle = styled.div`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-width: 18rem;
  max-height: 3em;
  line-height: 1.5rem;
  letter-spacing: 0.2px;
`
const StyledPlanPrice = styled.div`
  color: ${props => props.theme['@primary-color']};
  letter-spacing: 0.2px;
`
const StyledEnrollment = styled.div`
  color: var(--gray-dark);
  font-size: 14px;
  letter-spacing: 0.4px;
`
const StyledPublished = styled.div<{ active?: boolean }>`
  display: flex;
  align-items: center;
  color: var(--gray-dark);
  font-size: 14px;
  letter-spacing: 0.4px;

  :before {
    display: inline-block;
    margin-right: 0.5rem;
    width: 10px;
    height: 10px;
    background: ${props => (props.active ? 'var(--success)' : 'var(--gray)')};
    content: ' ';
    border-radius: 50%;
  }
`

const filterIcon = (filtered: boolean) => (
  <Icon type="search" style={{ color: filtered ? 'var(--primary)' : undefined }} />
)

export type AppointmentPlanProps = {
  id: string
  avatarlUrl?: string | null
  creatorName: string
  title: string
  listPrice: number
  enrollment: number
  isPublished: boolean
}

const AppointmentPlanCollectionTable: React.FC<{
  appointmentPlans: AppointmentPlanProps[]
}> = ({ appointmentPlans }) => {
  const { history } = useRouter()

  const [searchName, setSearchName] = useState<string | null>(null)
  const [searchTitle, setSearchTitle] = useState<string | null>(null)

  const data = appointmentPlans.filter(
    appointmentPlan =>
      (!searchName && !searchTitle) ||
      (searchName && appointmentPlan.creatorName.includes(searchName)) ||
      (searchTitle && appointmentPlan.title.includes(searchTitle)),
  )
  return (
    <Table
      rowKey="id"
      rowClassName={() => 'cursor-pointer'}
      onRow={record => ({
        onClick: () => history.push(`/admin/appointment-plans/${record.id}`),
      })}
      columns={[
        {
          key: 'id',
          title: '老師',
          render: (text, record, index) => (
            <div className="d-flex align-items-center justify-content-between">
              <AvatarImage className="mr-3" src={record.avatarlUrl} size={36} />
              <StyledCreatorName className="flex-grow-1">{record.creatorName}</StyledCreatorName>
            </div>
          ),
          filterDropdown: () => (
            <div className="p-2">
              <Input
                autoFocus
                value={searchName || ''}
                onChange={e => {
                  searchTitle && setSearchTitle('')
                  setSearchName(e.target.value)
                }}
              />
            </div>
          ),
          filterIcon,
        },
        {
          dataIndex: 'title',
          title: '方案名稱',
          render: (text, record, index) => <StyledPlanTitle>{text}</StyledPlanTitle>,
          filterDropdown: () => (
            <div className="p-2">
              <Input
                autoFocus
                value={searchTitle || ''}
                onChange={e => {
                  searchName && setSearchName('')
                  setSearchTitle(e.target.value)
                }}
              />
            </div>
          ),
          filterIcon,
        },
        {
          dataIndex: 'listPrice',
          title: '金額',
          width: '10em',
          render: (text, record, index) => <StyledPlanPrice>{currencyFormatter(text)}</StyledPlanPrice>,
          sorter: (a, b) => a.listPrice - b.listPrice,
        },
        {
          dataIndex: 'enrollment',
          title: '已預約',
          width: '7em',
          render: (text, record, index) => <StyledEnrollment>{text} 人</StyledEnrollment>,
          sorter: (a, b) => a.enrollment - b.enrollment,
        },
        {
          key: 'published',
          title: '狀態',
          width: '7em',
          render: (text, record, index) => (
            <StyledPublished active={record.isPublished}>{record.isPublished ? '已發布' : '未發布'}</StyledPublished>
          ),
          filters: [
            {
              text: '已發布',
              value: '已發布',
            },
            {
              text: '未發布',
              value: '未發布',
            },
          ],
          onFilter: (value, record) => record.isPublished === (value === '已發布'),
        },
      ]}
      dataSource={data}
    />
  )
}

export default AppointmentPlanCollectionTable
