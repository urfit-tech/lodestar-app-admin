import { gql } from '@apollo/client'

export const GetAppPageLanguage = gql`
  query GetAppPageLanguage($condition: app_page_bool_exp!) {
    app_page(where: $condition) {
      id
    }
  }
`
