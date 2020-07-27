import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Typography } from 'antd'
import React, { useContext, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { ReactSortable } from 'react-sortablejs'
import AppContext from '../../contexts/AppContext'
import { commonMessages } from '../../helpers/translation'
import {
  useCategory,
  useDeleteCategory,
  useInsertCategory,
  useUpdateCategory,
  useUpdateCategoryPosition,
} from '../../hooks/data'
import { ClassType } from '../../types/general'
import AdminCard from '../admin/AdminCard'
import DraggableItem from './DraggableItem'

const messages = defineMessages({
  deleteCategoryNotation: {
    id: 'common.text.deleteCategoryNotation',
    defaultMessage: '確定要刪除此類別？此動作無法復原',
  },
})

const CategoryAdminCard: React.FC<{
  classType: ClassType
}> = ({ classType }) => {
  const { formatMessage } = useIntl()
  const app = useContext(AppContext)
  const { loading: loadingCategory, categories, refetch } = useCategory(classType)

  const insertCategory = useInsertCategory()
  const updateCategory = useUpdateCategory()
  const updateCategoryPosition = useUpdateCategoryPosition()
  const deleteCategory = useDeleteCategory()

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
                  if (window.confirm(formatMessage(messages.deleteCategoryNotation))) {
                    deleteCategory({
                      variables: { categoryId: category.id },
                    }).then(() => refetch())
                  }
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

export default CategoryAdminCard
