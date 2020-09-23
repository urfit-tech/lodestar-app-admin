import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Typography } from 'antd'
import gql from 'graphql-tag'
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import { ReactSortable } from 'react-sortablejs'
import AppContext from '../../contexts/AppContext'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { useCategory } from '../../hooks/data'
import types from '../../types'
import { ClassType } from '../../types/general'
import DraggableItem from '../common/DraggableItem'
import AdminCard from './AdminCard'

const CategoryAdminCard: React.FC<{
  classType: ClassType
}> = ({ classType }) => {
  const { formatMessage } = useIntl()
  const app = useContext(AppContext)
  const { loading: loadingCategory, categories, refetch } = useCategory(classType)

  const [insertCategory] = useMutation<types.INSERT_PROGRAM_CATEGORY, types.INSERT_PROGRAM_CATEGORYVariables>(
    INSERT_PROGRAM_CATEGORY,
  )
  const [updateCategory] = useMutation<types.UPDATE_CATEGORY, types.UPDATE_CATEGORYVariables>(UPDATE_CATEGORY)
  const [updateCategoryPosition] = useMutation<types.UPDATE_CATEGORY_POSITION, types.UPDATE_CATEGORY_POSITIONVariables>(
    UPDATE_CATEGORY_POSITION,
  )
  const [deleteCategory] = useMutation<types.DELETE_PROGRAM_CATEGORY, types.DELETE_PROGRAM_CATEGORYVariables>(
    DELETE_PROGRAM_CATEGORY,
  )

  const [loading, setLoading] = useState(false)

  return (
    <AdminCard loading={loadingCategory} className={loading ? 'mask' : ''}>
      <Typography.Text>{formatMessage(commonMessages.label.categoryItem)}</Typography.Text>
      <ReactSortable
        className="mt-3"
        handle=".draggable-category"
        list={categories}
        setList={newCategories => {
          setLoading(true)
          updateCategoryPosition({
            variables: {
              data: newCategories.map((category, index) => ({
                app_id: app.id,
                id: category.id,
                name: category.name,
                class: classType,
                position: index,
              })),
            },
          }).then(() => refetch().then(() => setLoading(false)))
        }}
      >
        {categories.map(category => (
          <DraggableItem
            key={category.id}
            className="mb-2"
            dataId={category.id}
            handlerClassName="draggable-category"
            actions={[
              <DeleteOutlined
                key="delete"
                onClick={() => {
                  window.confirm(formatMessage(commonMessages.text.deleteCategoryNotation)) &&
                    deleteCategory({ variables: { categoryId: category.id } })
                      .then(() => refetch())
                      .catch(handleError)
                }}
              />,
            ]}
          >
            <Typography.Text
              editable={{
                onChange: name => {
                  updateCategory({
                    variables: {
                      categoryId: category.id,
                      name,
                      position: category.position,
                    },
                  }).then(() => refetch())
                },
              }}
            >
              {category.name}
            </Typography.Text>
          </DraggableItem>
        ))}
      </ReactSortable>

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

const INSERT_PROGRAM_CATEGORY = gql`
  mutation INSERT_PROGRAM_CATEGORY($appId: String!, $name: String, $classType: String, $position: Int) {
    insert_category(objects: { app_id: $appId, name: $name, class: $classType, position: $position }) {
      affected_rows
    }
  }
`
const UPDATE_CATEGORY = gql`
  mutation UPDATE_CATEGORY($categoryId: String!, $name: String, $position: Int) {
    update_category(_set: { name: $name, position: $position }, where: { id: { _eq: $categoryId } }) {
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
const DELETE_PROGRAM_CATEGORY = gql`
  mutation DELETE_PROGRAM_CATEGORY($categoryId: String!) {
    delete_category(where: { id: { _eq: $categoryId } }) {
      affected_rows
    }
  }
`

export default CategoryAdminCard
