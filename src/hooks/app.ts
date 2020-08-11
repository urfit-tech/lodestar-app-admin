import { useMutation, useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import types from '../types'
import { Module, AppProps } from '../types/app'

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
          _set: { name: $name, title: $title, description: $description, vimeo_project_id: $vimeoProjectId }
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
        insert_app_setting(
          objects: $appSettings
          on_conflict: { update_columns: value, constraint: app_setting_app_id_key_key }
        ) {
          affected_rows
        }
      }
    `,
  )

  return updateAppSettings
}

export const useUpdateAppSecrets = () => {
  const [updateAppSecrets] = useMutation<types.UPSERT_APP_SECRETS, types.UPSERT_APP_SECRETSVariables>(
    gql`
      mutation UPSERT_APP_SECRETS($appSecrets: [app_secret_insert_input!]!) {
        insert_app_secret(
          objects: $appSecrets
          on_conflict: { update_columns: value, constraint: app_secret_app_id_key_key }
        ) {
          affected_rows
        }
      }
    `,
  )

  return updateAppSecrets
}
