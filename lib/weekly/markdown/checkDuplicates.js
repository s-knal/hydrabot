const getDate = require('./getDate')
const { getSearchIssues } = require('../utils')

module.exports = async (context, {
  owner,
  repo,
  headDate
}) => {
  let author = 'app/hydrab0t'
  let type = 'issues'
  let date = getDate.getDayBeforeDate(headDate).substr(0, 19)
  let issues = await getSearchIssues(context, {
    owner,
    repo,
    date,
    author,
    type
  })
  let totalCount = issues.data.total_count
  if (totalCount >= 1) {
    return ({
      hasDuplicates: true,
      url: issues.data.items[0].html_url
    })
  } else {
    return ({
      hasDuplicates: false,
      url: undefined
    })
  }
}
