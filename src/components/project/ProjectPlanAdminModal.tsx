import { FileAddOutlined } from '@ant-design/icons'
import { gql, useMutation } from '@apollo/client'
import { Button, Checkbox, Form, Input, message, Radio } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import axios, { Canceler } from 'axios'
import BraftEditor, { EditorState } from 'braft-editor'
import { isEmpty } from 'lodash'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { v4 as uuid } from 'uuid'
import hasura from '../../hasura'
import { getImageSizedUrl, handleError, isImageUrlResized, uploadFile } from '../../helpers'
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

const StyledUploadWarning = styled.div`
  color: var(--gray-dark);
  font-size: 14px;
  letter-spacing: 0.4px;
  height: 100%;
`

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
  const [upsertProjectPlanProducts] = useMutation<
    hasura.UPSERT_PROJECT_PLAN_PRODUCT,
    hasura.UPSERT_PROJECT_PLAN_PRODUCTVariables
  >(UPSERT_PROJECT_PLAN_PRODUCT)

  const [updateProjectPlanCoverUrl] = useMutation<
    hasura.UPDATE_PROJECT_PLAN_COVER_URL,
    hasura.UPDATE_PROJECT_PLAN_COVER_URLVariables
  >(UPDATE_PROJECT_PLAN_COVER_URL)

  const [withDiscountDownPrice, setWithDiscountDownPrice] = useState(!!projectPlan?.discountDownPrice)
  const [loading, setLoading] = useState(false)
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [isUseOriginSizeCoverImage, setIsUseOriginSizeCoverImage] = useState(
    projectPlan?.coverUrl === '' || !projectPlan?.coverUrl ? false : !isImageUrlResized(projectPlan.coverUrl),
  )

  const withPeriod = projectPlanType === 'period' || projectPlanType === 'subscription'
  const withAutoRenewed = projectPlanType === 'subscription'
  const coverUrl = projectPlan?.coverUrl || ''

  const handleSubmit = (onSuccess: () => void) => {
    form
      .validateFields()
      .then(() => {
        setLoading(true)
        const values = form.getFieldsValue()
        upsertProjectPlan({
          variables: {
            data: {
              id: projectPlan?.id,
              project_id: projectId,
              title: values.title || '',
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
              cover_url: coverUrl ? coverUrl : null,
            },
          },
        })
          .then(async ({ data }) => {
            const projectPlanId = data?.insert_project_plan_one?.id
            if (projectPlanId && values.planProducts) {
              try {
                await upsertProjectPlanProducts({
                  variables: {
                    projectPlanId,
                    data: values.planProducts.map(planProduct => ({
                      project_plan_id: projectPlanId,
                      product_id: planProduct.id,
                      options: planProduct.options,
                    })),
                  },
                })
              } catch (error) {
                process.env.NODE_ENV === 'development' && console.log(error)
              }
            }
            const coverId = uuid()
            if (coverImage) {
              try {
                await uploadFile(
                  `project_covers/${appId}/${projectId}/${projectPlanId}/${coverId}`,
                  coverImage,
                  authToken,
                  {
                    cancelToken: new axios.CancelToken(canceler => {
                      uploadCanceler.current = canceler
                    }),
                  },
                )
              } catch (error) {
                process.env.NODE_ENV === 'development' && console.log(error)
              }
            }
            const uploadCoverUrl = getImageSizedUrl(
              isUseOriginSizeCoverImage,
              coverImage
                ? `https://${process.env.REACT_APP_S3_BUCKET}/project_covers/${appId}/${projectId}/${projectPlanId}/${coverId}`
                : coverUrl,
            )
            await updateProjectPlanCoverUrl({
              variables: {
                id: projectPlanId,
                coverUrl: uploadCoverUrl,
              },
            })
          })
          .then(() => {
            message.success(formatMessage(commonMessages.event.successfullySaved))
            onSuccess()
            onRefetch?.()
            onRefetchProjectPlanSorts?.()
            isCreated && form.resetFields()
            setCoverImage(null)
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
            {formatMessage(projectMessages.ProjectPlanAdminModal.saveProjectPlan)}
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
          title: projectPlan?.title || '',
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
          <div className="d-flex align-items-center">
            <ImageUploader
              file={coverImage}
              initialCoverUrl={projectPlan ? coverUrl : null}
              onChange={file => {
                setCoverImage(file)
                setIsUseOriginSizeCoverImage(false)
              }}
            />
            {(!isEmpty(coverUrl) || coverImage) && (
              <Checkbox
                className="ml-2"
                checked={isUseOriginSizeCoverImage}
                onChange={e => {
                  setIsUseOriginSizeCoverImage(e.target.checked)
                }}
              >
                {formatMessage(projectMessages.ProjectPlanAdminModal.showOriginSize)}
              </Checkbox>
            )}
            {coverImage && (
              <StyledUploadWarning className="ml-2">
                {formatMessage(projectMessages.ProjectPlanAdminModal.notUploaded)}
              </StyledUploadWarning>
            )}
          </div>
        </Form.Item>

        <Form.Item label={formatMessage(projectMessages.ProjectPlanAdminModal.isPublished)} name="isPublished">
          <Radio.Group>
            <Radio value={true} className="d-block">
              {formatMessage(projectMessages.ProjectPlanAdminModal.published)}
            </Radio>
            <Radio value={false} className="d-block">
              {formatMessage(projectMessages.ProjectPlanAdminModal.unPublished)}
            </Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label={formatMessage(projectMessages.ProjectPlanAdminModal.isParticipantsVisible)}
          name="isParticipantsVisible"
        >
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
        {enabledModules.project_auto_delivery && (
          <Form.Item name="planProducts" label={formatMessage(projectMessages.ProjectPlanAdminModal.deliverables)}>
            <ProjectPlanProductSelector />
          </Form.Item>
        )}
        <Form.Item label={formatMessage(projectMessages.ProjectPlanAdminModal.planDescription)} name="description">
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
  mutation UPSERT_PROJECT_PLAN($data: project_plan_insert_input!) {
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

const UPSERT_PROJECT_PLAN_PRODUCT = gql`
  mutation UPSERT_PROJECT_PLAN_PRODUCT($projectPlanId: uuid, $data: [project_plan_product_insert_input!]!) {
    delete_project_plan_product(where: { project_plan_id: { _eq: $projectPlanId } }) {
      affected_rows
    }
    insert_project_plan_product(
      objects: $data
      on_conflict: { constraint: project_plan_product_project_plan_id_product_id_key, update_columns: [options] }
    ) {
      affected_rows
    }
  }
`

export default ProjectPlanAdminModal
