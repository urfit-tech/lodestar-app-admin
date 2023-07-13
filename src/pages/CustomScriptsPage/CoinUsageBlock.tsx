import { useQuery } from '@apollo/client'
import { Button } from 'antd'
import gql from 'graphql-tag'
import moment from 'moment'
import React from 'react'
import hasura from '../../hasura'
import { downloadCSV, toCSV } from '../../helpers'

type CoinUsageExport = {
  memberContractId: string
  invoiceIssuedAt: string | null
  invoiceNumber: string | null
  memberId: string
  email: string
  name: string
  agreedAt: string | null
  price: number
  unTaxedPrice: number
  totalCoin: number
  totalCoinUsage: number
  achievedUnTaxedIncome: number
  unAchievedUnTaxedIncome: number
  achievedIncomePercent: number
  coinUsageLog: { date: string; amount: number }[]
}

const CoinUsageBlock: React.VFC = () => {
  const { data, loading, error } = useCoinUsage()

  return (
    <>
      <Button
        onClick={() => {
          if (data && data?.length > 0) {
            const titleArr = [
              '發票日期',
              '發票編號',
              '會員ID',
              '會員信箱',
              '會員姓名',
              '合約簽署日',
              '當年合約金額(未稅)',
              '當年合約金額(含稅)',
              '總代幣數量',
              ...data[0].coinUsageLog.map(c => `${c.date}代幣用量`),
              '總代幣用量',
              '已實現收入(未稅)',
              '未實現收入',
              '已實現比例',
            ]
            let csvData = [titleArr]
            for (let i = 0; i < data.length; i++) {
              csvData.push([
                `${data[i].invoiceIssuedAt}`,
                `${data[i].invoiceNumber}`,
                `${data[i].memberId}`,
                `${data[i].email}`,
                `${data[i].name}`,
                `${data[i].agreedAt}`,
                `${data[i].unTaxedPrice}`,
                `${data[i].price}`,
                `${data[i].totalCoin}`,
                ...data[i].coinUsageLog.map(c => `${c.amount}`),
                `${data[i].totalCoinUsage}`,
                `${data[i].achievedUnTaxedIncome}`,
                `${data[i].unAchievedUnTaxedIncome}`,
                `${data[i].achievedIncomePercent}`,
              ])
            }
            downloadCSV(`學米私塾代幣使用情況.csv`, toCSV(csvData))
          }
        }}
        type="primary"
        disabled={loading || Boolean(error)}
        loading={loading}
      >
        匯出資料
      </Button>
      {error && (
        <div style={{ color: 'red' }}>
          資料錯誤 <br />
          {JSON.stringify(error)}
        </div>
      )}
    </>
  )
}

const useCoinUsage = () => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_COIN_USAGE_EXPORT>(gql`
    query GET_COIN_USAGE_EXPORT {
      coin_usage_export {
        member_contract_id
        invoice_issued_at
        invoice_number
        member_id
        email
        name
        agreed_at
        price
        discount_log
        coin_logs
      }
    }
  `)

  const coinUsageExport: CoinUsageExport[] | null = data
    ? data.coin_usage_export.map(c => {
        let coinUsageLog: { date: string; amount: number }[] = []
        const DEFAULTYEAR = 109
        for (let i = 0; i < 96; i++) {
          if (i < 7) {
            continue
          }
          const year = DEFAULTYEAR + Math.floor(i / 12)
          const month = `${(i % 12) + 1 < 10 ? 0 : ''}${(i % 12) + 1}`
          coinUsageLog.push({
            date: `${year}年${month}月`,
            amount: c.discount_log[0]
              ? c.discount_log
                  ?.filter((v: any) => c?.coin_logs?.[0].id === v?.target)
                  ?.filter((d: any) => d?.created_at?.indexOf(`${year + 1911}-${month}`) !== -1)
                  ?.map((f: any) => f?.options?.coins)
                  ?.reduce((a: any, b: any) => a + b, 0) || 0
              : 0,
          })
        }
        const unTaxedPrice = Math.round(Number(c.price) / 1.05) || 0
        const totalCoinUsage = coinUsageLog.map(c => c.amount).reduce((a: any, b: any) => a + b, 0)
        const totalCoin =
          c.coin_logs
            ?.map(
              (coinLog: {
                id: string
                member_id: string
                title: string
                description: string
                amount: number
                started_at: Date
                ended_at: Date
              }) => coinLog?.amount,
            )
            .reduce((a: any, b: any) => a + b, 0) || 0
        const achievedUnTaxedIncome = Math.round(totalCoinUsage * (unTaxedPrice / totalCoin))

        return {
          memberContractId: c.member_contract_id,
          invoiceIssuedAt: c.invoice_issued_at ? moment(c.invoice_issued_at).format('YYYY-MM-DD HH:mm:ss') : '',
          invoiceNumber: c.invoice_number || '',
          memberId: c.member_id || '',
          email: c.email || '',
          name: c.name || '',
          agreedAt: moment(c.agreed_at).format('YYYY-MM-DD HH:mm:ss'),
          price: Number(c.price) || 0,
          unTaxedPrice: unTaxedPrice,
          totalCoin: totalCoin,
          totalCoinUsage: totalCoinUsage,
          achievedUnTaxedIncome: achievedUnTaxedIncome,
          unAchievedUnTaxedIncome: unTaxedPrice - achievedUnTaxedIncome,
          achievedIncomePercent: achievedUnTaxedIncome / unTaxedPrice,
          coinUsageLog: coinUsageLog,
        }
      })
    : null

  return {
    loading,
    error,
    data: coinUsageExport,
    refetch,
  }
}

export default CoinUsageBlock
