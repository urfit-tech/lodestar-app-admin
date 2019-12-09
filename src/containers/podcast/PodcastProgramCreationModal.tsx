import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import React from 'react'
import useRouter from 'use-react-router'
import PodcastProgramCreationModalComponent from '../../components/podcast/PodcastProgramCreationModal'
import types from '../../types'

export type CreatePodcastProgramProps = (props: {
  onSuccess?: () => void
  onError?: (error: Error) => void
  onFinally?: () => void
  data: {
    title: string
    categoryIds: string[]
  }
}) => void

const PodcastProgramCreationModal: React.FC<{
  memberId: string
}> = ({ memberId }) => {
  const { history } = useRouter()
  const [createPodcastProgram] = useMutation<types.CREATE_PODCAST_PROGRAM, types.CREATE_PODCAST_PROGRAMVariables>(CREATE_PODCAST_PROGRAM)

  const handleCreate: CreatePodcastProgramProps = ({ onSuccess, onError, onFinally, data }) => {
    createPodcastProgram({
      variables: {
        title: data.title,
        creatorId: memberId,
        podcastCategories: data.categoryIds.map((categoryId, index) => ({
          category_id: categoryId,
          position: index,
        })),
      },
    })
      .then(({ data }) => {
        onSuccess && onSuccess()

        data &&
          data.insert_podcast_program &&
          data.insert_podcast_program.returning &&
          history.push(`/admin/podcasts/${data.insert_podcast_program.returning[0].id}`)
      })
      .catch(error => {
        onError && onError(error)
      })
      .finally(() => {
        onFinally && onFinally()
      })
  }

  return <PodcastProgramCreationModalComponent onCreate={handleCreate} />
}

const CREATE_PODCAST_PROGRAM = gql`
  mutation CREATE_PODCAST_PROGRAM(
    $title: String!
    $creatorId: String!
    $podcastCategories: [podcast_program_category_insert_input!]!
  ) {
    insert_podcast_program(
      objects: {
        title: $title
        creator_id: $creatorId
        podcast_program_categories: { data: $podcastCategories }
        podcast_program_bodies: { data: { description: "" } }
        podcast_program_roles: { data: { member_id: $creatorId, name: "instructor" } }
      }
    ) {
      affected_rows
      returning {
        id
      }
    }
  }
`

export default PodcastProgramCreationModal
