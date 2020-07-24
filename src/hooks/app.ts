import { useMutation, useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import types from '../types'
import { Module, AppProps } from '../types/app'

export const useAppData = (appId: string) => {
  const { loading, error, data, refetch } = useQuery<types.GET_APP_BY_PK, types.GET_APP_BY_PKVariables>(
    gql`
      query GET_APP_BY_PK($appId: String!) {
        app_by_pk(id: $appId) {
          id
          name
          title
          description
          vimeo_project_id
          app_modules {
            id
            module_id
          }
          app_settings {
            key
            value
          }
          app_secrets {
            key
            value
          }
        }
      }
    `,
    {
      variables: {
        appId,
      },
    },
  )

  const app: AppProps | null =
    loading || error || !data || !data.app_by_pk
      ? null
      : (() => ({
          id: data.app_by_pk.id,
          name: data.app_by_pk.name,
          title: data.app_by_pk.title,
          description: data.app_by_pk.description,
          vimeoProjectId: data.app_by_pk.vimeo_project_id,
          enabledModules: data.app_by_pk.app_modules.reduce((dict, el, indx) => {
            dict[el.module_id as Module] = true
            return dict
          }, {} as { [key in Module]?: boolean }),
          settings: data.app_by_pk.app_settings.reduce((dict, el, index) => {
            dict[el.key] = el.value
            return dict
          }, {} as { [key: string]: string }),
          secrets: data.app_by_pk.app_secrets.reduce((dict, el, index) => {
            dict[el.key] = el.value
            return dict
          }, {} as { [key: string]: string }),
        }))()

  return {
    app,
    errorApp: error,
    loadingApp: loading,
    refetchApp: refetch,
  }
}

export const useUpdateApp = () => {
  const [updateApp] = useMutation<types.UPDATE_APP, types.UPDATE_APPVariables>(
    gql`
      mutation UPDATE_APP(
        $appId: String!
        $name: String
        $title: String
        $description: String
        $vimeoProjectId: String
      ) {
        update_app(
          where: { id: { _eq: $appId } }
          _set: {
            name: $name
            title: $title
            description: $description
            vimeo_project_id: $vimeoProjectId
          }
        ) {
          affected_rows
        }
      }
    `,
  )

  return updateApp
}

export const useUpdateAppSettings = () => {
  const [updateAppSettings] = useMutation<types.UPSERT_APP_SETTINGS, types.UPSERT_APP_SETTINGSVariables>(
    gql`
      mutation UPSERT_APP_SETTINGS($appSettings: [app_setting_insert_input!]!) {
        insert_app_setting(objects: $appSettings, on_conflict: {update_columns: value, constraint: app_setting_app_id_key_key}) {
          affected_rows
        }
      }
    `
  )

  return updateAppSettings
}

export const useUpdateAppSecrets = () => {
  const [updateAppSecrets] = useMutation<types.UPSERT_APP_SECRETS, types.UPSERT_APP_SECRETSVariables>(
    gql`
      mutation UPSERT_APP_SECRETS($appSecrets: [app_secret_insert_input!]!) {
        insert_app_secret(objects: $appSecrets, on_conflict: {update_columns: value, constraint: app_secret_app_id_key_key}) {
          affected_rows
        }
      }
    `
  )

  return updateAppSecrets
}