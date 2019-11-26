import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { sum } from 'ramda'
import React from 'react'
import { Redirect } from 'react-router'
import ProgramPackageContentComponent from '../../components/package/ProgramPackageContent'
import types from '../../types'

const ProgramCollectionContent: React.FC<{
  programPackageId: string
}> = ({ programPackageId }) => {
  const { loading, error, data } = useQuery<
    types.GET_PROGRAM_PACKAGE_CONTENT,
    types.GET_PROGRAM_PACKAGE_CONTENTVariables
  >(GET_PROGRAM_PACKAGE_CONTENT, {
    variables: {
      id: programPackageId,
    },
  })

  if (
    !loading &&
    !error &&
    data &&
    (!data.program_package_by_pk ||
      !data.program_package_by_pk.published_at ||
      new Date(data.program_package_by_pk.published_at).getTime() > Date.now())
  ) {
    return <Redirect to="/programs" />
  }

  const programPackage =
    loading || !!error || !data || !data.program_package_by_pk
      ? {
          title: '',
          coverUrl: '',
          programCount: 0,
          totalDuration: 0,
          programs: [],
        }
      : {
          title: data.program_package_by_pk.title,
          coverUrl: data.program_package_by_pk.cover_url || undefined,
          programCount: data.program_package_by_pk.program_package_programs.length,
          totalDuration: sum(
            data.program_package_by_pk.program_package_programs
              .map(programPackageProgram =>
                programPackageProgram.program.program_content_sections
                  .map(programContentSection =>
                    programContentSection.program_contents.map(programContent => programContent.duration || 0),
                  )
                  .flat(),
              )
              .flat(),
          ),
          programs: data.program_package_by_pk.program_package_programs.map(programPackageProgram => ({
            id: programPackageProgram.program.id,
            title: programPackageProgram.program.title,
            coverUrl: programPackageProgram.program.cover_url || undefined,
            categories: programPackageProgram.program.program_categories.map(programCategory => ({
              id: programCategory.category.id,
              name: programCategory.category.name,
            })),
          })),
        }

  return <ProgramPackageContentComponent loading={loading} error={error} programPackage={programPackage} />
}

const GET_PROGRAM_PACKAGE_CONTENT = gql`
  query GET_PROGRAM_PACKAGE_CONTENT($id: uuid!) {
    program_package_by_pk(id: $id) {
      id
      cover_url
      title
      published_at
      program_package_programs {
        id
        program {
          id
          cover_url
          title
          program_categories {
            id
            category {
              id
              name
            }
          }
          program_content_sections {
            id
            program_contents {
              id
              duration
            }
          }
        }
      }
    }
  }
`

export default ProgramCollectionContent
