import { Button, Form, Input, message } from 'antd'
import { CardProps } from 'antd/lib/card'
import { useForm } from 'antd/lib/form/Form'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { useAppData, useUpdateAppSettings } from '../../hooks/app'
import AdminCard from '../admin/AdminCard'
import { StyledForm } from '../layout'

const messages = defineMessages({
  appTitle: { id: 'app.label.title', defaultMessage: '網站標題' },
  appDescription: { id: 'app.label.description', defaultMessage: '網站敘述' },
  ogTitle: { id: 'app.label.ogTitle', defaultMessage: 'Open Graph 網站標題' },
  ogDescription: { id: 'app.label.ogDescription', defaultMessage: 'Open Graph 網站敘述' },
  ogUrl: { id: 'app.label.ogUrl', defaultMessage: 'Open Graph 網址' },
  ogImage: { id: 'app.label.ogImage', defaultMessage: 'Open Graph 網站圖片' },
  seoName: { id: 'app.label.seoName', defaultMessage: 'SEO 網站名稱' },
  seoUrl: { id: 'app.label.seoUrl', defaultMessage: 'SEO 網址' },

  gaId: { id: 'app.label.gaId', defaultMessage: 'Google Analytics ID' },
  gtmId: { id: 'app.label.gtmId', defaultMessage: 'Google Tag Manager ID' },
  fbPixelId: { id: 'app.label.fbPixelId', defaultMessage: 'Facebook Pixel ID' },

  tappayAppId: { id: 'app.label.tappayAppId', defaultMessage: 'Tappay ID' },
  tappayAppKey: { id: 'app.label.tappayAppKey', defaultMessage: 'Tappay 金鑰' },
  paymentDueDays: { id: 'app.label.paymentDueDays', defaultMessage: '付款截止天數' },

  themeLayoutBodyBackground: { id: 'app.label.themeLayoutBodyBackground', defaultMessage: '主題色：背景色' },
  themePrimaryColor: { id: 'app.label.themePrimaryColor', defaultMessage: '主題色：主色' },
  themeBtnPrimaryColor: { id: 'app.label.themeBtnPrimaryColor', defaultMessage: '主題色：按鈕主色' },
  themeBtnPrimaryBackground: { id: 'app.label.themeBtnPrimaryBackground', defaultMessage: '主題色：按鈕背景' },
  themeBtnDangerBorder: { id: 'app.label.themeBtnDangerBorder', defaultMessage: '主題色：警示按鈕邊框' },
  themeBtnDangerBackground: { id: 'app.label.themeBtnDangerBackground', defaultMessage: '主題色：警示按鈕背景' },
  themeLayoutHeaderBackground: { id: 'app.label.themeLayoutHeaderBackground', defaultMessage: '主題色：Header背景色' },
})

const AppSettingCard: React.FC<
  CardProps & {
    appId: string
  }
> = ({ appId, ...cardProps }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm()
  const { app, refetchApp, loadingApp } = useAppData(appId)
  const updateAppSettings = useUpdateAppSettings()
  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    form
      .validateFields()
      .then(values => {
        if (!app) {
          return
        }
        setLoading(true)
        const appSettings = Object.keys(values)
          .filter(key => values[key])
          .map(key => ({
            app_id: app.id,
            key,
            value: values[key],
          }))
        updateAppSettings({
          variables: {
            appSettings,
          },
        })
          .then(() => {
            refetchApp()
            message.success(formatMessage(commonMessages.event.successfullySaved))
          })
          .catch(handleError)
          .finally(() => setLoading(false))
      })
      .catch(() => {})
  }

  return (
    <AdminCard {...cardProps} loading={loadingApp}>
      <StyledForm
        form={form}
        hideRequiredMark
        colon={false}
        labelAlign="left"
        labelCol={{ md: { span: 4 } }}
        wrapperCol={{ md: { span: 12 } }}
        initialValues={{
          title: app?.settings['title'],
          description: app?.settings['description'],
          'open_graph.title': app?.settings['open_graph.title'],
          'open_graph.description': app?.settings['open_graph.description'],
          'open_graph.url': app?.settings['open_graph.url'],
          'open_graph.image': app?.settings['open_graph.image'],
          'seo.name': app?.settings['seo.name'],
          'seo.url': app?.settings['seo.url'],
          'tracking.gtm_id': app?.settings['tracking.gtm_id'],
          'tracking.ga_id': app?.settings['tracking.ga_id'],
          'tracking.fb_pixel_id': app?.settings['tracking.fb_pixel_id'],
          'theme.@layout-body-background': app?.settings['theme.@layout-body-background'],
          'theme.@primary-color': app?.settings['theme.@primary-color'],
          'theme.@btn-primary-color': app?.settings['theme.@btn-primary-color'],
          'theme.@btn-primary-bg': app?.settings['theme.@btn-primary-bg'],
          'theme.@btn-danger-border': app?.settings['theme.@btn-danger-border'],
          'theme.@btn-danger-bg': app?.settings['theme.@btn-danger-bg'],
          'theme.@layout-header-background': app?.settings['theme.@layout-header-background'],
          'tappay.app_id': app?.settings['tappay.app_id'],
          'tappay.app_key': app?.settings['tappay.app_key'],
          'payment.due_days': app?.settings['payment.due_days'],
        }}
      >
        <Form.Item label={formatMessage(messages.appTitle)} name="title">
          <Input />
        </Form.Item>
        <Form.Item label={formatMessage(messages.appDescription)} name="description">
          <Input />
        </Form.Item>

        {/* open graph */}
        <Form.Item label={formatMessage(messages.ogTitle)} name="open_graph.title">
          <Input />
        </Form.Item>
        <Form.Item label={formatMessage(messages.ogDescription)} name="open_graph.description">
          <Input />
        </Form.Item>
        <Form.Item label={formatMessage(messages.ogUrl)} name="open_graph.url">
          <Input />
        </Form.Item>
        <Form.Item label={formatMessage(messages.ogImage)} name="open_graph.image">
          <Input />
        </Form.Item>

        {/* seo */}
        <Form.Item label={formatMessage(messages.seoName)} name="seo.name">
          <Input />
        </Form.Item>
        <Form.Item label={formatMessage(messages.seoUrl)} name="seo.url">
          <Input />
        </Form.Item>

        {/* tracking */}
        <Form.Item label={formatMessage(messages.gtmId)} name="tracking.gtm_id">
          <Input />
        </Form.Item>
        <Form.Item label={formatMessage(messages.gaId)} name="tracking.ga_id">
          <Input />
        </Form.Item>
        <Form.Item label={formatMessage(messages.fbPixelId)} name="tracking.fb_pixel_id">
          <Input />
        </Form.Item>

        {/* themes */}
        <Form.Item label={formatMessage(messages.themeLayoutBodyBackground)} name="theme.@layout-body-background">
          <Input />
        </Form.Item>
        <Form.Item label={formatMessage(messages.themePrimaryColor)} name="theme.@primary-color">
          <Input />
        </Form.Item>
        <Form.Item label={formatMessage(messages.themeBtnPrimaryColor)} name="theme.@btn-primary-color">
          <Input />
        </Form.Item>
        <Form.Item label={formatMessage(messages.themeBtnPrimaryBackground)} name="theme.@btn-primary-bg">
          <Input />
        </Form.Item>
        <Form.Item label={formatMessage(messages.themeBtnDangerBorder)} name="theme.@btn-danger-border">
          <Input />
        </Form.Item>
        <Form.Item label={formatMessage(messages.themeBtnDangerBackground)} name="theme.@btn-danger-bg">
          <Input />
        </Form.Item>
        <Form.Item label={formatMessage(messages.themeLayoutHeaderBackground)} name="theme.@layout-header-background">
          <Input />
        </Form.Item>

        {/* payment */}
        <Form.Item label={formatMessage(messages.tappayAppId)} name="tappay.app_id">
          <Input />
        </Form.Item>
        <Form.Item label={formatMessage(messages.tappayAppKey)} name="tappay.app_key">
          <Input />
        </Form.Item>
        <Form.Item label={formatMessage(messages.paymentDueDays)} name="payment.due_days">
          <Input />
        </Form.Item>

        <Form.Item wrapperCol={{ md: { offset: 4 } }}>
          <Button className="mr-2" onClick={() => form.resetFields()}>
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" htmlType="submit" loading={loading} onClick={() => handleSubmit()}>
            {formatMessage(commonMessages.ui.save)}
          </Button>
        </Form.Item>
      </StyledForm>
    </AdminCard>
  )
}

export default AppSettingCard
