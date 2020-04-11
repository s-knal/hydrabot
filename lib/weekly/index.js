const moment = require('moment')
const getDate = require('./markdown/getDate')
const getNumDayFromLongDay = require('./markdown/getNumDayFromLongDay')
const fixConfig = require('./markdown/fixConfig')
const Configuration = require('../configuration/configuration')
const markdownBody = require('./markdown/markdownBody')
const checkDuplicates = require('./markdown/checkDuplicates')
const getLongMonth = require('./markdown/getLongMonth')
const defaultConfig = require('./markdown/defaultConfig')
const {
  postCreateIssues,
  postCreateLabel
} = require('./utils')

const getConfig = async (context) => {
  let config = await Configuration.instanceWithContext(context)
  config = config ? config.weeklyStats : config
  return config
}

const weeklyDigest = async (context, {
  owner,
  repo,
  headDate,
  tailDate
}, config) => {
  let headDateObject = moment(headDate).toObject()
  let tailDateObject = moment(tailDate).toObject()
  let title = `Hydrabot weekly stats for (${tailDateObject.date} ${getLongMonth(tailDateObject.months)}, ${tailDateObject.years} - ${headDateObject.date} ${getLongMonth(headDateObject.months)}, ${headDateObject.years})`
  let body = await markdownBody(context, {
    owner,
    repo,
    headDate,
    tailDate
  }, config)
  const labels = ['hydrabot-stats']
  console.log(`${title} \n${labels} \n${body}`)
  postCreateIssues(context, {
    owner,
    repo,
    title,
    body,
    labels
  })
  return {
    title,
    labels,
    body
  }
}

const executeFirstWDInstallation = async (context, log) => {
  if (!log) {
    log = {
      info: console.log
    }
  }
  const headDate = getDate.headDate()
  const tailDate = getDate.tailDate()
  const config = defaultConfig
  let repoList = []
  if (context.event === 'installation' && context.payload.action === 'created') {
    repoList = context.payload.repositories
  } else if (context.event === 'installation_repositories') {
    repoList = context.payload.repositories_added
  }
  repoList.forEach(async (item) => {
    const [owner, repo] = item.full_name.split('/')
    log.info(`Repository: ${owner}/${repo}`)
    await postCreateLabel(context, {
      owner,
      repo,
      name: 'hydrabot-stats',
      color: '9C27B0',
      description: ''
    })
    await weeklyDigest(context, {
      owner,
      repo,
      headDate,
      tailDate
    }, config)
  })
}

const weeklyDigestExecutor = async (context, log) => {
  if (!log) {
    log = {
      info: console.log
    }
  }
  log.info('Local time: ' + moment().format())
  const {
    owner,
    repo
  } = context.repo()
  log.info(`Repository: ${owner}/${repo}`)
  const headDate = getDate.headDate()
  const tailDate = getDate.tailDate()
  let {
    hasDuplicates,
    url
  } = await checkDuplicates(context, {
    owner,
    repo,
    headDate
  })
  if (hasDuplicates) {
    console.log(`Hydrabot weekly stats for this week has already been published for ${owner}/${repo}`)
    console.log(`URL: ` + url)
    return
  }
  let config = await getConfig(context)
  config = fixConfig(config)
  if (moment.utc().day() === getNumDayFromLongDay(config.publishDay)) {
    await weeklyDigest(context, {
      owner,
      repo,
      headDate,
      tailDate
    }, config)
  }
}

module.exports = {
  weeklyDigestExecutor,
  executeFirstWDInstallation,
  weeklyDigest
}
