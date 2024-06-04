import { FileAddOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/client'
import { Button, Tabs } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { handleError } from 'lodestar-app-element/src/helpers'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import { AdminPageBlock, AdminPageTitle } from '../../components/admin'
import ProductCreationModal from '../../components/common/ProductCreationModal'
import AdminLayout from '../../components/layout/AdminLayout'
import { InsertCard, useMembershipCardQuantity } from '../../hooks/membershipCard'
import { MembershipCardIcon } from '../../images/icon'
import ForbiddenPage from '../ForbiddenPage'
import LoadingPage from '../LoadingPage'
import pageMessages from '../translation'
import MembershipCardCollectionTable from './MembershipCardCollectionTable'
import MembershipCardPageMessages from './translation'

const MembershipCardCollectionPage: React.VFC = () => {
  const history = useHistory()
  const { formatMessage } = useIntl()
  const { enabledModules, id: appId } = useApp()
  const { isAuthenticating, currentMemberId } = useAuth()
  const [createMembershipCard] = useMutation(InsertCard)
  const { availableQuantity, expiredQuantity } = useMembershipCardQuantity()
  const templateHtml = `
    <div
      style="
        position: relative;
        width: 400px;
        height: 250px;
        background-image: url(https://static.kolable.com/membership_card_backgrounds/_default/membership-card-template.png);
        background-size: cover;
        background-position: center;
      "
    >
      <div
        style="
          position: absolute;
          top: 19.5%;
          left: 6.6%;
          width: 28%;
          height: 44.8%;
          padding: 2px;
          background-image: linear-gradient(to bottom, #4681ff, #0088ff);
          border-radius: 50%;
        "
      >
        <div
          style="width: 100%; height: 100%; border-radius: 50%; background-image: url({{  avatar  }}); background-size: cover; background-position: center;"
        ></div>
      </div>
      <div
        style="
          font-family: &quot;Roboto&quot;, &quot;Noto Sans TC&quot;, sans-serif;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.58px;
        "
      >
        <div style="position: absolute; top: 22%; left: 41%">
          <span style="margin-right: 8px; color: #4681ff">姓名</span>
          <span
            style="
              display: inline-block;
              width: 100px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              vertical-align: middle;
              color: #1b1464;
            "
            >{{ name }}</span
          >
        </div>
        <div style="position: absolute; top: 37%; left: 41%">
          <span style="margin-right: 8px; color: #4681ff">帳號</span>
          <span
            style="
              display: inline-block;
              width: 100px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              vertical-align: middle;
              color: #1b1464;
            "
            >{{ account }}</span
          >
        </div>
        <div style="position: absolute; top: 52%; left: 41%">
          <span style="margin-right: 8px; color: #4681ff">發證日期</span>
          <span
            style="
              display: inline-block;
              width: 100px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              vertical-align: middle;
              color: #1b1464;
            "
            >{{ date }}</span
          >
        </div>
      </div>
    </div>
  `

  const tabContents = [
    {
      key: 'available',
      tab: formatMessage(pageMessages['*'].available),
      quantity: availableQuantity,
      condition: {
        _or: [
          {
            fixed_end_date: {
              _gt: 'now()',
            },
          },
          {
            fixed_end_date: {
              _is_null: true,
            },
          },
        ],
      },
    },
    {
      key: 'unavailable',
      tab: formatMessage(pageMessages['*'].unavailable),
      quantity: expiredQuantity,
      condition: {
        fixed_end_date: {
          _lt: 'now()',
        },
      },
    },
  ]

  if (isAuthenticating || Object.keys(enabledModules).length === 0) {
    return <LoadingPage />
  }

  if (!enabledModules.membership_card) {
    return <ForbiddenPage />
  }

  return (
    <AdminLayout>
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <AdminPageTitle className="d-flex align-items-center mb-0">
          <MembershipCardIcon className="mr-3" />
          <span>{formatMessage(MembershipCardPageMessages.page.title)}</span>
        </AdminPageTitle>
      </div>

      {currentMemberId && appId && (
        <div className="mb-4">
          <ProductCreationModal
            renderTrigger={({ setVisible }) => (
              <Button type="primary" icon={<FileAddOutlined />} onClick={() => setVisible(true)}>
                {formatMessage(MembershipCardPageMessages.page.createCard)}
              </Button>
            )}
            customModalTitle={formatMessage(MembershipCardPageMessages.page.createCard)}
            onCreate={({ title }) =>
              createMembershipCard({
                variables: {
                  title,
                  appId: appId,
                  template: templateHtml,
                },
              })
                .then(({ data }) => {
                  const membershipCardId = data?.insert_card?.returning[0]?.id
                  membershipCardId && history.push(`/membership-card/${membershipCardId}`)
                })
                .catch(handleError)
            }
          />
        </div>
      )}

      <Tabs defaultActiveKey="published">
        {tabContents.map(tabContent => (
          <Tabs.TabPane key={tabContent.key} tab={`${tabContent.tab} (${tabContent.quantity})`}>
            <AdminPageBlock>
              <MembershipCardCollectionTable condition={tabContent.condition} />
            </AdminPageBlock>
          </Tabs.TabPane>
        ))}
      </Tabs>
    </AdminLayout>
  )
}

export default MembershipCardCollectionPage
