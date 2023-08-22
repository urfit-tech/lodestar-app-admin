import { DeepPick } from 'ts-deep-pick'
import { useMemo, useState, useEffect, useCallback } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { UploadFile } from 'antd/lib/upload/interface'
import { gql } from '@apollo/client'
import { useIntl } from 'react-intl'
import axios, { AxiosRequestConfig } from 'axios'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { handleError, uploadFile } from '../helpers'
import { commonMessages } from '../helpers/translation'
import hasura from '../hasura'
import { Attachment, Category, ClassType, ProductInventoryLogProps } from '../types/general'
import { InvoiceProps, ShippingProps } from '../types/merchandise'
import { ProgramPlanPeriodType } from '../types/program'
import { CouponProps } from '../types/checkout'
import { Uppy } from '@uppy/core'
import XHRUpload from '@uppy/xhr-upload'
import { MetaProductType } from 'lodestar-app-element/src/types/metaProduct'
import { ProductType } from 'lodestar-app-element/src/types/product'
import hooksMessages from './translation'
import moment, { Moment } from 'moment'
import { RangeValue } from 'rc-picker/lib/interface'
import { max, sum } from 'lodash'

export const useTags = () => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_TAGS>(
    gql`
      query GET_TAGS {
        app_tag {
          tag_name
        }
      }
    `,
  )

  const tags: string[] = data?.app_tag.map(v => v.tag_name || '').filter(v => v) || []

  return {
    loadingTags: loading,
    errorTags: error,
    tags,
    refetchTags: refetch,
  }
}

export const useCategory = (classType: ClassType) => {
  const { id: appId } = useApp()
  const { loading, data, error, refetch } = useQuery<hasura.GET_CATEGORIES, hasura.GET_CATEGORIESVariables>(
    gql`
      query GET_CATEGORIES($appId: String!, $classType: String) {
        category(where: { app_id: { _eq: $appId }, class: { _eq: $classType } }, order_by: { position: asc }) {
          id
          name
          position
        }
      }
    `,
    {
      variables: {
        appId,
        classType,
      },
      context: {
        important: true,
      },
    },
  )

  const categories: (Category & {
    position: number
  })[] =
    loading || error || !data
      ? []
      : data.category.map(category => ({
          id: category.id,
          name: category.name,
          position: category.position,
        }))

  return {
    loading,
    categories,
    error,
    refetch,
  }
}

export const useNotifications = (memberId: string, limit?: number) => {
  const { data, loading, error, refetch, startPolling } = useQuery<
    hasura.GET_NOTIFICATIONS,
    hasura.GET_NOTIFICATIONSVariables
  >(
    gql`
      query GET_NOTIFICATIONS($memberId: String, $limit: Int) {
        notification(where: { target_member_id: { _eq: $memberId } }, order_by: { updated_at: desc }, limit: $limit) {
          id
          avatar
          description
          reference_url
          extra
          type
          read_at
          updated_at
        }
      }
    `,
    { variables: { memberId, limit } },
  )

  const notifications: {
    id: string
    description: string
    type: string | null
    referenceUrl: string | null
    extra: string | null
    avatar: string | null
    readAt: Date | null
    updatedAt: Date
  }[] =
    loading || error || !data
      ? []
      : data.notification.map(notification => ({
          id: notification.id,
          description: notification.description || '',
          type: notification.type || null,
          referenceUrl: notification.reference_url || null,
          extra: notification.extra || null,
          avatar: notification.avatar || null,
          readAt: notification.read_at && new Date(notification.read_at),
          updatedAt: new Date(notification.updated_at),
        }))

  return {
    loading,
    error,
    notifications,
    refetch,
    startPolling,
  }
}

export const useProductInventoryLog = (productId: string) => {
  const { loading, error, data, refetch } = useQuery<
    hasura.GET_PRODUCT_INVENTORY,
    hasura.GET_PRODUCT_INVENTORYVariables
  >(
    gql`
      query GET_PRODUCT_INVENTORY($productId: String!) {
        product_inventory(where: { product_id: { _eq: $productId } }, order_by: { created_at: desc }) {
          id
          created_at
          status
          specification
          quantity
          comment
        }
        order_product(
          where: {
            _and: [
              { product_id: { _eq: $productId } }
              { order_log: { status: { _eq: "SUCCESS" } } }
              { order_log: { delivered_at: { _is_null: false } } }
            ]
          }
        ) {
          id
          options
          order_log {
            delivered_at
          }
        }
      }
    `,
    { variables: { productId }, fetchPolicy: 'no-cache' },
  )

  const inventoryLogs: ProductInventoryLogProps[] =
    loading || error || !data
      ? []
      : [
          ...data.order_product.map(shippedProduct => ({
            id: shippedProduct.id,
            createdAt: new Date(shippedProduct.order_log.delivered_at),
            status: 'shipped',
            specification: '',
            quantity: -shippedProduct.options?.quantity,
            comment: '',
          })),
          ...data.product_inventory.map(productInventory => ({
            id: productInventory.id,
            createdAt: new Date(productInventory.created_at),
            status: productInventory.status || null,
            specification: productInventory.specification || null,
            quantity: productInventory.quantity,
            comment: productInventory.comment || '',
          })),
        ]

  return {
    loadingInventoryLogs: loading,
    errorInventoryLogs: error,
    inventoryLogs: inventoryLogs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    refetchInventoryLogs: refetch,
  }
}

export const useArrangeProductInventory = (productId: string) => {
  const [arrangeMerchandiseInventory] = useMutation<
    hasura.ARRANGE_PRODUCT_INVENTORY,
    hasura.ARRANGE_PRODUCT_INVENTORYVariables
  >(
    gql`
      mutation ARRANGE_PRODUCT_INVENTORY($data: product_inventory_insert_input!) {
        insert_product_inventory_one(object: $data) {
          id
        }
      }
    `,
  )

  return (data: { specification: string; quantity: number; comment: string | null }) =>
    arrangeMerchandiseInventory({
      variables: {
        data: {
          product_id: productId,
          status: 'arrange',
          specification: data.specification,
          quantity: data.quantity,
          comment: data.comment,
        },
      },
    })
}

export const useOrderPhysicalProductLog = (memberId?: string) => {
  const { error, loading, data, refetch } = useQuery<hasura.GET_PHYSICAL_PRODUCT_ORDER_LOG>(
    gql`
      query GET_PHYSICAL_PRODUCT_ORDER_LOG($memberId: String) {
        order_log(
          where: {
            status: { _eq: "SUCCESS" }
            order_products: {
              product_id: { _similar: "(ProjectPlan|MerchandiseSpec)%" }
              product: { product_owner: { member_id: { _eq: $memberId } } }
            }
          }
        ) {
          id
          created_at
          updated_at
          last_paid_at
          delivered_at
          deliver_message
          shipping
          invoice_options
          order_products(
            where: {
              product_id: { _similar: "(ProjectPlan|MerchandiseSpec)%" }
              product: { product_owner: { member_id: { _eq: $memberId } } }
            }
          ) {
            id
            name
            product_id
            description
            options
            order_product_files(order_by: { updated_at: asc }) {
              id
              data
            }
            product {
              id
              product_owner {
                type
                target
              }
            }
          }
          member {
            id
            name
          }
        }
      }
    `,
    { variables: { memberId } },
  )

  const orderPhysicalProductLogs: {
    id: string
    member: string
    createdAt: Date
    updatedAt: Date
    lastPaidAt: Date
    deliveredAt: Date
    deliverMessage: string | null
    shipping: ShippingProps | null
    invoice: InvoiceProps
    orderPhysicalProducts: {
      key: string
      id: string
      name: string
      productId: string
      description: string | null
      quantity: number
      files: UploadFile[]
      memberShopId?: string | null
    }[]
  }[] =
    error || loading || !data
      ? []
      : data.order_log
          .filter(orderLog => orderLog.order_products.length && orderLog.shipping?.address)
          .map(v => ({
            id: v.id,
            member: v.member?.name || v.invoice_options?.name || '',
            createdAt: v.created_at,
            updatedAt: v.updated_at,
            lastPaidAt: v.last_paid_at,
            deliveredAt: v.delivered_at,
            deliverMessage: v.deliver_message || null,
            shipping: v.shipping,
            invoice: v.invoice_options,
            orderPhysicalProducts: v.order_products.map(orderPhysicalProduct => ({
              key: `${v.id}_${orderPhysicalProduct.name}`,
              id: orderPhysicalProduct.id,
              name: orderPhysicalProduct.name,
              productId: orderPhysicalProduct.product_id.split('_')[1],
              quantity: orderPhysicalProduct.options?.quantity || 1,
              description: orderPhysicalProduct.description || '',
              files: orderPhysicalProduct.order_product_files.map(v => v.data),
              memberShopId: orderPhysicalProduct.product.product_owner?.target || undefined,
            })),
          }))

  return {
    error,
    loading,
    orderPhysicalProductLogs,
    refetch,
  }
}

export const useSimpleProduct = (
  targetId: string,
  options: {
    startedAt?: Date
    quantity?: number
  },
) => {
  const { formatMessage } = useIntl()

  const { loading, error, data } = useQuery<hasura.GET_PRODUCT_SIMPLE, hasura.GET_PRODUCT_SIMPLEVariables>(
    gql`
      query GET_PRODUCT_SIMPLE($id: uuid!, $startedAt: timestamptz) {
        program_by_pk(id: $id) {
          id
          title
          cover_url
          is_subscription
          list_price
          sale_price
          sold_at
        }
        program_plan_by_pk(id: $id) {
          id
          title
          list_price
          sale_price
          sold_at
          discount_down_price
          period_type
          program {
            id
            title
            cover_url
          }
        }
        program_package_plan_by_pk(id: $id) {
          id
          title
          list_price
          sale_price
          sold_at
          discount_down_price
          period_amount
          period_type
          is_subscription
          program_package {
            id
            title
            cover_url
          }
        }
        card_by_pk(id: $id) {
          id
          title
        }
        activity_ticket_by_pk(id: $id) {
          id
          title
          price
          activity {
            id
            title
            cover_url
          }
        }
        project_plan_by_pk(id: $id) {
          id
          title
          cover_url
          list_price
          sale_price
          sold_at
          discount_down_price
          period_amount
          period_type
          project {
            id
            title
          }
        }
        podcast_program_by_pk(id: $id) {
          id
          title
          cover_url
          list_price
          sale_price
          sold_at
        }
        podcast_plan_by_pk(id: $id) {
          id
          title
          list_price
          sale_price
          sold_at
          creator {
            name
            username
          }
        }
        appointment_plan_by_pk(id: $id) {
          id
          title
          price
          creator {
            name
            username
            picture_url
          }
          appointment_periods(where: { started_at: { _eq: $startedAt } }) {
            started_at
            ended_at
            booked
          }
        }
        merchandise_by_pk(id: $id) {
          id
          title
          list_price
          is_physical
          is_customized
          merchandise_imgs(where: { type: { _eq: "cover" } }) {
            id
            url
          }
        }
        merchandise_spec_by_pk(id: $id) {
          id
          title
          list_price
          sale_price
          merchandise {
            id
            title
            sold_at
            is_physical
            is_customized
            merchandise_imgs(where: { type: { _eq: "cover" } }) {
              id
              url
            }
          }
        }
      }
    `,
    {
      variables: {
        id: targetId,
        startedAt: options.startedAt,
      },
    },
  )

  const target: {
    id: string
    productType: ProductType | null
    title: string
    coverUrl?: string | null
    listPrice?: number
    salePrice?: number
    discountDownPrice?: number
    periodAmount?: number
    periodType?: ProgramPlanPeriodType
    startedAt?: Date
    endedAt?: Date
    quantity?: number
    isSubscription?: boolean
    isPhysical?: boolean
    isCustomized?: boolean
  } | null =
    loading || error || !data
      ? null
      : data.program_plan_by_pk
      ? {
          id: data.program_plan_by_pk.id,
          productType: 'ProgramPlan',
          title: `${data.program_plan_by_pk.program.title} - ${data.program_plan_by_pk.title || ''}`,
          coverUrl: data.program_plan_by_pk.program.cover_url || undefined,
          listPrice: data.program_plan_by_pk.list_price,
          salePrice:
            data.program_plan_by_pk.sold_at && new Date(data.program_plan_by_pk.sold_at).getTime() > Date.now()
              ? data.program_plan_by_pk.sale_price
              : undefined,
          discountDownPrice: data.program_plan_by_pk.discount_down_price || undefined,
          periodType: data.program_plan_by_pk.period_type as ProgramPlanPeriodType,
        }
      : data.program_package_plan_by_pk
      ? {
          id: data.program_package_plan_by_pk.id,
          productType: 'ProgramPackagePlan',
          title: `${data.program_package_plan_by_pk.program_package.title} - ${data.program_package_plan_by_pk.title}`,
          coverUrl: data.program_package_plan_by_pk.program_package.cover_url || undefined,
          listPrice: data.program_package_plan_by_pk.list_price,
          salePrice:
            data.program_package_plan_by_pk.sold_at &&
            new Date(data.program_package_plan_by_pk.sold_at).getTime() > Date.now()
              ? data.program_package_plan_by_pk.sale_price
              : undefined,
          discountDownPrice: data.program_package_plan_by_pk.discount_down_price,
          periodAmount: data.program_package_plan_by_pk.period_amount,
          periodType: data.program_package_plan_by_pk.period_type as ProgramPlanPeriodType,
          isSubscription: data.program_package_plan_by_pk.is_subscription,
        }
      : data.card_by_pk
      ? {
          id: data.card_by_pk.id,
          productType: 'Card',
          title: data.card_by_pk.title || '',
          listPrice: 0,
        }
      : data.project_plan_by_pk
      ? {
          id: data.project_plan_by_pk.id,
          productType: 'ProjectPlan',
          title: `${data.project_plan_by_pk.project.title} - ${data.project_plan_by_pk.title}`,
          coverUrl: data.project_plan_by_pk.cover_url || undefined,
          listPrice: data.project_plan_by_pk.list_price,
          salePrice:
            data.project_plan_by_pk.sold_at && new Date(data.project_plan_by_pk.sold_at).getTime() > Date.now()
              ? data.project_plan_by_pk.sale_price
              : undefined,
          discountDownPrice: data.project_plan_by_pk.discount_down_price || undefined,
          periodAmount: data.project_plan_by_pk.period_amount,
          periodType: data.project_plan_by_pk.period_type as ProgramPlanPeriodType,
        }
      : data.podcast_program_by_pk
      ? {
          id: data.podcast_program_by_pk.id,
          productType: 'PodcastProgram',
          title: data.podcast_program_by_pk.title || '',
          coverUrl: data.podcast_program_by_pk.cover_url || null,
          listPrice: data.podcast_program_by_pk.list_price,
          salePrice:
            data.podcast_program_by_pk.sold_at && new Date(data.podcast_program_by_pk.sold_at).getTime() > Date.now()
              ? data.podcast_program_by_pk.sale_price
              : undefined,
        }
      : data.podcast_plan_by_pk && data.podcast_plan_by_pk.creator
      ? {
          id: data.podcast_plan_by_pk.id,
          productType: 'PodcastPlan',
          title: `${formatMessage(commonMessages.label.podcastSubscription)} - ${
            data.podcast_plan_by_pk.creator.name || data.podcast_plan_by_pk.creator.username
          }`,
          coverUrl: 'https://static.kolable.com/images/default/reservation.svg',
        }
      : data.appointment_plan_by_pk
      ? {
          id: data.appointment_plan_by_pk.id,
          productType: 'AppointmentPlan',
          title: data.appointment_plan_by_pk.title || '',
          coverUrl: (data.appointment_plan_by_pk.creator && data.appointment_plan_by_pk.creator.picture_url) || null,
          startedAt: data.appointment_plan_by_pk.appointment_periods[0]?.started_at,
          endedAt: data.appointment_plan_by_pk.appointment_periods[0]?.ended_at,
        }
      : data.merchandise_by_pk
      ? {
          id: data.merchandise_by_pk.id,
          productType: 'Merchandise',
          title: data.merchandise_by_pk.title || '',
          listPrice: data.merchandise_by_pk.list_price,
          coverUrl: data.merchandise_by_pk.merchandise_imgs[0]?.url,
          quantity: options.quantity,
          isPhysical: data.merchandise_by_pk.is_physical,
          isCustomized: data.merchandise_by_pk.is_customized,
        }
      : data.merchandise_spec_by_pk
      ? {
          id: data.merchandise_spec_by_pk.id,
          productType: 'MerchandiseSpec',
          title: `${data.merchandise_spec_by_pk.merchandise.title} - ${data.merchandise_spec_by_pk.title}`,
          listPrice: data.merchandise_spec_by_pk.list_price,
          salePrice:
            data.merchandise_spec_by_pk.merchandise.sold_at &&
            new Date(data.merchandise_spec_by_pk.merchandise.sold_at).getTime() > Date.now()
              ? data.merchandise_spec_by_pk.sale_price
              : undefined,
          coverUrl: data.merchandise_spec_by_pk.merchandise.merchandise_imgs[0]?.url,
          quantity: options.quantity,
          isPhysical: data.merchandise_spec_by_pk.merchandise.is_physical,
          isCustomized: data.merchandise_spec_by_pk.merchandise.is_customized,
        }
      : data.activity_ticket_by_pk
      ? {
          id: data.activity_ticket_by_pk.id,
          productType: 'ActivityTicket',
          title: `${data.activity_ticket_by_pk.activity.title} - ${data.activity_ticket_by_pk.title}`,
          listPrice: data.activity_ticket_by_pk.price,
          coverUrl: data.activity_ticket_by_pk.activity.cover_url || null,
        }
      : {
          id: targetId,
          productType: null,
          title: '',
        }

  return {
    loading,
    error,
    target,
  }
}

export const useEstimator = (
  targetId: string,
  options: {
    startedAt?: Date
    quantity?: number
  },
) => {
  const { loading, error, data } = useQuery<hasura.GET_ESTIMATOR, hasura.GET_ESTIMATORVariables>(
    gql`
      query GET_ESTIMATOR($id: String!, $startedAt: timestamptz) {
        estimator_by_pk(id: $id) {
          id
          title: name
        }
      }
    `,
    {
      variables: {
        id: targetId,
        startedAt: options.startedAt,
      },
    },
  )
  const target: {
    id: string | undefined
    title: string | undefined
  } | null =
    loading || error || !data
      ? null
      : {
          id: data?.estimator_by_pk?.id,
          title: data?.estimator_by_pk?.title,
        }

  return {
    loading,
    error,
    target,
  }
}

export const useUploadAttachments = () => {
  const { authToken } = useAuth()
  const { id: appId } = useApp()

  const { insertAttachment } = useMutateAttachment()
  return async (type: string, target: string, files: File[], uploadFileConfig?: (file: File) => AxiosRequestConfig) => {
    const { data } = await insertAttachment({
      variables: {
        attachments: files.map(() => ({
          type,
          target,
          app_id: appId,
        })),
      },
    })

    const attachmentIds: string[] = data?.insert_attachment?.returning.map(v => v.id) || []

    try {
      for (let index = 0; files[index]; index++) {
        const attachmentId = attachmentIds[index]
        const file = files[index]
        await uploadFile(`attachments/${attachmentId}`, file, authToken, uploadFileConfig?.(file))
        await insertAttachment({
          variables: {
            attachments: [
              {
                id: attachmentId,
                data: {
                  lastModified: file.lastModified,
                  name: file.name,
                  type: file.type,
                  size: file.size,
                },
                app_id: appId,
              },
            ],
          },
        })
      }

      return attachmentIds
    } catch (error) {
      handleError(error)
    }
  }
}

export const useMutateAttachment = () => {
  const [insertAttachment] = useMutation<hasura.INSERT_ATTACHMENT, hasura.INSERT_ATTACHMENTVariables>(
    gql`
      mutation INSERT_ATTACHMENT($attachments: [attachment_insert_input!]!) {
        insert_attachment(objects: $attachments, on_conflict: { constraint: attachment_pkey, update_columns: [data] }) {
          returning {
            id
          }
        }
      }
    `,
  )
  const [archiveAttachments] = useMutation<hasura.ARCHIVE_ATTACHMENTS, hasura.ARCHIVE_ATTACHMENTSVariables>(gql`
    mutation ARCHIVE_ATTACHMENTS($attachmentIds: [uuid!]!) {
      update_attachment(where: { id: { _in: $attachmentIds } }, _set: { is_deleted: true }) {
        affected_rows
      }
    }
  `)
  const [deleteAttachments] = useMutation<hasura.DELETE_ATTACHMENTS, hasura.DELETE_ATTACHMENTSVariables>(gql`
    mutation DELETE_ATTACHMENTS($attachmentIds: [uuid!]!) {
      delete_program_content_video(where: { attachment_id: { _in: $attachmentIds } }) {
        affected_rows
      }
      delete_attachment(where: { id: { _in: $attachmentIds } }) {
        affected_rows
      }
    }
  `)

  return { insertAttachment, archiveAttachments, deleteAttachments }
}

export const useCouponCollection = (memberId: string) => {
  const { loading, error, data, refetch } = useQuery<
    hasura.GET_COUPON_COLLECTION,
    hasura.GET_COUPON_COLLECTIONVariables
  >(
    gql`
      query GET_COUPON_COLLECTION($memberId: String!) {
        coupon(where: { member_id: { _eq: $memberId } }) {
          id
          status {
            outdated
            used
          }
          coupon_code {
            code
            coupon_plan {
              id
              title
              amount
              type
              constraint
              started_at
              ended_at
              description
              scope
              coupon_plan_products {
                id
                product_id
              }
            }
          }
        }
      }
    `,
    { variables: { memberId } },
  )

  const coupons: CouponProps[] =
    loading || error || !data
      ? []
      : data.coupon.map(coupon => ({
          id: coupon.id,
          member: {
            id: '',
            email: '',
          },
          status: {
            used: !!coupon.status?.used,
            outdated: !!coupon.status?.outdated,
          },
          couponCode: {
            code: coupon.coupon_code.code,
            couponPlan: {
              id: coupon.coupon_code.coupon_plan.id,
              startedAt: coupon.coupon_code.coupon_plan.started_at
                ? new Date(coupon.coupon_code.coupon_plan.started_at)
                : null,
              endedAt: coupon.coupon_code.coupon_plan.ended_at
                ? new Date(coupon.coupon_code.coupon_plan.ended_at)
                : null,
              type:
                coupon.coupon_code.coupon_plan.type === 1
                  ? 'cash'
                  : coupon.coupon_code.coupon_plan.type === 2
                  ? 'percent'
                  : 'cash',
              constraint: coupon.coupon_code.coupon_plan.constraint,
              amount: coupon.coupon_code.coupon_plan.amount,
              title: coupon.coupon_code.coupon_plan.title || '',
              description: coupon.coupon_code.coupon_plan.description || '',
              count: 0,
              remaining: 0,
              scope: coupon.coupon_code.coupon_plan.scope,
              productIds: coupon.coupon_code.coupon_plan.coupon_plan_products.map(
                couponPlanProduct => couponPlanProduct.product_id,
              ),
            },
          },
        }))

  return {
    loadingCoupons: loading,
    errorCoupons: error,
    coupons,
    refetchCoupons: refetch,
  }
}

export const useProductSku = (productId: string) => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_PRODUCT_SKU, hasura.GET_PRODUCT_SKUVariables>(
    gql`
      query GET_PRODUCT_SKU($productId: String!) {
        product_by_pk(id: $productId) {
          sku
        }
      }
    `,
    {
      variables: {
        productId,
      },
    },
  )

  const product = data?.product_by_pk

  return {
    loadingProduct: loading,
    errorProduct: error,
    product,
    refetchProduct: refetch,
  }
}

export const useProductLevel = (productId: string) => {
  const { loading, data } = useQuery<hasura.GetProductLevel, hasura.GetProductLevelVariables>(
    gql`
      query GetProductLevel($productId: String!) {
        product_by_pk(id: $productId) {
          id
          level
        }
      }
    `,
    { variables: { productId } },
  )
  const productLevel: number = data?.product_by_pk?.level || 0

  return {
    loading,
    productLevel,
  }
}

export const useMutateProductLevel = () => {
  const [updateProductLevel] = useMutation<hasura.UpdateProductLevel, hasura.UpdateProductLevelVariables>(gql`
    mutation UpdateProductLevel($productId: String, $level: numeric) {
      update_product(where: { id: { _eq: $productId } }, _set: { level: $level }) {
        affected_rows
      }
    }
  `)
  return {
    updateProductLevel,
  }
}

export const useAttachments = (options?: { contentType?: string; status?: string }) => {
  const { currentMemberId, authToken, permissions } = useAuth()
  const contentTypeLike = options?.contentType?.replace('*', '%')
  const { data, loading, refetch } = useQuery<hasura.GET_ATTACHMENTS, hasura.GET_ATTACHMENTSVariables>(
    gql`
      query GET_ATTACHMENTS($currentMemberId: String, $status: String, $contentTypeLike: String) {
        attachment_aggregate(
          where: {
            author_id: { _eq: $currentMemberId }
            status: { _eq: $status }
            content_type: { _like: $contentTypeLike }
          }
          order_by: [{ created_at: desc }]
        ) {
          aggregate {
            max {
              size
              duration
            }
            sum {
              size
              duration
            }
          }
          nodes {
            id
            name
            filename
            size
            duration
            status
            author {
              name
            }
            thumbnail_url
            content_type
            created_at
            updated_at
            options
            data
          }
        }
      }
    `,
    {
      variables: {
        currentMemberId: permissions.MEDIA_LIBRARY_ADMIN ? undefined : currentMemberId,
        contentTypeLike,
        status: options?.status,
      },
    },
  )
  const attachments: DeepPick<Attachment, '~author.name'>[] = useMemo(
    () =>
      data?.attachment_aggregate.nodes.map(v => ({
        id: v.id,
        name: v.name || 'untitled',
        filename: v.filename || 'unknown',
        size: v.size,
        duration: v.duration,
        status: v.status,
        author: v.author
          ? {
              name: v.author.name,
            }
          : {
              name: 'unknown',
            },
        contentType: v.content_type || 'application/octet-stream',
        thumbnailUrl: v.thumbnail_url || null,
        createdAt: v.created_at,
        updatedAt: v.updated_at,
        options: v.options,
        data: v.data,
      })) || [],
    [data],
  )
  const refetchAttachments = useCallback(async () => {
    await axios
      .post(
        `${process.env.REACT_APP_API_BASE_ROOT}/videos/sync`,
        {},
        {
          headers: {
            Authorization: `bearer ${authToken}`,
          },
        },
      )
      .catch(handleError)
      .finally(() => refetch?.())
  }, [authToken, refetch])
  return {
    maxSize: data?.attachment_aggregate.aggregate?.max?.size || 0,
    maxDuration: data?.attachment_aggregate.aggregate?.max?.duration || 0,
    totalSize: data?.attachment_aggregate.aggregate?.sum?.size || 0,
    totalDuration: data?.attachment_aggregate.aggregate?.sum?.duration || 0,
    attachments,
    loading,
    refetch: refetchAttachments,
  }
}

export const useCaptions = (videoAttachmentId: string) => {
  const captionLanguages = [
    { code: 'zh', name: 'Mandarin Chinese' },
    { code: 'hi', name: 'Hindi' },
    { code: 'es', name: 'Spanish' },
    { code: 'en', name: 'English' },
    { code: 'ar', name: 'Arabic' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'bn', name: 'Bengali' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'de', name: 'German' },
    { code: 'pa', name: 'Panjabi' },
    { code: 'jv', name: 'Javanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'vi', name: 'Vietnamese' },
    { code: 'fr', name: 'French' },
    { code: 'ur', name: 'Urdu' },
    { code: 'it', name: 'Italian' },
    { code: 'tr', name: 'Turkish' },
    { code: 'fa', name: 'Persian' },
    { code: 'pl', name: 'Polish' },
    { code: 'uk', name: 'Ukrainian' },
    { code: 'my', name: 'Burmese' },
    { code: 'th', name: 'Thai' },
  ]
  const { authToken } = useAuth()
  const [uppy, setUppy] = useState<Uppy | null>(null)
  const [captions, setCaptions] = useState<{ label: string; language: string }[]>([])
  const refetch = useCallback(
    () =>
      axios
        .get(`${process.env.REACT_APP_API_BASE_ROOT}/videos/${videoAttachmentId}/captions`, {
          headers: {
            Authorization: `bearer ${authToken}`,
          },
        })
        .then(({ data: { code, result } }) => {
          setCaptions(code === 'SUCCESS' ? result : [])
        }),
    [authToken, videoAttachmentId],
  )
  const deleteCaption = useCallback(
    (languageCode: string) =>
      axios
        .delete(`${process.env.REACT_APP_API_BASE_ROOT}/videos/${videoAttachmentId}/captions/${languageCode}`, {
          headers: {
            Authorization: `bearer ${authToken}`,
          },
        })
        .then(({ data: { code } }) => {
          code === 'SUCCESS' && refetch()
        }),
    [authToken, refetch, videoAttachmentId],
  )
  const addCaption = useCallback(
    async (languageCode: typeof captionLanguages[number]['code']) =>
      new Promise((resolve, reject) => {
        setUppy(
          new Uppy({
            autoProceed: true,
            restrictions: {
              maxNumberOfFiles: 1,
              maxTotalFileSize: 10 * 1024 * 1024, // limited 10MB at once
            },
          })
            .use(XHRUpload, {
              endpoint: `${process.env.REACT_APP_API_BASE_ROOT}/videos/${videoAttachmentId}/captions/${languageCode}`,
              headers: {
                Authorization: `bearer ${authToken}`,
              },
            })
            .on('complete', () => {
              uppy?.reset()
              resolve(null)
            })
            .on('error', reject),
        )
      }),
    [authToken, uppy, videoAttachmentId],
  )
  useEffect(() => {
    refetch()
  }, [refetch, videoAttachmentId])
  return {
    captions,
    captionLanguages,
    refetch,
    addCaption,
    deleteCaption,
    uppy,
  }
}

export const useAllBriefProductCollection = () => {
  const { enabledModules } = useApp()
  const { formatMessage } = useIntl()
  const { loading, error, data, refetch } = useQuery<hasura.GET_ALL_BRIEF_PRODUCT_COLLECTION>(
    gql`
      query GET_ALL_BRIEF_PRODUCT_COLLECTION {
        program_plan(
          where: {
            published_at: { _is_null: false }
            is_deleted: { _eq: false }
            program: { is_deleted: { _eq: false } }
          }
          order_by: { published_at: desc_nulls_last }
        ) {
          id
          title
          auto_renewed
          period_amount
          period_type
          published_at
          program {
            id
            title
          }
        }
        activity_ticket(
          where: {
            is_published: { _eq: true }
            ended_at: { _gt: "now()" }
            activity: { published_at: { _is_null: false }, deleted_at: { _is_null: true } }
          }
        ) {
          id
          title
          started_at
          ended_at
          activity {
            id
            title
          }
        }
        podcast_program(where: { published_at: { _is_null: false } }, order_by: { published_at: desc_nulls_last }) {
          id
          title
          published_at
        }
        podcast_plan(where: { published_at: { _is_null: false } }, order_by: { published_at: desc_nulls_last }) {
          id
          title
          published_at
          creator {
            id
            name
            username
          }
        }
        appointment_plan(where: { published_at: { _is_null: false } }, order_by: { published_at: desc_nulls_last }) {
          id
          title
          published_at
          creator {
            id
            name
            username
          }
        }
        merchandise_spec(where: { merchandise: { published_at: { _is_null: false } }, is_deleted: { _eq: false } }) {
          id
          title
          merchandise {
            id
            title
          }
        }
        project_plan(
          where: {
            project: { published_at: { _is_null: false }, expired_at: { _gt: "now()" }, type: { _neq: "modular" } }
            published_at: { _is_null: false }
          }
          order_by: { published_at: desc_nulls_last }
        ) {
          id
          title
          published_at
          project {
            id
            title
          }
        }
        program_package_plan(
          where: { published_at: { _is_null: false }, program_package: { published_at: { _is_null: false } } }
          order_by: { published_at: desc_nulls_last }
        ) {
          id
          title
          published_at
          program_package {
            id
            title
          }
        }
        voucher_plan(where: { sale_amount: { _is_null: false } }) {
          id
          title
        }
      }
    `,
  )

  const briefProducts: {
    [key in ProductType]?: {
      productId: string
      title: string
      parent?: string
      publishedAt?: Date | null
      tag?: string
    }[]
  } =
    loading || error || !data
      ? {}
      : {
          ProgramPlan: data.program_plan.map(programPlan => ({
            productId: `ProgramPlan_${programPlan.id}`,
            title: programPlan.title || '',
            parent: programPlan.program.title || '',
            publishedAt: programPlan.published_at ? new Date(programPlan.published_at) : null,
            tag: programPlan.auto_renewed
              ? formatMessage(commonMessages.ui.subscriptionPlan)
              : programPlan.period_amount && programPlan.period_type
              ? formatMessage(commonMessages.ui.periodPlan)
              : formatMessage(commonMessages.ui.perpetualPlan),
          })),
          ActivityTicket: enabledModules.activity
            ? data.activity_ticket.map(activityTicket => ({
                productId: `ActivityTicket_${activityTicket.id}`,
                title: activityTicket.title || '',
                parent: activityTicket.activity.title || '',
                publishedAt: activityTicket.started_at ? new Date(activityTicket.started_at) : null,
              }))
            : undefined,
          PodcastProgram: enabledModules.podcast
            ? data.podcast_program.map(podcastProgram => ({
                productId: `PodcastProgram_${podcastProgram.id}`,
                title: podcastProgram.title || '',
                publishedAt: podcastProgram.published_at ? new Date(podcastProgram.published_at) : null,
              }))
            : undefined,
          PodcastPlan: enabledModules.podcast
            ? data.podcast_plan.map(podcastPlan => ({
                productId: `PodcastPlan_${podcastPlan.id}`,
                title: `${podcastPlan.creator?.name || podcastPlan.creator?.username || ''}`,
                publishedAt: podcastPlan.published_at ? new Date(podcastPlan.published_at) : null,
              }))
            : undefined,
          AppointmentPlan: enabledModules.appointment
            ? data.appointment_plan.map(appointmentPlan => ({
                productId: `AppointmentPlan_${appointmentPlan.id}`,
                title: appointmentPlan.title || '',
                parent: appointmentPlan.creator?.name || appointmentPlan.creator?.username || '',
                publishedAt: appointmentPlan.published_at ? new Date(appointmentPlan.published_at) : null,
              }))
            : undefined,
          MerchandiseSpec: enabledModules.merchandise
            ? data.merchandise_spec.map(merchandiseSpec => ({
                productId: `MerchandiseSpec_${merchandiseSpec.id}`,
                title: merchandiseSpec.title || '',
                parent: merchandiseSpec.merchandise.title || '',
              }))
            : undefined,
          // todo: add module check of project
          ProjectPlan: data.project_plan.map(projectPlan => ({
            productId: `ProjectPlan_${projectPlan.id}`,
            title: projectPlan.title || '',
            parent: projectPlan.project.title || '',
            publishedAt: projectPlan.published_at ? new Date(projectPlan.published_at) : null,
          })),
          ProgramPackagePlan: enabledModules.program_package
            ? data.program_package_plan.map(programPackagePlan => ({
                productId: `ProgramPackagePlan_${programPackagePlan.id}`,
                title: programPackagePlan.title || '',
                parent: programPackagePlan.program_package.title || '',
                publishedAt: programPackagePlan.published_at ? new Date(programPackagePlan.published_at) : null,
              }))
            : undefined,
          VoucherPlan: enabledModules.sale_voucher
            ? data.voucher_plan.map(v => ({
                productId: `VoucherPlan_${v.id}`,
                title: v.title || '',
              }))
            : undefined,
        }

  return {
    loadingBriefProducts: loading,
    errorBriefProducts: error,
    briefProducts,
    refetchBriefProducts: refetch,
  }
}

export const useTransformProductToString = (productType: MetaProductType) => {
  const { formatMessage } = useIntl()

  let res = ''
  switch (productType) {
    case 'Program':
      res = formatMessage(hooksMessages.data.program)
      break
    case 'ProgramPackage':
      res = formatMessage(hooksMessages.data.programPackage)
      break
    case 'Activity':
      res = formatMessage(hooksMessages.data.activity)
      break
    case 'Post':
      res = formatMessage(hooksMessages.data.post)
      break
    case 'Merchandise':
      res = formatMessage(hooksMessages.data.merchandise)
      break
    case 'Project':
      res = formatMessage(hooksMessages.data.project)
      break
    case 'PodcastProgram':
      res = formatMessage(hooksMessages.data.podcastProgram)
      break
    case 'PodcastAlbum':
      res = formatMessage(hooksMessages.data.podcastAlbum)
      break
    case 'Certificate':
      res = formatMessage(hooksMessages.data.certificate)
      break
    default:
      break
  }
  return res
}

export const useAppUsage = (dateRange: RangeValue<Moment>) => {
  const startedAt = dateRange?.[0] || moment().subtract(1, 'day')
  const endedAt = dateRange?.[1] || moment()
  const { data } = useQuery<hasura.GET_APP_USAGE, hasura.GET_APP_USAGEVariables>(
    gql`
      query GET_APP_USAGE($startedDateHour: String!, $endedDateHour: String!) {
        app_usage(where: { date_hour: { _gte: $startedDateHour, _lte: $endedDateHour } }) {
          date_hour
          video_duration
          watched_seconds
        }
        last_app_usage: app_usage(
          where: { date_hour: { _lt: $startedDateHour }, video_duration: { _gte: 0 } }
          limit: 1
        ) {
          video_duration
        }
      }
    `,
    {
      variables: {
        startedDateHour: startedAt.clone().utc().format('YYYYMMDDHH'),
        endedDateHour: endedAt.clone().utc().format('YYYYMMDDHH'),
      },
    },
  )
  const dateHours = []
  for (let dateHour = startedAt; dateHour <= endedAt; dateHour = dateHour.clone().add(1, 'hour')) {
    dateHours.push(dateHour)
  }
  let videoDuration = Number(data?.last_app_usage[0]?.video_duration) || 0
  const ticks = dateHours.map(dateHour => {
    const usage = data?.app_usage.find(v => v.date_hour === dateHour.clone().utc().format('YYYYMMDDHH'))
    const tickVideoDuration = Number(usage?.video_duration) || -1
    // if videoDuration not exist, use last one
    // else, if videoDuration is wierd, set 0
    videoDuration = tickVideoDuration === -1 ? videoDuration : tickVideoDuration
    return {
      dateHour,
      videoDuration,
      watchedSeconds: Number(usage?.watched_seconds) || 0,
    }
  })
  return {
    totalVideoDuration: max(ticks.map(tick => tick.videoDuration)) || 0,
    totalWatchedSeconds: sum(data?.app_usage.map(v => v.watched_seconds || 0) || []),
    ticks,
  }
}

export const useAppPlan = () => {
  const { appPlanId } = useApp()
  const { data } = useQuery<hasura.GET_APP_PLAN, hasura.GET_APP_PLANVariables>(
    gql`
      query GET_APP_PLAN($appPlanId: String!) {
        app_plan_by_pk(id: $appPlanId) {
          id
          name
          options
        }
      }
    `,
    {
      variables: {
        appPlanId,
      },
    },
  )

  const storage = data?.app_plan_by_pk?.options?.limit?.storage
  const streaming = data?.app_plan_by_pk?.options?.limit?.streaming
  const usage = data?.app_plan_by_pk?.options?.limit?.usage

  return {
    appPlan: {
      id: data?.app_plan_by_pk?.id,
      name: data?.app_plan_by_pk?.name,
      options: {
        maxVideoDuration: storage?.max_video_duration,
        maxVideoDurationUnit: storage?.max_video_duration_unit,
        maxOther: storage?.max_other,
        maxOtherUnit: storage?.max_other_unit,
        maxVideoWatch: streaming?.max_video_watch,
        maxVideoWatchUnit: streaming?.max_video_watch_unit,
        maxSms: usage?.max_sms,
        maxSmsUnit: usage?.max_sms_unit,
      },
    },
  }
}
