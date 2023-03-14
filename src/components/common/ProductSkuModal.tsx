import Icon from '@ant-design/icons'
import { useApolloClient, useMutation } from '@apollo/react-hooks'
import { Button, Checkbox, Form, Input, message } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { ExclamationCircleIcon } from 'lodestar-app-element/src/images'
import { flatten, mergeAll } from 'ramda'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import hasura from '../../hasura'
import { handleError, notEmpty } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { useDeleteProductChannel, useProductChannelInfo, useUpsertProductChannel } from '../../hooks/channel'
import { useProductSku } from '../../hooks/data'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import componentCommonMessages from './translation'

const StyledIcon = styled(Icon)`
  vertical-align: baseline;
  font-size: 20px;
`

const StyledCheckbox = styled(Checkbox)`
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
      message: string
      url: string
    }
  | {
      type: SkuErrorType.MESSAGE
      message: string
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
  const { upsertProductChannel } = useUpsertProductChannel()
  const { deleteProductChannel } = useDeleteProductChannel()

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
      .then(() => {
        setLoading(true)
        const formValues = form.getFieldsValue()
        const checkChannelSkuDuplicate = () => {
          const channelSkuMapList: [string, string][] = []
          Object.entries(formValues).forEach(v => v[0] !== 'sku' && channelSkuMapList.push(v))

          const validationObject: Record<string, Array<string>> = {}
          for (const channelSkuMap of channelSkuMapList) {
            const [channelId, channelSku] = channelSkuMap
            validationObject[channelSku]
              ? validationObject[channelSku].push(channelId)
              : (validationObject[channelSku] = [channelId])
          }

          let duplicatedChannelIds: string[] = []
          for (const key in validationObject) {
            const channelIds = validationObject[key]
            if (channelIds.length > 1) {
              duplicatedChannelIds = duplicatedChannelIds.concat(channelIds)
            }
          }

          return duplicatedChannelIds
        }

        const duplicatedChannelIds = checkChannelSkuDuplicate()
        //FIXME: set input border color
        // duplicatedChannelIds.forEach(channelId => {
        //   form.getFieldInstance(channelId).style.borderColor = '#ff7d62'
        // })

        if (duplicatedChannelIds.length > 0) {
          setSkuErrors([
            {
              type: SkuErrorType.MESSAGE,
              message: formatMessage(componentCommonMessages.ProductSkuModal.channelSkuDuplicated),
            },
          ])
          return Promise.reject(duplicatedChannelIds)
        }
        return formValues
      })
      .then(async formValues => {
        const { data } = await client.query<hasura.GET_USED_CHANNEL_SKU, hasura.GET_USED_CHANNEL_SKUVariables>({
          query: GET_USED_CHANNEL_SKU,
          variables: {
            skuList: Object.keys(formValues)
              .filter(key => key !== 'sku')
              .map(key => formValues[key]),
          },
        })
        const productChannel = data.product_channel.filter(v => v.product_id !== productId)
        if (productChannel.length > 0) {
          //FIXME: set input border color
          const duplicatedTargets = productChannel.map(v => v.product_id.split('_')[1]).filter(notEmpty)
          const { data } = await client.query<hasura.GET_PRODUCT_TITLE, hasura.GET_PRODUCT_TITLEVariables>({
            query: GET_PRODUCT_TITLE,
            variables: {
              targets: duplicatedTargets,
            },
          })

          const errors: SkuError[] = []
          data.program_plan.forEach(v => {
            errors.push({
              type: SkuErrorType.LINK,
              message: formatMessage(componentCommonMessages.ProductSkuModal.productChannelSkuDuplicated, {
                name: `${v.program.title} - ${v.title}`,
              }),
              url: `/programs/${v.program.id}?tab=plan`,
            })
          })
          data.program_package_plan.forEach(v => {
            errors.push({
              type: SkuErrorType.LINK,
              message: formatMessage(componentCommonMessages.ProductSkuModal.productChannelSkuDuplicated, {
                name: `${v.program_package.title} - ${v.title}`,
              }),
              url: `/program-packages/${v.program_package.id}?tab=sales`,
            })
          })
          data.project_plan.forEach(v => {
            errors.push({
              type: SkuErrorType.LINK,
              message: formatMessage(componentCommonMessages.ProductSkuModal.productChannelSkuDuplicated, {
                name: `${v.project.title} - ${v.title}`,
              }),
              url: `/projects/${v.project.id}?tab=salesPlan`,
            })
          })
          data.activity_ticket.forEach(v => {
            errors.push({
              type: SkuErrorType.LINK,
              message: formatMessage(componentCommonMessages.ProductSkuModal.productChannelSkuDuplicated, {
                name: `${v.activity.title} - ${v.title}`,
              }),
              url: `/activities/${v.activity.id}?tab=tickets`,
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
            const upsertProductChannelList = channelIds.map(id => ({
              product_id: productId,
              app_id: appId,
              channel_id: id,
              channel_sku: formValues[id]?.trim() || null,
            }))
            return upsertProductChannel({
              variables: {
                productChannel: upsertProductChannelList,
              },
            })
          })
          .then(() => {
            const formValues = form.getFieldsValue()
            const upsertChannelIds = Object.keys(formValues).filter(key => key !== 'sku')
            const uncheckChannelIds =
              productChannelInfo
                ?.filter(info => !upsertChannelIds.includes(info.appChannelId))
                .map(v => v.appChannelId) || []
            return deleteProductChannel({ variables: { channelIds: uncheckChannelIds, productId } })
          })
          .then(() => {
            callback?.onSuccess?.()
            onRefetch?.()
            refetchProduct()
            refetchProductChannelInfo()
          })
          .catch(handleError)
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
              channelSku={v.channelSku}
            />
          ))}
        </Form.Item>
      </Form>
      {skuErrors.length > 0 &&
        skuErrors.map(skuError => (
          <div className="mb-2">
            <StyledIcon component={() => <ExclamationCircleIcon />} className="mr-2" />
            {skuError.type === 'message' ? (
              <span style={{ color: '#ff7d62' }}>{skuError.message}</span>
            ) : (
              <Link to={skuError.url} target="_blank" color="#ff7d62">
                {skuError.message}
              </Link>
            )}
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
      title
      program {
        id
        title
      }
    }
    program_package_plan(where: { id: { _in: $targets } }) {
      title
      program_package {
        id
        title
      }
    }
    project_plan(where: { id: { _in: $targets } }) {
      title
      project {
        id
        title
      }
    }
    activity_ticket(where: { id: { _in: $targets } }) {
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
    }
  }
`

export default ProductSkuModal
