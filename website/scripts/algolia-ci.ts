import { indexToAlgolia } from '@guild-docs/algolia';
import { resolve } from 'path';
import * as sidebars from '../sidebars';

indexToAlgolia({
  docusaurus: {
    sidebars,
  },
  // needed because GraphQL CLI has a weird routing config with content at `/`
  postProcessor: (objects) =>
    objects.map((o) => ({
      ...o,
      url: o.url.replace('docs/', ''),
    })),
  source: 'CLI',
  domain: process.env.SITE_URL!,
  lockfilePath: resolve(__dirname, '../algolia-lockfile.json'),
  dryMode: process.env.ALGOLIA_DRY_RUN === 'true',
});
