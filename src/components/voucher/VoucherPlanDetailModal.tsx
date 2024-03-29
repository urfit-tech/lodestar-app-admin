import { DeleteOutlined, DownloadOutlined } from '@ant-design/icons'
import { gql, useMutation } from '@apollo/client'
import { Button, message, Modal, Tabs } from 'antd'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { downloadCSV, handleError, toCSV } from '../../helpers'
import { commonMessages, promotionMessages } from '../../helpers/translation'
import { useVoucherCode, useVouchersStatus } from '../../hooks/checkout'
import AdminModal from '../admin/AdminModal'

const StyledTriggerText = styled.span`
  color: ${props => props.theme['@primary-color']};
  font-size: 14px;
  cursor: pointer;
`
const StyledTitle = styled.div`
  color: var(--gray-darker);
  font-size: 20px;
  font-weight: bold;
  line-height: 1.3;
  letter-spacing: 0.77px;
`
const StyledVoucherCodeAmountBlock = styled.div`
  display: flex;
  align-items: center;
`

const StyledVoucherCode = styled.div<{ isFinished: boolean }>`
  color: ${props => (props.isFinished ? 'var(--gray)' : 'var(--gray-darker)')};
  &:hover {
    background-color: rgba(76, 91, 143, 0.1);
  }
`

type VoucherPlanDetailModalProps = {
  id: string
  title: string
}
const VoucherPlanDetailModal: React.FC<VoucherPlanDetailModalProps> = ({ id, title }) => {
  const { formatMessage } = useIntl()
  const [visible, setVisible] = useState(false)

  return (
    <>
      <StyledTriggerText className="mr-4" onClick={() => setVisible(true)}>
        {formatMessage(commonMessages.ui.detail)}
      </StyledTriggerText>

      <Modal centered destroyOnClose footer={null} visible={visible} onCancel={() => setVisible(false)}>
        <VoucherPlanDetailBlock title={title} voucherPlanId={id} />
      </Modal>
    </>
  )
}

const VoucherPlanDetailBlock: React.FC<{ title: string; voucherPlanId: string }> = ({ title, voucherPlanId }) => {
  const { formatMessage } = useIntl()
  const { loadingVoucherCodes, errorVoucherCodes, voucherCodes, refetchVoucherCodes } = useVoucherCode(voucherPlanId)
  const vouchersStatus = useVouchersStatus(voucherPlanId)
  const [archiveVoucherCode] = useMutation<hasura.ARCHIVE_VOUCHER_CODE, hasura.ARCHIVE_VOUCHER_CODEVariables>(
    ARCHIVE_VOUCHER_CODE,
  )
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [activeKey, setActiveKey] = useState('codes')
  const { permissions } = useAuth()

  const mergedVoucherCodes = voucherCodes.map(voucherCode => ({
    ...voucherCode,
    vouchers: voucherCode.vouchers.map(voucher => ({
      ...voucher,
      used: vouchersStatus.data.find(voucherStatusVoucher => voucherStatusVoucher.id === voucher.id)?.used ?? false,
    })),
  }))

  const exportCodes = () => {
    const data: string[][] = [
      [formatMessage(promotionMessages.label.couponCodes), formatMessage(promotionMessages.status.used), 'Email'],
    ]

    mergedVoucherCodes.forEach(voucherCode => {
      voucherCode.vouchers.forEach(voucher => {
        data.push([voucherCode.code, voucher.used ? 'v' : '', voucher.memberEmail])
      })

      if (voucherCode.remaining) {
        for (let i = 0; i < voucherCode.remaining; i++) {
          data.push([voucherCode.code, '', ''])
        }
      }
    })

    downloadCSV(`${title}.csv`, toCSV(data))
  }

  const handleDeleteVoucherCode = (voucherCodeId: string, setVisible: (visible: boolean) => void) => {
    setDeleteLoading(true)
    archiveVoucherCode({ variables: { voucherCodeId: voucherCodeId } })
      .then(() => {
        refetchVoucherCodes()
        message.success(formatMessage(promotionMessages.message.successDeletedVoucherCode), 3)
      })
      .catch(handleError)
      .finally(() => {
        setDeleteLoading(false)
        setVisible(false)
      })
  }

  return (
    <>
      <StyledTitle className="mb-4">{title}</StyledTitle>

      <Button
        type="primary"
        icon={<DownloadOutlined />}
        className="mb-4"
        onClick={exportCodes}
        loading={!!(loadingVoucherCodes || errorVoucherCodes || vouchersStatus.loading || vouchersStatus.error)}
      >
        {formatMessage(promotionMessages.ui.exportCodes)}
      </Button>

      <Tabs activeKey={activeKey} onChange={key => setActiveKey(key)}>
        <Tabs.TabPane key="codes" tab={formatMessage(promotionMessages.label.voucherCode)} className="pt-4">
          {mergedVoucherCodes.map(voucherCode => (
            <StyledVoucherCode
              key={voucherCode.code}
              className="d-flex justify-content-between mb-2"
              isFinished={voucherCode.used === voucherCode.count}
            >
              <code>{voucherCode.code}</code>
              <StyledVoucherCodeAmountBlock>
                {formatMessage(promotionMessages.text.exchangedCount, {
                  exchanged: voucherCode.count - voucherCode.remaining,
                  total: voucherCode.count,
                })}
                <AdminModal
                  renderTrigger={({ setVisible }) =>
                    Boolean(permissions.VOUCHER_PLAN_ADMIN) || Boolean(permissions.VOUCHER_PLAN_ADMIN_DELETE) ? (
                      <DeleteOutlined className="ml-4" onClick={() => setVisible(true)} />
                    ) : (
                      <></>
                    )
                  }
                  title={formatMessage(
                    voucherCode.vouchers.some(voucher => voucher.used)
                      ? promotionMessages.label.canNotDeleteVoucherCode
                      : promotionMessages.label.deleteVoucherCode,
                  )}
                  footer={null}
                  renderFooter={({ setVisible }) =>
                    voucherCode.vouchers.some(voucher => voucher.used) ? (
                      <Button
                        type="primary"
                        loading={deleteLoading}
                        onClick={() => {
                          setVisible(false)
                        }}
                      >
                        {formatMessage(commonMessages.ui.confirm)}
                      </Button>
                    ) : (
                      <div>
                        <Button
                          className="mr-2"
                          onClick={() => {
                            setVisible(false)
                          }}
                        >
                          {formatMessage(commonMessages.ui.cancel)}
                        </Button>
                        <Button
                          type="primary"
                          danger={true}
                          loading={deleteLoading}
                          onClick={() => {
                            handleDeleteVoucherCode(voucherCode.id, setVisible)
                          }}
                        >
                          {formatMessage(commonMessages.ui.delete)}
                        </Button>
                      </div>
                    )
                  }
                >
                  <p className="mb-4">
                    {voucherCode.vouchers.some(voucher => voucher.used)
                      ? formatMessage(promotionMessages.text.codeUsedMessage, {
                          voucherCode: voucherCode.code,
                        })
                      : formatMessage(promotionMessages.text.deleteCodeMessage, {
                          voucherCode: voucherCode.code,
                        })}
                  </p>
                </AdminModal>
              </StyledVoucherCodeAmountBlock>
            </StyledVoucherCode>
          ))}
        </Tabs.TabPane>
      </Tabs>
    </>
  )
}

const ARCHIVE_VOUCHER_CODE = gql`
  mutation ARCHIVE_VOUCHER_CODE($voucherCodeId: uuid!) {
    update_voucher_code(where: { id: { _eq: $voucherCodeId } }, _set: { deleted_at: "now()" }) {
      affected_rows
    }
  }
`

export default VoucherPlanDetailModal
