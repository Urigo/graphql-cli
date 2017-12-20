import chalk from 'chalk'

export const noEndpointError = new Error(
  `You don't have any enpoint in your .graphqlconfig.
Run ${chalk.yellow('graphql add-endpoint')} to add endpoint to your config`,
)
