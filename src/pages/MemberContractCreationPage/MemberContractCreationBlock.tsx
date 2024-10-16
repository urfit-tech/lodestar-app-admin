import { gql, useMutation } from '@apollo/client'
import { Alert, Button, message } from 'antd'
import { FormInstance } from 'antd/lib/form'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import { project, sum } from 'ramda'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { v4 } from 'uuid'
import { ContractInfo, ContractItem, FieldProps } from '.'
import hasura from '../../hasura'
import { useCurrency } from '../../hooks/currency'
import pageMessages from '../translation'

const StyledOrder = styled.div`
  border: 1px solid var(--gray-darker);
  padding: 1rem;
`
const StyledTotal = styled.div`
  margin-bottom: 0.5rem;
  color: ${props => props.theme['@primary-color']};
  font-size: 20px;
  text-align: right;
`

const MemberContractCreationBlock: React.FC<{
  member: NonNullable<ContractInfo['member']>
  contracts: ContractInfo['contracts']
  startedAt: Date
  endedAt: Date | null
  memberBlockRef: React.MutableRefObject<HTMLDivElement | null>
  selectedProducts: NonNullable<FieldProps['contractProducts']>
  form: FormInstance<FieldProps>
  contractProducts: ContractItem[]
  contractDiscounts: ContractItem[]
  totalPrice: number
  totalCoins: number
}> = ({
  member,
  startedAt,
  endedAt,
  memberBlockRef,
  form,
  contractProducts,
  contractDiscounts,
  totalPrice,
  totalCoins,
}) => {
  const [addMemberContract] = useMutation<hasura.ADD_MEMBER_CONTRACT, hasura.ADD_MEMBER_CONTRACTVariables>(
    ADD_MEMBER_CONTRACT,
  )

  const { id: appId, settings } = useApp()
  const { currentMemberId } = useAuth()
  const [memberContractUrl, setMemberContractUrl] = useState('')
  const { formatCurrency } = useCurrency('TWD')
  const { formatMessage } = useIntl()

  const fieldValue = form.getFieldsValue()

  const handleMemberContractCreate = async () => {
    const alert = document.getElementsByClassName('ant-alert')[0]

    if (memberBlockRef.current?.contains(alert)) {
      message.warning(formatMessage(pageMessages.MemberContractCreationBlock.fillMemberInfo))
      return
    }
    if (fieldValue.identity === 'student' && !fieldValue?.certification?.file.name) {
      message.warn(formatMessage(pageMessages.MemberContractCreationBlock.uploadProof))
      return
    }

    try {
      await form.validateFields()
    } catch (error) {
      process.env.NODE_ENV === 'development' && console.error(error)
    }

    const orderExecutors: {
      member_id: string
      ratio: number
    }[] = [
      {
        member_id: fieldValue?.orderExecutorId || '',
        ratio: fieldValue.orderExecutorRatio,
      },
      ...(fieldValue?.orderExecutors?.map(orderExecutor => ({
        member_id: orderExecutor.memberId || '',
        ratio: orderExecutor.ratio || 0,
      })) || []),
    ].filter(v => v.member_id && v.ratio)

    if (contractProducts.length < 1) {
      message.warn(formatMessage(pageMessages.MemberContractCreationBlock.addContractContent))
      return
    }

    if (!fieldValue.paymentMethod) {
      message.warn(formatMessage(pageMessages.MemberContractCreationBlock.selectPaymentMethod))
      return
    }

    if (!fieldValue.installmentPlan) {
      message.warn(formatMessage(pageMessages.MemberContractCreationBlock.selectInstallmentPeriod))
      return
    }

    if (sum(orderExecutors.map(v => v.ratio)) !== 1) {
      message.warn(formatMessage(pageMessages.MemberContractCreationBlock.totalProportionMustBeOne))
      return
    }

    if (!window.confirm(formatMessage(pageMessages.MemberContractCreationBlock.confirmContractCorrectness))) {
      return
    }

    // !!TODO: confirm the business logic would create the couponPlan when totalAppointments >0
    // generate coupons
    // const couponPlanId = v4()
    // const coupons = range(0, totalAppointments).map((v, index) => ({
    //   member_id: member.id,
    //   coupon_code: {
    //     data: {
    //       code: moment().format('x') + v,
    //       count: 1,
    //       remaining: 0,
    //       app_id: appId,
    //       coupon_plan_id: index !== 0 ? couponPlanId : undefined,
    //       coupon_plan: undefined,
    //     },
    //   },
    // }))

    const times = '0'
    const orderId = moment().format('YYYYMMDDHHmmssSSS') + times.padStart(2, '0')

    const contractCoupons = contractDiscounts.map(v => ({
      id: v4(),
      name: v.name,
      price: Math.abs(v.price) * v.amount,
      member_id: member.id,
      coupon_code: {
        data: {
          coupon_plan_id: v.id,
          code: v4(),
          app_id: appId,
          count: 0,
          remaining: 0,
        },
      },
    }))

    addMemberContract({
      variables: {
        memberId: member.id,
        contractId: fieldValue.contractId,
        startedAt,
        endedAt,
        authorId: currentMemberId || '',
        values: {
          memberId: member.id,
          coinLogs:
            totalCoins > 1
              ? [
                  {
                    id: v4(),
                    member_id: member.id,
                    title: `${settings['coin.name'] || 'LSC'}`,
                    amount: totalCoins,
                    description: '',
                    started_at: startedAt.toISOString(),
                    ended_at: endedAt?.toISOString(),
                  },
                ]
              : [],
          invoice: {
            name: member.name,
            phone: member.phone,
            email: member.email,
          },
          price: totalPrice,
          orderId,
          orderOptions: {
            recognizePerformance: totalPrice,
          },
          orderProducts: [
            ...contractProducts.map(v => ({
              product_id: `ProjectPlan_${v.id}`,
              name: v.name,
              price: v.price * v.amount,
              started_at: startedAt,
              ended_at: endedAt,
              delivered_at: startedAt,
            })),
          ],
          coupons: [...project(['id', 'member_id', 'coupon_code'], contractCoupons)],
          orderDiscounts: [
            ...contractCoupons.map(v => ({
              name: v.name,
              price: v.price,
              type: 'Coupon',
              target: v.id,
            })),
          ],
          orderExecutors,
          paymentNo: moment().format('YYYYMMDDHHmmss'),
          paymentOptions: {
            paymentMethod: fieldValue.paymentMethod,
            installmentPlan: fieldValue.installmentPlan,
            paymentNumber: fieldValue.paymentNumber,
          },
        },
        options: {
          appointmentCreatorId: fieldValue.withCreatorId ? fieldValue.creatorId : null,
          studentCertification: fieldValue.identity === 'student' ? fieldValue?.certification?.file.name : null,
          referralMemberId: fieldValue.referralMemberId,
        },
      },
    })
      .then(({ data }) => {
        const contractId = data?.insert_member_contract_one?.id
        setMemberContractUrl(`${window.origin}/members/${member.id}/contracts/${contractId}`)
        message.success(formatMessage(pageMessages.MemberContractCreationBlock.contractCreateSuccess))
      })
      .catch(err =>
        message.error(`${formatMessage(pageMessages.MemberContractCreationBlock.contractCreateFail)}${err}`),
      )
  }

  return (
    <>
      <StyledOrder className="mb-5">
        {[...contractProducts, ...contractDiscounts].map(item => (
          <div key={item.id} className="row mb-2">
            <div className="col-6 text-right">
              {item.type === 'addonProduct' && formatMessage(pageMessages.MemberContractCreationBlock.addonProduct)}
              {item.type === 'referralDiscount' &&
                formatMessage(pageMessages.MemberContractCreationBlock.referralDiscount)}
              {item.type === 'promotionDiscount' &&
                formatMessage(pageMessages.MemberContractCreationBlock.promotionDiscount)}
            </div>
            <div className="col-3">
              <span>{item.name}</span>
              {item.amount > 1 ? <span>x{item.amount}</span> : ''}
            </div>
            <div className="col-3 text-right">{formatCurrency(item.price * item.amount)}</div>
          </div>
        ))}

        <div className="row mb-2">
          <div className="col-9 text-right">{formatMessage(pageMessages.MemberContractCreationBlock.deposit)}</div>

          <div className="col-3 text-right">$7,800</div>
        </div>
        <div className="row mb-2">
          <div className="col-9 text-right">{formatMessage(pageMessages.MemberContractCreationBlock.finalPayment)}</div>

          <div className="col-3 text-right">$70,200</div>
        </div>
        <div className="row mb-2">
          <strong className="col-6 text-right">
            {formatMessage(pageMessages.MemberContractCreationBlock.totalAmount)}
          </strong>

          <div className="col-6 text-right">$78,000</div>
        </div>
      </StyledOrder>

      {memberContractUrl ? (
        <Alert
          message={formatMessage(pageMessages.MemberContractCreationBlock.contractLink)}
          description={memberContractUrl}
          type="success"
          showIcon
        />
      ) : (
        <Button size="large" block type="primary" onClick={handleMemberContractCreate}>
          {formatMessage(pageMessages.MemberContractCreationBlock.generateContract)}
        </Button>
      )}
    </>
  )
}

const ADD_MEMBER_CONTRACT = gql`
  mutation ADD_MEMBER_CONTRACT(
    $memberId: String!
    $authorId: String!
    $contractId: uuid!
    $startedAt: timestamptz!
    $endedAt: timestamptz!
    $values: jsonb!
    $options: jsonb
  ) {
    insert_member_contract_one(
      object: {
        member_id: $memberId
        contract_id: $contractId
        author_id: $authorId
        started_at: $startedAt
        ended_at: $endedAt
        values: $values
        options: $options
      }
    ) {
      id
    }
  }
`

export default MemberContractCreationBlock
