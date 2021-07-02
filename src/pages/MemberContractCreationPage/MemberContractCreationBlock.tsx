import { useMutation } from '@apollo/react-hooks'
import { Alert, Button, message } from 'antd'
import { FormInstance } from 'antd/lib/form'
import gql from 'graphql-tag'
import { useAuth } from 'lodestar-app-admin/src/contexts/AuthContext'
import { currencyFormatter, notEmpty } from 'lodestar-app-admin/src/helpers'
import moment from 'moment'
import { flatten, range, sum, uniqBy } from 'ramda'
import { useState } from 'react'
import styled from 'styled-components'
import { v4 } from 'uuid'
import { ContractInfo, ContractItem, FieldProps } from '.'
import hasura from '../../hasura'

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
  products: ContractInfo['products']
  selectedProjectPlan: ContractInfo['projectPlans'][number] | null
  startedAt: Date
  endedAt: Date | null
  memberBlockRef: React.MutableRefObject<HTMLDivElement | null>
  selectedProducts: NonNullable<FieldProps['contractProducts']>
  form: FormInstance<FieldProps>
  coinExchangeRage: number
  contractProducts: ContractItem[]
  contractDiscounts: ContractItem[]
  finalPrice: number
  totalAppointments: number
  totalCoins: number
}> = ({
  member,
  products,
  selectedProjectPlan,
  startedAt,
  endedAt,
  memberBlockRef,
  form,
  selectedProducts,
  coinExchangeRage,
  contractProducts,
  contractDiscounts,
  finalPrice,
  totalAppointments,
  totalCoins,
}) => {
  const [addMemberContract] = useMutation<hasura.ADD_MEMBER_CONTRACT, hasura.ADD_MEMBER_CONTRACTVariables>(
    ADD_MEMBER_CONTRACT,
  )
  const { currentMemberId } = useAuth()
  const [memberContractUrl, setMemberContractUrl] = useState('')
  const fieldValue = form.getFieldsValue()

  const handleMemberContractCreate = async () => {
    const alert = document.getElementsByClassName('ant-alert')[0]

    if (memberBlockRef.current?.contains(alert)) {
      message.warning('學員資料請填寫完整')
      return
    }
    if (fieldValue.identity === 'student' && !fieldValue?.certification?.file.name) {
      message.warn('需上傳證明')
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

    if (sum(orderExecutors.map(v => v.ratio)) !== 1) {
      message.warn('承辦人分潤比例加總必須為 1')
      return
    }

    if (!window.confirm('請確認合約是否正確？')) {
      return
    }

    const previewProducts = uniqBy(
      v => v.product_id,
      flatten(
        selectedProducts
          .map(contractProduct => {
            const product = products.find(product => product.id === contractProduct.id)

            if (!product?.previews) {
              return null
            }

            return product.previews.map(v => ({
              product_id: v.productId,
              name: v.title,
              price: v.price ?? 225,
              started_at: fieldValue.withProductStartedAt ? startedAt.toISOString() : null,
              ended_at: endedAt?.toISOString(),
            }))
          })
          .filter(notEmpty),
      ),
    )

    const previewProductCoinLogId = v4()

    // generate coupons
    const couponPlanId = v4()
    const coupons = range(0, totalAppointments).map((v, index) => ({
      member_id: member.id,
      coupon_code: {
        data: {
          code: moment().format('x') + v,
          count: 1,
          remaining: 0,
          app_id: 'xuemi',
          coupon_plan_id: index !== 0 ? couponPlanId : undefined,
          coupon_plan:
            index === 0
              ? {
                  on_conflict: {
                    constraint: 'coupon_plan_pkey',
                    update_columns: ['title'],
                  },
                  data: {
                    id: couponPlanId,
                    type: 2,
                    amount: 100,
                    title: `學米諮詢券`,
                    description: `學員編號：${member.id}, 合約編號：${fieldValue.contractId}`,
                    started_at: startedAt.toISOString(),
                    ended_at: endedAt?.toISOString(),
                    scope: ['AppointmentPlan'],
                  },
                }
              : undefined,
        },
      },
    }))

    const contractCoupons = contractDiscounts.map(v => ({
      id: v4(),
      name: v.name,
      price: Math.abs(v.price) * v.amount,
      member_id: member.id,
      coupon_code: {
        data: {
          coupon_plan_id: v.id,
          code: v4(),
          app_id: 'xuemi',
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
          coinLogs: [
            {
              id: previewProductCoinLogId,
              member_id: member.id,
              title: '學習禮包',
              description: '搶先看學習禮包',
              amount: Math.ceil(sum(previewProducts.map(v => v.price)) / coinExchangeRage),
              started_at: null,
              ended_at: endedAt?.toISOString(),
            },
            {
              id: v4(),
              member_id: member.id,
              title: `${selectedProjectPlan?.title}`,
              description: '私塾課代幣',
              amount: totalCoins,
              started_at: startedAt.toISOString(),
              ended_at: endedAt?.toISOString(),
            },
          ],
          coupons: [
            ...contractCoupons.map(v => ({
              id: v.id,
              member_id: v.member_id,
              coupon_code: v.coupon_code,
            })),
            ...coupons,
          ],
          orderId: `${moment().format('YYYYMMDDHHmmssSSS')}00`,
          orderProducts: [
            {
              product_id: `ProjectPlan_${fieldValue.selectedProjectPlanId}`,
              name: selectedProjectPlan?.title,
              price: 0,
              started_at: startedAt.toISOString(),
              ended_at: endedAt?.toISOString(),
            },
            ...contractProducts.map(v => ({
              product_id: `ProjectPlan_${v.id}`,
              name: v.name,
              price: v.price * v.amount,
              started_at: startedAt.toISOString(),
              ended_at: endedAt?.toISOString(),
              options:
                v.amount > 1
                  ? {
                      quantity: v.amount,
                    }
                  : null,
            })),
            ...previewProducts,
            {
              product_id: 'Card_1af57db9-1af3-4bfd-b4a1-0c8f781ffe96',
              name: '學米 VIP 會員卡',
              price: 0,
              started_at: startedAt.toISOString(),
              ended_at: endedAt?.toISOString(),
            },
          ],
          orderDiscounts: [
            ...contractCoupons.map(v => ({
              name: `【折價券】${v.name}`,
              price: v.price,
              type: 'Coupon',
              target: v.id,
            })),
            ...previewProducts.map(v => ({
              name: `【代幣折抵】${v.name}`,
              price: 225,
              type: 'Coin',
              target: previewProductCoinLogId,
              options: {
                coins: 5,
                exchangeRate: 45,
              },
            })),
          ],
          orderExecutors,
          invoice: {
            name: member.name,
            phone: member.phones.join(','),
            email: member.email,
          },
          paymentNo: moment().format('YYYYMMDDHHmmss'),
          paymentOptions: {
            paymentMethod: fieldValue.paymentMethod,
            installmentPlan: fieldValue.installmentPlan,
            paymentNumber: fieldValue.paymentNumber,
          },
          price: finalPrice,
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
        setMemberContractUrl(`https://www.xuemi.co/members/${member.id}/contracts/${contractId}`)
        message.success('成功產生合約')
      })
      .catch(err => message.error(`產生合約失敗，請確認資料是否正確。錯誤代碼：${err}`))
  }

  return (
    <>
      <StyledOrder className="mb-5">
        {[...contractProducts, ...contractDiscounts].map(item => (
          <div key={item.id} className="row mb-2">
            <div className="col-6 text-right">
              {item.type === 'addonProduct' && '【加購項目】'}
              {item.type === 'referralDiscount' && '【介紹折抵】'}
              {item.type === 'promotionDiscount' && '【促銷折抵】'}
            </div>
            <div className="col-3">
              <span>{item.name}</span>
              {item.amount > 1 ? <span>x{item.amount}</span> : ''}
            </div>
            <div className="col-3 text-right">{currencyFormatter(item.price * item.amount)}</div>
          </div>
        ))}

        <div className="row mb-2">
          <strong className="col-6 text-right">合計</strong>

          <div className="col-6 text-right">
            <StyledTotal>{currencyFormatter(finalPrice)}</StyledTotal>
            <StyledTotal>{totalAppointments} 次諮詢</StyledTotal>
            <StyledTotal>{totalCoins} XP</StyledTotal>
          </div>
        </div>
      </StyledOrder>

      {memberContractUrl ? (
        <Alert message="合約連結" description={memberContractUrl} type="success" showIcon />
      ) : (
        <Button size="large" block type="primary" onClick={handleMemberContractCreate}>
          產生合約
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
