import { useMutation, useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import types from '../types'
import {
  MemberShopPreviewProps,
  MemberShopProps,
  MerchandiseInventoryLog,
  MerchandisePreviewProps,
  MerchandiseProps,
} from '../types/merchandise'

export const useInsertMerchandise = () => {
  const [insertMerchandise] = useMutation<types.INSERT_MERCHANDISE, types.INSERT_MERCHANDISEVariables>(gql`
    mutation INSERT_MERCHANDISE(
      $appId: String!
      $memberId: String!
      $title: String!
      $merchandiseCategories: [merchandise_category_insert_input!]!
    ) {
      insert_merchandise(
        objects: {
          app_id: $appId
          title: $title
          member_id: $memberId
          merchandise_categories: { data: $merchandiseCategories }
        }
      ) {
        affected_rows
        returning {
          id
        }
      }
    }
  `)

  return insertMerchandise
}

export const useMerchandiseCollection = (isNotPublished?: boolean) => {
  const { loading, error, data, refetch } = useQuery<types.GET_MERCHANDISE_COLLECTION>(
    gql`
      query GET_MERCHANDISE_COLLECTION($isNotPublished: Boolean) {
        merchandise(
          where: { is_deleted: { _eq: false }, published_at: { _is_null: $isNotPublished } }
          order_by: { position: asc, published_at: desc, updated_at: desc }
        ) {
          id
          title
          price
          published_at
          merchandise_imgs(where: { type: { _eq: "cover" } }) {
            id
            url
          }
        }
      }
    `,
    { variables: { isNotPublished } },
  )

  const merchandises: MerchandisePreviewProps[] =
    loading || error || !data
      ? []
      : data.merchandise.map(merchandise => ({
          id: merchandise.id,
          title: merchandise.title,
          price: merchandise.price,
          publishedAt: merchandise.published_at ? new Date(merchandise.published_at) : null,
          coverUrl: merchandise.merchandise_imgs[0]?.url || null,
        }))

  return {
    loadingMerchandises: loading,
    errorMerchandises: error,
    merchandises,
    refetchMerchandises: refetch,
  }
}

export const useMerchandise = (id: string) => {
  const { loading, error, data, refetch } = useQuery<types.GET_MERCHANDISE, types.GET_MERCHANDISEVariables>(
    gql`
      query GET_MERCHANDISE($id: uuid!) {
        merchandise_by_pk(id: $id) {
          id
          title
          meta
          abstract
          description
          price
          link
          published_at
          merchandise_categories(order_by: { position: asc }) {
            id
            category {
              id
              name
            }
          }
          merchandise_tags(order_by: { position: asc }) {
            id
            tag_name
          }
          merchandise_imgs(order_by: { position: asc }) {
            id
            type
            url
          }
        }
      }
    `,
    { variables: { id } },
  )
  const merchandise: MerchandiseProps | null =
    loading || error || !data || !data.merchandise_by_pk
      ? null
      : {
          id,
          title: data.merchandise_by_pk.title,
          categories: data.merchandise_by_pk.merchandise_categories.map(merchandiseCategory => ({
            id: merchandiseCategory.category.id,
            name: merchandiseCategory.category.name,
          })),
          tags: data.merchandise_by_pk.merchandise_tags.map(merchandiseTag => merchandiseTag.tag_name),
          images: data.merchandise_by_pk.merchandise_imgs.map(img => ({
            url: img.url,
            isCover: img.type === 'cover',
          })),
          abstract: data.merchandise_by_pk.abstract,
          meta: data.merchandise_by_pk.meta,
          link: data.merchandise_by_pk.link,
          description: data.merchandise_by_pk.description,
          price: data.merchandise_by_pk.price,
          publishedAt: data.merchandise_by_pk.published_at ? new Date(data.merchandise_by_pk.published_at) : null,
        }

  return {
    loadingMerchandise: loading,
    errorMerchandise: error,
    merchandise,
    refetchMerchandise: refetch,
  }
}

export const useMerchandiseInventoryStatus = (merchandiseId: string) => {
  const { loading, error, data, refetch } = useQuery<
    types.GET_MERCHANDISE_INVENTORY_STATUS,
    types.GET_MERCHANDISE_INVENTORY_STATUSVariables
  >(
    gql`
      query GET_MERCHANDISE_INVENTORY_STATUS($merchandiseId: uuid!) {
        merchandise_inventory_status(where: { merchandise_id: { _eq: $merchandiseId } }) {
          buyable_quantity
          undelivered_quantity
          delivered_quantity
        }
      }
    `,
    { variables: { merchandiseId } },
  )

  const inventoryStatus: {
    buyableQuantity: number
    undeliveredQuantity: number
    deliveredQuantity: number
  } =
    loading || error || !data || !data.merchandise_inventory_status[0]
      ? {
          buyableQuantity: 0,
          undeliveredQuantity: 0,
          deliveredQuantity: 0,
        }
      : {
          buyableQuantity: data.merchandise_inventory_status[0].buyable_quantity,
          undeliveredQuantity: data.merchandise_inventory_status[0].undelivered_quantity,
          deliveredQuantity: data.merchandise_inventory_status[0].delivered_quantity,
        }

  return {
    loadingInventoryStatus: loading,
    errorInventoryStatus: error,
    inventoryStatus,
    refetchInventoryStatus: refetch,
  }
}

export const useMerchandiseInventoryLog = (merchandiseId: string) => {
  const { loading, error, data, refetch } = useQuery<
    types.GET_MERCHANDISE_INVENTORY,
    types.GET_MERCHANDISE_INVENTORYVariables
  >(
    gql`
      query GET_MERCHANDISE_INVENTORY($merchandiseId: uuid!) {
        merchandise_inventory(where: { merchandise_id: { _eq: $merchandiseId } }, order_by: { created_at: desc }) {
          id
          created_at
          status
          specification
          quantity
        }
      }
    `,
    { variables: { merchandiseId } },
  )

  const inventoryLogs: MerchandiseInventoryLog[] =
    loading || error || !data
      ? []
      : data.merchandise_inventory.map(merchandiseInventory => ({
          id: merchandiseInventory.id,
          createdAt: new Date(merchandiseInventory.created_at),
          status: merchandiseInventory.status,
          specification: merchandiseInventory.specification,
          quantity: merchandiseInventory.quantity,
        }))

  return {
    loadingInventoryLogs: loading,
    errorInventoryLogs: error,
    inventoryLogs,
    refetchInventoryLogs: refetch,
  }
}

export const useArrangeMerchandiseInventory = (merchandiseId: string) => {
  const [arrangeMerchandiseInventory] = useMutation<
    types.ARRANGE_MERCHANDISE_INVENTORY,
    types.ARRANGE_MERCHANDISE_INVENTORYVariables
  >(
    gql`
      mutation ARRANGE_MERCHANDISE_INVENTORY($data: [merchandise_inventory_insert_input!]!) {
        insert_merchandise_inventory(objects: $data) {
          affected_rows
        }
      }
    `,
  )

  return (data: { specification: string; quantity: number }[]) =>
    arrangeMerchandiseInventory({
      variables: {
        data: data
          .filter(data => data.quantity)
          .map(data => ({
            merchandise_id: merchandiseId,
            status: 'arrange',
            specification: data.specification,
            quantity: data.quantity,
          })),
      },
    })
}

export const useMemberShopCollection = () => {
  const { loading, error, data, refetch } = useQuery<types.GET_MEMBER_SHOP_COLLECTION>(gql`
    query GET_MEMBER_SHOP_COLLECTION {
      member_shop(order_by: { member_id: asc }) {
        id
        title
        member {
          id
          name
          username
          picture_url
          merchandises_aggregate {
            aggregate {
              count
            }
          }
        }
        published_at
      }
    }
  `)

  const memberShops: MemberShopPreviewProps[] =
    loading || error || !data
      ? []
      : data.member_shop.map(memberShop => ({
          id: memberShop.id,
          title: memberShop.title,
          member: {
            id: memberShop.member.id,
            name: memberShop.member.name || memberShop.member.username,
            pictureUrl: memberShop.member.picture_url,
          },
          merchandisesCount: memberShop.member.merchandises_aggregate.aggregate?.count || 0,
          publishedAt: memberShop.published_at ? new Date(memberShop.published_at) : null,
        }))

  return {
    loadingMemberShops: loading,
    errorMemberShops: error,
    memberShops,
    refetchShops: refetch,
  }
}

export const useMemberShop = (shopId: string) => {
  const { loading, error, data, refetch } = useQuery<types.GET_MEMBER_SHOP, types.GET_MEMBER_SHOPVariables>(
    gql`
      query GET_MEMBER_SHOP($shopId: uuid!) {
        member_shop_by_pk(id: $shopId) {
          id
          title
          shipping_methods
          published_at
        }
      }
    `,
    { variables: { shopId } },
  )

  const memberShop: MemberShopProps | null =
    loading || error || !data || !data.member_shop_by_pk
      ? null
      : {
          id: data.member_shop_by_pk.id,
          title: data.member_shop_by_pk.title,
          shippingMethods: data.member_shop_by_pk.shipping_methods,
          publishedAt: data.member_shop_by_pk.published_at,
        }

  return {
    loadingMemberShop: loading,
    errorMemberShop: error,
    memberShop,
    refetchMemberShop: refetch,
  }
}
