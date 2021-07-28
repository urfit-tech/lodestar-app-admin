const defaultSettings = {
  customerSupportLink: 'https://kolable.com/',
  title: 'KOLABLE',
  description: 'Website of KOLABLE',
  openGraph: {
    title: '',
    url: '',
    image: '',
    description: '',
  },
  seo: {
    name: '',
    logo: '',
    url: '',
  },
  navLinks: [
    {
      label: '探索課程',
      href: `/programs`,
      icon: 'appstore',
      external: false,
      target: '_self',
    },
  ],
  footer: {
    type: 'default', // default, multiline
    socialMedias: [{ label: '', href: '' }],
    links: [
      {
        label: '使用條款',
        href: `/terms`,
        external: false,
      },
      {
        label: '探索課程',
        href: `/programs`,
        external: false,
      },
    ],
    copyright: 'Copyright © 2019 KOLABLE Inc. All rights reserved',
  },
  tappayApp: {
    id: 12972,
    key: 'app_JoE5vqRdTIatCvHPyw81oVxPJK2x0dEJriDOXxCeq85Yrt9VHWPkvOUJ4G7B',
  },
  trackingId: {
    ga: '',
    fbPixel: '',
  },
}

export default defaultSettings
