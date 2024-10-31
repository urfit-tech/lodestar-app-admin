import { SearchOutlined } from '@ant-design/icons'
import { gql, useQuery } from '@apollo/client'
import { Button, Input, Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { currencyFormatter } from '../../helpers'
import { appointmentMessages, commonMessages } from '../../helpers/translation'
import { AvatarImage } from '../common/Image'
import AppointmentPlanAppointmentModal from './AppointmentPlanAppointmentModal'

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

const messages = defineMessages({
  instructor: { id: 'appointment.label.instructor', defaultMessage: '老師' },
  price: { id: 'appointment.label.price', defaultMessage: '金額' },
  appointment: { id: 'appointment.label.appointment', defaultMessage: '預約' },
  enrollments: { id: 'appointment.label.enrollments', defaultMessage: '已預約' },
  status: { id: 'appointment.label.status', defaultMessage: '狀態' },
  people: { id: 'appointment.label.people', defaultMessage: '{count} 人' },
})

const filterIcon = (filtered: boolean) => <SearchOutlined style={{ color: filtered ? 'var(--primary)' : undefined }} />

type AppointmentPlanProps = {
  id: string
  creator: {
    id: string
    avatarUrl: string | null
    name: string
    abstract: string | null
  }
  title: string
  duration: number
  listPrice: number
  currencyId: string
  enrollments: number
  isPublished: boolean
  meetingLinkUrl: string
}

const AppointmentPlanCollectionTable: React.FC<{
  condition: hasura.GetAppointmentPlanCollectionAdminVariables['condition']
  withAppointmentButton?: Boolean
}> = ({ condition, withAppointmentButton }) => {
  const { formatMessage } = useIntl()
  const { settings } = useApp()
  const { loadingAppointmentPlans, appointmentPlans, refetchAppointmentPlans } = useAppointmentPlansAdmin(condition)

  const [searchName, setSearchName] = useState<string | null>(null)
  const [searchTitle, setSearchTitle] = useState<string | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentPlanProps | null>(null)

  const data = appointmentPlans.filter(
    appointmentPlan =>
      (!searchName && !searchTitle) ||
      (searchName && appointmentPlan.creator.name.includes(searchName)) ||
      (searchTitle && appointmentPlan.title.includes(searchTitle)),
  )

  const columns: ColumnProps<AppointmentPlanProps>[] = [
    {
      key: 'id',
      title: formatMessage(messages.instructor),
      render: (text, record, index) => (
        <div className="d-flex align-items-center justify-content-start">
          <AvatarImage size="36px" src={record.creator.avatarUrl} className="mr-3" />
          <StyledCreatorName className="pl-1">{record.creator.name}</StyledCreatorName>
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
      title: formatMessage(appointmentMessages.label.planTitle),
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
      title: formatMessage(commonMessages.unit.minute),
      render: (text, record, index) => <StyledText>{text}</StyledText>,
      sorter: (a, b) => b.duration - a.duration,
    },
    {
      dataIndex: 'listPrice',
      title: formatMessage(messages.price),
      render: (text, record, index) => (
        <StyledPlanPrice>{currencyFormatter(text, record.currencyId, settings['coin.unit'])}</StyledPlanPrice>
      ),
      sorter: (a, b) => b.listPrice - a.listPrice,
    },
    // {
    //   dataIndex: 'enrollments',
    //   title: formatMessage(messages.enrollments),
    //   render: (text, record, index) => <StyledText>{formatMessage(messages.people, { count: `${text}` })}</StyledText>,
    //   sorter: (a, b) => b.enrollments - a.enrollments,
    // },
  ]
  const appointmentButtonColumn: ColumnProps<AppointmentPlanProps> = {
    key: 'appointmentButton',
    title: '',
    render: (text, record, index) => (
      <Button
        onClick={e => {
          e.stopPropagation()
          setSelectedAppointment(record)
          setIsModalVisible(true)
        }}
      >
        {formatMessage(messages.appointment)}
      </Button>
    ),
  }
  return (
    <>
      <Table
        rowKey="id"
        rowClassName="cursor-pointer"
        loading={loadingAppointmentPlans}
        onRow={record => ({
          onClick: () => {
            window.open(`${process.env.PUBLIC_URL}/appointment-plans/${record.id}`)
          },
        })}
        columns={withAppointmentButton ? [...columns, appointmentButtonColumn] : columns}
        dataSource={data}
      />
      {selectedAppointment && (
        <AppointmentPlanAppointmentModal
          visible={isModalVisible}
          appointmentPlanId={selectedAppointment.id}
          creator={selectedAppointment.creator}
          setModalVisible={setIsModalVisible}
          onSuccess={() => refetchAppointmentPlans()}
        />
      )}
    </>
  )
}

const useAppointmentPlansAdmin = (condition: hasura.GetAppointmentPlanCollectionAdminVariables['condition']) => {
  const { loading, error, data, refetch } = useQuery<
    hasura.GetAppointmentPlanCollectionAdmin,
    hasura.GetAppointmentPlanCollectionAdminVariables
  >(
    gql`
      query GetAppointmentPlanCollectionAdmin($condition: appointment_plan_bool_exp!) {
        appointment_plan(where: $condition) {
          id
          creator_id
          creator {
            id
            picture_url
            name
            username
            abstract
          }
          title
          duration
          price
          currency_id
          published_at
          meeting_link_url
        }
      }
    `,
    {
      variables: { condition },
      fetchPolicy: 'no-cache',
    },
  )

  const appointmentPlans: AppointmentPlanProps[] =
    data?.appointment_plan.map(appointmentPlan => ({
      id: appointmentPlan.id,
      creator: {
        id: appointmentPlan.creator_id || '',
        avatarUrl: appointmentPlan.creator?.picture_url || null,
        name: appointmentPlan.creator?.name || appointmentPlan.creator?.username || '',
        abstract: appointmentPlan.creator?.abstract || null,
      },
      title: appointmentPlan.title || '',
      duration: appointmentPlan.duration,
      listPrice: appointmentPlan.price,
      currencyId: appointmentPlan.currency_id,
      enrollments: 0,
      // enrollments: appointmentPlan.appointment_enrollments_aggregate.aggregate?.count || 0,
      isPublished: !!appointmentPlan.published_at,
      meetingLinkUrl: appointmentPlan.meeting_link_url || '',
    })) || []

  return {
    loadingAppointmentPlans: loading,
    errorAppointmentPlans: error,
    appointmentPlans,
    refetchAppointmentPlans: refetch,
  }
}

export default AppointmentPlanCollectionTable
