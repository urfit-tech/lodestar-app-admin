import { UserOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { DatePicker } from 'antd'
import gql from 'graphql-tag'
import moment, { Moment } from 'moment'
import { sum } from 'ramda'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle } from '../../components/admin'
import AdminLayout from '../../components/layout/AdminLayout'
import { commonMessages } from '../../helpers/translation'
import types from '../../types'

type FiltersProps = {
  range?: [Moment, Moment]
  author?: string
  manager?: string
  member?: string
  category?: string
  tag?: string
}

const NoteCollectionPage: React.FC = () => {
  const { formatMessage } = useIntl()

  const [filters, setFilters] = useState<FiltersProps>({})
  const { loadingNotes, notes, loadMoreNotes } = useMemberNotesAdmin(filters)

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <UserOutlined className="mr-3" />
        <span>{formatMessage(commonMessages.menu.noteAdmin)}</span>
      </AdminPageTitle>

      <DatePicker.RangePicker
        defaultValue={[moment().startOf('month'), moment().endOf('month')]}
        onChange={value =>
          value &&
          value[0] &&
          value[1] &&
          setFilters({
            ...filters,
            range: [value[0], value[1]],
          })
        }
        className="mb-4"
      />
    </AdminLayout>
  )
}

const useMemberNotesAdmin = (filters?: FiltersProps) => {
  const condition: types.MEMBER_NOTES_ADMINVariables['condition'] = {
    created_at: filters?.range
      ? {
          _gte: filters.range[0].toDate(),
          _lte: filters.range[1].toDate(),
        }
      : undefined,
    author: filters?.author
      ? {
          _or: [
            { name: { _ilike: filters.author } },
            { username: { _ilike: filters.author } },
            { email: { _ilike: filters.author } },
          ],
        }
      : undefined,
    member: {
      manager: filters?.manager
        ? {
            _or: [
              { name: { _ilike: filters.manager } },
              { username: { _ilike: filters.manager } },
              { email: { _ilike: filters.manager } },
            ],
          }
        : undefined,
      _or: filters?.member
        ? [
            { name: { _ilike: filters.member } },
            { username: { _ilike: filters.member } },
            { email: { _ilike: filters.member } },
          ]
        : undefined,

      member_categories: filters?.category
        ? {
            category: { name: { _ilike: filters.category } },
          }
        : undefined,
      member_tags: filters?.tag
        ? {
            tag_name: { _ilike: filters.tag },
          }
        : undefined,
    },
  }
  const { loading, error, data, refetch, fetchMore } = useQuery<
    types.MEMBER_NOTES_ADMIN,
    types.MEMBER_NOTES_ADMINVariables
  >(
    gql`
      query MEMBER_NOTES_ADMIN($condition: member_note_bool_exp) {
        member_note_aggregate(where: $condition) {
          aggregate {
            count
          }
        }
        member_note(where: $condition, order_by: { created_at: desc }, limit: 10) {
          id
          created_at
          author {
            id
            name
            username
          }
          member {
            id
            name
            email
            manager {
              id
              name
              username
            }
            member_categories {
              id
              category {
                id
                name
              }
            }
            member_tags {
              tag_name
            }
            order_logs {
              id
              order_products_aggregate {
                aggregate {
                  sum {
                    price
                  }
                }
              }
              order_discounts_aggregate {
                aggregate {
                  sum {
                    price
                  }
                }
              }
            }
          }
          duration
          metadata
          description
        }
      }
    `,
    { variables: { condition } },
  )

  const notes: {
    id: string
    createdAt: Date
    author: {
      id: string
      name: string
    }
    manager: {
      id: string
      name: string
    } | null
    member: {
      id: string
      name: string
      email: string
    } | null
    memberCategories: {
      id: string
      name: string
    }[]
    memberTags: string[]
    consumption: number
    duration: number
    audioFilePath: string | null
    description: string | null
  }[] =
    data?.member_note.map(v => ({
      id: v.id,
      createdAt: new Date(v.created_at),
      author: {
        id: v.author.id,
        name: v.author.name,
      },
      manager: v.member?.manager
        ? {
            id: v.member.manager.id,
            name: v.member.manager.name,
          }
        : null,
      member: v.member
        ? {
            id: v.member.id,
            name: v.member.name,
            email: v.member.email,
          }
        : null,
      memberCategories:
        v.member?.member_categories.map(u => ({
          id: u.category.id,
          name: u.category.name,
        })) || [],
      memberTags: v.member?.member_tags.map(u => u.tag_name) || [],
      consumption:
        sum(v.member?.order_logs.map(u => u.order_products_aggregate.aggregate?.sum?.price || 0) || []) -
        sum(v.member?.order_logs.map(u => u.order_discounts_aggregate.aggregate?.sum?.price || 0) || []),
      duration: v.duration || 0,
      audioFilePath: v.metadata?.recordfile || null,
      description: v.description,
    })) || []

  const loadMoreNotes = () =>
    fetchMore({
      variables: {
        condition: {
          ...condition,
          created_at: { _lt: data?.member_note.slice(-1)[0]?.created_at },
        },
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev
        }
        return {
          member_note_aggregate: fetchMoreResult.member_note_aggregate,
          member_note: [...prev.member_note, ...fetchMoreResult.member_note],
        }
      },
    })

  return {
    loadingNotes: loading,
    errorNotes: error,
    notes,
    refetchNotes: refetch,
    loadMoreNotes: (data?.member_note_aggregate.aggregate?.count || 0) > 10 ? loadMoreNotes : undefined,
  }
}

export default NoteCollectionPage
