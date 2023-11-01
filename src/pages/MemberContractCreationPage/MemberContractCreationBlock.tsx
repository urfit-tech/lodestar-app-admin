import { gql, useMutation } from '@apollo/client'
import { Alert, Button, message } from 'antd'
import { FormInstance } from 'antd/lib/form'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import { flatten, range, sum, uniqBy } from 'ramda'
import { useState } from 'react'
import styled from 'styled-components'
import { v4 } from 'uuid'
import { ContractInfo, ContractItem, FieldProps } from '.'
import hasura from '../../hasura'
import { currencyFormatter, notEmpty } from '../../helpers'
import { useAppCustom } from '../../hooks'

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
const StyledInstallment = styled(StyledTotal)`
  font-size: 16px;
`

const MemberContractCreationBlock: React.FC<{
  member: NonNullable<ContractInfo['member']>
  products: ContractInfo['products']
  selectedProjectPlan: ContractInfo['projectPlans'][number] | null
  startedAt: Date
  endedAt: Date
  serviceStartedAt: Date
  serviceEndedAt: Date
  memberBlockRef: React.MutableRefObject<HTMLDivElement | null>
  selectedProducts: NonNullable<FieldProps['contractProducts']>
  form: FormInstance<FieldProps>
  coinExchangeRage: number
  contractProducts: ContractItem[]
  contractDiscounts: ContractItem[]
  totalPrice: number
  totalAppointments: number
  totalCoins: number
  customContractCard?: { id: string; title: string } | null
  customContractProduct?: { periodAmount: number; periodType: 'y' | 'M' | 'd' } | null
  totalBonusExtendedServiceCoupons: number
}> = ({
  member,
  products,
  selectedProjectPlan,
  startedAt,
  endedAt,
  serviceStartedAt,
  serviceEndedAt,
  memberBlockRef,
  form,
  selectedProducts,
  coinExchangeRage,
  contractProducts,
  contractDiscounts,
  totalPrice,
  totalAppointments,
  totalCoins,
  customContractCard,
  customContractProduct,
  totalBonusExtendedServiceCoupons,
}) => {
  const appCustom = useAppCustom()
  const [addMemberContract] = useMutation<hasura.AddMemberContract, hasura.AddMemberContractVariables>(
    AddMemberContract,
  )
  const { id: appId, host } = useApp()
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

    if (contractProducts.length < 1) {
      message.warn('請至少要新增一個合約內容')
      return
    }

    if (!fieldValue.paymentMethod) {
      message.warn('請選擇付款方式')
      return
    }

    if (!fieldValue.installmentPlan) {
      message.warn('請選擇分期期數')
      return
    }

    if (sum(orderExecutors.map(v => v.ratio)) !== 1) {
      message.warn('承辦人分潤比例加總必須為 1')
      return
    }

    if (!window.confirm('請確認合約是否正確？')) {
      return
    }

    const projectProducts = uniqBy(
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
              price: 0,
              started_at: serviceStartedAt,
              ended_at: serviceStartedAt
                ? moment(serviceStartedAt).add(v?.periodAmount, v?.periodType).endOf('day').toDate().toISOString()
                : null,
              delivered_at: new Date(),
            }))
          })
          .filter(notEmpty),
      ),
    )

    // generate appointment coupons
    const appointmentCouponPlanId = v4()
    const appointmentCoupons = range(0, totalAppointments).map((v, index) => {
      return {
        member_id: member.id,
        coupon_code: {
          data: {
            code: moment().format('x') + v,
            count: 1,
            remaining: 0,
            app_id: appId,
            coupon_plan_id: index !== 0 ? appointmentCouponPlanId : undefined,
            coupon_plan:
              index === 0
                ? {
                    on_conflict: {
                      constraint: 'coupon_plan_pkey',
                      update_columns: ['title'],
                    },
                    data: {
                      id: appointmentCouponPlanId,
                      type: 2,
                      amount: 100,
                      title: appCustom.contractCoupon.title,
                      description: `學員編號：${member.id}, 合約編號：${fieldValue.contractId}`,
                      started_at: serviceStartedAt.toISOString(),
                      ended_at: serviceEndedAt?.toISOString(),
                      scope: ['AppointmentPlan'],
                    },
                  }
                : undefined,
          },
        },
      }
    })

    // generate bonus extended service coupons
    const bonusExtendedServiceCouponPlanId = v4()
    const bonusExtendedServiceCoupons = range(0, totalBonusExtendedServiceCoupons).map((v, index) => {
      return {
        member_id: member.id,
        coupon_code: {
          data: {
            code: `extendedService-${moment().format('x')}-${v}`,
            count: 1,
            remaining: 0,
            app_id: appId,
            coupon_plan_id: index !== 0 ? bonusExtendedServiceCouponPlanId : undefined,
            coupon_plan:
              index === 0
                ? {
                    on_conflict: {
                      constraint: 'coupon_plan_pkey',
                      update_columns: ['title'],
                    },
                    data: {
                      id: bonusExtendedServiceCouponPlanId,
                      type: 2,
                      amount: 100,
                      title: appCustom.bonusExtendedServiceCoupon.title,
                      description: `學員編號：${member.id}, 合約編號：${fieldValue.contractId}`,
                      started_at: serviceStartedAt.toISOString(),
                      ended_at: serviceEndedAt?.toISOString(),
                      scope: ['ProjectPlan'],
                    },
                  }
                : undefined,
          },
        },
      }
    })

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
          coinLogs: [
            // {
            //   id: previewProductCoinLogId,
            //   member_id: member.id,
            //   title: '學習禮包',
            //   description: '搶先看學習禮包',
            //   amount: Math.ceil(sum(projectProducts.map(v => v.price)) / coinExchangeRage),
            //   started_at: null,
            //   ended_at: serviceEndedAt?.toISOString(),
            // },
            {
              id: v4(),
              member_id: member.id,
              title: `${selectedProjectPlan?.title}`,
              description: '私塾課代幣',
              amount: totalCoins,
              started_at: serviceStartedAt.toISOString(),
              ended_at: serviceEndedAt?.toISOString(),
            },
          ],
          coupons: [
            ...contractCoupons.map(v => ({
              id: v.id,
              member_id: v.member_id,
              coupon_code: v.coupon_code,
            })),
            ...appointmentCoupons,
            ...bonusExtendedServiceCoupons,
          ],
          orderId: `${moment().format('YYYYMMDDHHmmssSSS')}00`,
          orderOptions: {
            recognizePerformance:
              totalPrice -
              Math.round(
                totalPrice *
                  (appCustom.paymentMethods
                    .find(paymentMethod => paymentMethod.method === fieldValue.paymentMethod)
                    ?.feeWithInstallmentPlans.find(
                      feeWithInstallmentPlan => feeWithInstallmentPlan.installmentPlan === fieldValue.installmentPlan,
                    )?.fee || 0),
              ),
          },
          orderProducts: [
            // main project
            {
              product_id: `ProjectPlan_${selectedProjectPlan?.id}`,
              name: selectedProjectPlan?.title,
              price: totalPrice,
              started_at: serviceStartedAt.toISOString(),
              ended_at: serviceEndedAt?.toISOString(),
              delivered_at: new Date(),
            },
            // each subject project plan
            ...contractProducts
              .filter(v => v.name !== '業師諮詢')
              .map(v => ({
                product_id: `ProjectPlan_${v.id}`,
                name: v.name,
                price: 0,
                started_at: serviceStartedAt.toISOString(),
                ended_at: serviceEndedAt?.toISOString(),
                delivered_at: new Date(),
                options:
                  v.amount > 1
                    ? {
                        quantity: v.amount,
                      }
                    : null,
              })),
            // xuemi-only: consultant
            ...[
              appId === 'xuemi' && totalAppointments > 0 && products.find(p => p.name === '業師諮詢')
                ? {
                    product_id: `ProjectPlan_${products.find(p => p.name === '業師諮詢')?.id}`,
                    name: products.find(p => p.name === '業師諮詢')?.name,
                    price: 0,
                    started_at: serviceStartedAt.toISOString(),
                    ended_at: serviceEndedAt?.toISOString(),
                    delivered_at: new Date(),
                    options: {
                      quantity: totalAppointments,
                    },
                  }
                : null,
            ].filter(notEmpty),
            // ooschool-only: bonus extended service coupons
            ...[
              appId === 'sixdigital' &&
              totalBonusExtendedServiceCoupons > 0 &&
              products.find(p => p.name === '服務展延券')
                ? {
                    product_id: `ProjectPlan_${products.find(p => p.name === '服務展延券')?.id}`,
                    name: products.find(p => p.name === '服務展延券')?.name,
                    price: 0,
                    started_at: serviceStartedAt.toISOString(),
                    ended_at: serviceEndedAt?.toISOString(),
                    delivered_at: new Date(),
                    options: {
                      quantity: totalBonusExtendedServiceCoupons,
                    },
                  }
                : null,
            ].filter(notEmpty),
            // products from subject project plan
            ...projectProducts,
            ...[
              customContractCard
                ? {
                    product_id: `Card_${customContractCard.id}`,
                    name: customContractCard.title,
                    price: 0,
                    started_at: serviceStartedAt.toISOString(),
                    ended_at: serviceEndedAt?.toISOString(),
                    delivered_at: new Date(),
                  }
                : null,
            ].filter(notEmpty),
          ],
          orderDiscounts: [
            // ...contractCoupons.map(v => ({
            //   name: `【折價券】${v.name}`,
            //   price: 0,
            //   type: 'Coupon',
            //   target: v.id,
            // })),
            // ...projectProducts.map(v => ({
            //   name: `【代幣折抵】${v.name}`,
            //   price: 0,
            //   type: 'Coin',
            //   target: previewProductCoinLogId,
            //   options: {
            //     coins: 5,
            //     exchangeRate: 45,
            //   },
            // })),
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
          price: totalPrice,
        },
        options: {
          appointmentCreatorId: fieldValue.withCreatorId ? fieldValue.creatorId : null,
          studentCertification: fieldValue.identity === 'student' ? fieldValue?.certification?.file.name : null,
          referralMemberId: fieldValue.referralMemberId,
          serviceStartedAt: serviceStartedAt.toISOString(),
          serviceEndedAt: serviceEndedAt.toISOString(),
        },
        dealer: fieldValue.dealer,
      },
    })
      .then(({ data }) => {
        const contractId = data?.insert_member_contract_one?.id
        setMemberContractUrl(`https://${host}/members/${member.id}/contracts/${contractId}`)
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
              {item.type === 'rebateDiscount' && '【滿額折抵】'}
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
            <StyledTotal>{currencyFormatter(totalPrice)}</StyledTotal>
            <StyledInstallment>
              {totalPrice > 0 &&
                fieldValue.installmentPlan &&
                `(每月 NT$ ${Math.round(totalPrice / fieldValue.installmentPlan).toLocaleString('zh-TW', {
                  style: 'currency',
                  currency: 'NTD',
                  minimumFractionDigits: 0,
                })} / 共 ${fieldValue.installmentPlan} 期)`}
            </StyledInstallment>
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

const AddMemberContract = gql`
  mutation AddMemberContract(
    $memberId: String!
    $authorId: String!
    $contractId: uuid!
    $startedAt: timestamptz!
    $endedAt: timestamptz!
    $values: jsonb!
    $options: jsonb
    $dealer: String
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
        dealer: $dealer
      }
    ) {
      id
    }
  }
`

export default MemberContractCreationBlock
