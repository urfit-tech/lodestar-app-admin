import { Button, DatePicker, Modal, Radio, Space, Typography } from 'antd'
import moment from 'moment'
import React, { useCallback, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'

import { DeleteModalInfo, DeleteType } from './openTimeSchedule.type'
import memberMessages from '../member/translation'

const EventInfo = styled.div`
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 24px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
  text-align: center;
`

const OptionsContainer = styled.div`
  margin-bottom: 24px;
`

const OptionRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
`

const HintText = styled.div`
  color: #999;
  font-size: 12px;
  margin-top: 16px;
  padding: 12px;
  background: #fafafa;
  border-radius: 4px;
`

interface DeleteOpenTimeModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (deleteType: DeleteType, untilDate?: Date) => Promise<void>
  eventInfo: DeleteModalInfo
  isLoading?: boolean
}

const DeleteOpenTimeModal: React.FC<DeleteOpenTimeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  eventInfo,
  isLoading = false,
}) => {
  const { formatMessage } = useIntl()

  const [deleteType, setDeleteType] = useState<DeleteType>('thisWeek')
  const [untilDate, setUntilDate] = useState<Date | null>(null)

  // 重置狀態
  const resetState = useCallback(() => {
    setDeleteType('thisWeek')
    setUntilDate(null)
  }, [])

  // 處理確認刪除
  const handleConfirm = useCallback(async () => {
    await onConfirm(deleteType, untilDate || undefined)
    resetState()
  }, [deleteType, untilDate, onConfirm, resetState])

  // 處理關閉
  const handleClose = useCallback(() => {
    resetState()
    onClose()
  }, [resetState, onClose])

  return (
    <Modal
      title={formatMessage(memberMessages.ui.removeOpenTime)}
      visible={isOpen}
      onCancel={handleClose}
      width={500}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          {formatMessage(memberMessages.ui.cancel)}
        </Button>,
        <Button
          key="confirm"
          type="primary"
          danger
          onClick={handleConfirm}
          loading={isLoading}
          disabled={deleteType === 'untilDate' && !untilDate}
        >
          {formatMessage(memberMessages.ui.confirmRemove)}
        </Button>,
      ]}
      destroyOnClose
    >
      <EventInfo>
        {eventInfo.dayLabel} {eventInfo.timeRange}
      </EventInfo>

      <OptionsContainer>
        <Radio.Group value={deleteType} onChange={e => setDeleteType(e.target.value)}>
          <Space direction="vertical">
            <OptionRow>
              <Radio value="thisWeek">{formatMessage(memberMessages.ui.removeThisWeek)}</Radio>
            </OptionRow>

            <OptionRow>
              <Radio value="untilDate">
                <Space>
                  <span>{formatMessage(memberMessages.ui.removeUntilDate)}</span>
                  <DatePicker
                    value={untilDate ? moment(untilDate) : null}
                    onChange={date => setUntilDate(date ? date.toDate() : null)}
                    disabled={deleteType !== 'untilDate'}
                    disabledDate={current => current && current < moment().startOf('day')}
                    placeholder={formatMessage(memberMessages.ui.selectDate)}
                  />
                </Space>
              </Radio>
            </OptionRow>

            <OptionRow>
              <Radio value="all">{formatMessage(memberMessages.ui.removeAll)}</Radio>
            </OptionRow>
          </Space>
        </Radio.Group>
      </OptionsContainer>

      <HintText>{formatMessage(memberMessages.ui.pastOpenTimeHint)}</HintText>
    </Modal>
  )
}

export default DeleteOpenTimeModal
