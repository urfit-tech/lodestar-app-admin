import { useMutation, useQuery } from '@apollo/react-hooks'
import { Button, Icon, Typography } from 'antd'
import gql from 'graphql-tag'
import React, { useEffect, useState } from 'react'
import Sortable from 'react-sortablejs'
import { InferType } from 'yup'
import AdminCard from '../../../components/common/AdminCard'
import DraggableItem from '../../../components/common/DraggableItem'
import OwnerAdminLayout from '../../../components/layout/OwnerAdminLayout'
import { GET_PROGRAM_CATEGORIES } from '../../../components/program/ProgramCategorySelector'
import { categorySchema } from '../../../schemas/program'
import types from '../../../types'

const ProgramGeneralAdminPage = () => {
  const { loading, data, refetch } = useQuery<types.GET_PROGRAM_CATEGORIES, types.GET_PROGRAM_CATEGORIESVariables>(
    GET_PROGRAM_CATEGORIES,
    {
      variables: { appId: localStorage.getItem('kolable.app.id') || '' },
    },
  )
  const [insertProgramCategory] = useMutation<types.INSERT_PROGRAM_CATEGORY, types.INSERT_PROGRAM_CATEGORYVariables>(
    INSERT_PROGRAM_CATEGORY,
  )
  const [updateProgramCategory] = useMutation<types.UPDATE_PROGRAM_CATEGORY, types.UPDATE_PROGRAM_CATEGORYVariables>(
    UPDATE_PROGRAM_CATEGORY,
  )
  const [deleteProgramCategory] = useMutation<types.DELETE_PROGRAM_CATEGORY, types.DELETE_PROGRAM_CATEGORYVariables>(
    DELETE_PROGRAM_CATEGORY,
  )
  const [categories, setCategories] = useState<InferType<typeof categorySchema>[]>([])
  useEffect(() => {
    data && data.category && setCategories(data.category)
  }, [data])
  return (
    <OwnerAdminLayout>
      <Typography.Title level={3} className="mb-4">
        <Icon type="book" className="mr-3" />
        <span>課程設定</span>
      </Typography.Title>

      <AdminCard loading={loading}>
        <Typography.Text>分類項目</Typography.Text>
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
                    if (window.confirm('確定要刪除此類別？此動作無法復原')) {
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
                  name: `未命名分類-${categories.length + 1}`,
                  position: categories.length,
                },
              }).then(() => refetch())
          }}
        >
          新增分類
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

export default ProgramGeneralAdminPage
