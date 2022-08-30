import { Button, Form, Input, Radio, Space } from 'antd'
import { FormInstance, useForm } from 'antd/lib/form/Form'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { v4 as uuid } from 'uuid'
import { commonMessages, promotionMessages } from '../../helpers/translation'
import pageMessages from '../../pages/translation'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'

const StyledTitle = styled.div`
  color: var(--gray-darker);
  line-height: normal;
  letter-spacing: 0.2px;
  cursor: pointer;
`

type GiftPlanFields = {
  giftPlanTitle: string
  giftName: string
  shipping: string
}

const GiftPlanCollectionEditAdminModal: React.VFC<
  AdminModalProps & {
    createGiftPlanForm?: FormInstance
    giftPlanId?: string
    onRefetch?: () => void
  }
> = ({ createGiftPlanForm, giftPlanId, onRefetch, ...props }) => {
  const { formatMessage } = useIntl()
  const { id: appId } = useApp()
  const [form] = useForm<GiftPlanFields>()
  const [loading, setLoading] = useState(false)
  const [shipping, setShipping] = useState('deliver')
  const coverId = uuid()

  const handleEdit = (id: string, setVisible: (visible: boolean) => void) => {
    setLoading(true)
    console.log(id)
    setLoading(false)
    setVisible(false)
  }

  return (
    <AdminModal
      renderTrigger={({ setVisible }) => (
        <StyledTitle className="flex-grow-1" onClick={() => setVisible(true)}>
          大麥克
        </StyledTitle>
      )}
      title={formatMessage(pageMessages['GiftPlanCollectionAdminPage'].editGiftPlan)}
      footer={null}
      renderFooter={({ setVisible }) => (
        <div>
          <Button
            className="mr-2"
            onClick={() => {
              setVisible(false)
            }}
          >
            {formatMessage(commonMessages['ui'].cancel)}
          </Button>
          <Button
            type="primary"
            loading={loading}
            onClick={() => {
              giftPlanId && handleEdit(giftPlanId, setVisible)
            }}
          >
            {formatMessage(commonMessages['ui'].save)}
          </Button>
        </div>
      )}
      {...props}
    >
      <Form
        form={createGiftPlanForm || form}
        layout="vertical"
        colon={false}
        hideRequiredMark
        initialValues={{
          giftPlanTitle: '',
          giftName: '',
          shipping: shipping,
        }}
      >
        <Form.Item
          label={formatMessage(pageMessages['GiftPlanCollectionAdminPage'].giftPlanTitle)}
          name="giftPlanTitle"
          rules={[
            {
              required: true,
              message: formatMessage(promotionMessages['*'].isRequired, {
                field: formatMessage(pageMessages['GiftPlanCollectionAdminPage'].giftPlanTitle),
              }),
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={formatMessage(pageMessages['GiftPlanCollectionAdminPage'].giftItemName)}
          name="giftName"
          rules={[
            {
              required: true,
              message: formatMessage(promotionMessages['*'].isRequired, {
                field: formatMessage(pageMessages['GiftPlanCollectionAdminPage'].giftItemName),
              }),
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={
            <span className="d-flex align-items-center">
              {formatMessage(pageMessages['GiftPlanCollectionAdminPage'].giftPlanCover)}
              {/* <Tooltip
                placement="top"
                title={<StyledTips>{formatMessage(podcastMessages.text.podcastCoverTips)}</StyledTips>}
              >
                <QuestionCircleFilled className="ml-2" />
              </Tooltip> */}
            </span>
          }
        >
          {/* <ImageInput
            path={`gift_plan_covers/${appId}/${podcastProgramAdmin.id}/${coverId}`}
            image={{
              width: '120px',
              ratio: 1,
            }}
            value={podcastProgramAdmin.coverUrl}
            onChange={() => handleUpload()}
          /> */}
        </Form.Item>
        <Form.Item name="shipping">
          <Radio.Group onChange={e => setShipping(e.target.value)} value={shipping}>
            <Space direction="vertical">
              <Radio value="deliver">{formatMessage(pageMessages['GiftPlanCollectionAdminPage'].deliver)}</Radio>
              <Radio value="online">{formatMessage(pageMessages['GiftPlanCollectionAdminPage'].online)}</Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

export default GiftPlanCollectionEditAdminModal
