import { EditOutlined, FileAddOutlined, MoreOutlined } from '@ant-design/icons'
import { Button, Dropdown, Menu, message, Skeleton, Tabs } from 'antd'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import VoucherPlanAdminModal, { VoucherPlanFields } from '../../components/voucher/VoucherPlanAdminModal'
import VoucherPlanDetailModal from '../../components/voucher/VoucherPlanDetailModal'
import { useApp } from '../../contexts/AppContext'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages, promotionMessages } from '../../helpers/translation'
import { useMutateVoucherPlan, useVoucherPlanCollection } from '../../hooks/checkout'
import VoucherPlanCard from './VoucherPlanCard'

const VoucherPlanCollectionBlock: React.FC = () => {
  const { formatMessage } = useIntl()
  const { id: appId } = useApp()
  const { insertVoucherPlan, updateVoucherPlan } = useMutateVoucherPlan()
  const { loading, error, voucherPlanCollection, refetch } = useVoucherPlanCollection(appId)

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
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  if (loading) {
    return <Skeleton active />
  }

  if (error) {
    return <div>{formatMessage(errorMessages.data.fetch)}</div>
  }

  const voucherPlans = voucherPlanCollection.map(voucherPlan => {
    return {
      ...voucherPlan,
      action: (
        <>
          <VoucherPlanDetailModal id={voucherPlan.id} title={voucherPlan.title} />

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
                    icon={<EditOutlined />}
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
            <MoreOutlined className="cursor-pointer" />
          </Dropdown>
        </>
      ),
    }
  })

  const tabContents = [
    {
      key: 'available',
      tab: formatMessage(promotionMessages.status.available),
      voucherPlans: voucherPlans.filter(voucherPlan => voucherPlan.available),
    },
    {
      key: 'unavailable',
      tab: formatMessage(promotionMessages.status.unavailable),
      voucherPlans: voucherPlans.filter(voucherPlan => !voucherPlan.available),
    },
  ]

  return (
    <>
      <div className="mb-5">
        <VoucherPlanAdminModal
          renderTrigger={({ setVisible }) => (
            <Button type="primary" onClick={() => setVisible(true)} icon={<FileAddOutlined />}>
              {formatMessage(commonMessages.ui.create)}
            </Button>
          )}
          icon={<FileAddOutlined />}
          title={formatMessage(promotionMessages.ui.createVoucherPlan)}
          onSubmit={(setVisible, setLoading, values) => handleInsert(setVisible, setLoading, values)}
        />
      </div>

      <Tabs activeKey={activeKey} onChange={key => setActiveKey(key)}>
        {tabContents.map(tabContent => (
          <Tabs.TabPane key={tabContent.key} tab={tabContent.tab}>
            <div className="row">
              {tabContent.voucherPlans.map(voucherPlan => (
                <div key={voucherPlan.id} className="col-12 col-lg-6">
                  <VoucherPlanCard
                    id={voucherPlan.id}
                    title={voucherPlan.title}
                    startedAt={voucherPlan.startedAt}
                    endedAt={voucherPlan.endedAt}
                    productQuantityLimit={voucherPlan.productQuantityLimit}
                    available={voucherPlan.available}
                    action={voucherPlan.action}
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
