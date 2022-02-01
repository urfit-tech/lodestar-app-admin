import { FileAddOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Checkbox, Form, Input, message, Radio } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import axios, { Canceler } from 'axios'
import BraftEditor, { EditorState } from 'braft-editor'
import gql from 'graphql-tag'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useRef, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { v4 as uuid } from 'uuid'
import hasura from '../../hasura'
import { handleError, uploadFile } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import { PeriodType } from '../../types/general'
import { ProjectPlan, ProjectPlanProduct, ProjectPlanType } from '../../types/project'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import ImageUploader from '../common/ImageUploader'
import AdminBraftEditor from '../form/AdminBraftEditor'
import CurrencyInput from '../form/CurrencyInput'
import CurrencySelector from '../form/CurrencySelector'
import PeriodSelector from '../form/PeriodSelector'
import SaleInput, { SaleProps } from '../form/SaleInput'
import ProjectPlanProductSelector from './ProjectPlanProductSelector'
import projectMessages from './translation'

const StyledNotation = styled.div`
  line-height: 1.5;
  letter-spacing: 0.4px;
  font-size: 14px;
  font-weight: 500;
  color: #9b9b9b;
  white-space: pre-line;
`

const messages = defineMessages({
  isPublished: { id: 'project.label.isPublished', defaultMessage: '是否開賣' },
  published: { id: 'project.label.published', defaultMessage: '發售，專案上架後立即開賣' },
  unPublished: { id: 'project.label.unPublished', defaultMessage: '停售，此方案暫停對外銷售，並從專案中隱藏' },
  isParticipantsVisible: { id: 'project.label.isParticipantsVisible', defaultMessage: '購買人數' },
  planDescription: { id: 'project.label.planDescription', defaultMessage: '方案描述' },
  saveProjectPlan: { id: 'project.ui.saveProjectPlan', defaultMessage: '儲存方案' },
})

type FieldProps = {
  title: string
  isPublished: boolean
  isParticipantsVisible: boolean
  period: { type: PeriodType; amount: number }
  autoRenewed: boolean
  currencyId: string
  listPrice: number
  sale: SaleProps
  discountDownPrice?: number
  description: EditorState
  planProducts: ProjectPlanProduct[]
}

const ProjectPlanAdminModal: React.FC<
  Omit<AdminModalProps, 'renderTrigger'> & {
    projectId: string
    projectPlan?: ProjectPlan
    onRefetch?: () => void
    onRefetchProjectPlanSorts?: () => void
    renderTrigger?: React.FC<{
      onOpen?: (projectPlanType: ProjectPlanType) => void
      onClose?: () => void
    }>
    isCreated?: boolean
  }
> = ({ projectId, projectPlan, onRefetch, onRefetchProjectPlanSorts, isCreated, renderTrigger, ...modalProps }) => {
  const [projectPlanType, setProjectPlanType] = useState<ProjectPlanType>()
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { id: appId, enabledModules } = useApp()
  const { authToken } = useAuth()
  const uploadCanceler = useRef<Canceler>()
  const [upsertProjectPlan] = useMutation<hasura.UPSERT_PROJECT_PLAN, hasura.UPSERT_PROJECT_PLANVariables>(
    UPSERT_PROJECT_PLAN,
  )

  const [updateProjectPlanCoverUrl] = useMutation<
    hasura.UPDATE_PROJECT_PLAN_COVER_URL,
    hasura.UPDATE_PROJECT_PLAN_COVER_URLVariables
  >(UPDATE_PROJECT_PLAN_COVER_URL)

  const [withDiscountDownPrice, setWithDiscountDownPrice] = useState(!!projectPlan?.discountDownPrice)
  const [loading, setLoading] = useState(false)
  const [coverImage, setCoverImage] = useState<File | null>(null)

  const withPeriod = projectPlanType === 'period' || projectPlanType === 'subscription'
  const withAutoRenewed = projectPlanType === 'subscription'

  const handleSubmit = (onSuccess: () => void) => {
    form
      .validateFields()
      .then(() => {
        setLoading(true)
        const values = form.getFieldsValue()
        upsertProjectPlan({
          variables: {
            projectPlanId: projectPlan?.id,
            data: {
              id: projectPlan?.id,
              project_id: projectId,
              title: values.title,
              published_at: values.isPublished ? new Date() : null,
              is_participants_visible: values.isParticipantsVisible,
              period_amount: withPeriod ? values.period.amount : null,
              period_type: withPeriod ? values.period.type : null,
              auto_renewed: withPeriod ? withAutoRenewed : false,
              is_subscription: withPeriod ? withAutoRenewed : false,
              currency_id: values.currencyId,
              list_price: values.listPrice,
              sale_price: values.sale ? values.sale.price : null,
              sold_at: values.sale?.soldAt || null,
              discount_down_price: withDiscountDownPrice ? values.discountDownPrice : 0,
              description: values.description.toRAW(),
              cover_url: projectPlan?.coverUrl ? projectPlan.coverUrl : null,
              project_plan_products: {
                data: values.planProducts.map(planProduct => ({
                  product_id: planProduct.id,
                  options: planProduct.options,
                })),
              },
            },
          },
        })
          .then(async ({ data }) => {
            const id = data?.insert_project_plan_one?.id
            if (coverImage) {
              const coverId = uuid()
              try {
                await uploadFile(`project_covers/${appId}/${projectId}/${id}/${coverId}`, coverImage, authToken, {
                  cancelToken: new axios.CancelToken(canceler => {
                    uploadCanceler.current = canceler
                  }),
                })
              } catch (error) {
                process.env.NODE_ENV === 'development' && console.log(error)
                return error
              }
              updateProjectPlanCoverUrl({
                variables: {
                  id: id,
                  coverUrl: `https://${process.env.REACT_APP_S3_BUCKET}/project_covers/${appId}/${projectId}/${id}/${coverId}`,
                },
              })
            }
          })
          .then(() => {
            message.success(formatMessage(commonMessages.event.successfullySaved))
            onSuccess()
            onRefetch?.()
            onRefetchProjectPlanSorts?.()
            isCreated && form.resetFields()
            isCreated && setCoverImage(null)
          })
          .catch(handleError)
          .finally(() => {
            setLoading(false)
          })
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
      // TODO: too nested to understand
      renderTrigger={({ setVisible }) => {
        return (
          renderTrigger?.({
            onOpen: projectPlanType => {
              setProjectPlanType(projectPlanType)
              setVisible(true)
            },
            onClose: () => setVisible(false),
          }) || null
        )
      }}
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
          isParticipantsVisible: !!projectPlan?.isParticipantsVisible,
          currencyId: projectPlan?.currencyId,
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
          planProducts: projectPlan?.products || [],
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

        <Form.Item label={<span>{formatMessage(projectMessages['*'].projectCover)}</span>}>
          <ImageUploader
            file={coverImage}
            initialCoverUrl={projectPlan ? projectPlan?.coverUrl : null}
            onChange={file => setCoverImage(file)}
          />
        </Form.Item>

        <Form.Item label={formatMessage(messages.isPublished)} name="isPublished">
          <Radio.Group>
            <Radio value={true} className="d-block">
              {formatMessage(messages.published)}
            </Radio>
            <Radio value={false} className="d-block">
              {formatMessage(messages.unPublished)}
            </Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item label={formatMessage(messages.isParticipantsVisible)} name="isParticipantsVisible">
          <Radio.Group>
            <Radio value={true} className="d-block">
              {formatMessage(commonMessages.status.visible)}
            </Radio>
            <Radio value={false} className="d-block">
              {formatMessage(commonMessages.status.invisible)}
            </Radio>
          </Radio.Group>
        </Form.Item>

        {withPeriod && (
          <Form.Item name="period" label={formatMessage(commonMessages.label.period)}>
            <PeriodSelector />
          </Form.Item>
        )}

        {enabledModules?.currency && (
          <Form.Item
            label={formatMessage(commonMessages.label.currency)}
            name="currencyId"
            rules={[
              {
                required: true,
                message: formatMessage(errorMessages.form.isRequired, {
                  field: formatMessage(commonMessages.label.listPrice),
                }),
              },
            ]}
          >
            <CurrencySelector />
          </Form.Item>
        )}

        <Form.Item
          label={formatMessage(commonMessages.label.listPrice)}
          name="listPrice"
          rules={[
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(commonMessages.label.listPrice),
              }),
            },
          ]}
        >
          <CurrencyInput noLabel />
        </Form.Item>

        <Form.Item
          name="sale"
          rules={[{ validator: (rule, value, callback) => callback(value && !value.soldAt ? '' : undefined) }]}
        >
          <SaleInput />
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
        <Form.Item name="planProducts" label={formatMessage(projectMessages.ProjectPlanAdminModal.deliverables)}>
          <ProjectPlanProductSelector />
        </Form.Item>
        <Form.Item label={formatMessage(messages.planDescription)} name="description">
          <AdminBraftEditor variant="short" />
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

const UPDATE_PROJECT_PLAN_COVER_URL = gql`
  mutation UPDATE_PROJECT_PLAN_COVER_URL($id: uuid!, $coverUrl: String) {
    update_project_plan(where: { id: { _eq: $id } }, _set: { cover_url: $coverUrl }) {
      affected_rows
    }
  }
`

const UPSERT_PROJECT_PLAN = gql`
  mutation UPSERT_PROJECT_PLAN($projectPlanId: uuid!, $data: project_plan_insert_input!) {
    delete_project_plan_product(where: { project_plan_id: { _eq: $projectPlanId } }) {
      affected_rows
    }
    insert_project_plan_one(
      object: $data
      on_conflict: {
        constraint: project_plan_pkey
        update_columns: [
          title
          cover_url
          title
          description
          currency_id
          list_price
          sale_price
          sold_at
          discount_down_price
          period_amount
          period_type
          is_participants_visible
          published_at
          auto_renewed
          is_subscription
        ]
      }
    ) {
      id
    }
  }
`
export default ProjectPlanAdminModal
