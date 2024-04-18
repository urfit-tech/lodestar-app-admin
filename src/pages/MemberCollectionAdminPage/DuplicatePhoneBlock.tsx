import { Button, Skeleton } from 'antd'
import { gql, useQuery } from '@apollo/client'
import { CloseButton, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, HStack } from '@chakra-ui/react'
import styled from 'styled-components'
import hasura from '../../hasura'
import { ReactComponent as AngleRightIcon } from '../../images/icon/angle-right.svg'
import { ReactComponent as ExclamationCircleIcon } from '../../images/icon/exclamation-circle.svg'
import Icon from '@ant-design/icons'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import { flatten } from 'ramda'
import { notEmpty } from '../../helpers'
import pageMessages from '../translation'

const StyledAlertText = styled.div`
  height: 40px;
  margin-bottom: 20px;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.5;
  letter-spacing: 0.2px;
  color: var(--error);
  background-color: #ffe9e5;
  curser: pointer;
`

const StyledDrawerTitle = styled.p`
  color: var(--gray-darker);
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 0.2px;
`

const StyledDuplicatedNumberList = styled.ul`
  padding: 0 26px;
  margin: 0;
`

const StyledDuplicatedNumberListItem = styled.li`
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 0.2px;
  color: var(--gray-darker);
  margin-bottom: 20px;
`

const StyledDuplicatedNumberMemberList = styled.ul`
  display: flex;
  flex-direction: column;
  margin: 0;
`

const StyledDuplicatedNumberMemberItemButton = styled(Button)`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  height: auto;
  padding: 0;
  font-weight: 500;
  margin-top: 8px;

  span {
    margin: 0;
  }
`

const StyledDuplicatedNumberMemberName = styled.span`
  font-weight: bold;
`

const StyledDuplicatedNumberMemberEmail = styled.span`
  font-size: 14px;
`

const DuplicatePhoneBlock: React.VFC = () => {
  const { formatMessage } = useIntl()
  const [open, setOpen] = useState(false)
  const { loadingDuplicatedMemberPhone, loadingMembersInfo, duplicatedList } = useDuplicatedPhoneList()

  return !loadingDuplicatedMemberPhone && duplicatedList.length > 0 ? (
    <>
      <StyledAlertText
        className="d-flex align-items-center justify-content-between"
        onClick={() => {
          setOpen(true)
        }}
      >
        <span className="d-flex align-items-center">
          <Icon className="mr-2" component={() => <ExclamationCircleIcon />} />
          <span>{formatMessage(pageMessages.DuplicatePhoneBlock.duplicatedPhoneMemberExist)}</span>
        </span>
        <span className="d-flex align-items-center">
          {formatMessage(pageMessages['*'].view)}
          <Icon className="ml-2" component={() => <AngleRightIcon />} />
        </span>
      </StyledAlertText>
      <Drawer isOpen={open} placement="right" onClose={() => setOpen(false)} size="sm">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>
            <HStack>
              <CloseButton onClick={() => setOpen(false)} />
              <StyledDrawerTitle>
                {formatMessage(pageMessages.DuplicatePhoneBlock.duplicatedPhoneMember)}
              </StyledDrawerTitle>
            </HStack>
          </DrawerHeader>
          <DrawerBody>
            {loadingMembersInfo ? (
              <Skeleton />
            ) : (
              duplicatedList.map(({ phone, members }) => (
                <StyledDuplicatedNumberList key={phone}>
                  <StyledDuplicatedNumberListItem>
                    {phone}
                    <StyledDuplicatedNumberMemberList>
                      {members.map(({ id, name, email }) => (
                        <StyledDuplicatedNumberMemberItemButton
                          type="link"
                          onClick={() => window.open(`${process.env.PUBLIC_URL}/members/${id}`, '_blank')}
                        >
                          <StyledDuplicatedNumberMemberName>{name}</StyledDuplicatedNumberMemberName>
                          <StyledDuplicatedNumberMemberEmail>{email}</StyledDuplicatedNumberMemberEmail>
                        </StyledDuplicatedNumberMemberItemButton>
                      ))}
                    </StyledDuplicatedNumberMemberList>
                  </StyledDuplicatedNumberListItem>
                </StyledDuplicatedNumberList>
              ))
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  ) : (
    <></>
  )
}

const useDuplicatedPhoneList = () => {
  const { loading: loadingDuplicatedMemberPhone, data: duplicatedMemberPhone } = useQuery<
    hasura.GetDuplicatedMemberPhone,
    hasura.GetDuplicatedMemberPhoneVariables
  >(gql`
    query GetDuplicatedMemberPhone {
      member_phone_duplicated(limit: 100, order_by: { count: asc }) {
        phone
        member_phones {
          id
          member_id
        }
      }
    }
  `)

  const { loading: loadingMembersInfo, data: membersInfoData } = useQuery<
    hasura.GetMembersInfo,
    hasura.GetMembersInfoVariables
  >(
    gql`
      query GetMembersInfo($memberIdList: [String!]) {
        member(where: { id: { _in: $memberIdList } }) {
          id
          name
          email
        }
      }
    `,
    {
      variables: {
        memberIdList: flatten(
          duplicatedMemberPhone?.member_phone_duplicated.map(v => v.member_phones.map(w => w.member_id)) || [[]],
        ).filter(notEmpty),
      },
    },
  )

  const memberInfos: { id: string; name: string; email: string }[] =
    membersInfoData?.member.map(v => ({
      id: v.id,
      name: v.name,
      email: v.email,
    })) || []

  const duplicatedList =
    duplicatedMemberPhone?.member_phone_duplicated.map(v => {
      const duplicatedMemberIdList = v.member_phones.map(w => w.member_id)
      let memberList: { id: string; name: string; email: string }[] = []
      memberInfos.forEach(member => {
        if (duplicatedMemberIdList.some(duplicatedMemberId => duplicatedMemberId === member.id)) memberList.push(member)
      })

      return {
        phone: v.phone,
        members: memberList,
      }
    }) || []

  return {
    loadingDuplicatedMemberPhone,
    loadingMembersInfo,
    duplicatedList,
  }
}

export default DuplicatePhoneBlock
