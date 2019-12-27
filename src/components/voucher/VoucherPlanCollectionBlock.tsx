import { Button, Dropdown, Icon, Menu, Skeleton } from 'antd'
import React from 'react'
import VoucherCollectionTabs from '../../components/voucher/VoucherCollectionTabs'
import VoucherPlanAdminModal, { VoucherPlanFields } from '../../components/voucher/VoucherPlanAdminModal'
import VoucherPlanDetailModal from '../../components/voucher/VoucherPlanDetailModal'
import { VoucherProps } from './VoucherCard'

type VoucherPlanCollectionBlockProps = {
  loading?: boolean
  error?: Error
  voucherPlanCollection: (VoucherProps & {
    voucherCodes: {
      id: string
      code: string
      count: number
      remaining: number
    }[]
    count: number
    remaining: number
    productIds: string[]
  })[]
  onInsert: (
    setVisible: React.Dispatch<React.SetStateAction<boolean>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    values: VoucherPlanFields,
  ) => void
  onUpdate: (
    setVisible: React.Dispatch<React.SetStateAction<boolean>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    values: VoucherPlanFields,
    voucherPlanId: string,
  ) => void
}
const VoucherPlanCollectionBlock: React.FC<VoucherPlanCollectionBlockProps> = ({
  loading,
  error,
  voucherPlanCollection,
  onInsert,
  onUpdate,
}) => {
  if (loading) {
    return <Skeleton active />
  }

  if (error) {
    return <div>讀取錯誤</div>
  }

  const vouchers = voucherPlanCollection.map(voucherPlan => {
    return {
      ...voucherPlan,
      action: (
        <>
          <VoucherPlanDetailModal
            title={voucherPlan.title}
            productCounts={[]}
            voucherCodes={voucherPlan.voucherCodes.map(voucherCode => {
              return {
                ...voucherCode,
                used: voucherCode.count - voucherCode.remaining,
              }
            })}
          />

          <div className="flex-grow-1">
            數量 {voucherPlan.count - voucherPlan.remaining}/{voucherPlan.count}
          </div>

          <Dropdown
            trigger={['click']}
            overlay={
              <Menu>
                <Menu.Item>
                  <VoucherPlanAdminModal
                    renderTrigger={({ setVisible }) => <span onClick={() => setVisible(true)}>編輯方案</span>}
                    icon={<Icon type="edit" />}
                    title="編輯折價方案"
                    voucherPlan={voucherPlan}
                    onSubmit={(setVisible, setLoading, values) => {
                      onUpdate(setVisible, setLoading, values, voucherPlan.id)
                    }}
                  />
                </Menu.Item>
              </Menu>
            }
            placement="bottomRight"
          >
            <Icon type="more" className="cursor-pointer" />
          </Dropdown>
        </>
      ),
    }
  })

  return (
    <>
      <div className="mb-5">
        <VoucherPlanAdminModal
          renderTrigger={({ setVisible }) => (
            <Button type="primary" onClick={() => setVisible(true)} icon="file-add">
              建立兌換方案
            </Button>
          )}
          icon={<Icon type="file-add" />}
          title="建立兌換方案"
          onSubmit={onInsert}
        />
      </div>

      <VoucherCollectionTabs vouchers={vouchers} />
    </>
  )
}

export default VoucherPlanCollectionBlock
