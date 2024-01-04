import { useMutation, gql } from '@apollo/client'
import hasura from '../hasura'

export const useMutateProgramContentEbook = () => {
  const [insertProgramContentEbook] = useMutation<
    hasura.InsertProgramContentEbook,
    hasura.InsertProgramContentEbookVariables
  >(
    gql`
      mutation InsertProgramContentEbook($programContentEbook: program_content_ebook_insert_input!) {
        insert_program_content_ebook_one(object: $programContentEbook) {
          program_content_id
          data
        }
      }
    `,
  )

  const [deleteProgramContentEbook] = useMutation<
    hasura.DeleteProgramContentEbook,
    hasura.DeleteProgramContentEbookVariables
  >(gql`
    mutation DeleteProgramContentEbook($programContentId: uuid!) {
      delete_program_content_ebook(where: { program_content_id: { _eq: $programContentId } }) {
        affected_rows
      }
    }
  `)

  const [deleteProgramContentEbookToc] = useMutation<
    hasura.DeleteProgramContentEbookToc,
    hasura.DeleteProgramContentEbookTocVariables
  >(gql`
    mutation DeleteProgramContentEbookToc($programContentId: uuid!) {
      delete_program_content_ebook_toc(where: { program_content_id: { _eq: $programContentId } }) {
        affected_rows
      }
    }
  `)
  return {
    insertProgramContentEbook,
    deleteProgramContentEbook,
    deleteProgramContentEbookToc,
  }
}
