import { Button, Checkbox, Divider, Dropdown, Icon, Menu, Spin, Table } from 'antd'
import moment from 'moment'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { AdminBlock, AdminPageTitle } from '../../components/admin'
import OwnerAdminLayout from '../../components/layout/OwnerAdminLayout'
import { commonMessages, programMessages } from '../../helpers/translation'
import {
  useProgramPackageCollection,
  useProgramPackageEnrollment,
  useProgramPackagePlanCollection,
  useProgramPackageProgramCollection,
  useProgramTempoDelivery,
} from '../../hooks/programPackage'
import { ReactComponent as BookIcon } from '../../images/icon/book.svg'
import { ReactComponent as FileCheckIcon } from '../../images/icon/file-check.svg'
import { MemberBrief } from '../../types/general'
import { AvatarImage } from '../../components/common/Image'

const StyledProgramPackageTitle = styled.div`
  margin: 0 auto;
  width: 25rem;
  color: var(--gray-darker);
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 0.8px;
`
const StyledProgramPackagePlanTitle = styled.div`
  margin: 0 auto;
  width: 25rem;
  color: var(--gray-darker);
  letter-spacing: 0.2px;
`
const StyledItem = styled(Menu.Item)`
  width: 25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`
const StyledTableBlock = styled.div`
  && {
    table.ant-table-fixed > thead.ant-table-thead > tr {
      height: 65px !important;
    }
  }
`
const StyledHeader = styled.div`
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  width: 100%;
  max-height: 3rem;
  text-align: center;
  font-weight: bold;
`
const StyledMemberName = styled.div`
  color: var(--gray-darker);
  font-size: 14px;
  letter-spacing: 0.18px;
`
const StyledMemberEmail = styled.div`
  color: var(--gray-dark);
  font-size: 12px;
  letter-spacing: 0.4px;
`

const ProgramTempoDeliveryAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()

  const { loadingProgramPackage, programPackages } = useProgramPackageCollection()
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null)
  const packageId = selectedPackageId || programPackages[0]?.id || null

  const { loadingProgramPackagePlans, programPackagePlans } = useProgramPackagePlanCollection(packageId)
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const planId = selectedPlanId || programPackagePlans[0]?.id || null

  const [notDeliveryOnly, setNotDeliveryOnly] = useState(false)

  const { programs } = useProgramPackageProgramCollection(packageId)
  const { members } = useProgramPackageEnrollment(planId)

  const { tempoDelivery } = useProgramTempoDelivery(
    packageId,
    members.map(member => member.id),
  )

  return (
    <OwnerAdminLayout>
      <AdminPageTitle className="mb-5">
        <Icon component={() => <BookIcon />} className="mr-3" />
        <span>{formatMessage(commonMessages.menu.tempoDelivery)}</span>
      </AdminPageTitle>

      <AdminBlock>
        <div className="text-center">
          {loadingProgramPackage ? (
            <Spin />
          ) : programPackages.length > 0 ? (
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu
                  onClick={({ key }) => {
                    setSelectedPackageId(key)
                    setSelectedPlanId(null)
                  }}
                >
                  {programPackages.map(programPackage => (
                    <StyledItem key={programPackage.id}>{programPackage.title}</StyledItem>
                  ))}
                </Menu>
              }
            >
              <StyledProgramPackageTitle className="d-flex align-items-center justify-content-center cursor-pointer">
                <div className="mx-2">
                  {programPackages.find(programPackage => programPackage.id === packageId)?.title}
                </div>
                <Icon type="caret-down" className="ml-1" />
              </StyledProgramPackageTitle>
            </Dropdown>
          ) : null}
        </div>
        <Divider />
        <div className="mb-4 text-center">
          {loadingProgramPackagePlans ? (
            <Spin />
          ) : programPackagePlans.length > 0 ? (
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu onClick={({ key }) => setSelectedPlanId(key)}>
                  {programPackagePlans.map(programPackagePlan => (
                    <StyledItem key={programPackagePlan.id}>{programPackagePlan.title}</StyledItem>
                  ))}
                </Menu>
              }
            >
              <StyledProgramPackagePlanTitle className="d-flex align-items-center justify-content-center cursor-pointer">
                <div className="mr-1">{formatMessage(programMessages.label.planField)}</div>
                <div className="mx-2">
                  {programPackagePlans.find(programPackagePlan => programPackagePlan.id === planId)?.title}
                </div>
                <Icon type="caret-down" className="ml-1" />
              </StyledProgramPackagePlanTitle>
            </Dropdown>
          ) : null}
        </div>

        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <Button type="primary" disabled={!packageId || !planId}>
              <Icon component={() => <FileCheckIcon />} />
              <span>{formatMessage(programMessages.ui.deliveryProgram)}</span>
            </Button>
          </div>
          <div>
            <Checkbox checked={notDeliveryOnly} onChange={e => setNotDeliveryOnly(e.target.checked)}>
              {formatMessage(programMessages.label.notDeliveryOnly)}
            </Checkbox>
          </div>
        </div>

        <StyledTableBlock>
          {programs.length > 0 && (
            <Table<MemberBrief>
              columns={[
                {
                  title: <StyledHeader>{formatMessage(programMessages.label.memberList)}</StyledHeader>,
                  fixed: 'left',
                  width: 192,
                  render: (text, record) => {
                    return (
                      <div className="d-flex align-items-center justify-content-start">
                        <AvatarImage src={record.avatarUrl} className="mr-2" />
                        <div className="pl-1">
                          <StyledMemberName>{record.name}</StyledMemberName>
                          <StyledMemberEmail>{record.email}</StyledMemberEmail>
                        </div>
                      </div>
                    )
                  },
                },
                ...programs.map(program => ({
                  title: <StyledHeader>{program.title}</StyledHeader>,
                  render: (text: any, record: MemberBrief) => {
                    if (tempoDelivery[record.id] && tempoDelivery[record.id][program.id]) {
                      return moment(tempoDelivery[record.id][program.id]).format('YYYY-MM-DD HH:mm')
                    }
                    return null
                  },
                })),
              ]}
              dataSource={members}
              rowKey={record => record.id}
              rowSelection={{ onChange: selectedRowKeys => {} }}
              scroll={{ x: programs.length * 16 * 12 }}
              size="small"
              tableLayout="fixed"
              bordered
              pagination={false}
            />
          )}
        </StyledTableBlock>
      </AdminBlock>
    </OwnerAdminLayout>
  )
}

export default ProgramTempoDeliveryAdminPage
