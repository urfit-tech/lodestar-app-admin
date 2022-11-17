import { useApolloClient, useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { max, min } from 'lodash'
import hasura from '../hasura'

import {
  MemberShopPreviewProps,
  MemberShopProps,
  MerchandisePreviewProps,
  MerchandiseProps,
  MerchandiseSpec,
} from '../types/merchandise'
import { useEffect, useState } from 'react'

export const useMerchandiseCollection = (isNotPublished?: boolean) => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_MERCHANDISE_COLLECTION>(
    gql`
      query GET_MERCHANDISE_COLLECTION($isNotPublished: Boolean) {
        merchandise(
          where: { is_deleted: { _eq: false }, published_at: { _is_null: $isNotPublished } }
          order_by: [{ position: asc }, { published_at: desc }, { updated_at: desc }]
        ) {
          id
          title
          sold_at
          published_at
          is_physical
          is_customized
          currency_id
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
          soldAt: merchandise.sold_at ? new Date(merchandise.sold_at) : null,
          minPrice: 0,
          maxPrice: 0,
          currencyId: merchandise.currency_id,
          publishedAt: merchandise.published_at ? new Date(merchandise.published_at) : null,
          isPhysical: merchandise.is_physical,
          isCustomized: merchandise.is_customized,
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
  const apolloClient = useApolloClient()
  const [merchandiseProducts, setMerchandiseProducts] = useState<hasura.GET_MERCHANDISE_SPEC_PRODUCTS_product[]>([])
  const {
    loading: loadingMerchandise,
    error: errorMerchandise,
    data: merchandiseData,
    refetch: refetchMerchandise,
  } = useQuery<hasura.GET_MERCHANDISE, hasura.GET_MERCHANDISEVariables>(
    gql`
      query GET_MERCHANDISE($id: uuid!) {
        merchandise_by_pk(id: $id) {
          id
          title
          abstract
          description
          sold_at
          started_at
          ended_at
          link
          published_at
          member_shop_id
          is_physical
          is_customized
          is_limited
          is_countdown_timer_visible
          currency_id
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
          merchandise_specs {
            id
            title
            list_price
            sale_price
            quota
            merchandise_spec_files {
              id
              data
            }
          }
        }
      }
    `,
    { variables: { id } },
  )

  const merchandiseSpecIds: string[] = merchandiseData?.merchandise_by_pk?.merchandise_specs.map(spec => spec.id) || []

  useEffect(() => {
    if (merchandiseSpecIds.length > 0) {
      apolloClient
        .query<hasura.GET_MERCHANDISE_SPEC_PRODUCTS, hasura.GET_MERCHANDISE_SPEC_PRODUCTSVariables>({
          query: gql`
            query GET_MERCHANDISE_SPEC_PRODUCTS($merchandiseSpecIds: [String!]) {
              product(where: { target: { _in: $merchandiseSpecIds } }) {
                id
                type
                target
                coin_back
                coin_period_type
                coin_period_amount
              }
            }
          `,
          variables: { merchandiseSpecIds },
        })
        .then(({ data }) => {
          const products = data.product
          setMerchandiseProducts(products)
        })
        .catch(error => {
          console.error(error)
        })
    }
  }, [merchandiseData])

  const loading = loadingMerchandise
  const error = errorMerchandise
  const merchandise: MerchandiseProps | null =
    loading || error || !merchandiseData || !merchandiseData.merchandise_by_pk
      ? null
      : {
          id,
          title: merchandiseData.merchandise_by_pk.title,
          categories: merchandiseData.merchandise_by_pk.merchandise_categories.map(merchandiseCategory => ({
            id: merchandiseCategory.category.id,
            name: merchandiseCategory.category.name,
          })),
          tags: merchandiseData.merchandise_by_pk.merchandise_tags.map(merchandiseTag => merchandiseTag.tag_name),
          images: merchandiseData.merchandise_by_pk.merchandise_imgs.map(img => ({
            url: img.url,
            isCover: img.type === 'cover',
          })),
          abstract: merchandiseData.merchandise_by_pk.abstract,
          link: merchandiseData.merchandise_by_pk.link,
          description: merchandiseData.merchandise_by_pk.description,
          soldAt: merchandiseData.merchandise_by_pk.sold_at,
          startedAt: merchandiseData.merchandise_by_pk.started_at,
          endedAt: merchandiseData.merchandise_by_pk.ended_at,
          publishedAt: merchandiseData.merchandise_by_pk.published_at
            ? new Date(merchandiseData.merchandise_by_pk.published_at)
            : null,
          memberShopId: merchandiseData.merchandise_by_pk.member_shop_id,
          isPhysical: merchandiseData.merchandise_by_pk.is_physical,
          isCustomized: merchandiseData.merchandise_by_pk.is_customized,
          isLimited: merchandiseData.merchandise_by_pk.is_limited,
          isCountdownTimerVisible: merchandiseData.merchandise_by_pk.is_countdown_timer_visible,
          currencyId: merchandiseData.merchandise_by_pk.currency_id,
          specs: merchandiseData.merchandise_by_pk.merchandise_specs.map(v => ({
            id: v.id,
            title: v.title,
            listPrice: v.list_price,
            salePrice: v.sale_price,
            quota: v.quota,
            files: v.merchandise_spec_files.map(u => ({
              id: u.id,
              data: u.data,
            })),
            coinBack: merchandiseProducts?.find(p => p.target === v.id)?.coin_back || 0,
            coinBackPeriodAmount: merchandiseProducts?.find(p => p.target === v.id)?.coin_period_amount || null,
            coinBackPeriodType: merchandiseProducts?.find(p => p.target === v.id)?.coin_period_type || null,
          })),
        }

  return {
    loadingMerchandise: loading,
    errorMerchandise: error,
    merchandise,
    refetchMerchandise,
  }
}

export const useMemberShopCollection = (memberId?: string) => {
  const { loading, error, data, refetch } = useQuery<
    hasura.GET_MEMBER_SHOP_COLLECTION,
    hasura.GET_MEMBER_SHOP_COLLECTIONVariables
  >(
    gql`
      query GET_MEMBER_SHOP_COLLECTION($memberId: String) {
        member_shop(where: { member_id: { _eq: $memberId } }, order_by: { member_id: asc }) {
          id
          title
          member {
            id
            name
            username
            picture_url
          }
          published_at
          merchandises_aggregate {
            aggregate {
              count
            }
          }
        }
      }
    `,
    {
      variables: { memberId },
      fetchPolicy: 'no-cache',
    },
  )

  const memberShops: MemberShopPreviewProps[] =
    data?.member_shop.map(memberShop => ({
      id: memberShop.id,
      title: memberShop.title,
      member: {
        id: memberShop.member?.id || '',
        name: memberShop.member?.name || memberShop.member?.username || '',
        pictureUrl: memberShop.member?.picture_url || '',
      },
      merchandisesCount: memberShop.merchandises_aggregate.aggregate?.count || 0,
      publishedAt: memberShop.published_at ? new Date(memberShop.published_at) : null,
    })) || []

  return {
    loadingMemberShops: loading,
    errorMemberShops: error,
    memberShops,
    refetchMemberShops: refetch,
  }
}

export const useMemberShop = (shopId: string) => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_MEMBER_SHOP, hasura.GET_MEMBER_SHOPVariables>(
    gql`
      query GET_MEMBER_SHOP($shopId: uuid!) {
        member_shop_by_pk(id: $shopId) {
          id
          title
          shipping_methods
          published_at
          cover_url
          member {
            id
            name
            username
            picture_url
          }
          merchandises(
            where: { is_deleted: { _eq: false } }
            order_by: [{ position: asc }, { published_at: desc }, { updated_at: desc }]
          ) {
            id
            title
            sold_at
            published_at
            is_physical
            is_customized
            currency_id
            merchandise_imgs(where: { type: { _eq: "cover" } }) {
              id
              url
            }
            merchandise_specs {
              id
              list_price
              sale_price
              # merchandise_spec_inventory_status {
              #   undelivered_quantity
              #   delivered_quantity
              # }
            }
          }
        }
      }
    `,
    { variables: { shopId }, fetchPolicy: 'no-cache' },
  )

  const memberShop:
    | (MemberShopProps & {
        merchandises: MerchandisePreviewProps[]
      })
    | null =
    loading || error || !data || !data.member_shop_by_pk
      ? null
      : {
          id: data.member_shop_by_pk.id,
          title: data.member_shop_by_pk.title,
          shippingMethods: data.member_shop_by_pk.shipping_methods || [],
          publishedAt: data.member_shop_by_pk.published_at,
          coverUrl: data.member_shop_by_pk.cover_url,
          member: {
            id: data.member_shop_by_pk.member?.id || '',
            name: data.member_shop_by_pk.member?.name || data.member_shop_by_pk.member?.username || '',
            pictureUrl: data.member_shop_by_pk.member?.picture_url || '',
          },
          merchandises: data.member_shop_by_pk.merchandises.map(v => ({
            id: v.id,
            coverUrl: v.merchandise_imgs[0]?.url || null,
            title: v.title,
            soldAt: v.sold_at && new Date(v.sold_at),
            minPrice: min(
              v.merchandise_specs.map(spec =>
                v.sold_at && typeof spec.sale_price === 'number' ? spec.sale_price : spec.list_price || 0,
              ),
            ),
            maxPrice: max(
              v.merchandise_specs.map(spec =>
                v.sold_at && typeof spec.sale_price === 'number' ? spec.sale_price : spec.list_price || 0,
              ),
            ),
            currencyId: v.currency_id,
            isPhysical: v.is_physical,
            isCustomized: v.is_customized,
            publishedAt: v.published_at ? new Date(v.published_at) : null,
            // soldQuantity: sum(
            //   v.merchandise_specs
            //     .filter(notEmpty)
            //     .map(
            //       w =>
            //         (w.merchandise_spec_inventory_status?.delivered_quantity || 0) +
            //         (w.merchandise_spec_inventory_status?.undelivered_quantity || 0),
            //     ),
            // ),
          })),
        }

  return {
    loadingMemberShop: loading,
    errorMemberShop: error,
    memberShop,
    refetchMemberShop: refetch,
  }
}

export const useMerchandiseSpecCollection = (options?: {
  merchandiseSearch?: string
  isLimited?: boolean
  isCustomized?: boolean
  merchandiseId?: string
  memberId?: string
}) => {
  const {
    loading: loadingInventoryStatus,
    error: errorInventoryStatus,
    data: inventoryStatus,
    refetch: refetchInventoryStatus,
  } = useQuery<hasura.GET_MERCHANDISE_SPEC_INVENTORY_STATUS>(
    gql`
      query GET_MERCHANDISE_SPEC_INVENTORY_STATUS {
        merchandise_spec_inventory_status {
          merchandise_spec_id
          buyable_quantity
          delivered_quantity
          undelivered_quantity
          unpaid_quantity
        }
      }
    `,
    {
      fetchPolicy: 'no-cache',
    },
  )

  const {
    loading: loadingMerchandiseSpecs,
    error: errorMerchandiseSpecs,
    data,
    refetch: refetchMerchandiseSpecs,
  } = useQuery<hasura.GET_MERCHANDISE_SPEC_COLLECTION>(
    gql`
      query GET_MERCHANDISE_SPEC_COLLECTION(
        $merchandiseSearchLike: String
        $isCustomized: Boolean
        $isLimited: Boolean
        $merchandiseId: uuid
        $memberId: String
      ) {
        merchandise_spec(
          where: {
            merchandise: {
              is_limited: { _eq: $isLimited }
              is_customized: { _eq: $isCustomized }
              is_deleted: { _eq: false }
              title: { _like: $merchandiseSearchLike }
              id: { _eq: $merchandiseId }
              member_shop: { member_id: { _eq: $memberId } }
            }
          }
        ) {
          id
          title

          merchandise {
            title
            published_at
            is_physical
            is_customized
            merchandise_imgs {
              url
            }
            member_shop {
              id
              title
            }
          }
        }
      }
    `,
    {
      variables: {
        merchandiseSearchLike: options?.merchandiseSearch && `%${options.merchandiseSearch}%`,
        isLimited: options?.isLimited,
        isCustomized: options?.isCustomized,
        merchandiseId: options?.merchandiseId,
        memberId: options?.memberId,
      },
      fetchPolicy: 'no-cache',
    },
  )

  let merchandiseSpecs: MerchandiseSpec[] =
    loadingMerchandiseSpecs || errorMerchandiseSpecs || !data
      ? []
      : data.merchandise_spec.map(v => ({
          id: v.id,
          title: v.title,
          coverUrl: v.merchandise.merchandise_imgs[0]?.url || null,
          publishedAt: v.merchandise.published_at,
          inventoryStatus: {
            buyableQuantity: 0,
            deliveredQuantity: 0,
            undeliveredQuantity: 0,
            unpaidQuantity: 0,
          },
          isPhysical: v.merchandise.is_physical,
          isCustomized: v.merchandise.is_customized,
          merchandiseTitle: v.merchandise.title,
          memberShop: {
            id: v.merchandise?.member_shop?.id || '',
            title: v.merchandise?.member_shop?.title || '',
          },
        }))

  if (inventoryStatus) {
    inventoryStatus.merchandise_spec_inventory_status.forEach(v => {
      merchandiseSpecs.forEach(merchandiseSpec => {
        if (merchandiseSpec.id === v.merchandise_spec_id) {
          merchandiseSpec.inventoryStatus = {
            buyableQuantity: v.buyable_quantity || 0,
            deliveredQuantity: v.delivered_quantity || 0,
            undeliveredQuantity: v.undelivered_quantity || 0,
            unpaidQuantity: v.unpaid_quantity || 0,
          }
        }
      })
    })
  }

  return {
    loadingMerchandiseSpecs,
    errorMerchandiseSpecs,
    merchandiseSpecs,
    refetchMerchandiseSpecs,
    loadingInventoryStatus,
    errorInventoryStatus,
    inventoryStatus,
    refetchInventoryStatus,
  }
}
