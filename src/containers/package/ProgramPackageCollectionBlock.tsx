import gql from 'graphql-tag'
import { sum, uniqBy } from 'ramda'
import React from 'react'
import { useQuery } from 'react-apollo-hooks'
import ProgramPackageCollectionBlockComponent from '../../components/package/ProgramPackageCollectionBlock'
import types from '../../types'

type ProgramPackageCollectionBlockProps = {
  memberId: string
}
const ProgramPackageCollectionBlock: React.FC<ProgramPackageCollectionBlockProps> = ({ memberId }) => {
  const { loading, error, data } = useQuery<
    types.GET_ENROLLED_PROGRAM_PACKAGES,
    types.GET_ENROLLED_PROGRAM_PACKAGESVariables
  >(GET_ENROLLED_PROGRAM_PACKAGES, { variables: { memberId } })

  const programPackages =
    loading || !!error || !data
      ? []
      : uniqBy(programPackage => programPackage.id, data.program_package).map(programPackage => ({
          id: programPackage.id,
          coverUrl: programPackage.cover_url || undefined,
          title: programPackage.title,
          programCount: programPackage.program_package_programs.length,
          totalDuration: sum(
            programPackage.program_package_programs
              .map(programPackageProgram =>
                programPackageProgram.program.program_content_sections
                  .map(programContentSection =>
                    programContentSection.program_contents.map(programContent => programContent.duration),
                  )
                  .flat(),
              )
              .flat(),
          ),
        }))

  return <ProgramPackageCollectionBlockComponent loading={loading} error={error} programPackages={programPackages} />
}

const GET_ENROLLED_PROGRAM_PACKAGES = gql`
  query GET_ENROLLED_PROGRAM_PACKAGES($memberId: String!) {
    program_package(
      where: { program_package_plans: { program_package_plan_enrollments: { member_id: { _eq: $memberId } } } }
      distinct_on: id
    ) {
      id
      cover_url
      title
      published_at
      program_package_programs {
        id
        program {
          id
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

export default ProgramPackageCollectionBlock
