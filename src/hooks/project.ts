import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import types from '../types'

export const useProject = () => {
  const [insertProject] = useMutation<types.INSERT_PROJECT, types.INSERT_PROJECTVariables>(gql`
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
