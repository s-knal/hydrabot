const markdownContributors = require('../../../lib/weekly/markdown/markdownContributors')

const moment = require('moment')
const MockDate = require('mockdate')
MockDate.set(moment.utc('2020-04-24'))
let headDate = moment().utc().format()
let tailDate = moment().utc().subtract(7, 'days').format()

const { commits } = require('../../../__fixtures__/unit/payload')
let emptyCommit = commits.emptyCommits.data
let nullCommit = commits.nullCommits.data
let uselessCommit = commits.uselessCommits.data
let allCommits = commits.allCommits.data
let manyCommits = commits.manyCommits.data

describe('Tests markdownContributors function', () => {
  test('that checks return string if there are no commits', () => {
    expect(markdownContributors(emptyCommit, headDate, tailDate)).toContain('# CONTRIBUTORS')
    expect(markdownContributors(emptyCommit, headDate, tailDate)).toContain('Last week there were no contributors.')
  })

  test('that checks return string if there are null commits', () => {
    expect(markdownContributors(nullCommit, headDate, tailDate)).toContain('# CONTRIBUTORS')
    expect(markdownContributors(nullCommit, headDate, tailDate)).toContain('Last week there were no contributors.')
  })

  test('that checks return string if there are useless commits', () => {
    expect(markdownContributors(uselessCommit, headDate, tailDate)).toContain('# CONTRIBUTORS')
    expect(markdownContributors(uselessCommit, headDate, tailDate)).toContain('Last week there were no contributors.')
  })

  test('that checks returns string of many contributors', () => {
    expect(markdownContributors(manyCommits, headDate, tailDate)).toContain('# CONTRIBUTORS')
    expect(markdownContributors(manyCommits, headDate, tailDate)).toContain('Last week there were 3 contributors.')
    expect(markdownContributors(manyCommits, headDate, tailDate)).toContain(':bust_in_silhouette: [nehal-doshi](https://github.com/nehal-doshi/)')
    expect(markdownContributors(manyCommits, headDate, tailDate)).toContain(':bust_in_silhouette: [vidhi-mody](https://github.com/vidhi-mody/)')
    expect(markdownContributors(manyCommits, headDate, tailDate)).toContain('bust_in_silhouette: [AlQaholic007](https://github.com/AlQaholic007/)')
  })

  test('that checks return string of some contributors', () => {
    expect(markdownContributors(allCommits, headDate, tailDate)).toContain('# CONTRIBUTORS')
    expect(markdownContributors(allCommits, headDate, tailDate)).toContain('Last week there was 1 contributor.')
    expect(markdownContributors(allCommits, headDate, tailDate)).toContain(':bust_in_silhouette: [AlQaholic007](https://github.com/AlQaholic007/)')
  })
})
