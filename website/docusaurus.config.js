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
    sidebarCollapsible: false,
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
    prism: {
      theme: require('prism-react-renderer/themes/dracula'),
    },
  },
  scripts: [
    '/js/light-mode-by-default.js'
  ],
  presets: [
    [
      require.resolve('@docusaurus/preset-classic'),
      {
        docs: {
          path: 'docs',
          routeBasePath: '/',
          include: ['**/*.md', '**/*.mdx'],
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
            'https://github.com/urigo/graphql-cli/edit/master/website/',
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
