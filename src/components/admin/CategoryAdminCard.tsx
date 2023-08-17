import { PlusOutlined } from '@ant-design/icons'
import { gql, useMutation } from '@apollo/client'
import { Button, Typography } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { useCategory } from '../../hooks/data'
import { ClassType } from '../../types/general'
import DraggableItemCollectionBlock from '../common/DraggableItemCollectionBlock'
import AdminCard from './AdminCard'

const CategoryAdminCard: React.FC<{
  classType: ClassType
}> = ({ classType }) => {
  const { formatMessage } = useIntl()
  const app = useApp()
  const { loading: loadingCategory, categories, refetch } = useCategory(classType)

  const [insertCategory] = useMutation<hasura.INSERT_CATEGORY, hasura.INSERT_CATEGORYVariables>(INSERT_CATEGORY)
  const [updateCategoryName] = useMutation<hasura.UPDATE_CATEGORY_NAME, hasura.UPDATE_CATEGORY_NAMEVariables>(
    UPDATE_CATEGORY_NAME,
  )
  const [updateCategoryPosition] = useMutation<
    hasura.UPDATE_CATEGORY_POSITION,
    hasura.UPDATE_CATEGORY_POSITIONVariables
  >(UPDATE_CATEGORY_POSITION)
  const [deleteCategory] = useMutation<hasura.DELETE_CATEGORY, hasura.DELETE_CATEGORYVariables>(DELETE_CATEGORY)

  const [loading, setLoading] = useState(false)

  return (
    <AdminCard loading={loadingCategory} className={loading ? 'mask' : ''}>
      <Typography.Text className="d-block mb-3">{formatMessage(commonMessages.label.categoryItem)}</Typography.Text>
      <DraggableItemCollectionBlock
        items={categories.map(v => ({ id: v.id, description: v.name }))}
        isEditable
        isDeletable
        onSort={newCategories => {
          setLoading(true)
          updateCategoryPosition({
            variables: {
              data: newCategories.map((category, index) => ({
                id: category.id,
                app_id: app.id,
                name: category.description || '',
                class: classType,
                position: index,
              })),
            },
          })
            .then(() => refetch())
            .catch(handleError)
            .finally(() => setLoading(false))
        }}
        onEdit={item => {
          updateCategoryName({
            variables: {
              categoryId: item.id,
              name: item.description || '',
            },
          })
            .then(() => refetch())
            .catch(handleError)
        }}
        onDelete={id => {
          deleteCategory({ variables: { categoryId: id } })
            .then(() => refetch())
            .catch(handleError)
        }}
      />
      <Button
        icon={<PlusOutlined />}
        type="link"
        onClick={() => {
          insertCategory({
            variables: {
              appId: app.id,
              name: `Untitled-${categories.length + 1}`,
              position: categories.length,
              classType,
            },
          }).then(() => refetch())
        }}
      >
        {formatMessage(commonMessages.ui.addCategory)}
      </Button>
    </AdminCard>
  )
}

const INSERT_CATEGORY = gql`
  mutation INSERT_CATEGORY($appId: String!, $name: String, $classType: String, $position: Int) {
    insert_category(objects: { app_id: $appId, name: $name, class: $classType, position: $position }) {
      affected_rows
    }
  }
`
const UPDATE_CATEGORY_NAME = gql`
  mutation UPDATE_CATEGORY_NAME($categoryId: String!, $name: String) {
    update_category(_set: { name: $name }, where: { id: { _eq: $categoryId } }) {
      affected_rows
    }
  }
`
const UPDATE_CATEGORY_POSITION = gql`
  mutation UPDATE_CATEGORY_POSITION($data: [category_insert_input!]!) {
    insert_category(objects: $data, on_conflict: { constraint: category_pkey, update_columns: position }) {
      affected_rows
    }
  }
`
const DELETE_CATEGORY = gql`
  mutation DELETE_CATEGORY($categoryId: String!) {
    delete_program_category(where: { category_id: { _eq: $categoryId } }) {
      affected_rows
    }
    delete_project_category(where: { category_id: { _eq: $categoryId } }) {
      affected_rows
    }
    delete_podcast_program_category(where: { category_id: { _eq: $categoryId } }) {
      affected_rows
    }
    delete_podcast_album_category(where: { category_id: { _eq: $categoryId } }) {
      affected_rows
    }
    delete_activity_category(where: { category_id: { _eq: $categoryId } }) {
      affected_rows
    }
    delete_post_category(where: { category_id: { _eq: $categoryId } }) {
      affected_rows
    }
    delete_merchandise_category(where: { category_id: { _eq: $categoryId } }) {
      affected_rows
    }
    delete_program_package_category(where: { category_id: { _eq: $categoryId } }) {
      affected_rows
    }
    delete_member_category(where: { category_id: { _eq: $categoryId } }) {
      affected_rows
    }
    delete_creator_category(where: { category_id: { _eq: $categoryId } }) {
      affected_rows
    }
    delete_voucher_category(where: { category_id: { _eq: $categoryId } }) {
      affected_rows
    }
    update_member_task(where: { category_id: { _eq: $categoryId } }, _set: { category_id: null }) {
      returning {
        id
      }
    }
    delete_category(where: { id: { _eq: $categoryId } }) {
      affected_rows
    }
  }
`

export default CategoryAdminCard
