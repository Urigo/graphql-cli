import * as chalk from 'chalk';

export const noEndpointErrorMessage =
`You don't have any enpoint in your .graphqlconfig.
Run ${chalk.yellow('graphql add-endpoint')} to add endpoint to your config`;
