const getSearchIssues = async (context, {
  owner,
  repo,
  date,
  author,
  type
}) => {
  let searchIssues = await context.github.search.issues({
    q: `repo:${owner}/${repo} type:${type} author:${author} created:>=${date}`,
    per_page: 100
  })
  return searchIssues
}

const getAllIssues = async (context, {
  owner,
  repo,
  tailDate
}) => {
  // method returns all the issues and pull requests
  let issues = await context.github.paginate(
    context.github.issues.listForRepo({
      owner,
      repo,
      state: 'all',
      since: tailDate,
      per_page: 100
    }),
    res => res.data
  )
  return issues
}

const getAllPullRequests = async (context, {
  owner,
  repo
}) => {
  // method returns all the pull requests
  let pullRequests = await context.github.paginate(
    context.github.pulls.list({
      owner,
      repo,
      state: 'all',
      per_page: 100
    }),
    res => res.data
  )
  return pullRequests
}

const getCommits = async (context, {
  owner,
  repo,
  tailDate
}) => {
  let commits = await context.github.paginate(
    context.github.repos.listCommits({
      owner,
      repo,
      since: tailDate,
      per_page: 100
    }),
    res => res.data
  )
  return commits
}

const getContributors = async (context, {
  owner,
  repo
}) => {
  let contributors = await context.github.paginate(
    context.github.repos.listContributors({
      owner,
      repo,
      per_page: 100
    }),
    res => res.data
  )
  return contributors
}

const getReleases = async (context, {
  owner,
  repo
}) => {
  let releases = await context.github.paginate(
    context.github.repos.listReleases({
      owner,
      repo,
      per_page: 100
    }),
    res => res.data
  )
  return releases
}

const getStarGazers = async (context, {
  owner,
  repo
}) => {
  let stargazers = await context.github.paginate(
    context.github.activity.listStargazersForRepo({
      owner,
      repo,
      per_page: 100
    }),
    res => res.data
  )
  return stargazers
}

const postCreateIssues = (context, {
  owner,
  repo,
  title,
  body,
  labels
}) => {
  // method is used to create issues
  return context.github.issues.create({
    owner,
    repo,
    title,
    body,
    labels
  })
}

const postCreateLabel = (context,
  {
    owner,
    repo,
    name,
    color,
    description
  }) => {
  context.github.issues.createLabel({
    owner,
    repo,
    name: name,
    color: color,
    description: description
  })
}

module.exports = {
  getAllIssues,
  getSearchIssues,
  getAllPullRequests,
  getCommits,
  getContributors,
  getReleases,
  getStarGazers,
  postCreateIssues,
  postCreateLabel
}
