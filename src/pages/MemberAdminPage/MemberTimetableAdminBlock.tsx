// organize-imports-ignore
import { DeleteOutlined, DownOutlined, PlusOutlined, UpOutlined } from '@ant-design/icons'
import { uuidv4 } from '@antv/xflow-core'
import { useMutation, useQuery } from '@apollo/client'
import { Alert, AlertDescription, AlertIcon, AlertTitle, Tooltip } from '@chakra-ui/react'
import FullCalendar from '@fullcalendar/react'
import listPlugin from '@fullcalendar/list'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Button, Input, List, Select, Tag } from 'antd'
import dayjs from 'dayjs'
import gql from 'graphql-tag'
import { sum } from 'lodash'
import { StyledTitle } from 'lodestar-app-element/src/components/modals/CheckoutProductModal'
import { notEmpty } from 'lodestar-app-element/src/helpers'
import React, { useEffect, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import AdminModal from '../../components/admin/AdminModal'
import hasura from '../../hasura'
import { fuzzySearch } from '../../helpers'
import pageMessages from '../translation'

type TimetableProgram = {
  id: string
  title: string
  categories: string[]
  coins: number
  position: number
}
type TimetableProgramPackage = {
  id: string
  title: string
  programs: TimetableProgram[]
}

type TimetableProgramEvent = {
  id: string
  time: Date
  program: TimetableProgram
}

const MemberTimetableAdminBlock: React.VFC<{ memberId: string; memberCoins: number }> = ({ memberId, memberCoins }) => {
  const { formatMessage } = useIntl()
  const [isUpdating, setIsUpdating] = useState(false)
  const [searchText, setSearchText] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [searchType, setSearchType] = useState<'program' | 'programPackage'>('programPackage')
  const { enrolledProgramIds, programs, programPackages, programEvents, updateProgramEvents } =
    useProgramTimetable(memberId)
  const [selectedDateProgramEvents, setSelectedDateProgramEvents] = useState<TimetableProgramEvent[]>([])

  useEffect(() => {
    setSelectedDateProgramEvents(
      programEvents.filter(pt => dayjs(pt.time).format('YYYYMMDD') === dayjs(selectedDate).format('YYYYMMDD')),
    )
  }, [programEvents, selectedDate])
  const handleSubmit = () => {
    setIsUpdating(true)
    updateProgramEvents([
      ...selectedDateProgramEvents,
      ...programEvents.filter(pt => dayjs(pt.time).format('YYYYMMDD') !== dayjs(selectedDate).format('YYYYMMDD')),
    ])
      .finally(() => setIsUpdating(false))
      .finally(() => setSelectedDate(null))
  }
  const futureUnenrolledProgramEvents = programEvents.filter(
    pe => dayjs(pe.time) > dayjs() && !enrolledProgramIds.includes(pe.program.id),
  )
  const futureCoins = sum(futureUnenrolledProgramEvents.map(pe => pe.program.coins))

  return (
    <>
      {futureCoins > memberCoins ? (
        <Alert status="error" className="mb-3">
          <AlertIcon />
          <AlertTitle>{formatMessage(pageMessages.MemberAdminPage.notEnoughCoins)}</AlertTitle>
          <AlertDescription>
            {formatMessage(pageMessages.MemberAdminPage.notEnoughCoinsDescription, {
              futureCoins,
              insufficientCoins: futureCoins - memberCoins,
            })}
          </AlertDescription>
        </Alert>
      ) : (
        <Alert status="success" className="mb-3">
          <AlertIcon />
          {formatMessage(pageMessages.MemberAdminPage.remainingCoins, { remainingCoins: memberCoins - futureCoins })}
        </Alert>
      )}
      <FullCalendar
        selectable
        eventOrder="position"
        eventContent={({ event }) => (
          <Tooltip label={event.extendedProps.program?.categories?.join('/')}>{event.title}</Tooltip>
        )}
        plugins={[dayGridPlugin, interactionPlugin, listPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek,listYear',
        }}
        initialView="dayGridMonth"
        events={programEvents.map((pevent, index) => ({
          title: pevent.program?.title,
          start: pevent.time,
          color: enrolledProgramIds.includes(pevent.program?.id) ? '#585858' : '#cdcece',
          allDay: true,
          url: `/programs/${pevent.program.id}?visitIntro=1`,
          program: pevent.program,
          position: index,
        }))}
        dateClick={info => setSelectedDate(info.date)}
        eventClick={info => {
          info.jsEvent.preventDefault()
          window.open(info.event.url)
        }}
      />
      <AdminModal
        visible={!!selectedDate}
        width="80rem"
        okText={`${sum(selectedDateProgramEvents.map(programEvent => programEvent.program.coins))} Coins`}
        onCancel={() => {
          setSelectedDateProgramEvents([])
          setSelectedDate(null)
        }}
        onOk={handleSubmit}
        confirmLoading={isUpdating}
      >
        <StyledTitle className="mb-3">{dayjs(selectedDate).format('YYYY/MM/DD')}</StyledTitle>
        <div className="row">
          <div className="col-12 col-md-6">
            <Input.Group compact className="mb-2">
              <Select value={searchType} onSelect={setSearchType}>
                <Select.Option value="programPackage">{formatMessage(pageMessages['*'].programPackage)}</Select.Option>
                <Select.Option value="program">{formatMessage(pageMessages['*'].program)}</Select.Option>
              </Select>
              <Input style={{ width: '60%' }} onChange={e => setSearchText(e.target.value)} value={searchText} />
            </Input.Group>
            <div style={{ height: 'calc(60vh - 45px)', overflowY: 'auto' }}>
              {searchType === 'program' ? (
                <List
                  rowKey="id"
                  dataSource={programs.filter(program => fuzzySearch(searchText, program.title))}
                  renderItem={program => (
                    <List.Item
                      actions={[
                        <Button
                          key="add"
                          type="link"
                          icon={<PlusOutlined />}
                          onClick={() =>
                            selectedDate &&
                            setSelectedDateProgramEvents(pevents => [
                              ...pevents,
                              {
                                id: uuidv4(),
                                time: selectedDate,
                                program,
                                position: pevents.length,
                              },
                            ])
                          }
                        />,
                      ]}
                    >
                      <List.Item.Meta
                        style={{ opacity: enrolledProgramIds.includes(program.id) ? 0.4 : 1 }}
                        title={
                          <div>
                            <span className="mr-2">{program.title}</span>
                            {program.categories.map((category, idx) => (
                              <Tag key={idx}>{category}</Tag>
                            ))}
                          </div>
                        }
                        description={`Coins: ${program.coins}`}
                      />
                    </List.Item>
                  )}
                />
              ) : searchType === 'programPackage' ? (
                <List
                  rowKey="id"
                  dataSource={programPackages.filter(programPackage => fuzzySearch(searchText, programPackage.title))}
                  renderItem={programPackage => (
                    <List.Item
                      actions={[
                        <Button
                          key="add"
                          type="link"
                          icon={<PlusOutlined />}
                          onClick={() =>
                            selectedDate &&
                            setSelectedDateProgramEvents(pevents => [
                              ...pevents,
                              ...programPackage.programs.map((program, idx) => ({
                                id: uuidv4(),
                                time: selectedDate,
                                program,
                                position: pevents.length + idx,
                              })),
                            ])
                          }
                        />,
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <div>
                            <span className="mr-2">{programPackage.title}</span>
                          </div>
                        }
                        description={`Coins: ${sum(programPackage.programs.map(program => program.coins))}`}
                      />
                    </List.Item>
                  )}
                />
              ) : null}
            </div>
          </div>
          <div className="col-12 col-md-6">
            <List
              rowKey="id"
              bordered
              style={{ height: '60vh', overflowY: 'auto' }}
              dataSource={selectedDateProgramEvents}
              renderItem={(programEvent, index) => (
                <List.Item
                  actions={[
                    <div>
                      <Button
                        key="up"
                        type="link"
                        icon={<UpOutlined />}
                        disabled={index === 0}
                        onClick={() =>
                          setSelectedDateProgramEvents(pevents => [
                            ...pevents.slice(0, index - 1),
                            pevents[index],
                            pevents[index - 1],
                            ...pevents.slice(index + 1),
                          ])
                        }
                      />
                      <Button
                        key="down"
                        type="link"
                        icon={<DownOutlined />}
                        disabled={index === selectedDateProgramEvents.length - 1}
                        onClick={() =>
                          setSelectedDateProgramEvents(pevents => [
                            ...pevents.slice(0, index),
                            pevents[index + 1],
                            pevents[index],
                            ...pevents.slice(index + 2),
                          ])
                        }
                      />
                      <Button
                        key="delete"
                        type="link"
                        icon={<DeleteOutlined />}
                        onClick={() =>
                          setSelectedDateProgramEvents(pevents => [
                            ...pevents.slice(0, index),
                            ...pevents.slice(index + 1),
                          ])
                        }
                      />
                    </div>,
                  ]}
                >
                  <List.Item.Meta
                    style={{ opacity: enrolledProgramIds.includes(programEvent.program.id) ? 0.4 : 1 }}
                    title={
                      <div>
                        <span className="mr-2">{programEvent.program.title}</span>
                        {programEvent.program.categories.map((category, idx) => (
                          <Tag key={idx}>{category}</Tag>
                        ))}
                      </div>
                    }
                    description={`Coins: ${programEvent.program.coins}`}
                  />
                </List.Item>
              )}
            />
          </div>
        </div>
      </AdminModal>
    </>
  )
}

const useProgramTimetable = (memberId: string) => {
  const [updateProgramTimetable] = useMutation<
    hasura.UPDATE_PROGRAM_TIMETABLE,
    hasura.UPDATE_PROGRAM_TIMETABLEVariables
  >(UPDATE_PROGRAM_TIMETABLE)
  const { data, refetch: refetchProgramTimetable } = useQuery<
    hasura.GetProgramTimetable,
    hasura.GetProgramTimetableVariables
  >(GetProgramTimetable, {
    variables: {
      memberId,
    },
  })
  const enrolledProgramIds = data?.program_content_enrollment.map(v => v.program_id) || []
  const programs: TimetableProgram[] = useMemo(
    () =>
      data?.program.map(p => ({
        id: p.id,
        title: p.title,
        categories: p.program_categories.map(pc => pc.category.name),
        coins: p.program_plans[0]?.list_price || 0,
        position: 0,
      })) || [],
    [data],
  )
  const programPackages: TimetableProgramPackage[] = useMemo(
    () =>
      Object.values(
        data?.program.reduce((accum, p) => {
          p.program_package_programs.forEach(ppp => {
            const program = {
              id: p.id,
              title: p.title,
              categories: p.program_categories.map(pc => pc.category.name),
              coins: p.program_plans[0].list_price,
              position: ppp.position,
            }
            accum[ppp.program_package.id] = {
              id: ppp.program_package.id,
              title: ppp.program_package.title,
              programs: [...(accum[ppp.program_package.id]?.programs || []), program],
            }
          })
          return accum
        }, {} as { [programPackageId: string]: TimetableProgramPackage }) || {},
      ).map(programPackage => ({
        ...programPackage,
        programs: programPackage.programs.sort((a, b) => (a.position > b.position ? 1 : -1)),
      })),
    [data],
  )
  const programEvents: TimetableProgramEvent[] = useMemo(
    () =>
      data?.program_timetable
        .map(pt => {
          const program = programs.find(program => program.id === pt.program_id)
          return program
            ? {
                id: pt.id,
                time: dayjs(pt.time).toDate(),
                program,
              }
            : null
        })
        .filter(notEmpty) || [],
    [data],
  )

  return {
    programs,
    programPackages,
    enrolledProgramIds,
    programEvents,
    updateProgramEvents: async (pevents: TimetableProgramEvent[]) => {
      await updateProgramTimetable({
        variables: {
          memberId,
          programTimetableInsertInput: pevents.map((pevent, index) => ({
            id: pevent.id,
            member_id: memberId,
            program_id: pevent.program.id,
            time: pevent.time,
            position: index,
          })),
        },
      })
      await refetchProgramTimetable()
    },
  }
}

const GetProgramTimetable = gql`
  query GetProgramTimetable($memberId: String!) {
    program(
      where: {
        published_at: { _is_null: false }
        program_plans: { currency_id: { _eq: "LSC" }, period_type: { _eq: "Y" }, period_amount: { _eq: "1" } }
      }
    ) {
      id
      title
      program_plans(
        where: { period_type: { _eq: "Y" }, period_amount: { _eq: "1" } }
        order_by: [{ list_price: asc }]
      ) {
        list_price
      }
      program_package_programs(
        where: {
          program: { published_at: { _is_null: false } }
          program_package: { published_at: { _is_null: false } }
        }
      ) {
        position
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
    program_timetable(where: { member_id: { _eq: $memberId } }, order_by: [{ time: asc }, { position: asc }]) {
      id
      program_id
      time
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
