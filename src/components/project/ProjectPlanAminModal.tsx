import { FileAddOutlined } from '@ant-design/icons'
import { Button, Checkbox, Form, Input, Radio } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import BraftEditor, { EditorState } from 'braft-editor'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { useApp } from '../../contexts/AppContext'
import { commonMessages, errorMessages, projectMessages } from '../../helpers/translation'
import { PeriodType } from '../../types/general'
import { ProjectPlanProps } from '../../types/project'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import AdminBraftEditor from '../form/AdminBraftEditor'
import CurrencyInput from '../form/CurrencyInput'
import ImageInput from '../form/ImageInput'
import PeriodSelector from '../form/PeriodSelector'
import SaleInput, { SaleProps } from '../form/SaleInput'

const StyledNotation = styled.div`
  line-height: 1.5;
  letter-spacing: 0.4px;
  font-size: 14px;
  font-weight: 500;
  color: #9b9b9b;
  white-space: pre-line;
`

const messages = defineMessages({
  isContinued: { id: 'project.label.isContinued', defaultMessage: '是否開賣' },
  continued: { id: 'project.label.continued', defaultMessage: '發售，專案上架後立即開賣' },
  discontinued: { id: 'project.label.discontinued', defaultMessage: '停售，此方案暫停對外銷售，並從專案中隱藏' },
  numberOfPurchases: { id: 'project.label.numberOfPurchases', defaultMessage: '購買人數' },
  planDescription: { id: 'project.label.planDescription', defaultMessage: '方案描述' },
  saveProjectPlan: { id: 'project.ui.saveProjectPlan', defaultMessage: '儲存方案' },
})

type FieldProps = {
  title: string
  isPublished: boolean
  period: { type: PeriodType; amount: number }
  listPrice: number
  sale: SaleProps
  discountDownPrice?: number
  description: EditorState
}

const ProjectPlanAdminModal: React.FC<
  AdminModalProps & {
    projectId: string
    projectPlan?: ProjectPlanProps
    onRefetch?: () => void
  }
> = ({ projectId, projectPlan, onRefetch, ...modalProps }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { id: appId } = useApp()
  // const [upsertProjectPlan] = useMutation<types.UPSERT_PROJECT_PLAN, types.UPSERT_PROJECT_PLANVariables>(
  //   UPSERT_PROJECT_PLAN,
  // )

  const [withDiscountDownPrice, setWithDiscountDownPrice] = useState(!!projectPlan?.discountDownPrice)
  const [withPeriod, setWithPeriod] = useState(!!(projectPlan?.periodAmount && projectPlan?.periodType))
  const [withAutoRenewed, setWithAutoRenewed] = useState(!!projectPlan?.autoRenewed)

  const [loading, setLoading] = useState(false)

  const handleUpdateCover = () => {
    setLoading(true)
    const uploadTime = Date.now()
    // updateProjectPlanCover({
    //   variables: {
    //     projectPlanId: projectPlan.id,
    //     coverUrl: `https://${process.env.REACT_APP_S3_BUCKET}/project_covers/${appId}/${project.id}?t=${uploadTime}`,
    //   },
    // })
    //   .then(() => {
    //     message.success(formatMessage(commonMessages.event.successfullySaved))
    //     onRefetch?.()
    //   })
    //   .catch(handleError)
    //   .finally(() => setLoading(false))
  }

  const handleSubmit = (onSuccess: () => void) => {
    form
      .validateFields()
      .then(() => {
        setLoading(true)
        const values = form.getFieldsValue()
        // upsertProjectPlan({
        //   variables: {
        //     id: projectPlan ? projectPlan.id : uuid(),
        //     projectId,
        //     title: values.title,
        //     description: values.description.toRAW(),
        //     listPrice: values.listPrice,
        //     salePrice: values.sale ? values.sale.price : null,
        //     soldAt: values.sale?.soldAt || null,
        //     discountDownPrice: withDiscountDownPrice ? values.discountDownPrice : 0,
        //     periodAmount: withPeriod ? values.period.amount : null,
        //     periodType: withPeriod ? values.period.type : null,
        //     autoRenewed: withPeriod ? withAutoRenewed : false,
        //     publishedAt: values.isPublished ? new Date() : null,
        //     isCountdownTimerVisible: !!values.sale?.isTimerVisible,
        //   },
        // })
        //   .then(() => {
        //     message.success(formatMessage(commonMessages.event.successfullySaved))
        //     onSuccess()
        //     onRefetch?.()
        //   })
        //   .catch(handleError)
        //   .finally(() => setLoading(false))
      })
      .catch(() => {})
  }
  return (
    <AdminModal
      title={formatMessage(commonMessages.label.salesPlan)}
      icon={<FileAddOutlined />}
      footer={null}
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={() => setVisible(false)}>
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleSubmit(() => setVisible(false))}>
            {formatMessage(messages.saveProjectPlan)}
          </Button>
        </>
      )}
      {...modalProps}
    >
      <Form
        form={form}
        layout="vertical"
        colon={false}
        hideRequiredMark
        initialValues={{
          title: projectPlan?.title,
          isPublished: !!projectPlan?.publishedAt,
          listPrice: projectPlan?.listPrice,
          sale: projectPlan?.soldAt
            ? {
                price: projectPlan.salePrice,
                soldAt: projectPlan.soldAt,
              }
            : null,
          period: { amount: projectPlan?.periodAmount || 1, type: projectPlan?.periodType || 'M' },
          discountDownPrice: projectPlan?.discountDownPrice,
          description: BraftEditor.createEditorState(projectPlan ? projectPlan.description : null),
        }}
      >
        <Form.Item
          label={formatMessage(commonMessages.label.planTitle)}
          name="title"
          rules={[
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(commonMessages.label.planTitle),
              }),
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item label={<span>{formatMessage(projectMessages.label.projectCover)}</span>}>
          <ImageInput
            path={`project_plan_covers/${appId}/`}
            image={{
              width: '160px',
              ratio: 9 / 16,
              shape: 'rounded',
            }}
            value={projectPlan?.coverUrl}
            onChange={() => handleUpdateCover()}
          />
        </Form.Item>

        <Form.Item label={formatMessage(messages.isContinued)} name="isOnSale">
          <Radio.Group>
            <Radio value={true} className="d-block">
              {formatMessage(messages.continued)}
            </Radio>
            <Radio value={false} className="d-block">
              {formatMessage(messages.discontinued)}
            </Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item label={formatMessage(messages.numberOfPurchases)} name="isPublished">
          <Radio.Group>
            <Radio value={true} className="d-block">
              {formatMessage(commonMessages.status.visible)}
            </Radio>
            <Radio value={false} className="d-block">
              {formatMessage(commonMessages.status.invisible)}
            </Radio>
          </Radio.Group>
        </Form.Item>

        <div className="mb-4">
          <Checkbox defaultChecked={withPeriod} onChange={e => setWithPeriod(e.target.checked)}>
            {formatMessage(commonMessages.label.period)}
          </Checkbox>
        </div>

        {withPeriod && (
          <Form.Item name="period">
            <PeriodSelector />
          </Form.Item>
        )}
        {withPeriod && (
          <div className="mb-4">
            <Checkbox checked={withAutoRenewed} onChange={e => setWithAutoRenewed(e.target.checked)}>
              {formatMessage(commonMessages.label.autoRenewed)}
            </Checkbox>
          </div>
        )}

        <Form.Item label={formatMessage(commonMessages.term.listPrice)} name="listPrice">
          <CurrencyInput noLabel />
        </Form.Item>

        <Form.Item
          name="sale"
          rules={[{ validator: (rule, value, callback) => callback(value && !value.soldAt ? '' : undefined) }]}
        >
          <SaleInput withTimer />
        </Form.Item>

        {withPeriod && withAutoRenewed && (
          <div className="mb-4">
            <Checkbox defaultChecked={withDiscountDownPrice} onChange={e => setWithDiscountDownPrice(e.target.checked)}>
              {formatMessage(commonMessages.label.discountDownPrice)}
            </Checkbox>
            {withDiscountDownPrice && (
              <StyledNotation>{formatMessage(commonMessages.text.discountDownNotation)}</StyledNotation>
            )}
          </div>
        )}
        {withPeriod && withAutoRenewed && withDiscountDownPrice && (
          <Form.Item name="discountDownPrice">
            <CurrencyInput noLabel />
          </Form.Item>
        )}

        <Form.Item label={formatMessage(messages.planDescription)} name="description">
          <AdminBraftEditor variant="short" />
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

// const UPSERT_PROJECT_PLAN = gql`
//   mutation UPSERT_PROJECT_PLAN(
//     $id: uuid!
//     $projectId: uuid!
//     $coverUrl: String!
//     $title: String!
//     $description: String!
//     $listPrice: numeric!
//     $salePrice: numeric
//     $soldAt: timestamptz
//     $discountDownPrice: numeric!
//     $isSubscription: boolean
//     $periodAmount: numeric
//     $periodType: String
//     $position: numeric
//     $isParticipantsVisible: boolean
//     $isPhysical: boolean
//      $isLimited: boolean
//     $publishedAt: Date | null
//     $autoRenewed: boolean
//   ) {
//     insert_project_plan(
//       objects: {
//         id: $id
//         project_id: $projectId
//         coverUrl: $coverUrl
//         title: $title
//         description: $description
//         list_price: $listPrice
//         sale_price: $salePrice
//         soldAt: $soldAt
//         discount_down_price: $discountDownPrice
//         is_subscription: $isSubscription
//         period_amount: $periodAmount
//         period_type: $periodType
//         position: $position
//         is_participants_visible: $isParticipantsVisible
//         is_physical: $isPhysical
//         published_at: $publishedAt
//         auto_renewed: $autoRenewed
//       }
//         constraint: project_plan_pkey
//         update_columns: [
//           type
//           title
//           description
//           list_price
//           sale_price
//           discount_down_price
//           period_amount
//           period_type
//           sold_at
//           currency_ida
//           published_at
//           auto_renewed
//         ]
//       }
//     ) {
//       affected_rows
//     }
//   }
// `
export default ProjectPlanAdminModal
