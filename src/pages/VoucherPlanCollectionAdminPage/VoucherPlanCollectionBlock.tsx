import { EditOutlined, MoreOutlined } from '@ant-design/icons'
import { Button, Dropdown, Menu, Skeleton } from 'antd'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { EmptyBlock } from '../../components/admin'
import VoucherPlanAdminModal from '../../components/voucher/VoucherPlanAdminModal'
import VoucherPlanCard from '../../components/voucher/VoucherPlanCard'
import hasura from '../../hasura'
import { useVoucherPlanCollection } from '../../hooks/checkout'
import pageMessages from '../translation'

const VoucherPlanCollectionBlock: React.VFC<{
  available: boolean
  condition: hasura.GET_VOUCHER_PLAN_COLLECTIONVariables['condition']
}> = ({ available, condition }) => {
  const { formatMessage } = useIntl()
  const [loadingMoreVoucherPlans, setLoadingMoreVoucherPlans] = useState(false)
  const {
    loading: loadingVoucherPlans,
    error,
    voucherPlans,
    refetch,
    loadMoreVoucherPlans,
  } = useVoucherPlanCollection(condition)

  if (loadingVoucherPlans) {
    return <Skeleton active />
  }

  if (error) {
    return <div>{formatMessage(pageMessages.VoucherPlanCollectionBlock.fetchDataError)}</div>
  }

  return (
    <>
      {voucherPlans.length === 0 ? (
        <EmptyBlock>{formatMessage(pageMessages.VoucherPlanCollectionBlock.emptyVoucherPlan)}</EmptyBlock>
      ) : (
        <div className="row">
          {voucherPlans.map(voucherPlan => (
            <div key={voucherPlan.id} className="col-12 col-lg-6">
              <VoucherPlanCard
                id={voucherPlan.id}
                title={voucherPlan.title}
                startedAt={voucherPlan.startedAt}
                endedAt={voucherPlan.endedAt}
                productQuantityLimit={voucherPlan.productQuantityLimit}
                available={available}
                isTransferable={voucherPlan.isTransferable}
                count={voucherPlan.count}
                remaining={voucherPlan.remaining}
                pinCode={voucherPlan.pinCode}
                bonusCoins={voucherPlan.bonusCoins}
                renderEditDropdown={
                  <Dropdown
                    trigger={['click']}
                    overlay={
                      <Menu>
                        <Menu.Item>
                          <VoucherPlanAdminModal
                            renderTrigger={({ setVisible }) => (
                              <span onClick={() => setVisible(true)}>
                                {formatMessage(pageMessages.VoucherPlanCollectionBlock.edit)}
                              </span>
                            )}
                            icon={<EditOutlined />}
                            title={formatMessage(pageMessages.VoucherPlanCollectionBlock.editVoucherPlan)}
                            voucherPlan={voucherPlan}
                            onRefetch={refetch}
                          />
                        </Menu.Item>
                      </Menu>
                    }
                    placement="bottomRight"
                  >
                    <MoreOutlined className="cursor-pointer" />
                  </Dropdown>
                }
              />
            </div>
          ))}

          {loadMoreVoucherPlans && (
            <div className="text-center" style={{ width: '100%' }}>
              <Button
                loading={loadingMoreVoucherPlans}
                onClick={() => {
                  setLoadingMoreVoucherPlans(true)
                  loadMoreVoucherPlans()?.finally(() => setLoadingMoreVoucherPlans(false))
                }}
              >
                {formatMessage(pageMessages.VoucherPlanCollectionBlock.showMore)}
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default VoucherPlanCollectionBlock
