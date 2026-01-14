import { CalendarOutlined } from '@ant-design/icons'
import { Alert, Typography } from 'antd'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useLocation } from 'react-router-dom'
import { AdminPageBlock, AdminPageTitle } from '../components/admin'
import adminMessages from '../components/admin/translation'
import AdminLayout from '../components/layout/AdminLayout'

const messages = defineMessages({
  pageTitle: { id: 'page.ScheduleManagementExamplePage.pageTitle', defaultMessage: '排課管理示例頁' },
  description: {
    id: 'page.ScheduleManagementExamplePage.description',
    defaultMessage: '依據 docs/排課管理_PRD.md 建立的佈局占位，後續功能可在此頁型上接續開發。',
  },
  docPath: { id: 'page.ScheduleManagementExamplePage.docPath', defaultMessage: 'PRD 路徑：docs/排課管理_PRD.md' },
  nextStepHint: {
    id: 'page.ScheduleManagementExamplePage.nextStepHint',
    defaultMessage: '目前僅為示例，之後可補上表格、行事曆與預排/發布等互動流程。',
  },
})

type ScheduleType = 'personal' | 'semester' | 'group'

const scheduleSections: Record<ScheduleType, string[]> = {
  personal: [
    '學生資料唯讀（姓名、Email、備註、偏好老師）',
    '訂單按語言分頁，顯示可排課時與未完成警示',
    '排課條件包含開始/結束日期、排入課時與假日設定',
    '老師清單依語言/校區篩選，最多多選 3 位並跨頁保留',
    '週視圖行事曆與安排課程彈窗，支援預排與發布流程',
  ],
  semester: [
    '班級基本設定：名稱、成班/滿班人數、校區、語言、教材',
    '學生清單按語言與校區過濾，未完成訂單標示紅色驚嘆號',
    '排課條件含開始/結束日與固定假日勾選',
    '老師清單沿用共用規則，預設篩班級校區',
    '週曆顯示待處理/預排/發布色彩，發布後角標顯示預排學生',
  ],
  group: [
    '班級基本設定與教材多選，校區變更需確認並重載資源',
    '學生清單顯示語言/校區符合且可排課時 > 0 的訂單',
    '排課條件：開始/結束日或排入課時擇一，限制依最早訂單',
    '老師清單與行事曆同共用規則，角標區分已付款/未付款學生',
    '預排與發布流程同學期班，含資源檢查與修正模式',
  ],
}

const ScheduleManagementExamplePage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { pathname } = useLocation()

  const scheduleType: ScheduleType = pathname.includes('/class-schedule/semester')
    ? 'semester'
    : pathname.includes('/class-schedule/group')
    ? 'group'
    : 'personal'

  const scheduleTitle =
    scheduleType === 'semester'
      ? formatMessage(adminMessages.AdminMenu.semesterSchedule)
      : scheduleType === 'group'
      ? formatMessage(adminMessages.AdminMenu.groupSchedule)
      : formatMessage(adminMessages.AdminMenu.personalSchedule)

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <CalendarOutlined className="mr-3" />
        <span>{formatMessage(messages.pageTitle)}</span>
      </AdminPageTitle>

      <AdminPageBlock className="mb-4">
        <Alert
          showIcon
          type="info"
          message={formatMessage(messages.docPath)}
          description={formatMessage(messages.description)}
        />
      </AdminPageBlock>

      <AdminPageBlock>
        <Typography.Title level={4} className="mb-3">
          {scheduleTitle}
        </Typography.Title>
        <Typography.Paragraph type="secondary" className="mb-3">
          {formatMessage(messages.nextStepHint)}
        </Typography.Paragraph>
        <ul className="pl-4 mb-0">
          {scheduleSections[scheduleType].map(section => (
            <li key={section}>
              <Typography.Text>{section}</Typography.Text>
            </li>
          ))}
        </ul>
      </AdminPageBlock>
    </AdminLayout>
  )
}

export default ScheduleManagementExamplePage
