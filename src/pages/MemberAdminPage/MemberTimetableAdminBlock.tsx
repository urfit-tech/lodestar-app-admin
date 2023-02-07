import { DeleteOutlined, DownOutlined, PlusOutlined, UpOutlined } from '@ant-design/icons'
import { uuidv4 } from '@antv/xflow-core'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { Alert, AlertDescription, AlertIcon, AlertTitle } from '@chakra-ui/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import FullCalendar from '@fullcalendar/react'
import { Button, Input, List, Select, Tag } from 'antd'
import dayjs from 'dayjs'
import gql from 'graphql-tag'
import { sum } from 'lodash'
import { StyledTitle } from 'lodestar-app-element/src/components/modals/CheckoutProductModal'
import { notEmpty } from 'lodestar-app-element/src/helpers'
import React, { useEffect, useMemo, useState } from 'react'
import AdminModal from '../../components/admin/AdminModal'
import hasura from '../../hasura'
import { fuzzySearch } from '../../helpers'

type TimetableProgram = {
  id: string
  title: string
  categories: string[]
  coins: number
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
  const [isUpdating, setIsUpdating] = useState(false)
  const [searchText, setSearchText] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [searchType, setSearchType] = useState<'program' | 'programPackage'>('programPackage')
  const {
    enrolledProgramIds,
    programs,
    programPackages,
    programEvents,
    setProgramEvents,
    resetProgramEvents,
    updateProgramEvents,
  } = useProgramTimetable(memberId)

  const handleSubmit = () => {
    setIsUpdating(true)
    updateProgramEvents()
      .finally(() => setIsUpdating(false))
      .finally(() => setSelectedDate(null))
  }

  const selectedDateProgramEvents = programEvents.filter(
    pt => dayjs(pt.time).format('YYYYMMDD') === dayjs(selectedDate).format('YYYYMMDD'),
  )

  const futureUnenrolledProgramEvents = programEvents.filter(
    pe => dayjs(pe.time) > dayjs() && !enrolledProgramIds.includes(pe.program.id),
  )
  const futureCoins = sum(futureUnenrolledProgramEvents.map(pe => pe.program.coins))
  return (
    <>
      {futureCoins > memberCoins ? (
        <Alert status="error" className="mb-3">
          <AlertIcon />
          <AlertTitle>Coins are not enough!</AlertTitle>
          <AlertDescription>
            Needs {futureCoins} coins. You need {futureCoins - memberCoins} coins more.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert status="success" className="mb-3">
          <AlertIcon />
          Still have {memberCoins - futureCoins} coins.
        </Alert>
      )}
      <FullCalendar
        selectable
        plugins={[dayGridPlugin, interactionPlugin, listPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek,listYear',
        }}
        initialView="dayGridMonth"
        events={programEvents.map(pevent => ({
          title: pevent.program?.title,
          start: pevent.time,
          color: enrolledProgramIds.includes(pevent.program?.id) ? '#585858' : '#cdcece',
          allDay: true,
          url: `/programs/${pevent.program.id}?visitIntro=1`,
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
          resetProgramEvents()
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
                <Select.Option value="programPackage">programPackage</Select.Option>
                <Select.Option value="program">program</Select.Option>
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
                            setProgramEvents(pevents => [
                              ...pevents,
                              {
                                id: uuidv4(),
                                time: selectedDate,
                                program,
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
                            setProgramEvents(pevents => [
                              ...pevents,
                              ...programPackage.programs.map(program => ({
                                id: uuidv4(),
                                time: selectedDate,
                                program,
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
              renderItem={(programEvent, index) => {
                const programEventIndex = programEvents.findIndex(pevent => pevent.id === programEvent.id)
                return (
                  <List.Item
                    actions={[
                      <div>
                        <Button
                          key="up"
                          type="link"
                          icon={<UpOutlined />}
                          disabled={index === 0}
                          onClick={() =>
                            setProgramEvents(pevents => [
                              ...pevents.slice(0, programEventIndex - 1),
                              pevents[programEventIndex],
                              pevents[programEventIndex - 1],
                              ...pevents.slice(programEventIndex + 1),
                            ])
                          }
                        />
                        <Button
                          key="down"
                          type="link"
                          icon={<DownOutlined />}
                          disabled={index === selectedDateProgramEvents.length - 1}
                          onClick={() =>
                            setProgramEvents(pevents => [
                              ...pevents.slice(0, programEventIndex),
                              pevents[programEventIndex + 1],
                              pevents[programEventIndex],
                              ...pevents.slice(programEventIndex + 2),
                            ])
                          }
                        />
                        <Button
                          key="delete"
                          type="link"
                          icon={<DeleteOutlined />}
                          onClick={() =>
                            setProgramEvents(pevents => [
                              ...pevents.slice(0, programEventIndex),
                              ...pevents.slice(programEventIndex + 1),
                            ])
                          }
                        />
                      </div>,
                    ]}
                  >
                    <List.Item.Meta
                      style={{ opacity: enrolledProgramIds.includes(programEvent.id) ? 0.4 : 1 }}
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
                )
              }}
            />
          </div>
        </div>
      </AdminModal>
    </>
  )
}

const useProgramTimetable = (memberId: string) => {
  const [programEvents, setProgramEvents] = useState<TimetableProgramEvent[]>([])
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
  const programs: TimetableProgram[] = useMemo(
    () =>
      data?.program.map(p => ({
        id: p.id,
        title: p.title,
        categories: p.program_categories.map(pc => pc.category.name),
        coins: p.program_plans[0].list_price,
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
            }
            accum[ppp.program_package.id] = {
              id: ppp.program_package.id,
              title: ppp.program_package.title,
              programs: [...(accum[ppp.program_package.id]?.programs || []), program],
            }
          })
          return accum
        }, {} as { [programPackageId: string]: TimetableProgramPackage }) || {},
      ),
    [data],
  )
  const defaultProgramEvents: TimetableProgramEvent[] = useMemo(
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
  useEffect(() => setProgramEvents(defaultProgramEvents), [defaultProgramEvents])

  return {
    programs,
    programPackages,
    enrolledProgramIds,
    programEvents,
    setProgramEvents,
    resetProgramEvents: () => setProgramEvents(defaultProgramEvents),
    updateProgramEvents: async () => {
      await updateProgramTimetable({
        variables: {
          memberId,
          programTimetableInsertInput: programEvents.map((programEvent, index) => ({
            id: programEvent.id,
            member_id: memberId,
            program_id: programEvent.program.id,
            time: programEvent.time,
            position: index,
          })),
        },
      })
      await refetchProgramTimetable()
    },
  }
}

const GET_PROGRAM_TIMETABLE = gql`
  query GET_PROGRAM_TIMETABLE($memberId: String!) {
    program(where: { published_at: { _is_null: false }, program_plans: { currency_id: { _eq: "LSC" } } }) {
      id
      title
      program_plans(where: { currency_id: { _eq: "LSC" } }, order_by: [{ list_price: asc }]) {
        list_price
      }
      program_package_programs(order_by: [{ position: asc }]) {
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
    program_timetable(where: { member_id: { _eq: $memberId } }, order_by: [{ position: asc }]) {
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
