import { DeleteOutlined, DownOutlined, PlusOutlined, UpOutlined } from '@ant-design/icons'
import { useMutation, useQuery } from '@apollo/react-hooks'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import FullCalendar from '@fullcalendar/react'
import { Button, List, Tag } from 'antd'
import Search from 'antd/lib/input/Search'
import dayjs from 'dayjs'
import gql from 'graphql-tag'
import { StyledTitle } from 'lodestar-app-element/src/components/modals/CheckoutProductModal'
import { useAppTheme } from 'lodestar-app-element/src/contexts/AppThemeContext'
import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminModal from '../../components/admin/AdminModal'
import hasura from '../../hasura'
import { fuzzySearch } from '../../helpers'

const MemberTimetableAdminBlock: React.VFC<{ memberId: string }> = ({ memberId }) => {
  const theme = useAppTheme()
  const [isUpdating, setIsUpdating] = useState(false)
  const [searchText, setSearchText] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [programEvents, setProgramEvents] = useState<
    { id: string; time: Date; position: number; title: string; categories: string[]; packages: string[] }[]
  >([])
  const [updateProgramTimetable] = useMutation<
    hasura.UPDATE_PROGRAM_TIMETABLE,
    hasura.UPDATE_PROGRAM_TIMETABLEVariables
  >(UPDATE_PROGRAM_TIMETABLE)
  const {
    loading,
    data,
    refetch: refetchProgramTimetable,
  } = useQuery<hasura.GET_PROGRAM_TIMETABLE, hasura.GET_PROGRAM_TIMETABLEVariables>(GET_PROGRAM_TIMETABLE, {
    variables: {
      memberId,
    },
  })
  const enrolledProgramIds = data?.program_content_enrollment.map(v => v.program_id) || []
  const programs = useMemo(
    () =>
      data?.program.map(p => ({
        id: p.id,
        title: p.title,
        categories: p.program_categories.map(pc => pc.category.name),
        packages: p.program_package_programs.map(ppp => ppp.program_package.title),
      })) || [],
    [data],
  )

  useEffect(() => {
    setProgramEvents(
      data?.program_timetable.map(p => ({
        time: p.time,
        position: p.position,
        id: p.program.id,
        title: p.program.title,
        categories: p.program.program_categories.map(pc => pc.category.name),
        packages: p.program.program_package_programs.map(ppp => ppp.program_package.title),
      })) || [],
    )
  }, [data])

  const handleSubmit = () => {
    setIsUpdating(true)
    updateProgramTimetable({
      variables: {
        memberId,
        programTimetableInsertInput: programEvents.map((pevent, index) => ({
          member_id: memberId,
          program_id: pevent.id,
          time: pevent.time,
          position: index,
        })),
      },
    })
      .then(() => refetchProgramTimetable())
      .finally(() => setIsUpdating(false))
      .finally(() => setSelectedDate(null))
  }

  const selectedDateProgramEvents = programEvents.filter(
    pt => dayjs(pt.time).format('YYYYMMDD') === dayjs(selectedDate).format('YYYYMMDD'),
  )
  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin, listPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek,listYear',
        }}
        initialView="dayGridMonth"
        events={programEvents.map(pevent => ({
          title: pevent.title,
          start: pevent.time,
          color: enrolledProgramIds.includes(pevent.id) ? '#585858' : '#cdcece',
          allDay: true,
        }))}
        dateClick={info => setSelectedDate(info.date)}
      />
      <AdminModal
        visible={!!selectedDate}
        width="60rem"
        onCancel={() => setSelectedDate(null)}
        onOk={handleSubmit}
        confirmLoading={isUpdating}
      >
        <StyledTitle className="mb-3">{dayjs(selectedDate).format('YYYY/MM/DD')}</StyledTitle>
        <List
          dataSource={selectedDateProgramEvents}
          renderItem={(programEvent, index) => (
            <List.Item
              actions={[
                <Button
                  key="up"
                  type="link"
                  icon={<UpOutlined />}
                  disabled={index === 0}
                  onClick={() =>
                    setProgramEvents(pevents => [
                      ...pevents.slice(0, index - 1),
                      pevents[index],
                      pevents[index - 1],
                      ...pevents.slice(index + 1),
                    ])
                  }
                />,
                <Button
                  key="down"
                  type="link"
                  icon={<DownOutlined />}
                  disabled={index === selectedDateProgramEvents.length - 1}
                  onClick={() =>
                    setProgramEvents(pevents => [
                      ...pevents.slice(0, index),
                      pevents[index + 1],
                      pevents[index],
                      ...pevents.slice(index + 2),
                    ])
                  }
                />,
                <Button
                  key="delete"
                  type="link"
                  icon={<DeleteOutlined />}
                  onClick={() => setProgramEvents(pevents => [...pevents.slice(0, index), ...pevents.slice(index + 1)])}
                />,
              ]}
            >
              <List.Item.Meta
                style={{ opacity: enrolledProgramIds.includes(programEvent.id) ? 0.4 : 1 }}
                title={
                  <Link to={`/admin/programs/${programEvent.id}`}>
                    <span className="mr-2">{programEvent.title}</span>
                    {programEvent.categories.map((category, idx) => (
                      <Tag key={idx}>{category}</Tag>
                    ))}
                  </Link>
                }
                description={programEvent.packages.join(', ')}
              />
            </List.Item>
          )}
        />
        <Search className="mb-2" onChange={e => setSearchText(e.target.value)} value={searchText} />
        <div style={{ height: '420px', overflowY: 'auto' }}>
          <List
            dataSource={programs
              .filter(program => !programEvents.map(pevent => pevent.id).includes(program.id))
              .filter(
                program =>
                  fuzzySearch(searchText, program.title) ||
                  fuzzySearch(searchText, program.categories.join()) ||
                  fuzzySearch(searchText, program.packages.join()),
              )}
            renderItem={program => (
              <List.Item
                actions={[
                  <Button
                    key="add"
                    type="link"
                    icon={<PlusOutlined />}
                    onClick={() =>
                      selectedDate &&
                      setProgramEvents(pevents => [
                        ...pevents,
                        {
                          time: selectedDate,
                          position: pevents.length,
                          id: program.id,
                          title: program.title,
                          categories: program.categories,
                          packages: program.packages,
                        },
                      ])
                    }
                  />,
                ]}
              >
                <List.Item.Meta
                  style={{ opacity: enrolledProgramIds.includes(program.id) ? 0.4 : 1 }}
                  title={
                    <Link to={`/admin/programs/${program.id}`}>
                      <span className="mr-2">{program.title}</span>
                      {program.categories.map((category, idx) => (
                        <Tag key={idx}>{category}</Tag>
                      ))}
                    </Link>
                  }
                  description={program.packages.join(', ')}
                />
              </List.Item>
            )}
          />
        </div>
      </AdminModal>
    </>
  )
}

const GET_PROGRAM_TIMETABLE = gql`
  query GET_PROGRAM_TIMETABLE($memberId: String!) {
    program(where: { published_at: { _is_null: false } }) {
      id
      title
      program_package_programs {
        program_package {
          id
          title
        }
      }
      program_categories(order_by: [{ position: asc }]) {
        category {
          name
        }
      }
    }
    program_content_enrollment(where: { member_id: { _eq: $memberId } }, distinct_on: [program_id]) {
      program_id
    }
    program_timetable(where: { member_id: { _eq: $memberId } }) {
      program {
        id
        title
        program_package_programs {
          program_package {
            id
            title
          }
        }
        program_categories(order_by: [{ position: asc }]) {
          category {
            name
          }
        }
      }
      time
      position
    }
  }
`

const UPDATE_PROGRAM_TIMETABLE = gql`
  mutation UPDATE_PROGRAM_TIMETABLE(
    $memberId: String!
    $programTimetableInsertInput: [program_timetable_insert_input!]!
  ) {
    delete_program_timetable(where: { member_id: { _eq: $memberId } }) {
      affected_rows
    }
    insert_program_timetable(objects: $programTimetableInsertInput) {
      affected_rows
    }
  }
`
export default MemberTimetableAdminBlock
