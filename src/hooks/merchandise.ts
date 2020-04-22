import { useMutation, useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import types from '../types'
import { MerchandisePreviewProps, MerchandiseProps } from '../types/merchandise'

export const useInsertMerchandise = () => {
  const [insertMerchandise] = useMutation<types.INSERT_MERCHANDISE, types.INSERT_MERCHANDISEVariables>(gql`
    mutation INSERT_MERCHANDISE(
      $appId: String!
      $title: String!
      $merchandiseCategories: [merchandise_category_insert_input!]!
    ) {
      insert_merchandise(
        objects: { app_id: $appId, title: $title, merchandise_categories: { data: $merchandiseCategories } }
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
