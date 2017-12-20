import chalk from 'chalk'

export const noEndpointError = new Error(
  `You don't have any endpoint in your .graphqlconfig.
Run ${chalk.yellow('graphql add-endpoint')} to add an endpoint to your config`,
)
