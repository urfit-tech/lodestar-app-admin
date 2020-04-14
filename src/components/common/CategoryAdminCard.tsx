import { Button, Icon, Typography } from 'antd'
import React, { useEffect, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import Sortable from 'react-sortablejs'
import { commonMessages } from '../../helpers/translation'
import { useCategory, useDeleteCategory, useInsertCategory, useUpdateCategory } from '../../hooks/data'
import { Category, ClassType } from '../../types/general'
import AdminCard from '../admin/AdminCard'
import DraggableItem from './DraggableItem'

const messages = defineMessages({
  deleteCategoryNotation: {
    id: 'common.text.deleteCategoryNotation',
    defaultMessage: '確定要刪除此類別？此動作無法復原',
  },
})

const CategoryAdminCard: React.FC<{ classType: ClassType }> = ({ classType }) => {
  const { formatMessage } = useIntl()
  const { loading, categories: data, refetch } = useCategory(classType)
  console.log('categories', data)

  const insertCategory = useInsertCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    data && setCategories(data)
  }, [JSON.stringify(data)])

  return (
    <AdminCard loading={loading}>
      <Typography.Text>{formatMessage(commonMessages.label.categoryItem)}</Typography.Text>
      <Sortable
        className="mt-3"
        options={{ handle: '.draggable-category' }}
        onChange={(categoryStrings: string[]) => {
          const newCategories = categoryStrings.map(categoryString => JSON.parse(categoryString))
          setCategories(newCategories)
          newCategories.map((category, idx) =>
            updateCategory({
              variables: {
                categoryId: category.id,
                name: category.name,
                position: idx,
              },
            }),
          )
        }}
      >
        {categories.map(category => (
          <DraggableItem
            key={category.id}
            className="mb-2"
            dataId={JSON.stringify(category)}
            handlerClassName="draggable-category"
            actions={[
              <Icon
                type="delete"
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
      </Sortable>
      <Button
        icon="plus"
        type="link"
        onClick={() => {
          const appId = localStorage.getItem('kolable.app.id')
          appId &&
            insertCategory({
              variables: {
                appId,
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
