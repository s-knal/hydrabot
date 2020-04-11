
const markdownIssues = require('../../../lib/weekly/markdown/markdownIssues')

const moment = require('moment')
const MockDate = require('mockdate')
MockDate.set(moment.utc('2020-04-24'))
let headDate = moment().utc().format()
let tailDate = moment().utc().subtract(7, 'days').format()

const { issues } = require('../../../__fixtures__/unit/payload')
const nullIssue = issues.nullIssue.data
const emptyIssue = issues.emptyIssue.data
const openIssue = issues.openIssue.data
const closedIssue = issues.closedIssue.data
const uselessIssue = issues.uselessIssue.data
const likedIssue = issues.likedIssue.data
const noisyIssue = issues.noisyIssue.data
const allIssueA = issues.allIssueA.data
const allIssueB = issues.allIssueB.data

describe('Tests for markdownIssues function', () => {
  test('that checks return string if payload is null', () => {
    expect(markdownIssues(nullIssue, headDate, tailDate)).toContain('# ISSUES')
    expect(markdownIssues(nullIssue, headDate, tailDate)).toContain('Last week, no issues were created.')
  })

  test('that checks return string if payload is empty', () => {
    expect(markdownIssues(emptyIssue, headDate, tailDate)).toContain('# ISSUES')
    expect(markdownIssues(emptyIssue, headDate, tailDate)).toContain('Last week, no issues were created.')
  })

  test('that checks return string if all the issues are useless', () => {
    expect(markdownIssues(uselessIssue, headDate, tailDate)).toContain('# ISSUES')
    expect(markdownIssues(uselessIssue, headDate, tailDate)).toContain('Last week, no issues were created.')
  })

  test('that checks return string if payload has only one data - closed issue', () => {
    expect(markdownIssues(closedIssue, headDate, tailDate)).toContain('# ISSUES')
    expect(markdownIssues(closedIssue, headDate, tailDate)).toContain('Last week 1 issue was created.')
    expect(markdownIssues(closedIssue, headDate, tailDate)).toContain('It is closed now.')
    expect(markdownIssues(closedIssue, headDate, tailDate)).toContain('## CLOSED ISSUES')
    expect(markdownIssues(closedIssue, headDate, tailDate)).toContain(':heart: #4 [Hydrab0t stats test4](https://github.com/AlQaholic007/test/issues/4), by [AlQaholic007](https://github.com/AlQaholic007)')
  })

  test('that checks return string if payload has only one data - open issue', () => {
    expect(markdownIssues(openIssue, headDate, tailDate)).toContain('# ISSUES')
    expect(markdownIssues(openIssue, headDate, tailDate)).toContain('Last week 1 issue was created.')
    expect(markdownIssues(openIssue, headDate, tailDate)).toContain('It is still open.')
    expect(markdownIssues(openIssue, headDate, tailDate)).toContain('## OPEN ISSUES')
    expect(markdownIssues(openIssue, headDate, tailDate)).toContain(':green_heart: #4 [Hydrab0t stats test4](https://github.com/AlQaholic007/test/issues/4), by [AlQaholic007](https://github.com/AlQaholic007)')
  })

  test('that checks return string to test noisy issues', () => {
    expect(markdownIssues(noisyIssue, headDate, tailDate)).toContain('# ISSUES')
    expect(markdownIssues(noisyIssue, headDate, tailDate)).toContain('Last week 2 issues were created.')
    expect(markdownIssues(noisyIssue, headDate, tailDate)).toContain('Of these, 1 issues have been closed and 1 issues are still open.')
    expect(markdownIssues(noisyIssue, headDate, tailDate)).toContain('## OPEN ISSUES')
    expect(markdownIssues(noisyIssue, headDate, tailDate)).toContain(':green_heart: #5 [Hydrab0t stats test5](https://github.com/AlQaholic007/test/issues/5), by [AlQaholic007](https://github.com/AlQaholic007)')
    expect(markdownIssues(noisyIssue, headDate, tailDate)).toContain('## CLOSED ISSUES')
    expect(markdownIssues(noisyIssue, headDate, tailDate)).toContain(':heart: #4 [Hydrab0t stats test4](https://github.com/AlQaholic007/test/issues/4), by [AlQaholic007](https://github.com/AlQaholic007)')
    expect(markdownIssues(noisyIssue, headDate, tailDate)).toContain('## NOISY ISSUE')
    expect(markdownIssues(noisyIssue, headDate, tailDate)).toContain(':speaker: #4 [Hydrab0t stats test4](https://github.com/AlQaholic007/test/issues/4), by [AlQaholic007](https://github.com/AlQaholic007)')
    expect(markdownIssues(noisyIssue, headDate, tailDate)).toContain('It received 7 comments.')
  })

  test('that checks return string to test liked issues', () => {
    expect(markdownIssues(likedIssue, headDate, tailDate)).toContain('# ISSUES')
    expect(markdownIssues(likedIssue, headDate, tailDate)).toContain('Last week 2 issues were created.')
    expect(markdownIssues(likedIssue, headDate, tailDate)).toContain('Of these, 1 issues have been closed and 1 issues are still open.')
    expect(markdownIssues(likedIssue, headDate, tailDate)).toContain('## OPEN ISSUES')
    expect(markdownIssues(likedIssue, headDate, tailDate)).toContain(':green_heart: #5 [Hydrab0t stats test5](https://github.com/AlQaholic007/test/issues/5), by [AlQaholic007](https://github.com/AlQaholic007)')
    expect(markdownIssues(likedIssue, headDate, tailDate)).toContain('## CLOSED ISSUES')
    expect(markdownIssues(likedIssue, headDate, tailDate)).toContain(':heart: #4 [Hydrab0t stats test4](https://github.com/AlQaholic007/test/issues/4), by [AlQaholic007](https://github.com/AlQaholic007)')
    expect(markdownIssues(likedIssue, headDate, tailDate)).toContain('## LIKED ISSUE')
    expect(markdownIssues(likedIssue, headDate, tailDate)).toContain(':+1: #4 [Hydrab0t stats test4](https://github.com/AlQaholic007/test/issues/4), by [AlQaholic007](https://github.com/AlQaholic007)')
    expect(markdownIssues(likedIssue, headDate, tailDate)).toContain('It received :+1: x3, :smile: x2, :tada: x5 and :heart: x2.')
  })

  test('that checks return string if payload has some data A', () => {
    expect(markdownIssues(allIssueA, headDate, tailDate)).toContain('# ISSUES')
    expect(markdownIssues(allIssueA, headDate, tailDate)).toContain('Last week 2 issues were created.')
    expect(markdownIssues(allIssueA, headDate, tailDate)).toContain('Of these, 1 issues have been closed and 1 issues are still open.')
    expect(markdownIssues(allIssueA, headDate, tailDate)).toContain('## OPEN ISSUES')
    expect(markdownIssues(allIssueA, headDate, tailDate)).toContain(':green_heart: #6 [Hydrab0t stats test6](https://github.com/AlQaholic007/test/issues/6), by [AlQaholic007](https://github.com/AlQaholic007)')
    expect(markdownIssues(allIssueA, headDate, tailDate)).toContain('## CLOSED ISSUES')
    expect(markdownIssues(allIssueA, headDate, tailDate)).toContain(':heart: #5 [Hydrab0t stats test5](https://github.com/AlQaholic007/test/issues/5), by [AlQaholic007](https://github.com/AlQaholic007)')
    expect(markdownIssues(allIssueA, headDate, tailDate)).toContain('## LIKED ISSUE')
    expect(markdownIssues(allIssueA, headDate, tailDate)).toContain(':+1: #5 [Hydrab0t stats test5](https://github.com/AlQaholic007/test/issues/5), by [AlQaholic007](https://github.com/AlQaholic007)')
    expect(markdownIssues(allIssueA, headDate, tailDate)).toContain('It received :+1: x2, :smile: x3, :tada: x1 and :heart: x2.')
    expect(markdownIssues(allIssueA, headDate, tailDate)).toContain('## NOISY ISSUE')
    expect(markdownIssues(allIssueA, headDate, tailDate)).toContain(':speaker: #6 [Hydrab0t stats test6](https://github.com/AlQaholic007/test/issues/6), by [AlQaholic007](https://github.com/AlQaholic007)')
    expect(markdownIssues(allIssueA, headDate, tailDate)).toContain('It received 6 comments.')
  })

  test('that checks return string if payload has some data B', () => {
    expect(markdownIssues(allIssueB, headDate, tailDate)).toContain('# ISSUES')
    expect(markdownIssues(allIssueB, headDate, tailDate)).toContain('Last week 2 issues were created.')
    expect(markdownIssues(allIssueB, headDate, tailDate)).toContain('Of these, 1 issues have been closed and 1 issues are still open.')
    expect(markdownIssues(allIssueB, headDate, tailDate)).toContain('## OPEN ISSUES')
    expect(markdownIssues(allIssueB, headDate, tailDate)).toContain(':green_heart: #6 [Hydrab0t stats test6](https://github.com/AlQaholic007/test/issues/6), by [AlQaholic007](https://github.com/AlQaholic007)')
    expect(markdownIssues(allIssueB, headDate, tailDate)).toContain('## CLOSED ISSUES')
    expect(markdownIssues(allIssueB, headDate, tailDate)).toContain(':heart: #5 [Hydrab0t stats test5](https://github.com/AlQaholic007/test/issues/5), by [AlQaholic007](https://github.com/AlQaholic007)')
    expect(markdownIssues(allIssueB, headDate, tailDate)).toContain('## LIKED ISSUE')
    expect(markdownIssues(allIssueB, headDate, tailDate)).toContain(':+1: #6 [Hydrab0t stats test6](https://github.com/AlQaholic007/test/issues/6), by [AlQaholic007](https://github.com/AlQaholic007)')
    expect(markdownIssues(allIssueB, headDate, tailDate)).toContain('It received :+1: x2, :smile: x3, :tada: x1 and :heart: x2.')
    expect(markdownIssues(allIssueB, headDate, tailDate)).toContain('## NOISY ISSUE')
    expect(markdownIssues(allIssueB, headDate, tailDate)).toContain(':speaker: #5 [Hydrab0t stats test5](https://github.com/AlQaholic007/test/issues/5), by [AlQaholic007](https://github.com/AlQaholic007)')
    expect(markdownIssues(allIssueB, headDate, tailDate)).toContain('It received 6 comments.')
  })
})
