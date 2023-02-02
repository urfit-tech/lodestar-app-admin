import { LoadingOutlined } from '@ant-design/icons'
import { useApolloClient } from '@apollo/react-hooks'
import { Button, DatePicker, Form } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import gql from 'graphql-tag'
import moment, { Moment } from 'moment'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { downloadCSV, handleError, toCSV } from '../../helpers'
import { blogMessages } from '../../helpers/translation'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import saleMessages from '../sale/translation'
dayjs.extend(utc)
dayjs.extend(timezone)
const currentTimeZone = dayjs.tz.guess()
type FieldProps = {
  timeRange: [Moment, Moment]
}
const BlogExportModal: React.VFC<AdminModalProps> = ({ renderTrigger, ...adminModalProps }) => {
  const { formatMessage } = useIntl()
  const client = useApolloClient()

  const [form] = useForm<FieldProps>()
  const [loading, setLoading] = useState(false)

  const getBlogLogExport: (startedAt: Date, endedAt: Date) => Promise<string[][]> = async (startedAt, endedAt) => {
    const { data, loading } = await client.query<hasura.GET_BLOG_LOG_EXPORT, hasura.GET_BLOG_LOG_EXPORTVariables>({
      query: gql`
        query GET_BLOG_LOG_EXPORT($startedAt: timestamptz, $endedAt: timestamptz) {
          post(
            where: { is_deleted: { _eq: false }, published_at: { _is_null: false, _gte: $startedAt, _lte: $endedAt } }
          ) {
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
      variables: {
        startedAt,
        endedAt,
      },
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
    const posts = loading
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
        const values = form.getFieldsValue()
        const startedAt = values.timeRange[0].startOf('day').toDate()
        const endedAt = values.timeRange[1].endOf('day').toDate()

        let fileName = 'Blogpost.csv'
        let content: string[][] = []

        content = await getBlogLogExport(startedAt, endedAt)

        downloadCSV(
          `${fileName}_${moment(startedAt).format('YYYYMMDD')}_${moment(endedAt).format('YYYYMMDD')}.csv`,
          toCSV(content),
        )
        setLoading(false)
      })
      .catch(handleError)
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <AdminModal
      renderTrigger={renderTrigger}
      title={formatMessage(saleMessages.OrderExportModal.exportOrder)}
      footer={null}
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={() => setVisible(false)}>
            {formatMessage(saleMessages['*'].cancel)}
          </Button>
          <Button type="primary" onClick={() => !loading && handleExport()}>
            {loading ? <LoadingOutlined /> : <div>{formatMessage(saleMessages.OrderExportModal.exportOrderLog)}</div>}
          </Button>
        </>
      )}
      maskClosable={false}
      {...adminModalProps}
    >
      <Form
        form={form}
        colon={false}
        hideRequiredMark
        layout="vertical"
        initialValues={{
          timeRange: [moment().startOf('month'), moment().endOf('day')],
        }}
      >
        <Form.Item label={formatMessage(saleMessages.OrderExportModal.dateRange)}>
          <div className="d-flex">
            <div className="flex-grow-1">
              <Form.Item
                name="timeRange"
                rules={[
                  {
                    required: true,
                    message: formatMessage(saleMessages['*'].isRequired, {
                      field: formatMessage(saleMessages.OrderExportModal.timeRange),
                    }),
                  },
                ]}
                noStyle
              >
                <DatePicker.RangePicker style={{ width: '100%' }} format="YYYY-MM-DD" showTime={false} />
              </Form.Item>
            </div>
          </div>
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

export default BlogExportModal
