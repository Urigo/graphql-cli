module.exports = {
  title: 'GraphQL CLI',
  tagline: '📟 Command line tool for common GraphQL development workflows',

  url: 'https://graphql-cli.com',
  baseUrl: '/',
  favicon: 'img/logo.ico',

  organizationName: 'urigo',
  projectName: 'graphql-cli',

  themeConfig: {
    colorMode: {
      disableSwitch: true,
    },
    image: 'img/logo.png',
    navbar: {
      title: 'GraphQL CLI',
      logo: {
        alt: 'GraphQL CLI Logo',
        src: 'img/logo.png',
      },
      items: [
        {
          to: '/introduction',
          label: 'Documentation',
          position: 'right',
        },
        {
          href: 'https://github.com/urigo/graphql-cli',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      copyright: `Copyright © ${new Date().getFullYear()} The Guild. All rights reserved.`,
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Introduction',
              to: 'introduction',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Discord',
              href: 'https://discord.gg/xud7bH9',
            },
            {
              label: 'Other projects',
              href: 'https://github.com/the-guild-org/Stack',
            },
            {
              label: 'Mailing List',
              href: 'https://upscri.be/19qjhi',
            },
            {
              label: 'Community Meetings',
              href: 'https://github.com/the-guild-org/community-meetings',
            },
          ],
        },
        {
          title: 'Social',
          items: [
            {
              label: 'Blog',
              href: 'https://the-guild.dev/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/urigo/graphql-cli',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/TheGuildDev',
            },
            {
              label: 'LinkedIn',
              href: 'https://www.linkedin.com/company/the-guild-software',
            },
          ],
        },
      ],
    },
    prism: {
      theme: require('prism-react-renderer/themes/dracula'),
    },
  },
  scripts: ['/js/light-mode-by-default.js'],
  customFields: {
    algolia: {
      appId: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
      searchApiKey: process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY,
      indexName: process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME,
    },
  },
  presets: [
    [
      require.resolve('@docusaurus/preset-classic'),
      {
        docs: {
          path: 'docs',
          routeBasePath: '/',
          include: ['**/*.md', '**/*.mdx'],
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/urigo/graphql-cli/edit/master/website/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        sitemap: {
          // cacheTime: 600 * 1001, // 600 sec - cache purge period
          changefreq: 'weekly',
          priority: 0.5,
        },
      },
    ],
  ],
};
