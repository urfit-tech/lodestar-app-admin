import Icon from '@ant-design/icons'
import { useApolloClient, useMutation } from '@apollo/client'
import { Button, Checkbox, Form, Input, message } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { gql } from '@apollo/client'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { ExclamationCircleIcon } from 'lodestar-app-element/src/images'
import { flatten, mergeAll } from 'ramda'
import React, { ReactNode, useState } from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import hasura from '../../hasura'
import { notEmpty } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { useProductChannelInfo, useUpdateProductChannel } from '../../hooks/channel'
import { useProductSku } from '../../hooks/data'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import componentCommonMessages from './translation'

const StyledIcon = styled(Icon)`
  vertical-align: baseline;
  font-size: 20px;
`

const StyledCheckbox = styled(Checkbox)`
  width: 100%;
  display: block;
  &&& {
    margin-left: 0px;
  }
`

type FieldProps = {
  sku?: string
} & { [key: string]: string }

enum SkuErrorType {
  MESSAGE = 'message',
  LINK = 'link',
}

type SkuError =
  | {
      type: SkuErrorType.LINK
      message: ReactNode
    }
  | {
      type: SkuErrorType.MESSAGE
      message: string
    }

type UpdateProductChannelDTO = {
  product_id: string
  app_id: string
  channel_id: string
  channel_sku: string | null
}

const ProductSkuModal: React.FC<
  Omit<AdminModalProps, 'renderTrigger'> & {
    productId: string
    onRefetch?: () => void
    renderTrigger?: React.FC<{
      sku: string | null
      onOpen?: () => void
      onClose?: () => void
    }>
    renderTitle?: () => React.ReactNode
    renderInputLabel?: () => React.ReactNode
  }
> = ({ productId, onRefetch, renderTrigger, renderTitle, renderInputLabel, ...modalProps }) => {
  const { formatMessage } = useIntl()
  const { id: appId } = useApp()
  const [form] = useForm<FieldProps>()
  const [loading, setLoading] = useState(false)
  const [skuErrors, setSkuErrors] = useState<SkuError[]>([])
  const client = useApolloClient()
  const { loadingProduct, product, refetchProduct } = useProductSku(productId)
  const [updateProductSku] = useMutation<hasura.UPDATE_PRODUCT_SKU, hasura.UPDATE_PRODUCT_SKUVariables>(
    UPDATE_PRODUCT_SKU,
  )
  const { productChannelInfo, loadingProductChannelInfo, refetchProductChannelInfo } = useProductChannelInfo(
    appId,
    productId,
  )
  const { updateProductChannel } = useUpdateProductChannel()

  if (loadingProduct || loadingProductChannelInfo) {
    return <></>
  }

  const initialChannelSkuList = productChannelInfo?.map(v => ({ [v.appChannelId]: v.channelSku })) || []
  const initialValues = mergeAll(
    flatten([
      {
        sku: product?.sku,
      },
      initialChannelSkuList,
    ]),
  )

  const handleSubmit = (callback?: { onSuccess?: () => void }) => {
    form
      .validateFields()
      .then(async () => {
        setLoading(true)
        const formValues = form.getFieldsValue()
        const { data: channelSkuData } = await client.query<
          hasura.GET_USED_CHANNEL_SKU,
          hasura.GET_USED_CHANNEL_SKUVariables
        >({
          query: GET_USED_CHANNEL_SKU,
          variables: {
            skuList: Object.keys(formValues)
              .filter(key => key !== 'sku')
              .map(id => formValues[id]?.trim() || null)
              .filter(notEmpty),
          },
        })

        const productChannel = Object.entries(formValues)
          .map(([channelId, channelSku]) =>
            channelSkuData.product_channel.filter(pc => channelId === pc.channel_id && pc.channel_sku === channelSku),
          )
          .flat()
          .filter(v => v.product_id !== productId)

        if (productChannel.length > 0) {
          //FIXME: set input border color
          const duplicatedTargets = productChannel.map(v => v.product_id.split('_')[1]).filter(notEmpty)
          const { data: productTitleData } = await client.query<
            hasura.GET_PRODUCT_TITLE,
            hasura.GET_PRODUCT_TITLEVariables
          >({
            query: GET_PRODUCT_TITLE,
            variables: {
              targets: duplicatedTargets,
            },
          })

          const errors: SkuError[] = []
          productTitleData.program_plan.forEach(programPlan => {
            const channel = productChannel.find(v => v.product_id.includes(programPlan.id))
            errors.push({
              type: SkuErrorType.LINK,
              message: formatMessage(componentCommonMessages.ProductSkuModal.productChannelSkuDuplicated, {
                productName: (
                  <Link to={`/programs/${programPlan.program.id}?tab=plan`} target="_blank" color="#ff7d62">
                    {programPlan.program.title} - {programPlan.title}
                  </Link>
                ),
                channelSku: ` ${channel?.app_channel.name} - ${channel?.channel_sku}`,
              }),
            })
          })

          productTitleData.program_package_plan.forEach(programPackagePlan => {
            const channel = productChannel.find(v => v.product_id.includes(programPackagePlan.id))
            errors.push({
              type: SkuErrorType.LINK,
              message: formatMessage(componentCommonMessages.ProductSkuModal.productChannelSkuDuplicated, {
                productName: (
                  <Link
                    to={`/program-packages/${programPackagePlan.program_package.id}?tab=sales`}
                    target="_blank"
                    color="#ff7d62"
                  >
                    {programPackagePlan.program_package.title} - {programPackagePlan.title}
                  </Link>
                ),
                channelSku: ` ${channel?.app_channel.name} - ${channel?.channel_sku}`,
              }),
            })
          })
          productTitleData.project_plan.forEach(projectPlan => {
            const channel = productChannel.find(v => v.product_id.includes(projectPlan.id))
            errors.push({
              type: SkuErrorType.LINK,
              message: formatMessage(componentCommonMessages.ProductSkuModal.productChannelSkuDuplicated, {
                productName: (
                  <Link to={`/projects/${projectPlan.project.id}?tab=salesPlan`} target="_blank" color="#ff7d62">
                    {projectPlan.project.title} - {projectPlan.title}
                  </Link>
                ),
                channelSku: ` ${channel?.app_channel.name} - ${channel?.channel_sku}`,
              }),
            })
          })
          productTitleData.activity_ticket.forEach(activityTicket => {
            const channel = productChannel.find(v => v.product_id.includes(activityTicket.id))
            errors.push({
              type: SkuErrorType.LINK,
              message: formatMessage(componentCommonMessages.ProductSkuModal.productChannelSkuDuplicated, {
                productName: (
                  <Link to={`/activities/${activityTicket.activity.id}?tab=tickets`} target="_blank" color="#ff7d62">
                    {activityTicket.activity.title} - {activityTicket.title}
                  </Link>
                ),
                channelSku: ` ${channel?.app_channel.name} - ${channel?.channel_sku}`,
              }),
            })
          })

          setSkuErrors(errors)
          return Promise.reject(productChannel)
        }
      })
      .then(() => {
        const { sku } = form.getFieldsValue()
        updateProductSku({
          variables: {
            productId,
            sku: sku || null,
          },
        })
          .then(() => {
            const formValues = form.getFieldsValue()
            const channelIds = Object.keys(formValues).filter(key => key !== 'sku')
            const updateProductChannelList: UpdateProductChannelDTO[] = channelIds.map(id => ({
              product_id: productId,
              app_id: appId,
              channel_id: id,
              channel_sku: formValues[id]?.trim() || null,
            }))
            return updateProductChannel({
              variables: {
                productId: productId,
                productChannelList: updateProductChannelList,
              },
            })
          })
          .then(() => {
            callback?.onSuccess?.()
            onRefetch?.()
            refetchProduct()
            refetchProductChannelInfo()
          })
          .catch(() =>
            message.error(formatMessage(componentCommonMessages.ProductSkuModal.productChannelSkuDuplicated)),
          )
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  return (
    <AdminModal
      title={renderTitle?.() || formatMessage(commonMessages.label.skuSetting)}
      footer={null}
      onCancel={() => {
        form.resetFields()
        setSkuErrors([])
      }}
      renderFooter={({ setVisible }) => (
        <>
          <Button
            className="mr-2"
            onClick={() => {
              setVisible(false)
              form.resetFields()
              setSkuErrors([])
            }}
          >
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button
            type="primary"
            loading={loading}
            onClick={() =>
              handleSubmit({
                onSuccess: () => {
                  message.success(formatMessage(commonMessages.event.successfullySaved))
                  setVisible(false)
                },
              })
            }
          >
            {formatMessage(commonMessages.ui.confirm)}
          </Button>
        </>
      )}
      // TODO: too difficult to understand
      renderTrigger={({ setVisible }) => {
        return (
          renderTrigger?.({
            sku: product?.sku || null,
            onOpen: () => setVisible(true),
            onClose: () => {
              setVisible(false)
              form.resetFields()
              setSkuErrors([])
            },
          }) || null
        )
      }}
      {...modalProps}
    >
      <Form form={form} colon={false} layout="vertical" hideRequiredMark initialValues={initialValues}>
        <Form.Item label={renderInputLabel?.() || formatMessage(commonMessages.label.sku)} name="sku">
          <Input />
        </Form.Item>
        <Form.Item label={formatMessage(commonMessages.label.appChannel)}>
          {productChannelInfo?.map(v => (
            <ChannelCheckbox
              key={v.appChannelId}
              channelId={v.appChannelId}
              name={v.appChannelName}
              channelSku={v.channelSku || null}
            />
          ))}
        </Form.Item>
      </Form>
      {skuErrors.length > 0 &&
        skuErrors.map(skuError => (
          <div className="mb-2">
            <StyledIcon component={() => <ExclamationCircleIcon />} className="mr-2" />
            <span style={{ color: '#ff7d62' }}>{skuError.message}</span>
          </div>
        ))}
    </AdminModal>
  )
}

const ChannelCheckbox: React.VFC<{ channelId: string; name: string; channelSku: string | null }> = ({
  channelId,
  name,
  channelSku,
}) => {
  const { formatMessage } = useIntl()
  const [isChecked, setIsChecked] = useState(channelSku ? true : false)

  return (
    <>
      <StyledCheckbox className="mb-1" defaultChecked={isChecked} onChange={v => setIsChecked(v.target.checked)}>
        {name}
      </StyledCheckbox>
      {isChecked && (
        <Form.Item name={channelId}>
          <Input placeholder={formatMessage(commonMessages.placeholder.enterChannelSku)} />
        </Form.Item>
      )}
    </>
  )
}

const UPDATE_PRODUCT_SKU = gql`
  mutation UPDATE_PRODUCT_SKU($productId: String, $sku: String) {
    update_product(where: { id: { _eq: $productId } }, _set: { sku: $sku }) {
      affected_rows
    }
  }
`

const GET_PRODUCT_TITLE = gql`
  query GET_PRODUCT_TITLE($targets: [uuid!]) {
    program_plan(where: { id: { _in: $targets } }) {
      id
      title
      program {
        id
        title
      }
    }
    program_package_plan(where: { id: { _in: $targets } }) {
      id
      title
      program_package {
        id
        title
      }
    }
    project_plan(where: { id: { _in: $targets } }) {
      id
      title
      project {
        id
        title
      }
    }
    activity_ticket(where: { id: { _in: $targets } }) {
      id
      title
      activity {
        id
        title
      }
    }
  }
`

const GET_USED_CHANNEL_SKU = gql`
  query GET_USED_CHANNEL_SKU($skuList: [String!]) {
    product_channel(where: { channel_sku: { _in: $skuList } }) {
      product_id
      channel_id
      channel_sku
      app_channel {
        name
      }
    }
  }
`

export default ProductSkuModal
