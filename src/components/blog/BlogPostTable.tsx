import Icon, { MoreOutlined, SearchOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Dropdown, Input, Menu, message, Table, Tag } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { blogMessages, commonMessages } from '../../helpers/translation'
import EmptyCover from '../../images/default/empty-cover.png'
import { ReactComponent as PlayIcon } from '../../images/icon/play.svg'
import pageMessages from '../../pages/translation'

const StyledDiv = styled.div`
  .ant-table-content {
    padding: 0.25rem 1.5rem 2.5rem;
  }
  .ant-table-thead th.ant-table-column-has-sorters {
    display: none;
  }
  .td.ant-table-column-sort {
    background: transparent;
  }
`
const StyledCover = styled.div<{ src: string }>`
  position: relative;
  min-width: 100px;
  height: 60px;
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
  display: flex;
  border-radius: 4px;
  align-items: center;
  margin-right: 15px;
`
const StyledIcon = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
`

const StyledTitle = styled.div`
  color: var(--gray-darker);
  line-height: normal;
  letter-spacing: 0.2px;
  cursor: pointer;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 5;
  overflow: hidden;
`

const StyledDetailItem = styled(Menu.Item)`
  padding: 0;
`

const filterIcon = (filtered: boolean) => <SearchOutlined style={{ color: filtered ? 'var(--primary)' : undefined }} />

type BlogPostListColumn = {
  id: String
  authorName?: string | null | undefined
  coverUrl: string | null
  videoUrl: string | null
  title: string
  views?: number | null
  publishedAt: Date | null
  pinnedAt: string | null
  roles?: {
    name: string | null | undefined
    memberId?: string | null | undefined
  }[]
  postMerchandises: { id: string | null | undefined }[]
}

const BlogPostTable: React.VFC<{ blogPostData: BlogPostListColumn[]; postTableType: String; onRefetch: () => void }> =
  ({ blogPostData = [], onRefetch = () => {}, postTableType = '' }) => {
    const { formatMessage } = useIntl()
    const [searchTitle, setSearchTitle] = useState<string>('')
    const [searchAuthor, setSearchAuthor] = useState<string>('')
    const [detailLoading, setDetailLoading] = useState(false)
    const [blogDisplayData, setBlogDisplayData] = useState<BlogPostListColumn[]>([])
    const [updatePostPinnedAt] = useMutation<hasura.UPDATE_POST_PINNED_AT, hasura.UPDATE_POST_PINNED_ATVariables>(
      UPDATE_POST_PINNED_AT,
    )

    const blogPostPinatNumber = blogPostData.filter(post => !!post.pinnedAt).length

    const handleUpload = (id: String | null, updateTime: Date | null = null) => {
      if (blogPostPinatNumber === 3 && updateTime) {
        return message.warning(formatMessage(blogMessages.text.uploadPinnedAtLimmited))
      }
      setDetailLoading(true)

      updatePostPinnedAt({
        variables: {
          postId: id,
          pinnedAt: updateTime,
        },
      })
        .then(() => {
          message.success(formatMessage(commonMessages.event.successfullySaved))
          onRefetch()
        })
        .catch(handleError)
        .finally(() => setDetailLoading(false))
    }
    const filteredBlogPost =
      searchTitle === '' && searchAuthor === ''
        ? blogPostData
        : blogPostData.filter(post => post.title?.includes(searchTitle) && post.authorName?.includes(searchAuthor))
    const columns: ColumnProps<BlogPostListColumn>[] = [
      {
        key: 'picture',
        title: formatMessage(pageMessages['*'].title),
        width: 'auto',
        render: (_, record) => (
          <Link className="d-flex align-items-center justify-content-between" to={`/blog/${record.id}`}>
            <StyledCover src={record.coverUrl || EmptyCover}>
              <StyledIcon>{record.videoUrl && <Icon component={() => <PlayIcon />} />}</StyledIcon>
            </StyledCover>
          </Link>
        ),
      },
      {
        key: 'title',
        title: '',
        width: '25%',
        render: (_, record) => (
          <Link className="d-flex align-items-center justify-content-between" to={`/blog/${record.id}`}>
            <StyledTitle className="flex-grow-1">{record.title}</StyledTitle>
          </Link>
        ),
        filterDropdown: () => (
          <div className="p-2">
            <Input
              autoFocus
              value={searchTitle || ''}
              onChange={e => {
                setSearchTitle(e.target.value)
              }}
            />
          </div>
        ),
        filterIcon,
      },
      {
        key: 'author',
        title: formatMessage(commonMessages.label.author),
        width: '10%',
        render: (_, record) => <StyledTitle className="flex-grow-1">{record.authorName}</StyledTitle>,
        filterDropdown: () => (
          <div className="p-2">
            <Input
              autoFocus
              value={searchAuthor || ''}
              onChange={e => {
                setSearchAuthor(e.target.value)
              }}
            />
          </div>
        ),
        filterIcon,
      },
      {
        key: 'publicAt',
        title: formatMessage(blogMessages.label.publicAt),
        width: '18%',
        render: (_, record) => {
          let data = null
          if (record.publishedAt) {
            data = new Date(record.publishedAt).toDateString()
          } else {
            data = ''
          }
          return <div>{data}</div>
        },
      },
      {
        key: 'count',
        title: formatMessage(blogMessages.label.views),
        width: '10%',
        render: (_, record) => <div>{record.views}</div>,
      },
      {
        key: 'tags',
        title: '',
        width: '20%',
        defaultSortOrder: 'descend',
        sorter: (a, b) => {
          if (!!a.pinnedAt && !!b.pinnedAt) {
            return new Date(a.pinnedAt).getTime() - new Date(b.pinnedAt).getTime()
          } else {
            let set1 = a.pinnedAt ? 1 : 0
            let set2 = b.pinnedAt ? 1 : 0
            return set1 - set2
          }
        },
        render: (_, record) => (
          <div>
            {record.pinnedAt ? <Tag color={'volcano'}>{formatMessage(blogMessages.label.pinnedAt)}</Tag> : ''}
            {record.postMerchandises.length > 0 ? <Tag>{formatMessage(blogMessages.label.merchandises)}</Tag> : ''}
          </div>
        ),
      },
      {
        key: 'button',
        title: '',
        width: 'auto',
        render: (_, record) => (
          <Dropdown
            placement="bottomRight"
            overlay={
              <Menu className="p-0">
                <StyledDetailItem>
                  {!record.pinnedAt ? (
                    <Button type="text" className="m-0" onClick={() => handleUpload(record.id, new Date())}>
                      {formatMessage(blogMessages.label.pinnedAtUpdate)}
                    </Button>
                  ) : (
                    <Button type="text" onClick={() => handleUpload(record.id)}>
                      {formatMessage(blogMessages.label.pinnedAtDelete)}
                    </Button>
                  )}
                </StyledDetailItem>
              </Menu>
            }
            trigger={['click']}
          >
            <MoreOutlined style={{ fontSize: '20px' }} onClick={e => e.stopPropagation()} />
          </Dropdown>
        ),
      },
    ]
    let displayColumns = postTableType === 'draft' ? columns.filter(items => items.key !== 'button') : columns

    if (blogPostData.length > 0) {
      return (
        <StyledDiv>
          <Table<BlogPostListColumn>
            loading={detailLoading}
            rowKey="id"
            columns={displayColumns}
            dataSource={filteredBlogPost}
          />
        </StyledDiv>
      )
    } else {
      return <div>{formatMessage(pageMessages['*'].fetchDataError)}</div>
    }
  }

export default BlogPostTable
const UPDATE_POST_PINNED_AT = gql`
  mutation UPDATE_POST_PINNED_AT($postId: uuid, $pinnedAt: timestamptz) {
    update_post(where: { id: { _eq: $postId } }, _set: { pinned_at: $pinnedAt }) {
      affected_rows
    }
  }
`
