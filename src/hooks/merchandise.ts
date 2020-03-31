import { useMutation, useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import types from '../types'
import { MerchandiseProps } from '../types/merchandise'

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

export const useMerchandiseCollection = () => {
  const { loading, error, data, refetch } = useQuery<types.GET_MERCHANDISE_COLLECTION>(gql`
    query GET_MERCHANDISE_COLLECTION {
      merchandise(order_by: { position: asc }) {
        id
        title
        abstract
        description
        price
        link
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
  `)

  const merchandises: MerchandiseProps[] =
    loading || error || !data
      ? []
      : data.merchandise.map(merchandise => ({
          id: merchandise.id,
          images: merchandise.merchandise_imgs.map(img => ({
            url: img.url,
            isCover: img.type === 'cover',
          })),
          categories: merchandise.merchandise_categories.map(merchandiseCategory => ({
            id: merchandiseCategory.category.id,
            name: merchandiseCategory.category.name,
          })),
          tags: merchandise.merchandise_tags.map(merchandiseTag => merchandiseTag.tag_name),
          title: merchandise.title,
          abstract: merchandise.abstract,
          price: merchandise.price,
          description: merchandise.description,
          link: merchandise.link,
        }))

  return {
    loadingMerchandises: loading,
    errorMerchandises: error,
    merchandises,
    refetchMerchandises: refetch,
  }
}
