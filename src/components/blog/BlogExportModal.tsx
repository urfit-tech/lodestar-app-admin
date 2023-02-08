import { LoadingOutlined } from '@ant-design/icons'
import { useApolloClient } from '@apollo/react-hooks'
import { useForm } from 'antd/lib/form/Form'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import gql from 'graphql-tag'
import { Moment } from 'moment'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { downloadCSV, handleError, toCSV } from '../../helpers'
import { blogMessages, commonMessages } from '../../helpers/translation'
import { ExportIcon } from '../../images/icon'
import { AdminModalProps } from '../admin/AdminModal'
dayjs.extend(utc)
dayjs.extend(timezone)
const currentTimeZone = dayjs.tz.guess()
type FieldProps = {
  timeRange: [Moment, Moment]
}
const StyledButton = styled.div`
  width: auto;
  padding: 15px;
  font-size: 16px;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: 0.2px;
  color: #4c5b8f;
  display: flex;
  align-items: center;
  cursor: pointer;
`
const BlogExportModal: React.VFC<AdminModalProps> = ({ renderTrigger, ...adminModalProps }) => {
  const { formatMessage } = useIntl()
  const client = useApolloClient()

  const [form] = useForm<FieldProps>()
  const [loading, setLoading] = useState(false)

  const getBlogLogExport: () => Promise<string[][]> = async () => {
    const { data, loading } = await client.query<hasura.GET_BLOG_LOG_EXPORT, hasura.GET_BLOG_LOG_EXPORTVariables>({
      query: gql`
        query GET_BLOG_LOG_EXPORT {
          post(where: { is_deleted: { _eq: false }, published_at: { _is_null: false } }) {
            id
            title
            post_tags {
              id
              tag_name
            }
            post_categories {
              id
              post_id
              category {
                name
              }
            }
            pinned_at
            post_roles(where: { name: { _eq: "author" } }) {
              id
              name
              member {
                id
                name
              }
            }

            published_at
            views

            post_reaction {
              post_id
            }
            post_issue {
              post_id
            }
          }
        }
      `,
      variables: {},
    })
    const defaultDataTitle = [
      formatMessage(blogMessages.BlogExportModal.title),
      formatMessage(blogMessages.BlogExportModal.category),
      formatMessage(blogMessages.BlogExportModal.postTags),
      formatMessage(blogMessages.BlogExportModal.author),
      formatMessage(blogMessages.BlogExportModal.publicAt),
      formatMessage(blogMessages.BlogExportModal.views),
      formatMessage(blogMessages.BlogExportModal.likes),
      formatMessage(blogMessages.BlogExportModal.comments),
    ]
    const posts =
      loading || !data
        ? []
        : [
            [...defaultDataTitle],
            ...data.post?.map(exportLog => [
              `${exportLog.title}`,
              `${exportLog.post_categories.map(v => v.category.name).join(',')}`,
              `${exportLog.post_tags.map(v => v.tag_name).join(',')}`,
              `${exportLog.post_roles.map(v => v.member?.name).join(',')}`,
              `${dayjs(exportLog.published_at).tz(currentTimeZone).format('YYYY-MM-DD HH:mm:ss')}`,
              `${exportLog.views}`,
              `${exportLog.post_reaction.length}`,
              `${exportLog.post_issue.length}`,
            ]),
          ]
    return posts
  }

  const handleExport = () => {
    form
      .validateFields()
      .then(async () => {
        setLoading(true)

        let fileName = 'Blogpost'
        let content: string[][] = []

        content = await getBlogLogExport()

        downloadCSV(`${fileName}_${dayjs().tz(currentTimeZone).format('YYYY-MM-DD HH:mm:ss')}.csv`, toCSV(content))
        setLoading(false)
      })
      .catch(handleError)
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <StyledButton onClick={() => !loading && handleExport()}>
      {loading ? (
        <LoadingOutlined />
      ) : (
        <div className="d-flex align-items-center">
          <ExportIcon className="pr-1 align-content-center" />
          <span>{formatMessage(commonMessages.ui.export)}</span>
        </div>
      )}
    </StyledButton>
  )
}

export default BlogExportModal
