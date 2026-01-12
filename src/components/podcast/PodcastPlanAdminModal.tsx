import { FileAddOutlined } from '@ant-design/icons'
import { gql, useMutation } from '@apollo/client'
import { Button, Form, InputNumber, Radio } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages, podcastMessages } from '../../helpers/translation'
import { PeriodType } from '../../types/general'
import { PodcastPlanProps } from '../../types/podcast'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import ContentCreatorSelector from '../form/ContentCreatorSelector'
import PeriodSelector from '../form/PeriodSelector'
import SaleInput, { SaleProps } from '../form/SaleInput'

const messages = defineMessages({
  planPublished: { id: 'podcast.status.planPublished', defaultMessage: '發佈，立刻開賣訂閱方案' },
  planNotPublished: {
    id: 'podcast.status.planNotPublished',
    defaultMessage: '停售，方案暫停對外銷售，並從廣播頁中隱藏',
  },
})

type FieldProps = {
  creatorId?: string
  isPublished: boolean
  period: {
    type: PeriodType
    amount: number
  }
  listPrice: number
  sale: SaleProps
}

const PodcastPlanAdminModal: React.FC<
  AdminModalProps & {
    podcastPlan?: PodcastPlanProps
    onRefetch?: () => Promise<any>
  }
> = ({ podcastPlan, onRefetch, ...props }) => {
  const { formatMessage } = useIntl()
  const { currentMemberId, currentUserRole } = useAuth()
  const [form] = useForm<FieldProps>()
  const [createPodcastPlan] = useMutation<hasura.CREATE_PODCAST_PLAN, hasura.CREATE_PODCAST_PLANVariables>(
    CREATE_PODCAST_PLAN,
  )
  const [updatePodcastPlan] = useMutation<hasura.UPDATE_PODCAST_PLAN, hasura.UPDATE_PODCAST_PLANVariables>(
    UPDATE_PODCAST_PLAN,
  )
  const [loading, setLoading] = useState(false)

  const handleSubmit = (setVisible: React.Dispatch<React.SetStateAction<boolean>>) => {
    form
      .validateFields()
      .then(() => {
        setLoading(true)
        const values = form.getFieldsValue()
        if (podcastPlan) {
          updatePodcastPlan({
            variables: {
              podcastPlanId: podcastPlan.id,
              publishedAt: values.isPublished ? new Date() : null,
              listPrice: values.listPrice,
              salePrice: values.sale ? values.sale.price : null,
              soldAt: values.sale?.soldAt || null,
              periodAmount: values.period?.amount || 1,
              periodType: values.period?.type || 'D',
              creatorId: values.creatorId || currentMemberId || '',
            },
          })
            .then(() => onRefetch?.().then(() => setVisible(false)))
            .catch(handleError)
            .finally(() => setLoading(false))
        } else {
          createPodcastPlan({
            variables: {
              publishedAt: values.isPublished ? new Date() : null,
              listPrice: values.listPrice,
              salePrice: values.sale?.price || null,
              soldAt: values.sale?.soldAt || null,
              periodAmount: values.period?.amount || 1,
              periodType: values.period?.type || 'D',
              creatorId: values.creatorId || currentMemberId || '',
            },
          })
            .then(() => onRefetch?.().then(() => setVisible(false)))
            .catch(handleError)
            .finally(() => setLoading(false))
        }
      })
      .catch(() => {})
  }

  return (
    <AdminModal
      icon={<FileAddOutlined />}
      title={formatMessage(podcastMessages.label.podcastPlan)}
      footer={null}
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={() => setVisible(false)}>
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleSubmit(setVisible)}>
            {podcastPlan ? formatMessage(commonMessages.ui.save) : formatMessage(commonMessages.ui.create)}
          </Button>
        </>
      )}
      {...props}
    >
      <Form
        form={form}
        layout="vertical"
        colon={false}
        hideRequiredMark
        initialValues={{
          creatorId: podcastPlan?.creatorId || '',
          isPublished: !!podcastPlan?.publishedAt,
          period: {
            amount: podcastPlan?.periodAmount || 1,
            type: podcastPlan?.periodType || 'D',
          },
          listPrice: podcastPlan?.listPrice || 0,
          sale: podcastPlan?.soldAt
            ? {
                price: podcastPlan.salePrice || 0,
                soldAt: podcastPlan.soldAt,
              }
            : null,
        }}
      >
        {currentUserRole === 'app-owner' && (
          <Form.Item
            label={formatMessage(commonMessages.label.selectInstructor)}
            name="creatorId"
            rules={[{ required: true, message: formatMessage(errorMessages.form.selectInstructor) }]}
          >
            <ContentCreatorSelector />
          </Form.Item>
        )}

        <Form.Item
          label={formatMessage(commonMessages.label.sellingStatus)}
          name="isPublished"
          rules={[{ required: true }]}
        >
          <Radio.Group>
            <Radio value={true}>{formatMessage(messages.planPublished)}</Radio>
            <Radio value={false}>{formatMessage(messages.planNotPublished)}</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          label={formatMessage(commonMessages.label.periodType)}
          name="period"
          rules={[
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(commonMessages.label.periodType),
              }),
            },
          ]}
        >
          <PeriodSelector />
        </Form.Item>
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
            { type: 'number' },
          ]}
        >
          <InputNumber
            min={0}
            formatter={value => `NT$ ${value}`}
            parser={value => (value ? value.replace(/\D/g, '') : '')}
          />
        </Form.Item>

        <Form.Item
          name="sale"
          rules={[{ validator: (rule, value, callback) => callback(value && !value.soldAt ? '' : undefined) }]}
        >
          <SaleInput />
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

const CREATE_PODCAST_PLAN = gql`
  mutation CREATE_PODCAST_PLAN(
    $publishedAt: timestamptz
    $listPrice: numeric!
    $salePrice: numeric
    $soldAt: timestamptz
    $periodAmount: numeric!
    $periodType: String!
    $creatorId: String!
  ) {
    insert_podcast_plan(
      objects: {
        is_subscription: true
        published_at: $publishedAt
        title: ""
        list_price: $listPrice
        sale_price: $salePrice
        sold_at: $soldAt
        period_amount: $periodAmount
        period_type: $periodType
        creator_id: $creatorId
      }
    ) {
      affected_rows
    }
  }
`
const UPDATE_PODCAST_PLAN = gql`
  mutation UPDATE_PODCAST_PLAN(
    $podcastPlanId: uuid!
    $publishedAt: timestamptz
    $listPrice: numeric!
    $salePrice: numeric
    $soldAt: timestamptz
    $periodAmount: numeric!
    $periodType: String!
    $creatorId: String!
  ) {
    update_podcast_plan(
      where: { id: { _eq: $podcastPlanId } }
      _set: {
        published_at: $publishedAt
        list_price: $listPrice
        sale_price: $salePrice
        sold_at: $soldAt
        period_amount: $periodAmount
        period_type: $periodType
        creator_id: $creatorId
      }
    ) {
      affected_rows
    }
  }
`

export default PodcastPlanAdminModal
