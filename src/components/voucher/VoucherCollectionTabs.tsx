import { Tabs } from 'antd'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { promotionMessages } from '../../helpers/translation'
import VoucherCard, { VoucherProps } from './VoucherCard'

const VoucherCollectionTabs: React.FC<{
  vouchers: VoucherProps[]
}> = ({ vouchers }) => {
  const { formatMessage } = useIntl()
  const [activeKey, setActiveKey] = useState('available')

  return (
    <Tabs activeKey={activeKey} onChange={key => setActiveKey(key)}>
      <Tabs.TabPane key="available" tab={formatMessage(promotionMessages.status.available)}>
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
      <Tabs.TabPane key="unavailable" tab={formatMessage(promotionMessages.status.unavailable)}>
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
