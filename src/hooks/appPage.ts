import { useQuery, useMutation } from '@apollo/client'
import { gql } from '@apollo/client'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import hasura from '../hasura'
import { Device } from '../types/general'

export type AppPageProps = {
  id: string
  path: string | null
  title: string | null
  craftData: { [key: string]: string } | null
  editorId: string | null
  editorName: string | null
  publishedAt: Date | null
  updatedAt: Date
  options: { [key: string]: any } | null
  metaTag: { [key: string]: any } | null
}

export const useAppPage = (pageId: string) => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_APP_PAGE, hasura.GET_APP_PAGEVariables>(
    gql`
      query GET_APP_PAGE($pageId: uuid!) {
        app_page_by_pk(id: $pageId) {
          id
          path
          title
          craft_data
          updated_at
          published_at
          options
          meta_tag
          editor_id
          editor {
            name
          }
        }
      }
    `,
    {
      variables: {
        pageId,
      },
    },
  )

  const appPage: AppPageProps | null = data?.app_page_by_pk
    ? {
        id: data.app_page_by_pk.id,
        path: data.app_page_by_pk.path || null,
        title: data.app_page_by_pk.title || null,
        craftData: data.app_page_by_pk.craft_data,
        editorId: data.app_page_by_pk.editor_id || null,
        editorName: data.app_page_by_pk.editor?.name || null,
        publishedAt: data.app_page_by_pk.published_at ? new Date(data.app_page_by_pk.published_at) : null,
        updatedAt: new Date(data.app_page_by_pk.updated_at),
        options: data.app_page_by_pk.options,
        metaTag: data.app_page_by_pk.meta_tag,
      }
    : null

  const initialDevice: Device | null =
    (data?.app_page_by_pk && data?.app_page_by_pk.craft_data?.ROOT?.custom?.device) || null

  return {
    refetchAppPage: refetch,
    loadingAppPage: loading,
    errorAppPage: error,
    initialDevice,
    appPage,
  }
}

export const useAppPageCollection = () => {
  const { id: appId } = useApp()
  const { currentMemberId, permissions } = useAuth()
  const condition: hasura.GET_APP_PAGE_COLLECTIONVariables['condition'] = {
    app_id: { _eq: appId },
    is_deleted: { _eq: false },
    editor_id: {
      _eq: permissions.CRAFT_PAGE_ADMIN ? undefined : permissions.CRAFT_PAGE_NORMAL ? currentMemberId : '',
    },
  }
  const { loading, error, data, refetch } = useQuery<
    hasura.GET_APP_PAGE_COLLECTION,
    hasura.GET_APP_PAGE_COLLECTIONVariables
  >(
    gql`
      query GET_APP_PAGE_COLLECTION($condition: app_page_bool_exp!) {
        app_page(where: $condition, order_by: { created_at: desc }) {
          id
          path
          title
          craft_data
          updated_at
          published_at
          options
          meta_tag
          editor_id
          editor {
            name
          }
        }
      }
    `,
    {
      variables: {
        condition: condition,
      },
    },
  )

  const appPages: AppPageProps[] =
    data?.app_page
      .map(v => ({
        id: v.id,
        path: v.path || null,
        title: v.title || null,
        craftData: v.craft_data,
        editorId: v.editor_id || null,
        editorName: v.editor?.name || null,
        publishedAt: v.published_at ? new Date(v.published_at) : null,
        updatedAt: new Date(v.updated_at),
        options: v.options,
        metaTag: v.meta_tag,
      }))
      .filter(v => v.craftData) || []

  return {
    refetchAppPages: refetch,
    loadingAppPages: loading,
    errorAppPages: error,
    appPages,
  }
}

export const useMutateAppPage = () => {
  const { id: appId } = useApp()
  const [insertAppPageHandler] = useMutation<hasura.INSERT_APP_PAGE, hasura.INSERT_APP_PAGEVariables>(gql`
    mutation INSERT_APP_PAGE(
      $appId: String!
      $path: String
      $editorId: String!
      $title: String!
      $craftData: jsonb
      $options: jsonb
    ) {
      insert_app_page_one(
        object: {
          app_id: $appId
          path: $path
          title: $title
          editor_id: $editorId
          craft_data: $craftData
          options: $options
        }
      ) {
        id
      }
    }
  `)
  const insertAppPage = (values: {
    path?: string
    title: string
    editorId: string
    craftData: { [key: string]: any } | null
    options: { [key: string]: any }
  }) => {
    return insertAppPageHandler({
      variables: { appId, ...values },
    })
  }
  const [updateAppPageHandler] = useMutation<hasura.UPDATE_APP_PAGE, hasura.UPDATE_APP_PAGEVariables>(gql`
    mutation UPDATE_APP_PAGE($pageId: uuid!, $updated: app_page_set_input) {
      update_app_page_by_pk(pk_columns: { id: $pageId }, _set: $updated) {
        id
      }
    }
  `)
  const updateAppPage = (values: {
    pageId: string
    path?: string
    title?: string
    editorId?: string
    publishedAt?: Date | null
    craftData?: { [key: string]: any }
    options?: { [key: string]: any }
    isDeleted?: boolean
  }) => {
    return updateAppPageHandler({
      variables: {
        pageId: values.pageId,
        updated: {
          path: values.path,
          title: values.title,
          editor_id: values.editorId,
          craft_data: values.craftData,
          options: values.options,
          is_deleted: values.isDeleted,
          published_at: values.publishedAt,
        },
      },
    })
  }
  const [updateAppPageMetaTag] = useMutation<hasura.UPDATE_APP_PAGE_META_TAG, hasura.UPDATE_APP_PAGE_META_TAGVariables>(
    gql`
      mutation UPDATE_APP_PAGE_META_TAG($id: uuid!, $metaTag: jsonb) {
        update_app_page(where: { id: { _eq: $id } }, _set: { meta_tag: $metaTag }) {
          affected_rows
        }
      }
    `,
  )

  return {
    insertAppPage,
    updateAppPage,
    updateAppPageMetaTag,
  }
}
