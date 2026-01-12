import { gql, useQuery } from '@apollo/client'
import { Select } from 'antd'
import { SelectProps } from 'antd/lib/select'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import programMessages from '../program/translation'

export const OwnedProgramPackageSelector: React.VFC<{ noAll?: boolean } & SelectProps<string | string[]>> = ({
  noAll,
  ...selectProps
}) => {
  const { formatMessage } = useIntl()
  const { loading: loadingProgramPackages, error, programPackages } = useProgramPackages()

  return (
    <Select
      loading={loadingProgramPackages}
      style={{ width: '100%' }}
      defaultValue={noAll ? undefined : 'all'}
      filterOption={(input, option) =>
        option?.label ? (option.label as string).toLowerCase().indexOf(input.toLowerCase()) >= 0 : true
      }
      {...selectProps}
    >
      {!noAll && (
        <Select.Option value="all">
          {formatMessage(programMessages.ProgramPackageSelector.allProgramPackage)}
        </Select.Option>
      )}
      {programPackages.map(programPackage => (
        <Select.Option key={programPackage.id} value={programPackage.id} label={programPackage.title}>
          {programPackage.title}
        </Select.Option>
      ))}
    </Select>
  )
}

const useProgramPackages = (options?: { isPublished: boolean }) => {
  const condition: hasura.GET_PUBLISHED_PROGRAM_PACKAGEVariables['condition'] = {
    published_at: options?.isPublished ? { _is_null: false } : undefined,
  }
  const { loading, error, data } = useQuery<
    hasura.GET_PUBLISHED_PROGRAM_PACKAGE,
    hasura.GET_PUBLISHED_PROGRAM_PACKAGEVariables
  >(
    gql`
      query GET_PUBLISHED_PROGRAM_PACKAGE($condition: program_package_bool_exp!) {
        program_package(where: $condition) {
          id
          title
        }
      }
    `,
    { variables: { condition } },
  )
  const programPackages =
    data?.program_package.map(v => ({
      id: v.id,
      title: v.title || '',
    })) || []

  return {
    loading,
    error,
    programPackages,
  }
}
