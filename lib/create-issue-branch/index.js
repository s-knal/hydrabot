const { createIssueBranch } = require('./utils')
const Configuration = require('../configuration/configuration')
const issueTitle = 'Error in create new issue branch configuration'

const load = async (context, log) => {
  try {
    let config = await Configuration.instanceWithContext(context)
    config = config.settings ? config.settings : config
    if (config && config.branches) {
      for (let branchConfiguration of config.branches) {
        if (!branchConfiguration.label) {
          await handleError(context, `Branch configuration is missing label: ${JSON.stringify(branchConfiguration)}`, log)
          return undefined
        }
      }
    }
    return config
  } catch (error) {
    await handleError(context, `Exception while parsing configuration YAML: ${error.message}`, log)
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
    ${err}
    \`\`\`
    Please check the syntax of your \`.github/hydrabot.yml\`
  `
  }
  return context.github.issues.create(context.repo({
    title: issueTitle,
    body: errorBody(error)
  }))
}

const handleError = async (context, error, log) => {
  log.error(`Error in app configuration: ${error}`)
  let issues = await findConfigurationErrorIssue(context)
  if (issues.length > 0) {
    log.error(`Error issue alread exists for repo: ${context.payload.repository.full_name}`)
  } else {
    return createConfigurationErrorIssue(context, error)
  }
}

const executeCreateIssueBranch = async (context, log) => {
  let config = await load(context, log)
  if (config) {
    await createIssueBranch(context, config, log)
  }
}

module.exports = executeCreateIssueBranch
