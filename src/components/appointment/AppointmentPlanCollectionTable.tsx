import { SearchOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { Input, Table } from 'antd'
import gql from 'graphql-tag'
import React, { useEffect, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import { currencyFormatter } from '../../helpers'
import { appointmentMessages } from '../../helpers/translation'
import types from '../../types'
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
  max-height: 3em;
  color: var(--gray-darker);
  line-height: 1.5rem;
  letter-spacing: 0.2px;
`
const StyledPlanPrice = styled.div`
  color: ${props => props.theme['@primary-color']};
  letter-spacing: 0.2px;
`
const StyledText = styled.div`
  color: var(--gray-darker);
  line-height: 1.5;
  letter-spacing: 0.2px;
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

const messages = defineMessages({
  instructor: { id: 'appointment.label.instructor', defaultMessage: '老師' },
  minutes: { id: 'appointment.label.minutes', defaultMessage: '分鐘' },
  price: { id: 'appointment.label.price', defaultMessage: '金額' },
  enrollments: { id: 'appointment.label.enrollments', defaultMessage: '已預約' },
  status: { id: 'appointment.label.status', defaultMessage: '狀態' },
  isPublished: { id: 'appointment.status.isPublished', defaultMessage: '已發佈' },
  notPublished: { id: 'appointment.status.notPublished', defaultMessage: '未發佈' },
  people: { id: 'appointment.label.people', defaultMessage: '{count} 人' },
})

const filterIcon = (filtered: boolean) => <SearchOutlined style={{ color: filtered ? 'var(--primary)' : undefined }} />

export type AppointmentPlanProps = {
  id: string
  avatarUrl?: string | null
  creatorName: string
  title: string
  duration: number
  listPrice: number
  enrollments: number
  isPublished: boolean
}

const AppointmentPlanCollectionTable: React.FC<{
  creatorId?: string
}> = ({ creatorId }) => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const { loadingAppointmentPlans, appointmentPlans, refetchAppointmentPlans } = useAppointmentPlansAdmin(creatorId)

  const [searchName, setSearchName] = useState<string | null>(null)
  const [searchTitle, setSearchTitle] = useState<string | null>(null)

  const data = appointmentPlans.filter(
    appointmentPlan =>
      (!searchName && !searchTitle) ||
      (searchName && appointmentPlan.creatorName.includes(searchName)) ||
      (searchTitle && appointmentPlan.title.includes(searchTitle)),
  )

  useEffect(() => {
    refetchAppointmentPlans()
  }, [refetchAppointmentPlans])

  return (
    <Table
      rowKey="id"
      rowClassName={() => 'cursor-pointer'}
      loading={loadingAppointmentPlans}
      onRow={record => ({
        onClick: () => history.push(`/appointment-plans/${record.id}`),
      })}
      columns={[
        {
          key: 'id',
          title: formatMessage(messages.instructor),
          render: (text, record, index) => (
            <div className="d-flex align-items-center justify-content-start">
              <AvatarImage size="36px" src={record.avatarUrl} className="mr-3" />
              <StyledCreatorName className="pl-1">{record.creatorName}</StyledCreatorName>
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
          title: formatMessage(appointmentMessages.term.planTitle),
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
          dataIndex: 'duration',
          title: formatMessage(messages.minutes),
          // width: '7em',
          render: (text, record, index) => <StyledText>{text}</StyledText>,
          sorter: (a, b) => b.duration - a.duration,
        },
        {
          dataIndex: 'listPrice',
          title: formatMessage(messages.price),
          // width: '10em',
          render: (text, record, index) => <StyledPlanPrice>{currencyFormatter(text)}</StyledPlanPrice>,
          sorter: (a, b) => b.listPrice - a.listPrice,
        },
        {
          dataIndex: 'enrollments',
          title: formatMessage(messages.enrollments),
          // width: '7em',
          render: (text, record, index) => (
            <StyledText>{formatMessage(messages.people, { count: `${text}` })}</StyledText>
          ),
          sorter: (a, b) => b.enrollments - a.enrollments,
        },
        {
          key: 'published',
          title: formatMessage(messages.status),
          // width: '7em',
          render: (text, record, index) => (
            <StyledPublished active={record.isPublished}>
              {record.isPublished ? formatMessage(messages.isPublished) : formatMessage(messages.notPublished)}
            </StyledPublished>
          ),
          filters: [
            {
              text: formatMessage(messages.isPublished),
              value: formatMessage(messages.isPublished),
            },
            {
              text: formatMessage(messages.notPublished),
              value: formatMessage(messages.notPublished),
            },
          ],
          onFilter: (value, record) => record.isPublished === (value === formatMessage(messages.isPublished)),
        },
      ]}
      dataSource={data}
    />
  )
}

const useAppointmentPlansAdmin = (creatorId?: string) => {
  const { loading, error, data, refetch } = useQuery<
    types.GET_APPOINTMENT_PLAN_COLLECTION_ADMIN,
    types.GET_APPOINTMENT_PLAN_COLLECTION_ADMINVariables
  >(
    gql`
      query GET_APPOINTMENT_PLAN_COLLECTION_ADMIN($creatorId: String) {
        appointment_plan(where: { creator_id: { _eq: $creatorId } }, order_by: { updated_at: desc }) {
          id
          creator {
            id
            picture_url
            name
            username
          }
          title
          duration
          price
          published_at
          appointment_enrollments_aggregate {
            aggregate {
              count
            }
          }
        }
      }
    `,
    { variables: { creatorId } },
  )

  const appointmentPlans: AppointmentPlanProps[] =
    loading || !!error || !data
      ? []
      : data.appointment_plan.map(appointmentPlan => ({
          id: appointmentPlan.id,
          avatarUrl: appointmentPlan.creator ? appointmentPlan.creator.picture_url : null,
          creatorName: appointmentPlan.creator && appointmentPlan.creator.name ? appointmentPlan.creator.name : '',
          title: appointmentPlan.title,
          duration: appointmentPlan.duration,
          listPrice: appointmentPlan.price,
          enrollments: appointmentPlan.appointment_enrollments_aggregate.aggregate
            ? appointmentPlan.appointment_enrollments_aggregate.aggregate.count || 0
            : 0,
          isPublished: !!appointmentPlan.published_at,
        }))

  return {
    loadingAppointmentPlans: loading,
    errorAppointmentPlans: error,
    appointmentPlans,
    refetchAppointmentPlans: refetch,
  }
}

export default AppointmentPlanCollectionTable
