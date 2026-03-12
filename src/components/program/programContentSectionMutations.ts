import { gql } from '@apollo/client'

export const DELETE_PROGRAM_CONTENT_SECTION = gql`
  mutation DELETE_PROGRAM_CONTENT_SECTION($programContentSectionId: uuid!, $programContentIds: [uuid!]!) {
    delete_program_content_plan(
      where: { program_content: { content_section_id: { _eq: $programContentSectionId } } }
    ) {
      affected_rows
    }
    delete_program_content_progress(
      where: { program_content: { content_section_id: { _eq: $programContentSectionId } } }
    ) {
      affected_rows
    }
    delete_practice(where: { program_content: { content_section_id: { _eq: $programContentSectionId } } }) {
      affected_rows
    }
    delete_exercise(where: { program_content: { content_section_id: { _eq: $programContentSectionId } } }) {
      affected_rows
    }
    delete_program_content_log(
      where: { program_content: { content_section_id: { _eq: $programContentSectionId } } }
    ) {
      affected_rows
    }
    delete_program_content_video(
      where: { program_content: { content_section_id: { _eq: $programContentSectionId } } }
    ) {
      affected_rows
    }
    delete_program_content_audio(
      where: { program_content: { content_section_id: { _eq: $programContentSectionId } } }
    ) {
      affected_rows
    }
    delete_program_content_ebook_bookmark(where: { program_content_id: { _in: $programContentIds } }) {
      affected_rows
    }
    delete_program_content_ebook_highlight(where: { program_content_id: { _in: $programContentIds } }) {
      affected_rows
    }
    delete_program_content_body(
      where: { program_contents: { content_section_id: { _eq: $programContentSectionId } } }
    ) {
      affected_rows
    }
    delete_program_content_section(where: { id: { _eq: $programContentSectionId } }) {
      affected_rows
    }
  }
`
