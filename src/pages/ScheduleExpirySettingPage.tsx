import Icon, { ClockCircleOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { gql, useMutation, useQuery } from '@apollo/client'
import { Button, Form, Input, InputNumber, message, Select, Table, Tabs, Tag } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import React, { useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import { AdminPageBlock, AdminPageTitle } from '../components/admin'
import AdminCard from '../components/admin/AdminCard'
import AdminLayout from '../components/layout/AdminLayout'
import { handleError } from '../helpers'
import { commonMessages } from '../helpers/translation'
import ForbiddenPage from './ForbiddenPage'
import pageMessages from './translation'

type ScheduleValidityRule = {
  id: string
  type: string
  language: string
  class_count: number
  valid_days: number
  status: string
  created_at: string
  deleted_at: string | null
  schedule_validity_rule_member: {
    name: string
    email: string
  } | null
}

const ScheduleExpirySettingPage: React.VFC = () => {
  const { formatMessage } = useIntl()
  const { id: appId, enabledModules } = useApp()

  const languageOptions = [
    { value: '中文', label: formatMessage(pageMessages.ScheduleExpirySettingPage.languageChinese) },
    { value: '德文', label: formatMessage(pageMessages.ScheduleExpirySettingPage.languageGerman) },
    { value: '日文', label: formatMessage(pageMessages.ScheduleExpirySettingPage.languageJapanese) },
    { value: '法文', label: formatMessage(pageMessages.ScheduleExpirySettingPage.languageFrench) },
    { value: '英文', label: formatMessage(pageMessages.ScheduleExpirySettingPage.languageEnglish) },
    { value: '西文', label: formatMessage(pageMessages.ScheduleExpirySettingPage.languageSpanish) },
    { value: '韓文', label: formatMessage(pageMessages.ScheduleExpirySettingPage.languageKorean) },
    { value: '台語', label: formatMessage(pageMessages.ScheduleExpirySettingPage.languageTaiwanese) },
    { value: '粵語', label: formatMessage(pageMessages.ScheduleExpirySettingPage.languageCantonese) },
  ]

  const statusOptions = [
    { value: 'active', label: formatMessage(pageMessages.ScheduleExpirySettingPage.statusActive) },
    { value: 'archived', label: formatMessage(pageMessages.ScheduleExpirySettingPage.statusArchived) },
  ]

  const { currentMemberId, currentUserRole } = useAuth()
  const [form] = Form.useForm()

  // 表單狀態
  const [activeTab, setActiveTab] = useState<string>('individual')
  const [language, setLanguage] = useState<string | undefined>(undefined)
  const [classCount, setClassCount] = useState<number | undefined>(1)
  const [validDays, setValidDays] = useState<number | undefined>(1)
  const [submitting, setSubmitting] = useState(false)

  // 篩選狀態
  const [filterLanguages, setFilterLanguages] = useState<string[]>([])
  const [filterStatuses, setFilterStatuses] = useState<string[]>([])
  const [filterOperator, setFilterOperator] = useState<string>('')
  const searchInputRef = useRef<Input>(null)

  // Mutation
  const [insertScheduleValidityRule] = useMutation(INSERT_SCHEDULE_VALIDITY_RULE)
  const [archiveScheduleValidityRule] = useMutation(ARCHIVE_SCHEDULE_VALIDITY_RULE)

  // Query
  const { data, loading, refetch } = useQuery<{
    schedule_validity_rule: ScheduleValidityRule[]
  }>(GET_SCHEDULE_VALIDITY_RULES, {
    variables: { appId },
  })

  const allData = data?.schedule_validity_rule || []

  // 套用篩選條件
  const filteredData = allData.filter(item => {
    if (filterLanguages.length > 0 && !filterLanguages.includes(item.language)) return false
    if (filterStatuses.length > 0 && !filterStatuses.includes(item.status)) return false
    if (filterOperator) {
      const member = item.schedule_validity_rule_member
      const operatorText = member ? `${member.name} ${member.email}`.toLowerCase() : ''
      if (!operatorText.includes(filterOperator.toLowerCase())) return false
    }
    return true
  })

  const individualData = filteredData.filter(item => item.type === 'individual')
  const groupData = filteredData.filter(item => item.type === 'group')

  const handleSubmit = async () => {
    if (!language || !classCount || !validDays) {
      message.warning(formatMessage(pageMessages.ScheduleExpirySettingPage.fillAllFields))
      return
    }
    setSubmitting(true)
    try {
      // 檢查是否有相同 type、language、class_count 且狀態為 active 的資料
      const existingData = allData.find(
        item =>
          item.type === activeTab &&
          item.language === language &&
          item.class_count === classCount &&
          item.status === 'active',
      )

      // 若有，先將其封存
      if (existingData) {
        await archiveScheduleValidityRule({
          variables: {
            id: existingData.id,
          },
        })
      }

      // 新增新規則
      await insertScheduleValidityRule({
        variables: {
          type: activeTab, // individual 或 group
          language,
          classCount,
          validDays,
          status: 'active',
        },
      })
      message.success(formatMessage(pageMessages.ScheduleExpirySettingPage.addRuleSuccess))
      // 成功後清空表單
      setLanguage(undefined)
      setClassCount(1)
      setValidDays(1)
      form.resetFields()
      refetch()
    } catch (error) {
      handleError(error)
    } finally {
      setSubmitting(false)
    }
  }

  const renderDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return moment(dateString).format('YYYY-MM-DD')
  }

  const statusMap: Record<string, string> = {
    active: formatMessage(pageMessages.ScheduleExpirySettingPage.statusActive),
    archived: formatMessage(pageMessages.ScheduleExpirySettingPage.statusArchived),
  }

  const columns: ColumnProps<ScheduleValidityRule>[] = [
    {
      key: 'language',
      title: formatMessage(pageMessages.ScheduleExpirySettingPage.language),
      dataIndex: 'language',
      width: '10%',
      render: (value: string) => languageOptions.find(opt => opt.value === value)?.label || value,
      filters: languageOptions.map(opt => ({ text: opt.label, value: opt.value })),
    },
    {
      key: 'class_count',
      title: formatMessage(pageMessages.ScheduleExpirySettingPage.classCount),
      dataIndex: 'class_count',
      width: '15%',
      sorter: (a, b) => a.class_count - b.class_count,
    },
    {
      key: 'valid_days',
      title: formatMessage(pageMessages.ScheduleExpirySettingPage.validDays),
      dataIndex: 'valid_days',
      width: '15%',
      sorter: (a, b) => a.valid_days - b.valid_days,
    },
    {
      key: 'status',
      title: formatMessage(pageMessages.ScheduleExpirySettingPage.status),
      dataIndex: 'status',
      width: '10%',
      render: (value: string) => {
        const color = value === 'active' ? '#4ed1b3' : '#9b9b9b'
        return <Tag color={color}>{statusMap[value] || value}</Tag>
      },
      filters: statusOptions.map(opt => ({ text: opt.label, value: opt.value })),
    },
    {
      key: 'created_at',
      title: formatMessage(pageMessages.ScheduleExpirySettingPage.createdAt),
      dataIndex: 'created_at',
      width: '15%',
      render: (value: string) => renderDate(value),
      sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
    {
      key: 'deleted_at',
      title: formatMessage(pageMessages.ScheduleExpirySettingPage.archivedAt),
      dataIndex: 'deleted_at',
      width: '15%',
      render: (value: string | null) => renderDate(value),
      sorter: (a, b) => {
        if (!a.deleted_at) return 1
        if (!b.deleted_at) return -1
        return new Date(a.deleted_at).getTime() - new Date(b.deleted_at).getTime()
      },
    },
    {
      key: 'member',
      title: formatMessage(pageMessages.ScheduleExpirySettingPage.operator),
      dataIndex: 'schedule_validity_rule_member',
      width: '15%',
      render: (member: ScheduleValidityRule['schedule_validity_rule_member']) =>
        member ? `${member.name} ${member.email}` : '-',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div className="p-2">
          <Input
            ref={searchInputRef}
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => {
              confirm()
              setFilterOperator((selectedKeys[0] as string) || '')
            }}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <div>
            <Button
              type="primary"
              onClick={() => {
                confirm()
                setFilterOperator((selectedKeys[0] as string) || '')
              }}
              icon={<SearchOutlined />}
              size="small"
              className="mr-2"
              style={{ width: 90 }}
            >
              {formatMessage(commonMessages.ui.search)}
            </Button>
            <Button
              onClick={() => {
                clearFilters?.()
                setFilterOperator('')
              }}
              size="small"
              style={{ width: 90 }}
            >
              {formatMessage(commonMessages.ui.reset)}
            </Button>
          </div>
        </div>
      ),
      filterIcon: () => <SearchOutlined style={{ color: filterOperator ? '#1890ff' : undefined }} />,
      onFilterDropdownVisibleChange: visible => visible && setTimeout(() => searchInputRef.current?.select(), 100),
    },
    {
      key: 'action',
      title: '',
      width: '10%',
      render: () => <span>{/* TODO: 操作按鈕 (編輯/封存) */}</span>,
    },
  ]

  const tabContents = [
    {
      key: 'individual',
      tab: formatMessage(pageMessages.ScheduleExpirySettingPage.individualClass),
      data: individualData,
    },
    {
      key: 'group',
      tab: formatMessage(pageMessages.ScheduleExpirySettingPage.groupClass),
      data: groupData,
    },
  ]

  if (!enabledModules.appointment) {
    return <ForbiddenPage />
  }

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <ClockCircleOutlined />} className="mr-3" />
        <span>{formatMessage(commonMessages.menu.scheduleExpirySetting)}</span>
      </AdminPageTitle>

      <Tabs defaultActiveKey="individual" activeKey={activeTab} onChange={key => setActiveTab(key)}>
        {tabContents.map(tabContent => (
          <Tabs.TabPane key={tabContent.key} tab={`${tabContent.tab} (${tabContent.data.length})`}>
            {currentUserRole === 'app-owner' && (
              <AdminCard className="mb-3">
                <Form form={form} layout="inline" initialValues={{ classCount: 1, validDays: 1 }}>
                  <Form.Item
                    label={formatMessage(pageMessages.ScheduleExpirySettingPage.language)}
                    name="language"
                    rules={[
                      { required: true, message: formatMessage(pageMessages.ScheduleExpirySettingPage.selectLanguage) },
                    ]}
                  >
                    <Select
                      style={{ width: 150 }}
                      placeholder={formatMessage(pageMessages.ScheduleExpirySettingPage.selectLanguage)}
                      value={language}
                      onChange={value => setLanguage(value)}
                    >
                      {languageOptions.map(opt => (
                        <Select.Option key={opt.value} value={opt.value}>
                          {opt.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    label={formatMessage(pageMessages.ScheduleExpirySettingPage.classCount)}
                    name="classCount"
                    rules={[
                      {
                        required: true,
                        message: formatMessage(pageMessages.ScheduleExpirySettingPage.inputClassCount),
                      },
                    ]}
                  >
                    <InputNumber
                      min={1}
                      value={classCount}
                      onChange={value => setClassCount(typeof value === 'number' ? value : undefined)}
                    />
                  </Form.Item>
                  <Form.Item
                    label={formatMessage(pageMessages.ScheduleExpirySettingPage.validDays)}
                    name="validDays"
                    rules={[
                      { required: true, message: formatMessage(pageMessages.ScheduleExpirySettingPage.inputValidDays) },
                    ]}
                  >
                    <InputNumber
                      min={1}
                      value={validDays}
                      onChange={value => setValidDays(typeof value === 'number' ? value : undefined)}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" icon={<PlusOutlined />} loading={submitting} onClick={handleSubmit}>
                      {formatMessage(pageMessages.ScheduleExpirySettingPage.addRule)}
                    </Button>
                  </Form.Item>
                </Form>
              </AdminCard>
            )}
            <AdminPageBlock>
              <Table<ScheduleValidityRule>
                loading={loading}
                rowKey="id"
                columns={columns}
                dataSource={tabContent.data}
                onChange={(_, filters) => {
                  setFilterLanguages((filters.language as string[]) || [])
                  setFilterStatuses((filters.status as string[]) || [])
                }}
              />
            </AdminPageBlock>
          </Tabs.TabPane>
        ))}
      </Tabs>
    </AdminLayout>
  )
}

// TODO:等排課頁面，之後需移動到共用的 GraphQL 檔案中
const GET_SCHEDULE_VALIDITY_RULES = gql`
  query GET_SCHEDULE_VALIDITY_RULES($appId: String!) {
    schedule_validity_rule(where: { app_id: { _eq: $appId } }, order_by: { created_at: desc }) {
      id
      type
      language
      class_count
      valid_days
      status
      created_at
      deleted_at
      schedule_validity_rule_member {
        name
        email
      }
    }
  }
`

const INSERT_SCHEDULE_VALIDITY_RULE = gql`
  mutation INSERT_SCHEDULE_VALIDITY_RULE(
    $type: String!
    $language: String!
    $classCount: Int!
    $validDays: Int!
    $status: String!
  ) {
    insert_schedule_validity_rule_one(
      object: { type: $type, language: $language, class_count: $classCount, valid_days: $validDays, status: $status }
    ) {
      id
    }
  }
`

const ARCHIVE_SCHEDULE_VALIDITY_RULE = gql`
  mutation ARCHIVE_SCHEDULE_VALIDITY_RULE($id: uuid!) {
    update_schedule_validity_rule_by_pk(pk_columns: { id: $id }, _set: { status: "archived", deleted_at: "now()" }) {
      id
    }
  }
`

export default ScheduleExpirySettingPage
