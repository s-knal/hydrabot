async function createIssueBranch (ctx, config, log) {
  const owner = getRepoOwner(ctx)
  const repo = getRepoName(ctx)
  const branchName = await getBranchNameFromIssue(ctx, config)
  if (await branchExists(ctx, owner, repo, branchName)) {
    await addComment(ctx, config, 'Branch already exists')
  } else {
    const sha = await getSourceBranchHeadSha(ctx, config, log)
    await createBranch(ctx, owner, repo, branchName, sha, log)
    log.info(`Branch created: ${branchName}`)
    await addComment(ctx, config, `Branch [${branchName}](${getRepoUrl(ctx)}/tree/${branchName}) created!`)
  }
}

function getRepoOwner (ctx) {
  return ctx.payload.repository.owner.login
}

function getRepoName (ctx) {
  return ctx.payload.repository.name
}

function getRepoUrl (ctx) {
  return ctx.payload.repository.html_url
}

function getIssueNumber (ctx) {
  return ctx.payload.issue.number
}

function getIssueTitle (ctx) {
  return ctx.payload.issue.title
}

function getDefaultBranch (ctx) {
  return ctx.payload.repository.default_branch
}

async function addComment (ctx, config, comment) {
  const params = {
    owner: ctx.payload.repository.owner.login,
    repo: ctx.payload.repository.name,
    issue_number: ctx.payload.issue.number,
    body: comment
  }
  await ctx.github.issues.createComment(params)
}

function getIssueLabels (ctx) {
  const labels = ctx.payload.issue.labels.map(l => l.name)
  if (labels.length === 0) {
    return ['']
  } else {
    return labels
  }
}

async function branchExists (ctx, owner, repo, branchName) {
  try {
    await ctx.github.git.getRef({
      owner: owner,
      repo: repo,
      ref: `heads/${branchName}`
    })
    return true
  } catch (error) {
    return false
  }
}

async function getSourceBranchHeadSha (ctx, config, log) {
  const branchConfig = getIssueBranchConfig(ctx, config)
  let result
  if (branchConfig && branchConfig.name) {
    result = await getBranchHeadSha(ctx, branchConfig.name)
    if (result) {
      log.info(`Source branch: ${branchConfig.name}`)
    }
  }
  if (!result) {
    const defaultBranch = getDefaultBranch(ctx)
    log.info(`Source branch: ${defaultBranch}`)
    result = await getBranchHeadSha(ctx, defaultBranch)
  }
  return result
}

async function getBranchHeadSha (ctx, branch) {
  try {
    const res = await ctx.github.git.getRef({
      owner: getRepoOwner(ctx),
      repo: getRepoName(ctx),
      ref: `heads/${branch}`
    })
    const ref = res.data.object
    return ref.sha
  } catch (e) {
    return undefined
  }
}

async function createBranch (ctx, owner, repo, branchName, sha, log) {
  try {
    const res = await ctx.github.git.createRef({
      owner: owner,
      repo: repo,
      ref: `refs/heads/${branchName}`,
      sha: sha
    })
    return res
  } catch (e) {
    if (e.message === 'Reference already exists') {
      log.error('Could not create branch as it already exists')
    } else {
      log.error(`Could not create branch (${e.message})`)
    }
  }
}

async function getBranchNameFromIssue (ctx, config) {
  const number = getIssueNumber(ctx)
  const title = getIssueTitle(ctx)
  let result
  if (config.branchName) {
    if (config.branchName === 'tiny') {
      result = `i${number}`
    } else if (config.branchName === 'short') {
      result = `issue-${number}`
    } else if (config.branchName === 'full') {
      result = `issue-${number}-${title}`
    } else {
      result = interpolate(config.branchName, ctx.payload)
    }
  } else {
    result = `issue-${number}-${title}`
  }
  return makeGitSafe(getIssueBranchPrefix(ctx, config), true) + makeGitSafe(result)
}

function getIssueBranchPrefix (ctx, config) {
  let result = ''
  const branchConfig = getIssueBranchConfig(ctx, config)
  if (branchConfig && branchConfig.prefix) {
    result = branchConfig.prefix
  }
  return interpolate(result, ctx.payload)
}

function getIssueBranchConfig (ctx, config) {
  if (config.branches) {
    const issueLabels = getIssueLabels(ctx)
    for (const branchConfiguration of config.branches) {
      if (issueLabels.some(l => wildcardMatch(branchConfiguration.label, l))) {
        return branchConfiguration
      }
    }
  }
  return undefined
}

function makeGitSafe (s, isPrefix = false) {
  const regexp = isPrefix ? /(?![-/])[\W]+/g : /(?![-])[\W]+/g
  const result = trim(s, ' ').replace(regexp, '_')
  return isPrefix ? result : trim(result, '_')
}

function trim (str, ch) {
  let start = 0
  let end = str.length
  while (start < end && str[start] === ch) ++start
  while (end > start && str[end - 1] === ch) --end
  return (start > 0 || end < str.length) ? str.substring(start, end) : str
}

function interpolate (s, obj) {
  return s.replace(/[$]{([^}]+)}/g, function (_, path) {
    const properties = path.split('.')
    return properties.reduce((prev, curr) => prev && prev[curr], obj)
  })
}

function wildcardMatch (pattern, s) {
  const regExp = new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$')
  return regExp.test(s)
}

module.exports = {
  getBranchNameFromIssue,
  getIssueBranchConfig,
  createBranch,
  makeGitSafe,
  interpolate,
  wildcardMatch,
  getIssueBranchPrefix,
  createIssueBranch
}
