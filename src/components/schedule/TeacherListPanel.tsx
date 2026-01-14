import { CloseOutlined, SearchOutlined } from '@ant-design/icons'
import { Badge, Checkbox, Collapse, Empty, Input, Pagination, Select, Space, Spin, Table, Tag, Typography } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import dayjs from 'dayjs'
import React, { useCallback, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import {
  usePermissionGroupsAsCampuses,
  useTeacherOpenTimeEvents,
  useTeachersFromMembers,
} from '../../hooks/scheduleManagement'
import { Language, ScheduleCondition, scheduleStore, SCHEDULE_COLORS, Teacher } from '../../types/schedule'
import scheduleMessages from './translation'

const { Panel } = Collapse

const SelectedTeachersRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
`

const TeacherBadge = styled.div<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px 4px 12px;
  background-color: ${props => props.$color};
  color: white;
  border-radius: 16px;
  font-size: 13px;
`

const RemoveButton = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.5);
  }
`

const FilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
`

const LANGUAGE_LABELS: Record<Language, string> = {
  'zh-TW': '中文(繁)',
  'zh-CN': '中文(簡)',
  'en-US': '英文',
  ja: '日文',
  ko: '韓文',
  de: '德文',
  fr: '法文',
  es: '西文',
}

interface TeacherListPanelProps {
  /** 要篩選的語言列表（來自訂單的原始語言值，如 '中文'、'英文'） */
  languages?: string[]
  campus?: string
  selectedTeachers: Teacher[]
  onTeacherSelect: (teachers: Teacher[]) => void
  maxSelection?: number
  /** Enable real data mode using GraphQL queries from member table */
  useRealData?: boolean
  /** Permission group IDs to filter teachers by (used as campus in real data mode) */
  permissionGroupIds?: string[]
  scheduleCondition?: ScheduleCondition
  enableAvailabilitySort?: boolean
}

const TeacherListPanel: React.FC<TeacherListPanelProps> = ({
  languages,
  campus,
  selectedTeachers,
  onTeacherSelect,
  maxSelection = 3,
  useRealData = false,
  permissionGroupIds,
  scheduleCondition,
  enableAvailabilitySort = false,
}) => {
  const { formatMessage } = useIntl()
  const [searchText, setSearchText] = useState('')
  const [selectedCampusIds, setSelectedCampusIds] = useState<string[]>(permissionGroupIds || (campus ? [campus] : []))
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [selectedTraits, setSelectedTraits] = useState<string[]>([])
  const [selectedLevel, setSelectedLevel] = useState<number | undefined>()
  const [currentPage, setCurrentPage] = useState(1)
  const [isCollapsed, setIsCollapsed] = useState(false)

  // 當校區 prop 改變時，同步更新篩選器
  React.useEffect(() => {
    if (campus) {
      setSelectedCampusIds([campus])
    }
  }, [campus])

  // 當訂單語言改變時，清空語言篩選器（讓用戶重新選擇）
  React.useEffect(() => {
    setSelectedLanguages([])
  }, [languages])

  const pageSize = 5

  // Real data hooks
  const { campuses: realCampuses, loading: campusesLoading } = usePermissionGroupsAsCampuses()
  const {
    teachers: realTeachers,
    loading: teachersLoading,
    availableTraits,
  } = useTeachersFromMembers(
    useRealData ? (selectedCampusIds.length > 0 ? selectedCampusIds : undefined) : undefined,
    languages, // 使用訂單語言作為基本查詢條件
    undefined, // traitFilter
    true, // requireLanguage: 沒有訂單語言時不查詢
  )

  // Fallback to mock data if not using real data
  const mockCampuses = useMemo(() => scheduleStore.getCampuses(), [])
  const campuses = useRealData ? realCampuses : mockCampuses

  // Get all unique traits from mock teachers
  const mockAllTraits = useMemo(() => {
    const teachers = scheduleStore.getTeachers()
    const traits = new Set<string>()
    teachers.forEach(t => t.traits.forEach(trait => traits.add(trait)))
    return Array.from(traits)
  }, [])

  // Get all unique levels
  const allLevels = useMemo(() => {
    if (useRealData) {
      const levels = new Set<number>()
      realTeachers.forEach(t => {
        if (t.level > 0) levels.add(t.level)
      })
      return Array.from(levels).sort((a, b) => b - a) // Descending order
    }
    const teachers = scheduleStore.getTeachers()
    return Array.from(new Set(teachers.map(t => parseInt(t.level, 10) || 0))).filter(l => l > 0)
  }, [useRealData, realTeachers])

  const allTraits = useRealData ? availableTraits : mockAllTraits

  // Convert real teachers to Teacher type for compatibility
  const convertedRealTeachers = useMemo<Teacher[]>(() => {
    return realTeachers.map(t => ({
      id: t.id,
      name: t.name,
      email: t.email,
      campus: t.campusId,
      languages: t.languages as Language[],
      traits: t.traits,
      level: t.level > 0 ? `${t.level} 星` : '-',
      yearsOfExperience: t.yearsOfExperience,
      note: t.note,
      availableSlots: [], // Will be populated later
    }))
  }, [realTeachers])

  const baseTeachers = useMemo(() => {
    // 如果沒有訂單語言，不顯示任何老師
    if (!languages || languages.length === 0) {
      return []
    }

    let teachers: Teacher[]

    if (useRealData) {
      // 使用 GraphQL 查詢的結果，hook 已經根據訂單語言過濾
      teachers = convertedRealTeachers
    } else {
      // Mock data 模式：需要在前端根據訂單語言過濾
      teachers = scheduleStore.getTeachers()
      if (selectedCampusIds.length > 0) {
        teachers = teachers.filter(t => selectedCampusIds.includes(t.campus))
      }
      teachers = teachers.filter(t => languages.some(lang => t.languages.includes(lang as Language)))
    }

    // 以下為額外篩選器（可選）

    // 語言篩選器 - 如果有選擇，進一步篩選
    if (selectedLanguages.length > 0) {
      teachers = teachers.filter(t => selectedLanguages.some(lang => t.languages.includes(lang as Language)))
    }

    // Traits filter
    if (selectedTraits.length > 0) {
      teachers = teachers.filter(t => selectedTraits.some(trait => t.traits.includes(trait)))
    }

    // Level filter
    if (selectedLevel !== undefined) {
      teachers = teachers.filter(t => {
        const teacherLevel = typeof t.level === 'string' ? parseInt(t.level, 10) : t.level
        return teacherLevel === selectedLevel
      })
    }

    // Search filter
    if (searchText) {
      const search = searchText.toLowerCase()
      teachers = teachers.filter(
        t =>
          t.name.toLowerCase().includes(search) ||
          t.email.toLowerCase().includes(search) ||
          t.note?.toLowerCase().includes(search),
      )
    }

    return teachers
  }, [
    useRealData,
    convertedRealTeachers,
    languages,
    selectedLanguages,
    selectedCampusIds,
    selectedTraits,
    selectedLevel,
    searchText,
  ])

  const availabilityWindow = useMemo(() => {
    if (!enableAvailabilitySort || !scheduleCondition?.startDate) return null
    const start = dayjs(scheduleCondition.startDate).startOf('day')
    const end = scheduleCondition.endDate
      ? dayjs(scheduleCondition.endDate).endOf('day')
      : start.add(180, 'day').endOf('day')
    return { start: start.toDate(), end: end.toDate() }
  }, [enableAvailabilitySort, scheduleCondition])

  const teacherIdsForAvailability = useMemo(() => baseTeachers.map(t => t.id), [baseTeachers])
  const { events: availabilityEvents } = useTeacherOpenTimeEvents(
    enableAvailabilitySort && availabilityWindow ? teacherIdsForAvailability : [],
    availabilityWindow?.start,
    availabilityWindow?.end,
  )

  const availabilityScores = useMemo(() => {
    if (!enableAvailabilitySort || !availabilityWindow) return {}
    const scoreMap: Record<string, number> = {}
    availabilityEvents.forEach(event => {
      const eventStart = dayjs(event.start)
      const eventEnd = dayjs(event.end)
      const windowStart = dayjs(availabilityWindow.start)
      const windowEnd = dayjs(availabilityWindow.end)
      if (eventEnd.isBefore(windowStart) || eventStart.isAfter(windowEnd)) return
      const overlapStart = eventStart.isAfter(windowStart) ? eventStart : windowStart
      const overlapEnd = eventEnd.isBefore(windowEnd) ? eventEnd : windowEnd
      const minutes = Math.max(0, overlapEnd.diff(overlapStart, 'minute'))
      scoreMap[event.teacherId] = (scoreMap[event.teacherId] || 0) + minutes
    })
    return scoreMap
  }, [availabilityEvents, availabilityWindow, enableAvailabilitySort])

  // Sort teachers
  const filteredTeachers = useMemo(() => {
    const teachers = [...baseTeachers]

    // Sort: 同校區 > 開放時間重合度 > 等級(降序) > 年資(降序) > 姓名拼音(升序)
    teachers.sort((a, b) => {
      if (campus) {
        const aMatch = a.campus === campus ? 0 : 1
        const bMatch = b.campus === campus ? 0 : 1
        if (aMatch !== bMatch) return aMatch - bMatch
      }

      if (enableAvailabilitySort && availabilityWindow) {
        const aScore = availabilityScores[a.id] || 0
        const bScore = availabilityScores[b.id] || 0
        if (bScore !== aScore) return bScore - aScore
      }

      const levelA = typeof a.level === 'string' ? parseInt(a.level, 10) || 0 : a.level
      const levelB = typeof b.level === 'string' ? parseInt(b.level, 10) || 0 : b.level
      if (levelB !== levelA) {
        return levelB - levelA
      }

      if (b.yearsOfExperience !== a.yearsOfExperience) {
        return b.yearsOfExperience - a.yearsOfExperience
      }

      return a.name.localeCompare(b.name, 'zh-TW')
    })

    return teachers
  }, [baseTeachers, campus, enableAvailabilitySort, availabilityWindow, availabilityScores])

  // Paginated teachers
  const paginatedTeachers = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredTeachers.slice(start, start + pageSize)
  }, [filteredTeachers, currentPage])

  const totalPages = Math.ceil(filteredTeachers.length / pageSize)
  const visiblePages = useMemo(() => {
    const pages = new Set<number>()
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i += 1) {
      pages.add(i)
    }
    return pages
  }, [currentPage, totalPages])

  const handleTeacherToggle = useCallback(
    (teacher: Teacher, checked: boolean) => {
      if (checked) {
        if (selectedTeachers.length < maxSelection) {
          onTeacherSelect([...selectedTeachers, teacher])
        }
      } else {
        onTeacherSelect(selectedTeachers.filter(t => t.id !== teacher.id))
      }
    },
    [selectedTeachers, onTeacherSelect, maxSelection],
  )

  const handleRemoveTeacher = useCallback(
    (teacherId: string) => {
      onTeacherSelect(selectedTeachers.filter(t => t.id !== teacherId))
    },
    [selectedTeachers, onTeacherSelect],
  )

  const isTeacherSelected = useCallback(
    (teacherId: string) => {
      return selectedTeachers.some(t => t.id === teacherId)
    },
    [selectedTeachers],
  )

  const canSelectMore = selectedTeachers.length < maxSelection
  const isLoading = useRealData && (campusesLoading || teachersLoading)

  const columns: ColumnsType<Teacher> = [
    {
      title: '',
      key: 'checkbox',
      width: 40,
      render: (_, record) => (
        <Checkbox
          checked={isTeacherSelected(record.id)}
          disabled={!isTeacherSelected(record.id) && !canSelectMore}
          onChange={e => handleTeacherToggle(record, e.target.checked)}
        />
      ),
    },
    {
      title: formatMessage(scheduleMessages.TeacherList.nameEmail),
      key: 'nameEmail',
      render: (_, record) => (
        <div>
          <div>{record.name}</div>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {record.email}
          </Typography.Text>
        </div>
      ),
    },
    {
      title: formatMessage(scheduleMessages.TeacherList.campus),
      dataIndex: 'campus',
      key: 'campus',
      render: campusId => {
        const found = campuses.find(c => c.id === campusId)
        return found?.name || campusId
      },
    },
    {
      title: formatMessage(scheduleMessages.TeacherList.languages),
      key: 'languages',
      render: (_, record) => (
        <Space size={[0, 4]} wrap>
          {record.languages.map(lang => (
            <Tag key={lang}>{LANGUAGE_LABELS[lang as Language] || lang}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: formatMessage(scheduleMessages.TeacherList.traits),
      key: 'traits',
      render: (_, record) => (
        <Space size={[0, 4]} wrap>
          {record.traits.map(trait => (
            <Tag key={trait} color="blue">
              {trait}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: formatMessage(scheduleMessages.TeacherList.level),
      dataIndex: 'level',
      key: 'level',
      render: level => {
        const numLevel = typeof level === 'string' ? parseInt(level, 10) : level
        return numLevel > 0 ? numLevel : '-'
      },
    },
    {
      title: formatMessage(scheduleMessages.TeacherList.experience),
      dataIndex: 'yearsOfExperience',
      key: 'yearsOfExperience',
      sorter: (a, b) => a.yearsOfExperience - b.yearsOfExperience,
      render: years => (years > 0 ? `${years} 年` : '-'),
    },
    {
      title: formatMessage(scheduleMessages.TeacherList.note),
      dataIndex: 'note',
      key: 'note',
      ellipsis: true,
      render: note => note || '-',
    },
  ]

  const getTeacherBadgeColor = (index: number): string => {
    const colorKeys = ['teacher1', 'teacher2', 'teacher3'] as const
    return SCHEDULE_COLORS.teacher[colorKeys[index]]?.dark || '#64748B'
  }

  return (
    <>
      {/* Selected Teachers Display - 顯示在 Collapse 外部，收起時仍可見 */}
      {selectedTeachers.length > 0 && (
        <SelectedTeachersRow>
          {selectedTeachers.map((teacher, index) => (
            <TeacherBadge key={teacher.id} $color={getTeacherBadgeColor(index)}>
              {teacher.name}
              <RemoveButton onClick={() => handleRemoveTeacher(teacher.id)}>
                <CloseOutlined style={{ fontSize: 10 }} />
              </RemoveButton>
            </TeacherBadge>
          ))}
        </SelectedTeachersRow>
      )}

      <Collapse
        activeKey={isCollapsed ? [] : ['1']}
        onChange={() => setIsCollapsed(!isCollapsed)}
        ghost
        style={{ marginBottom: 0 }}
      >
        <Panel
          header={
            <Space>
              <Typography.Text strong>{formatMessage(scheduleMessages.TeacherList.title)}</Typography.Text>
              <Badge count={selectedTeachers.length} style={{ backgroundColor: SCHEDULE_COLORS.today }} />
            </Space>
          }
          key="1"
        >
          {/* Filters */}
          <FilterRow>
            <Input
              placeholder={formatMessage(scheduleMessages['*'].search)}
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            <Select
              mode="multiple"
              placeholder={formatMessage(scheduleMessages.TeacherList.campus)}
              value={selectedCampusIds}
              onChange={setSelectedCampusIds}
              style={{ width: 200 }}
              allowClear
              loading={campusesLoading}
            >
              {campuses.map(c => (
                <Select.Option key={c.id} value={c.id}>
                  {c.name}
                </Select.Option>
              ))}
            </Select>
            <Select
              mode="multiple"
              placeholder={formatMessage(scheduleMessages.TeacherList.languages)}
              value={selectedLanguages}
              onChange={setSelectedLanguages}
              style={{ width: 200 }}
              allowClear
            >
              {/* 只顯示訂單的語言作為選項 */}
              {languages?.map(lang => (
                <Select.Option key={lang} value={lang}>
                  {lang}
                </Select.Option>
              ))}
            </Select>
            <Select
              mode="multiple"
              placeholder={formatMessage(scheduleMessages.TeacherList.traits)}
              value={selectedTraits}
              onChange={setSelectedTraits}
              style={{ width: 200 }}
              allowClear
            >
              {allTraits.map(trait => (
                <Select.Option key={trait} value={trait}>
                  {trait}
                </Select.Option>
              ))}
            </Select>
            <Select
              placeholder={formatMessage(scheduleMessages.TeacherList.level)}
              value={selectedLevel}
              onChange={setSelectedLevel}
              style={{ width: 120 }}
              allowClear
            >
              {allLevels.map(level => (
                <Select.Option key={level} value={level}>
                  {level} 星
                </Select.Option>
              ))}
            </Select>
          </FilterRow>

          {/* Max Selection Warning */}
          {!canSelectMore && (
            <Typography.Text type="warning" style={{ display: 'block', marginBottom: 8 }}>
              {formatMessage(scheduleMessages.TeacherList.maxSelection)}
            </Typography.Text>
          )}

          {/* Loading State */}
          {isLoading && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Spin tip="載入中..." />
            </div>
          )}

          {/* Teachers Table */}
          {!isLoading && filteredTeachers.length > 0 ? (
            <>
              <Table columns={columns} dataSource={paginatedTeachers} rowKey="id" pagination={false} size="small" />
              <div style={{ marginTop: 16, textAlign: 'right' }}>
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={filteredTeachers.length}
                  onChange={setCurrentPage}
                  showSizeChanger={false}
                  showTotal={total => `共 ${total} 位老師`}
                  itemRender={(page, type, element) => {
                    if (type === 'page' && !visiblePages.has(page)) {
                      return null
                    }
                    return element
                  }}
                />
              </div>
            </>
          ) : !isLoading ? (
            <Empty description={formatMessage(scheduleMessages.TeacherList.noTeachers)} />
          ) : null}
        </Panel>
      </Collapse>
    </>
  )
}

export default TeacherListPanel
