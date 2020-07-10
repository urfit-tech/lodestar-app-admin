import { useMutation, useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { useContext } from 'react'
import { useIntl } from 'react-intl'
import AppContext from '../contexts/AppContext'
import { commonMessages } from '../helpers/translation'
import types from '../types'
import { Category, ClassType, ProductInventoryLogProps, ProductType } from '../types/general'
import { InvoiceProps, ShippingProps } from '../types/merchandise'
import { ProgramPlanPeriodType } from '../types/program'

export const useTags = () => {
  const { loading, error, data, refetch } = useQuery<types.GET_TAGS>(
    gql`
      query GET_TAGS {
        tag {
          name
        }
      }
    `,
  )
  return {
    tags: data ? data.tag.map(tag => tag.name) : [],
    errorTags: error,
    loadingTags: loading,
    refetchTags: refetch,
  }
}

export const useCategory = (classType: ClassType) => {
  const { id: appId } = useContext(AppContext)
  const { loading, data, error, refetch } = useQuery<types.GET_CATEGORIES, types.GET_CATEGORIESVariables>(
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
      variables: { appId, classType },
    },
  )

  const categories: Category[] =
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
    types.GET_NOTIFICATIONS,
    types.GET_NOTIFICATIONSVariables
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
          description: notification.description,
          type: notification.type,
          referenceUrl: notification.reference_url,
          extra: notification.extra,
          avatar: notification.avatar,
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

export const useInsertCategory = () => {
  const [insertCategory] = useMutation(gql`
    mutation INSERT_PROGRAM_CATEGORY($appId: String!, $name: String, $classType: String, $position: Int) {
      insert_category(objects: { app_id: $appId, name: $name, class: $classType, position: $position }) {
        affected_rows
      }
    }
  `)

  return insertCategory
}

export const useUpdateCategory = () => {
  const [updateCategory] = useMutation<types.UPDATE_CATEGORY, types.UPDATE_CATEGORYVariables>(gql`
    mutation UPDATE_CATEGORY($categoryId: String!, $name: String, $position: Int) {
      update_category(_set: { name: $name, position: $position }, where: { id: { _eq: $categoryId } }) {
        affected_rows
      }
    }
  `)

  return updateCategory
}

export const useUpdateCategoryPosition = () => {
  const [updateCategoryPosition] = useMutation<
    types.UPDATE_CATEGORY_POSITION,
    types.UPDATE_CATEGORY_POSITIONVariables
  >(gql`
    mutation UPDATE_CATEGORY_POSITION($data: [category_insert_input!]!) {
      insert_category(objects: $data, on_conflict: { constraint: category_pkey, update_columns: position }) {
        affected_rows
      }
    }
  `)

  return updateCategoryPosition
}

export const useDeleteCategory = () => {
  const [deleteCategory] = useMutation(gql`
    mutation DELETE_PROGRAM_CATEGORY($categoryId: String!) {
      delete_category(where: { id: { _eq: $categoryId } }) {
        affected_rows
      }
    }
  `)

  return deleteCategory
}

export const useProductInventoryLog = (productId: string) => {
  const { loading, error, data, refetch } = useQuery<types.GET_PRODUCT_INVENTORY, types.GET_PRODUCT_INVENTORYVariables>(
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
    { variables: { productId } },
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
            status: productInventory.status,
            specification: productInventory.specification,
            quantity: productInventory.quantity,
            comment: productInventory.comment,
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
    types.ARRANGE_PRODUCT_INVENTORY,
    types.ARRANGE_PRODUCT_INVENTORYVariables
  >(
    gql`
      mutation ARRANGE_PRODUCT_INVENTORY($data: [product_inventory_insert_input!]!) {
        insert_product_inventory(objects: $data) {
          affected_rows
        }
      }
    `,
  )

  return (data: { specification: string; quantity: number; comment: string | null }[]) =>
    arrangeMerchandiseInventory({
      variables: {
        data: data
          .filter(data => data.quantity)
          .map(data => ({
            product_id: productId,
            status: 'arrange',
            specification: data.specification,
            quantity: data.quantity,
            comment: data.comment,
          })),
      },
    })
}

export const useAllBriefProductCollection = () => {
  const { enabledModules } = useContext(AppContext)

  const { loading, error, data, refetch } = useQuery<types.GET_ALL_BRIEF_PRODUCT_COLLECTION>(
    gql`
      query GET_ALL_BRIEF_PRODUCT_COLLECTION {
        program(where: { published_at: { _is_null: false } }) {
          id
          title
        }
        program_plan(where: { program: { published_at: { _is_null: false } } }) {
          id
          title
          program {
            id
            title
          }
        }
        activity_ticket(where: { is_published: { _eq: true }, activity: { published_at: { _is_null: false } } }) {
          id
          title
          activity {
            id
            title
          }
        }
        podcast_program(where: { published_at: { _is_null: false } }) {
          id
          title
        }
        podcast_plan(where: { published_at: { _is_null: false } }) {
          id
          title
          creator {
            id
            name
            username
          }
        }
        appointment_plan(where: { published_at: { _is_null: false } }) {
          id
          title
          creator {
            id
            name
            username
          }
        }
        merchandise(where: { published_at: { _is_null: false } }) {
          id
          title
        }
        project_plan(where: { project: { published_at: { _is_null: false } } }) {
          id
          title
          project {
            id
            title
          }
        }
        program_package_plan(
          where: { published_at: { _is_null: false }, program_package: { published_at: { _is_null: false } } }
        ) {
          id
          title
          program_package {
            id
            title
          }
        }
      }
    `,
  )

  const briefProducts: {
    [key in ProductType]?: {
      productId: string
      title: string
      parent?: string
    }[]
  } =
    loading || error || !data
      ? {}
      : {
          Program: data.program.map(program => ({
            productId: `Program_${program.id}`,
            title: program.title,
          })),
          ProgramPlan: data.program_plan.map(programPlan => ({
            productId: `ProgramPlan_${programPlan.id}`,
            title: programPlan.title || '',
            parent: programPlan.program.title,
          })),
          ActivityTicket: enabledModules.activity
            ? data.activity_ticket.map(activityTicket => ({
                productId: `ActivityTicket_${activityTicket.id}`,
                title: activityTicket.title,
                parent: activityTicket.activity.title,
              }))
            : undefined,
          PodcastProgram: enabledModules.podcast
            ? data.podcast_program.map(podcastProgram => ({
                productId: `PodcastProgram_${podcastProgram.id}`,
                title: podcastProgram.title,
              }))
            : undefined,
          PodcastPlan: enabledModules.podcast
            ? data.podcast_plan.map(podcastPlan => ({
                productId: `PodcastPlan_${podcastPlan.id}`,
                title: `${podcastPlan.creator?.name || podcastPlan.creator?.username || ''}`,
              }))
            : undefined,
          AppointmentPlan: enabledModules.appointment
            ? data.appointment_plan.map(appointmentPlan => ({
                productId: `AppointmentPlan_${appointmentPlan.id}`,
                title: appointmentPlan.title,
                parent: appointmentPlan.creator?.name || appointmentPlan.creator?.username || '',
              }))
            : undefined,
          Merchandise: enabledModules.merchandise
            ? data.merchandise.map(merchandise => ({
                productId: `Merchandise_${merchandise.id}`,
                title: merchandise.title,
              }))
            : undefined,
          // todo: add module check of project
          ProjectPlan: data.project_plan.map(projectPlan => ({
            productId: `ProjectPlan_${projectPlan.id}`,
            title: projectPlan.title,
            parent: projectPlan.project.title,
          })),
          ProgramPackagePlan: enabledModules.program_package
            ? data.program_package_plan.map(programPackagePlan => ({
                productId: `ProgramPackagePlan_${programPackagePlan.id}`,
                title: programPackagePlan.title,
                parent: programPackagePlan.program_package.title,
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

export const useOrderPhysicalProductLog = () => {
  const { error, loading, data, refetch } = useQuery<types.GET_PHYSICAL_PRODUCT_ORDER_LOG>(
    gql`
      query GET_PHYSICAL_PRODUCT_ORDER_LOG {
        orderLogs: order_log(where: { _and: [{ status: { _eq: "SUCCESS" } }] }, order_by: { updated_at: desc }) {
          id
          created_at
          updated_at
          delivered_at
          deliver_message
          shipping
          invoice

          orderPhysicalProducts: order_products(where: { order_log: { shipping: { _is_null: false } } }) {
            id
            name
            product_id
            options
          }
        }
      }
    `,
  )

  const orderPhysicalProductLogs: {
    id: string
    createdAt: Date
    updatedAt: Date
    deliveredAt: Date
    deliverMessage: string | null
    shipping: ShippingProps
    invoice: InvoiceProps
    orderPhysicalProducts: {
      key: string
      id: string
      name: string
      productId: string
      quantity: number
    }[]
  }[] =
    error || loading || !data
      ? []
      : data?.orderLogs
          .filter(orderLog => orderLog.orderPhysicalProducts.length)
          .map(orderLog => ({
            id: orderLog.id,
            createdAt: orderLog.created_at,
            updatedAt: orderLog.updated_at,
            deliveredAt: orderLog.delivered_at,
            deliverMessage: orderLog.deliver_message,
            shipping: orderLog.shipping,
            invoice: orderLog.invoice,
            orderPhysicalProducts: orderLog.orderPhysicalProducts.map(orderPhysicalProduct => ({
              key: `${orderLog.id}_${orderPhysicalProduct.name}`,
              id: orderPhysicalProduct.id,
              name: orderPhysicalProduct.name,
              productId: orderPhysicalProduct.product_id.split('_')[1],
              quantity: orderPhysicalProduct.options?.quantity || 1,
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

  const { loading, error, data } = useQuery<types.GET_PRODUCT_SIMPLE, types.GET_PRODUCT_SIMPLEVariables>(
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
          merchandise_imgs(where: { type: { _eq: "cover" } }) {
            url
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
  } | null =
    loading || error || !data
      ? null
      : data.program_by_pk
      ? {
          id: data.program_by_pk.id,
          productType: 'Program',
          title: data.program_by_pk.title,
          coverUrl: data.program_by_pk.cover_url || undefined,
          listPrice: data.program_by_pk.list_price,
          salePrice:
            data.program_by_pk.sold_at && new Date(data.program_by_pk.sold_at).getTime() > Date.now()
              ? data.program_by_pk.sale_price
              : undefined,
        }
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
          title: data.program_package_plan_by_pk.title,
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
          title: data.card_by_pk.title,
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
          title: data.podcast_program_by_pk.title,
          coverUrl: data.podcast_program_by_pk.cover_url,
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
          title: data.appointment_plan_by_pk.title,
          coverUrl: data.appointment_plan_by_pk.creator && data.appointment_plan_by_pk.creator.picture_url,
          startedAt: data.appointment_plan_by_pk.appointment_periods[0].started_at,
          endedAt: data.appointment_plan_by_pk.appointment_periods[0].ended_at,
        }
      : data.merchandise_by_pk
      ? {
          id: data.merchandise_by_pk.id,
          productType: 'Merchandise',
          title: data.merchandise_by_pk.title,
          listPrice: data.merchandise_by_pk.list_price,
          coverUrl: data.merchandise_by_pk.merchandise_imgs[0]?.url,
          quantity: options.quantity,
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
