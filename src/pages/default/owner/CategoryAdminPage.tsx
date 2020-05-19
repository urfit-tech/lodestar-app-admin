import { useQuery } from '@apollo/react-hooks'
import { Button, Icon, Typography } from 'antd'
import React, { useContext, useEffect, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import Sortable from 'react-sortablejs'
import { InferType } from 'yup'
import AdminCard from '../../../components/admin/AdminCard'
import DraggableItem from '../../../components/common/DraggableItem'
import OwnerAdminLayout from '../../../components/layout/OwnerAdminLayout'
import { GET_PROGRAM_CATEGORIES } from '../../../components/program/ProgramCategorySelector'
import AppContext from '../../../contexts/AppContext'
import { commonMessages } from '../../../helpers/translation'
import { useDeleteCategory, useInsertCategory, useUpdateCategory } from '../../../hooks/data'
import { categorySchema } from '../../../schemas/program'
import types from '../../../types'

const messages = defineMessages({
  deleteCategoryNotation: {
    id: 'common.text.deleteCategoryNotation',
    defaultMessage: '確定要刪除此類別？此動作無法復原',
  },
})

const CategoryAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { id: appId } = useContext(AppContext)
  const { loading, data, refetch } = useQuery<types.GET_PROGRAM_CATEGORIES, types.GET_PROGRAM_CATEGORIESVariables>(
    GET_PROGRAM_CATEGORIES,
    {
      variables: { appId },
    },
  )
  const insertCategory = useInsertCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()
  const [categories, setCategories] = useState<InferType<typeof categorySchema>[]>([])

  useEffect(() => {
    data && data.category && setCategories(data.category)
  }, [data])

  return (
    <OwnerAdminLayout>
      <Typography.Title level={3} className="mb-4">
        <Icon type="book" className="mr-3" />
        <span>{formatMessage(commonMessages.menu.categories)}</span>
      </Typography.Title>

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
            appId &&
              insertCategory({
                variables: {
                  appId,
                  name: `Untitled-${categories.length + 1}`,
                  position: categories.length,
                  classType: 'program',
                },
              }).then(() => refetch())
          }}
        >
          {formatMessage(commonMessages.ui.addCategory)}
        </Button>
      </AdminCard>
    </OwnerAdminLayout>
  )
}

export default CategoryAdminPage
