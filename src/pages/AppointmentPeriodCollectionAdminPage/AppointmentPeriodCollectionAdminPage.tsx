import Icon from '@ant-design/icons'
import { Spinner } from '@chakra-ui/react'
import { DatePicker, Input, message, Select, Tabs } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import { RangeValue } from 'rc-picker/lib/interface'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { StringParam, useQueryParam } from 'use-query-params'
import { AdminPageTitle } from '../../components/admin'
import AdminLayout from '../../components/layout/AdminLayout'
import { appointmentMessages, commonMessages } from '../../helpers/translation'
import { useAppointmentEnrollmentCreator } from '../../hooks/appointment'
import { ReactComponent as CalendarAltOIcon } from '../../images/icon/calendar-alt-o.svg'
import ForbiddenPage from '../ForbiddenPage'
import pageMessages from '../translation'
import AppointmentPlanPeriodTabContent from './AppointmentPlanPeriodTabContent'

type tabKey = 'scheduled' | 'canceled' | 'finished'

const StyledFilterBlock = styled.div`
  margin-bottom: 2rem;
`

const AppointmentPeriodCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useApp()
  const { permissions, currentMemberId } = useAuth()
  const [memberId] = useQueryParam('memberId', StringParam)
  const [startedAt, setStartedAt] = useState<Date | null>(moment().startOf('month').startOf('minute').toDate())
  const [endedAt, setEndedAt] = useState<Date | null>(moment().endOf('month').startOf('minute').toDate())
  const defaultSelectedCreatorId = memberId
    ? memberId
    : permissions.APPOINTMENT_PERIOD_ADMIN
    ? ''
    : currentMemberId || ''
  const [selectedCreatorId, setSelectedCreatorId] = useState<string>(defaultSelectedCreatorId)
  const { loading: loadingAppointmentCreators, appointmentCreators } = useAppointmentEnrollmentCreator()

  const { RangePicker } = DatePicker

  const tabConditions = [
    {
      key: 'scheduled',
      tab: formatMessage(appointmentMessages.status.aboutToStart),
    },
    {
      key: 'canceled',
      tab: formatMessage(appointmentMessages.status.canceled),
    },
    {
      key: 'finished',
      tab: formatMessage(appointmentMessages.status.finished),
    },
  ]

  const handleRangePickerChange = (v: RangeValue<moment.Moment>) => {
    const pickStartedAt = moment(v?.[0])
    const pickEndedAt = moment(v?.[1])
    const diffDate = pickEndedAt?.diff(pickStartedAt, 'days')

    v && v[0] && setStartedAt(v?.[0].startOf('minute').toDate())
    v && v[1] && setEndedAt(v[1].startOf('minute').toDate())

    if (diffDate > 31) {
      message.warning(formatMessage(pageMessages.AppointmentPeriodCollectionAdminPage.dateRangeWarning))
    }
  }

  if (
    !enabledModules.appointment ||
    (!permissions.APPOINTMENT_PERIOD_ADMIN && !permissions.APPOINTMENT_PERIOD_NORMAL)
  ) {
    return <ForbiddenPage />
  }

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <CalendarAltOIcon />} className="mr-3" />
        <span>{formatMessage(commonMessages.menu.appointments)}</span>
      </AdminPageTitle>

      <StyledFilterBlock className="d-flex">
        {permissions.APPOINTMENT_PERIOD_ADMIN && (
          <Select<string>
            showSearch
            value={selectedCreatorId}
            onChange={(value: string) => setSelectedCreatorId?.(value)}
            className="mr-3"
            style={{ width: '100%', maxWidth: '15rem' }}
            filterOption={(input, option) =>
              option?.props?.children
                ? (option.props.children as string).toLowerCase().indexOf(input.toLowerCase()) >= 0
                : true
            }
          >
            <Select.Option value="">
              {formatMessage(pageMessages.AppointmentPeriodCollectionAdminPage.allInstructors)}
            </Select.Option>
            {loadingAppointmentCreators ? (
              <Spinner />
            ) : (
              appointmentCreators.map(v => <Select.Option value={v.id}>{v.name}</Select.Option>)
            )}
          </Select>
        )}

        <Input.Group compact>
          <RangePicker
            format="YYYY-MM-DD HH:mm"
            showTime
            value={[moment(startedAt), moment(endedAt)]}
            onChange={v => handleRangePickerChange(v)}
          />
        </Input.Group>
      </StyledFilterBlock>

      <Tabs>
        {tabConditions.map(v => (
          <Tabs.TabPane key={v.key} tab={v.tab}>
            <div className="py-4">
              <AppointmentPlanPeriodTabContent
                tabKey={v.key as tabKey}
                selectedCreatorId={selectedCreatorId}
                startedAt={startedAt}
                endedAt={endedAt}
              />
            </div>
          </Tabs.TabPane>
        ))}
      </Tabs>
    </AdminLayout>
  )
}

export default AppointmentPeriodCollectionAdminPage
