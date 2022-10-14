import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import hasura from '../hasura'

export const useProject = () => {
  const [insertProject] = useMutation<hasura.INSERT_PROJECT, hasura.INSERT_PROJECTVariables>(gql`
    mutation INSERT_PROJECT(
      $appId: String!
      $title: String!
      $memberId: String!
      $type: String!
      $projectCategories: [project_category_insert_input!]!
    ) {
      insert_project(
        objects: {
          app_id: $appId
          title: $title
          creator_id: $memberId
          type: $type
          project_categories: { data: $projectCategories }
        }
      ) {
        affected_rows
        returning {
          id
        }
      }
    }
  `)
  const [insertProjectRole] = useMutation<hasura.INSERT_PROJECT_ROLE, hasura.INSERT_PROJECT_ROLEVariables>(gql`
    mutation INSERT_PROJECT_ROLE($projectId: uuid!, $memberId: String!, $identityId: uuid!) {
      insert_project_role(objects: { project_id: $projectId, member_id: $memberId, identity_id: $identityId }) {
        affected_rows
        returning {
          id
        }
      }
    }
  `)
  return {
    insertProject,
    insertProjectRole,
  }
}
