import { useQuery } from '@apollo/react-hooks'
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
  startedAt: string | null
  endedAt: string | null
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
              '服務起始日',
              '服務結束日',
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
                `${data[i].startedAt}`,
                `${data[i].endedAt}`,
                `${data[i].unTaxedPrice}`,
                `${data[i].price}`,
                `${data[i].totalCoin}`,
                ...data[0].coinUsageLog.map(c => `${c.amount}`),
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
        started_at
        ended_at
        price
        coin_log
        discount_log
      }
    }
  `)

  const cointUsageExport: CoinUsageExport[] | null = data
    ? data.coin_usage_export.map(c => {
        let coinUsageLog: { date: string; amount: number }[] = []
        const DEFAULTYEAR = 111
        for (let i = 0; i < 60; i++) {
          const year = DEFAULTYEAR + Math.floor(i / 12)
          const month = `${(i % 12) + 1 < 10 ? 0 : ''}${(i % 12) + 1}`
          coinUsageLog.push({
            date: `${year}年${month}月`,
            amount: c.discount_log
              .filter((d: any) => d.created_at.indexOf(`${year + 1911}-${month}`) !== -1)
              .map((f: any) => f.options.coins)
              .reduce((a: any, b: any) => a + b, 0),
          })
        }
        const unTaxedPrice = Math.round(Number(c.price) / 1.05) || 0
        const totalCoinUsage = coinUsageLog.map(c => c.amount).reduce((a: any, b: any) => a + b, 0)
        const totalCoin = c.coin_log.map((c: any) => c?.amount || 0).reduce((a: any, b: any) => a + b, 0)
        const achievedUnTaxedIncome = totalCoinUsage * (unTaxedPrice / totalCoin)
        return {
          memberContractId: c.member_contract_id,
          invoiceIssuedAt: c.invoice_issued_at ? moment(c.invoice_issued_at).format('YYYY-MM-DD HH:mm:ss') : '',
          invoiceNumber: c.invoice_number || '',
          memberId: c.member_id || '',
          email: c.email || '',
          name: c.name || '',
          startedAt: moment(c.started_at).format('YYYY-MM-DD HH:mm:ss'),
          endedAt: moment(c.ended_at).format('YYYY-MM-DD HH:mm:ss'),
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
    data: cointUsageExport,
    refetch,
  }
}

export default CoinUsageBlock
