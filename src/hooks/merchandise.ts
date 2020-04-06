import { useMutation, useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { useContext } from 'react'
import { MerchandiseBasicProps } from '../components/merchandise/MerchandiseBasicForm'
import { MerchandiseIntroductionProps } from '../components/merchandise/MerchandiseIntroductionForm'
import AppContext from '../contexts/AppContext'
import { handleError } from '../helpers'
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

export const useMerchandiseCollection = () => {
  const { loading, error, data, refetch } = useQuery<types.GET_MERCHANDISE_COLLECTION>(gql`
    query GET_MERCHANDISE_COLLECTION {
      merchandise(where: { is_deleted: { _eq: false } }, order_by: { position: asc, published_at: desc }) {
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
  `)

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

export const useUpdateMerchandiseBasic = (merchandiseId: string) => {
  const app = useContext(AppContext)
  const [updateMerchandiseBasic] = useMutation<types.UPDATE_MERCHANDISE_BASIC, types.UPDATE_MERCHANDISE_BASICVariables>(
    gql`
      mutation UPDATE_MERCHANDISE_BASIC(
        $merchandiseId: uuid!
        $title: String
        $categories: [merchandise_category_insert_input!]!
        $tags: [tag_insert_input!]!
        $merchandiseTags: [merchandise_tag_insert_input!]!
      ) {
        update_merchandise(where: { id: { _eq: $merchandiseId } }, _set: { title: $title }) {
          affected_rows
        }
        delete_merchandise_category(where: { merchandise_id: { _eq: $merchandiseId } }) {
          affected_rows
        }
        insert_merchandise_category(objects: $categories) {
          affected_rows
        }
        insert_tag(objects: $tags, on_conflict: { constraint: tag_pkey, update_columns: [updated_at] }) {
          affected_rows
        }
        delete_merchandise_tag(where: { merchandise_id: { _eq: $merchandiseId } }) {
          affected_rows
        }
        insert_merchandise_tag(objects: $merchandiseTags) {
          affected_rows
        }
      }
    `,
  )
  const updateBasic: (data: MerchandiseBasicProps) => Promise<any> = ({ title, categoryIds, merchandiseTags }) => {
    return updateMerchandiseBasic({
      variables: {
        merchandiseId: merchandiseId,
        title,
        categories: categoryIds?.map((categoryId, index) => ({
          merchandise_id: merchandiseId,
          category_id: categoryId,
          position: index,
        })),
        tags: merchandiseTags?.map(merchandiseTag => ({
          app_id: app.id,
          name: merchandiseTag,
          type: '',
        })),
        merchandiseTags: merchandiseTags?.map((merchandiseTag, index) => ({
          merchandise_id: merchandiseId,
          tag_name: merchandiseTag,
          position: index,
        })),
      },
    }).catch(handleError)
  }

  return {
    updateBasic,
  }
}

export const useUpdateMerchandiseIntroduction = (merchandiseId: string) => {
  const [updateMerchandiseIntroduction] = useMutation<
    types.UPDATE_MERCHANDISE_INTRODUCTION,
    types.UPDATE_MERCHANDISE_INTRODUCTIONVariables
  >(gql`
    mutation UPDATE_MERCHANDISE_INTRODUCTION(
      $merchandiseId: uuid!
      $abstract: String
      $link: String
      $merchandiseImages: [merchandise_img_insert_input!]!
    ) {
      update_merchandise(where: { id: { _eq: $merchandiseId } }, _set: { abstract: $abstract, link: $link }) {
        affected_rows
      }
      delete_merchandise_img(where: { merchandise_id: { _eq: $merchandiseId } }) {
        affected_rows
      }
      insert_merchandise_img(objects: $merchandiseImages) {
        affected_rows
      }
    }
  `)

  const updateIntroduction: (data: MerchandiseIntroductionProps) => Promise<any> = ({ abstract, link, images }) => {
    return updateMerchandiseIntroduction({
      variables: {
        merchandiseId: merchandiseId,
        abstract,
        link,
        merchandiseImages: images.map((image, index) => ({
          url: image.url,
          type: image.isCover ? 'cover' : '',
        })),
      },
    }).catch(handleError)
  }

  return {
    updateIntroduction,
  }
}
