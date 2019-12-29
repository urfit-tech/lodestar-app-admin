import { Tabs } from 'antd'
import React, { useState } from 'react'
import VoucherCard, { VoucherProps } from './VoucherCard'

type VoucherCollectionTabProps = {
  vouchers: VoucherProps[]
}
const VoucherCollectionTabs: React.FC<VoucherCollectionTabProps> = ({ vouchers }) => {
  const [activeKey, setActiveKey] = useState('available')

  return (
    <Tabs activeKey={activeKey} onChange={key => setActiveKey(key)}>
      <Tabs.TabPane key="available" tab="可使用">
        <div className="row">
          {vouchers
            .filter(voucher => voucher.available)
            .map(voucher => (
              <div key={voucher.id} className="col-12 col-lg-6">
                <VoucherCard {...voucher} />
              </div>
            ))}
        </div>
      </Tabs.TabPane>
      <Tabs.TabPane key="unavailable" tab="已失效">
        <div className="row">
          {vouchers
            .filter(voucher => !voucher.available)
            .map(voucher => (
              <div key={voucher.id} className="col-12 col-lg-6">
                <VoucherCard {...voucher} />
              </div>
            ))}
        </div>
      </Tabs.TabPane>
    </Tabs>
  )
}

export default VoucherCollectionTabs
