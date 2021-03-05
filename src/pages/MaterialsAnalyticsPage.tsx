import { BarChartOutlined } from '@ant-design/icons'
import { DatePicker, Form, Tabs } from 'antd'
import { AdminPageTitle } from 'lodestar-app-admin/src/components/admin'
import AdminLayout from 'lodestar-app-admin/src/components/layout/AdminLayout'
import moment, { Moment } from 'moment'
import React, { useState } from 'react'
import SalesMemberInput from '../components/common/SalesMemberInput'

const MaterialsAnalyticsPage: React.FC = () => {
  const [range, setRange] = useState<[Moment, Moment]>([moment().startOf('month'), moment().endOf('month')])
  const [selectedMemberId, setSelectedMemberId] = useState<string>('')
  const [selectedMaterial, setSelectedMaterial] = useState('廣告素材')

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <BarChartOutlined className="mr-3" />
        <span>素材表現</span>
      </AdminPageTitle>

      <Form colon={false} labelAlign="left">
        <Form.Item label="時間">
          <DatePicker.RangePicker
            value={range}
            onChange={value => value?.[0] && value[1] && setRange([value[0], value[1]])}
          />
        </Form.Item>
        <Form.Item label="業務">
          <SalesMemberInput value={selectedMemberId} onChange={setSelectedMemberId} />
        </Form.Item>
      </Form>

      <Tabs activeKey={selectedMaterial} onChange={key => setSelectedMaterial(key)}>
        <Tabs.TabPane key="廣告素材" tab="廣告素材"></Tabs.TabPane>
        <Tabs.TabPane key="廣告組合" tab="廣告組合"></Tabs.TabPane>
        <Tabs.TabPane key="行銷活動" tab="行銷活動"></Tabs.TabPane>
      </Tabs>
    </AdminLayout>
  )
}

export default MaterialsAnalyticsPage
