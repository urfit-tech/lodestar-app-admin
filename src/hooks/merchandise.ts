import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { sum } from 'ramda'
import { notEmpty } from '../helpers'
import types from '../types'
import { ProductInventoryStatusProps } from '../types/general'
import {
  MemberShopPreviewProps,
  MemberShopProps,
  MerchandisePreviewProps,
  MerchandiseProps,
} from '../types/merchandise'

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
          list_price
          sale_price
          sold_at
          published_at
          is_physical
          is_customized
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
          listPrice: merchandise.list_price,
          salePrice: merchandise.sale_price,
          soldAt: merchandise.sold_at ? new Date(merchandise.sold_at) : null,
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
  const { loading, error, data, refetch } = useQuery<types.GET_MERCHANDISE, types.GET_MERCHANDISEVariables>(
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
          merchandise_inventory_status {
            buyable_quantity
            undelivered_quantity
            delivered_quantity
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
  const merchandise:
    | (MerchandiseProps & {
        merchandiseInventoryStatus: ProductInventoryStatusProps
      })
    | null =
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
          link: data.merchandise_by_pk.link,
          description: data.merchandise_by_pk.description,
          soldAt: data.merchandise_by_pk.sold_at,
          startedAt: data.merchandise_by_pk.started_at,
          endedAt: data.merchandise_by_pk.ended_at,
          publishedAt: data.merchandise_by_pk.published_at ? new Date(data.merchandise_by_pk.published_at) : null,
          memberShopId: data.merchandise_by_pk.member_shop_id,
          isPhysical: data.merchandise_by_pk.is_physical,
          isCustomized: data.merchandise_by_pk.is_customized,
          isLimited: data.merchandise_by_pk.is_limited,
          isCountdownTimerVisible: data.merchandise_by_pk.is_countdown_timer_visible,
          merchandiseInventoryStatus: {
            buyableQuantity: data.merchandise_by_pk.merchandise_inventory_status?.buyable_quantity || 0,
            undeliveredQuantity: data.merchandise_by_pk.merchandise_inventory_status?.undelivered_quantity || 0,
            deliveredQuantity: data.merchandise_by_pk.merchandise_inventory_status?.delivered_quantity || 0,
          },
          specs: data.merchandise_by_pk.merchandise_specs.map(v => ({
            id: v.id,
            title: v.title,
            listPrice: v.list_price,
            salePrice: v.sale_price,
            quota: v.quota,
            files: v.merchandise_spec_files.map(u => ({
              id: u.id,
              data: u.data,
            })),
          })),
        }

  return {
    loadingMerchandise: loading,
    errorMerchandise: error,
    merchandise,
    refetchMerchandise: refetch,
  }
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
        }
        published_at
        merchandises_aggregate {
          aggregate {
            count
          }
        }
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
            id: memberShop.member?.id || '',
            name: memberShop.member?.name || memberShop.member?.username || '',
            pictureUrl: memberShop.member?.picture_url || '',
          },
          merchandisesCount: memberShop.merchandises_aggregate.aggregate?.count || 0,
          publishedAt: memberShop.published_at ? new Date(memberShop.published_at) : null,
        }))

  return {
    loadingMemberShops: loading,
    errorMemberShops: error,
    memberShops,
    refetchMemberShops: refetch,
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
          cover_url
          member {
            id
            name
            username
            picture_url
          }
          merchandises(
            where: { is_deleted: { _eq: false } }
            order_by: { position: asc, published_at: desc, updated_at: desc }
          ) {
            id
            title
            list_price
            sale_price
            sold_at
            published_at
            is_physical
            is_customized
            merchandise_specs {
              id
              merchandise_spec_inventory_status {
                total_quantity
                buyable_quantity
              }
            }
            merchandise_imgs(where: { type: { _eq: "cover" } }) {
              id
              url
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
            title: v.title,
            listPrice: v.list_price,
            salePrice: v.sale_price,
            soldAt: v.sold_at ? new Date(v.sold_at) : null,
            isPhysical: v.is_physical,
            isCustomized: v.is_customized,
            publishedAt: v.published_at ? new Date(v.published_at) : null,
            soldQuantity: sum(
              v.merchandise_specs
                .filter(notEmpty)
                .map(
                  w =>
                    (w.merchandise_spec_inventory_status?.total_quantity || 0) -
                    (w.merchandise_spec_inventory_status?.buyable_quantity || 0),
                ),
            ),
            coverUrl: v.merchandise_imgs[0]?.url || null,
          })),
        }

  return {
    loadingMemberShop: loading,
    errorMemberShop: error,
    memberShop,
    refetchMemberShop: refetch,
  }
}
