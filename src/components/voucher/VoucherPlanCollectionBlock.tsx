import { Button, Dropdown, Icon, Menu, message, Skeleton, Tabs } from 'antd'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import VoucherPlanAdminModal, { VoucherPlanFields } from '../../components/voucher/VoucherPlanAdminModal'
import VoucherPlanDetailModal from '../../components/voucher/VoucherPlanDetailModal'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages, promotionMessages } from '../../helpers/translation'
import { useMutateVoucherPlan, useVoucherPlanCollection } from '../../hooks/checkout'
import VoucherCard from './VoucherCard'

const VoucherPlanCollectionBlock: React.FC = () => {
  const { formatMessage } = useIntl()
  const { insertVoucherPlan, updateVoucherPlan } = useMutateVoucherPlan()
  const { loading, error, voucherPlanCollection, refetch } = useVoucherPlanCollection()

  const [activeKey, setActiveKey] = useState('available')

  const handleInsert = (
    setVisible: React.Dispatch<React.SetStateAction<boolean>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    values: VoucherPlanFields,
  ) => {
    setLoading(true)

    insertVoucherPlan(values)
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullyCreated))
        setVisible(false)
        refetch()
      })
      .catch(error => {
        if (/^GraphQL error: Uniqueness violation/.test(error.message)) {
          message.error(formatMessage(errorMessages.event.duplicateVoucherCode))
        } else {
          handleError(error)
        }
      })
      .finally(() => setLoading(false))
  }

  const handleUpdate = (
    setVisible: React.Dispatch<React.SetStateAction<boolean>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    values: VoucherPlanFields,
    voucherPlanId: string,
  ) => {
    setLoading(true)

    updateVoucherPlan(values, voucherPlanId)
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
        setVisible(false)
        refetch()
      })
      .catch(error => {
        handleError(error)
        setLoading(false)
      })
      .finally(() => setLoading(false))
  }

  if (loading) {
    return <Skeleton active />
  }

  if (error) {
    return <div>{formatMessage(errorMessages.data.fetch)}</div>
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
            {formatMessage(promotionMessages.text.exchangedCount, {
              exchanged: voucherPlan.count - voucherPlan.remaining,
              total: voucherPlan.count,
            })}
          </div>

          <Dropdown
            trigger={['click']}
            overlay={
              <Menu>
                <Menu.Item>
                  <VoucherPlanAdminModal
                    renderTrigger={({ setVisible }) => (
                      <span onClick={() => setVisible(true)}>{formatMessage(commonMessages.ui.edit)}</span>
                    )}
                    icon={<Icon type="edit" />}
                    title={formatMessage(promotionMessages.ui.editVoucherPlan)}
                    voucherPlan={voucherPlan}
                    onSubmit={(setVisible, setLoading, values) =>
                      handleUpdate(setVisible, setLoading, values, voucherPlan.id)
                    }
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

  const tabContents = [
    {
      key: 'available',
      tab: formatMessage(promotionMessages.status.available),
      vouchers: vouchers.filter(voucher => voucher.available),
    },
    {
      key: 'unavailable',
      tab: formatMessage(promotionMessages.status.unavailable),
      vouchers: vouchers.filter(voucher => !voucher.available),
    },
  ]

  return (
    <>
      <div className="mb-5">
        <VoucherPlanAdminModal
          renderTrigger={({ setVisible }) => (
            <Button type="primary" onClick={() => setVisible(true)} icon="file-add">
              {formatMessage(commonMessages.ui.create)}
            </Button>
          )}
          icon={<Icon type="file-add" />}
          title={formatMessage(promotionMessages.ui.createVoucherPlan)}
          onSubmit={(setVisible, setLoading, values) => handleInsert(setVisible, setLoading, values)}
        />
      </div>

      <Tabs activeKey={activeKey} onChange={key => setActiveKey(key)}>
        {tabContents.map(tabContent => (
          <Tabs.TabPane key={tabContent.key} tab={tabContent.tab}>
            <div className="row">
              {tabContent.vouchers.map(voucher => (
                <div key={voucher.id} className="col-12 col-lg-6">
                  <VoucherCard
                    id={voucher.id}
                    title={voucher.title}
                    description={voucher.description}
                    startedAt={voucher.startedAt}
                    endedAt={voucher.endedAt}
                    productQuantityLimit={voucher.productQuantityLimit}
                    available={voucher.available}
                    extra={voucher.extra}
                    action={voucher.action}
                  />
                </div>
              ))}
            </div>
          </Tabs.TabPane>
        ))}
      </Tabs>
    </>
  )
}

export default VoucherPlanCollectionBlock
