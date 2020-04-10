const { createIssueBranch } = require('./utils')
const Configuration = require('../configuration/configuration')
const issueTitle = 'Error in Create Issue Branch app configuration'
let log

const load = async (context) => {
  try {
    let config = await Configuration.instanceWithContext(context)
    if (config.branches) {
      for (let branchConfiguration of config.branches) {
        if (!branchConfiguration.label) {
          await handleError(ctx, `Branch configuration is missing label: ${JSON.stringify(branchConfiguration)}`)
          return undefined
        }
      }
    }
    return config
  } catch (error) {
    await handleError(context, `Exception while parsing configuration YAML: ${error.message}`)
    return undefined
  }
}

const findConfigurationErrorIssue = async (context) => {
  let fullName = context.payload.repository.full_name
  const result = await context.github.search.issuesAndPullRequests({
    q: `${issueTitle} repo:${fullName} in:title type:issue state:open`
  })
  return result.data.items
}

const createConfigurationErrorIssue = async (context, error) => {
  let errorBody = (err) => {
    return `
    Error in app configuration:
    \`\`\`
    ${error}
    \`\`\`
    Please check the syntax of your \`.github/hydrabot.yml\`
  `
  }
  return context.github.issues.create(context.repo({
    title: issueTitle,
    body: errorBody(error)
  }))
}

const handleError = async (context, error) => {
  let log = logger.create('hydrabot')
  log.error(`Error in app configuration: ${error}`)
  let issues = await findConfigurationErrorIssue(context)
  if (issues.length > 0) {
    log.error(`Error issue alread exists for repo: ${context.payload.repository.full_name}`)
  } else {
    return createConfigurationErrorIssue(context, error)
  }
}

const executeCreateIssueBranch = async (context, log) => {
  global.log = log
  let config = await load(context);
  if (config) {
    await createIssueBranch(context, config, log)
  }
}

module.exports = executeCreateIssueBranch