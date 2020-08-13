import Icon, { CaretDownOutlined } from '@ant-design/icons'
import { Button, Checkbox, Divider, Dropdown, Form, Menu, Select, Spin, Table, Tooltip } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import moment, { Moment } from 'moment'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { AdminBlock, AdminPageTitle } from '../../components/admin'
import AdminModal from '../../components/admin/AdminModal'
import DatetimePicker from '../../components/common/DatetimePicker'
import { AvatarImage } from '../../components/common/Image'
import AdminLayout from '../../components/layout/AdminLayout'
import { handleError } from '../../helpers'
import { commonMessages, programMessages } from '../../helpers/translation'
import {
  useDeliverProgramCollection,
  useProgramPackageCollection,
  useProgramPackagePlanCollection,
  useProgramPackagePlanEnrollment,
  useProgramPackageProgramCollection,
  useProgramTempoDelivery,
} from '../../hooks/programPackage'
import { ReactComponent as BookIcon } from '../../images/icon/book.svg'
import { ReactComponent as FileCheckIcon } from '../../images/icon/file-check.svg'
import { MemberBriefProps } from '../../types/general'

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

  const { loadingProgramPackagePlans, programPackagePlans } = useProgramPackagePlanCollection(packageId, true)
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const planId = selectedPlanId || programPackagePlans[0]?.id || null

  const { programs } = useProgramPackageProgramCollection(packageId)
  const { loadingEnrollment, members } = useProgramPackagePlanEnrollment(planId)
  const { loadingTempoDelivery, tempoDelivery, allDeliveredProgramIds, refetchTempoDelivery } = useProgramTempoDelivery(
    packageId,
    members.map(member => member.id),
  )

  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([])
  const [selectedProgramIds, setSelectedProgramIds] = useState<string[]>([])
  const [deliveredAt, setDeliveredAt] = useState<Moment | null>(moment())
  const deliverPrograms = useDeliverProgramCollection()

  const [notDeliveryOnly, setNotDeliveryOnly] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDeliver = (closeModal?: () => void) => {
    if (!selectedMemberIds.length || !selectedProgramIds.length || !deliveredAt) {
      return
    }
    setLoading(true)
    deliverPrograms(selectedMemberIds, selectedProgramIds, deliveredAt.toDate())
      .then(() => {
        closeModal && closeModal()
        refetchTempoDelivery()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
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
                    setSelectedPackageId(key as string)
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
                <CaretDownOutlined className="ml-1" />
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
                <Menu onClick={({ key }) => setSelectedPlanId(key as string)}>
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
                <CaretDownOutlined className="ml-1" />
              </StyledProgramPackagePlanTitle>
            </Dropdown>
          ) : null}
        </div>

        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <AdminModal
              renderTrigger={({ setVisible }) => (
                <Button
                  type="primary"
                  disabled={!packageId || !planId || selectedMemberIds.length === 0}
                  onClick={() => setVisible(true)}
                >
                  <Icon component={() => <FileCheckIcon />} />
                  <span>{formatMessage(programMessages.ui.delivery)}</span>
                </Button>
              )}
              icon={<Icon component={() => <FileCheckIcon />} />}
              title={formatMessage(programMessages.ui.delivery)}
              footer={null}
              renderFooter={({ setVisible }) => (
                <>
                  <Button className="mr-2" onClick={() => setVisible(false)}>
                    {formatMessage(commonMessages.ui.cancel)}
                  </Button>
                  <Button type="primary" loading={loading} onClick={() => handleDeliver(() => setVisible(false))}>
                    {formatMessage(programMessages.ui.deliver)}
                  </Button>
                </>
              )}
            >
              <Form colon={false}>
                <Form.Item label={formatMessage(programMessages.label.select)}>
                  <Select<string[]>
                    mode="multiple"
                    onChange={value => setSelectedProgramIds(value)}
                    showSearch
                    filterOption={(input, option) =>
                      option?.props?.children
                        ? (option.props.children as string).toLowerCase().indexOf(input.toLowerCase()) >= 0
                        : true
                    }
                  >
                    {programs.map(program => (
                      <Select.Option value={program.programPackageProgramId}>{program.title}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label={formatMessage(programMessages.label.selectDeliveryAt)}>
                  <DatetimePicker value={deliveredAt || undefined} onChange={value => setDeliveredAt(value)} />
                </Form.Item>
              </Form>
            </AdminModal>
          </div>
          <div>
            <Checkbox checked={notDeliveryOnly} onChange={e => setNotDeliveryOnly(e.target.checked)}>
              {formatMessage(programMessages.label.notDeliveryOnly)}
            </Checkbox>
          </div>
        </div>

        <StyledTableBlock>
          {programs.length > 0 && (
            <Table<MemberBriefProps>
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
                ...programs
                  .filter(program => !notDeliveryOnly || !allDeliveredProgramIds.includes(program.id))
                  .map(program => ({
                    title: (
                      <Tooltip title={program.title}>
                        <StyledHeader>{program.title}</StyledHeader>
                      </Tooltip>
                    ),
                    align: 'center' as ColumnProps<any>['align'],
                    render: (text: any, record: MemberBriefProps) => {
                      if (tempoDelivery[record.id] && tempoDelivery[record.id][program.id]) {
                        return moment(tempoDelivery[record.id][program.id]).format('YYYY-MM-DD HH:mm')
                      }
                      return null
                    },
                  })),
              ]}
              dataSource={members}
              rowKey={record => record.id}
              rowSelection={{
                onChange: (selectedRowKeys, selectedRows) => {
                  setSelectedMemberIds(selectedRows.map(row => row.id))
                },
              }}
              size="small"
              tableLayout="fixed"
              scroll={{ x: programs.length * 16 * 12 }}
              bordered
              pagination={false}
              loading={loadingEnrollment || loadingTempoDelivery}
            />
          )}
        </StyledTableBlock>
      </AdminBlock>
    </AdminLayout>
  )
}

export default ProgramTempoDeliveryAdminPage
