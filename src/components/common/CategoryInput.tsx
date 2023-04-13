import { gql, useQuery } from '@apollo/client'
import { Select } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import hasura from '../../hasura'

const CategoryInput: React.VFC<{
  categoryClass: string
  value?: string
  onChange?: (category: string | null) => void
}> = ({ categoryClass, value, onChange }) => {
  const { id: appId } = useApp()
  const { loading, error, data } = useQuery<hasura.GET_CATEGORY_LIST>(
    gql`
      query GET_CATEGORY_LIST($appId: String!, $class: String!) {
        category(where: { app_id: { _eq: $appId }, class: { _eq: $class } }) {
          id
          name
        }
      }
    `,
    {
      variables: {
        appId,
        class: categoryClass,
      },
    },
  )

  return (
    <Select
      mode="multiple"
      allowClear
      loading={loading || !!error}
      style={{ width: '100%' }}
      value={value}
      onChange={value => onChange?.(value || null)}
    >
      {data?.category.map(v => (
        <Select.Option key={v.id} value={v.name}>
          {v.name}
        </Select.Option>
      ))}
    </Select>
  )
}

export default CategoryInput
