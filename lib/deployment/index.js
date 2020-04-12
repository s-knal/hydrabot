const Configuration = require('../configuration/configuration')

async function deploymentExecutor (context, logger) {
  let config = await Configuration.instanceWithContext(context)
  config = config.settings ? config.settings : config
  let labelName = context.payload.label.name
  let encodedLabelName = encodeURI(labelName)
  if (config && config.deploy && config.deploy.labels && config.deploy.labels[encodedLabelName]) {
    let owner = context.payload.pull_request.head.repo.owner.login
    let repo = context.payload.pull_request.head.repo.name
    let ref = context.payload.pull_request.head.ref
    let number = context.payload.pull_request.number
    let deployment = config.deploy.labels[encodedLabelName]
    Object.assign(deployment, {
      owner,
      repo,
      ref,
      headers: {
        accept: 'application/vnd.github.ant-man-preview+json'
      }
    })
    try {
      await context.github.repos.createDeployment(deployment)
    } catch (error) {
      logger.warn('Error creating deployment')
      let errorMessage = JSON.parse(error.message)
      let body = `:rotating_light: Failed to trigger deployment. :rotating_light: with error:\n${errorMessage.message}`
      if (errorMessage.documentation_url) {
        body = body + `\n\nSee [the documentation](${errorMessage.documentation_url}) for more details`
      } else {
        body = body + '\n\nPlease contact the **sysops** :ambulance:  regarding this issue'
      }

      logger.debug('Cleaning up failed deployment')
      await createComment(context, {owner, repo, number, body})
    }
    await cleanUpLabel(context, {owner, repo, number}, labelName)
  }
}

async function cleanUpLabel (context, { owner, repo, number }, name) {
  let params = {
    owner,
    repo,
    number,
    name
  }
  await context.github.issues.removeLabel(params)
}

async function createComment (context, { owner, repo, number, body }) {
  let params = {
    owner,
    repo,
    number,
    body
  }
  await context.github.issues.createComment(params)
}

module.exports = deploymentExecutor
