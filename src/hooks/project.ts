import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import hasura from '../hasura'

export const useProject = () => {
  const [insertProject] = useMutation<hasura.INSERT_PROJECT, hasura.INSERT_PROJECTVariables>(gql`
    mutation INSERT_PROJECT($appId: String!, $title: String!, $memberId: String!, $type: String!) {
      insert_project(objects: { app_id: $appId, title: $title, creator_id: $memberId, type: $type }) {
        affected_rows
        returning {
          id
        }
      }
    }
  `)
  return {
    insertProject,
  }
}
