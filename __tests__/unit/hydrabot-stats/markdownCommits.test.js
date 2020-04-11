const markdownCommits = require('../../../lib/weekly/markdown/markdownCommits')
const moment = require('moment')
const MockDate = require('mockdate')
MockDate.set(moment.utc('2020-04-24'))
let headDate = moment().utc().format()
let tailDate = moment().utc().subtract(7, 'days').format()
const { commits } = require('../../../__fixtures__/unit/payload')
let emptyCommit = commits.emptyCommits.data
let nullCommit = commits.nullCommits.data
let uselessCommits = commits.uselessCommits.data
let manyCommits = commits.manyCommits.data
let allCommits = commits.allCommits.data

describe('Tests for markdownCommits function', () => {
  test('that checks return string if the commit data is empty', () => {
    expect(markdownCommits(emptyCommit, headDate, tailDate)).toContain('# COMMITS')
    expect(markdownCommits(emptyCommit, headDate, tailDate)).toContain('Last week there were no commits.')
  })

  test('that checks return string if the commit data is null', () => {
    expect(markdownCommits(nullCommit, headDate, tailDate)).toContain('# COMMITS')
    expect(markdownCommits(nullCommit, headDate, tailDate)).toContain('Last week there were no commits.')
  })

  test('that checks return string if the commit data is useless', () => {
    expect(markdownCommits(uselessCommits, headDate, tailDate)).toContain('# COMMITS')
    expect(markdownCommits(uselessCommits, headDate, tailDate)).toContain('Last week there were no commits.')
  })

  test('that checks return string if there are many commits', () => {
    expect(markdownCommits(manyCommits, headDate, tailDate)).toContain('# COMMITS')
    expect(markdownCommits(manyCommits, headDate, tailDate)).toContain('Last week there were 3 commits.')
    expect(markdownCommits(manyCommits, headDate, tailDate)).toContain(':hammer_and_wrench: [Hydrab0t stats commit test3](https://github.com/AlQaholic007/test/commit/commit-sha-3) by [nehal-doshi](https://github.com/nehal-doshi/)')
    expect(markdownCommits(manyCommits, headDate, tailDate)).toContain(':hammer_and_wrench: [Hydrab0t stats commit test3](https://github.com/AlQaholic007/test/commit/commit-sha-2) by [vidhi-mody](https://github.com/vidhi-mody/)')
    expect(markdownCommits(manyCommits, headDate, tailDate)).toContain(':hammer_and_wrench: [Hydrab0t stats commit test3](https://github.com/AlQaholic007/test/commit/commit-sha-1) by [AlQaholic007](https://github.com/AlQaholic007/)')
  })

  test('that checks return string if there are commit', () => {
    expect(markdownCommits(allCommits, headDate, tailDate)).toContain('# COMMITS')
    expect(markdownCommits(allCommits, headDate, tailDate)).toContain('Last week there was 1 commit.')
    expect(markdownCommits(allCommits, headDate, tailDate)).toContain(':hammer_and_wrench: [Hydrab0t stats commit test3](https://github.com/AlQaholic007/test/commit/commit-sha-3) by [AlQaholic007](https://github.com/AlQaholic007/)')
  })
})
