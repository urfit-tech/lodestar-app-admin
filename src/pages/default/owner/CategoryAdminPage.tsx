import { useMutation } from '@apollo/react-hooks'
import { Button, Icon, Typography } from 'antd'
import gql from 'graphql-tag'
import React, { useContext, useEffect, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import Sortable from 'react-sortablejs'
import AdminCard from '../../../components/admin/AdminCard'
import DraggableItem from '../../../components/common/DraggableItem'
import OwnerAdminLayout from '../../../components/layout/OwnerAdminLayout'
import AppContext from '../../../contexts/AppContext'
import { commonMessages } from '../../../helpers/translation'
import { useCategory } from '../../../hooks/category'
import types from '../../../types'
import { Category } from '../../../types/category'

const messages = defineMessages({
  deleteCategoryNotation: {
    id: 'common.text.deleteCategoryNotation',
    defaultMessage: '確定要刪除此類別？此動作無法復原',
  },
})

const CategoryAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { id: appId } = useContext(AppContext)
  const { loading, categories: data, refetch } = useCategory(appId)
  const [insertProgramCategory] = useMutation<types.INSERT_PROGRAM_CATEGORY, types.INSERT_PROGRAM_CATEGORYVariables>(
    INSERT_PROGRAM_CATEGORY,
  )
  const [updateProgramCategory] = useMutation<types.UPDATE_PROGRAM_CATEGORY, types.UPDATE_PROGRAM_CATEGORYVariables>(
    UPDATE_PROGRAM_CATEGORY,
  )
  const [deleteProgramCategory] = useMutation<types.DELETE_PROGRAM_CATEGORY, types.DELETE_PROGRAM_CATEGORYVariables>(
    DELETE_PROGRAM_CATEGORY,
  )
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    data && setCategories(data)
  }, [JSON.stringify(data)])

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
              updateProgramCategory({
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
                      deleteProgramCategory({
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
                    updateProgramCategory({
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
              insertProgramCategory({
                variables: {
                  appId,
                  name: `Untitled-${categories.length + 1}`,
                  position: categories.length,
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

const INSERT_PROGRAM_CATEGORY = gql`
  mutation INSERT_PROGRAM_CATEGORY($appId: String!, $name: String, $position: Int) {
    insert_category(objects: { app_id: $appId, name: $name, class: "program", position: $position }) {
      affected_rows
    }
  }
`

const UPDATE_PROGRAM_CATEGORY = gql`
  mutation UPDATE_PROGRAM_CATEGORY($categoryId: String!, $name: String, $position: Int) {
    update_category(where: { id: { _eq: $categoryId } }, _set: { name: $name, position: $position }) {
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

export default CategoryAdminPage
