const markdownPullRequests = require('../../../lib/weekly/markdown/markdownPullRequests')

const moment = require('moment')
const MockDate = require('mockdate')
MockDate.set(moment.utc('2020-04-24'))
let headDate = moment().utc().format()
let tailDate = moment().utc().subtract(7, 'days').format()

const { pullRequests } = require('../../../__fixtures__/unit/payload')
const emptyPullRequest = pullRequests.emptyPullRequest.data
const nullPullRequest = pullRequests.nullPullRequest.data
const uselessPullRequest = pullRequests.uselessPullRequest.data
const mergedPullRequest = pullRequests.mergedPullRequest.data
const openPullRequest = pullRequests.openPullRequest.data
const updatedPullRequest = pullRequests.updatedPullRequest.data
const allPullRequest = pullRequests.allPullRequests.data
const onePullRequest = pullRequests.onePullRequest.data

describe('Tests for markdownPullRequests function', () => {
  test('that checks return string if the pull requests is empty', () => {
    expect(markdownPullRequests(emptyPullRequest, headDate, tailDate)).toContain('# PULL REQUESTS')
    expect(markdownPullRequests(emptyPullRequest, headDate, tailDate)).toContain('Last week, no pull requests were created, updated or merged.')
  })

  test('that checks return string if the pull requests is null', () => {
    expect(markdownPullRequests(nullPullRequest, headDate, tailDate)).toContain('# PULL REQUESTS')
    expect(markdownPullRequests(nullPullRequest, headDate, tailDate)).toContain('Last week, no pull requests were created, updated or merged.')
  })

  test('that checks return string if the pull requests are useless', () => {
    expect(markdownPullRequests(uselessPullRequest, headDate, tailDate)).toContain('# PULL REQUESTS')
    expect(markdownPullRequests(uselessPullRequest, headDate, tailDate)).toContain('Last week, no pull requests were created, updated or merged.')
  })

  test('that checks return string if there is one pull request', () => {
    expect(markdownPullRequests(openPullRequest, headDate, tailDate)).toContain('# PULL REQUESTS')
    expect(markdownPullRequests(openPullRequest, headDate, tailDate)).toContain('Last week, 2 pull requests were created, updated or merged.')
    expect(markdownPullRequests(openPullRequest, headDate, tailDate)).toContain('## OPEN PULL REQUEST')
    expect(markdownPullRequests(openPullRequest, headDate, tailDate)).toContain('Last week, 2 pull requests were opened.')
    expect(markdownPullRequests(openPullRequest, headDate, tailDate)).toContain(':green_heart: #15 [Hydrab0t stats test15](https://github.com/AlQaholic007/test/pull/15), by [AlQaholic007](https://github.com/AlQaholic007)')
    expect(markdownPullRequests(openPullRequest, headDate, tailDate)).toContain(':green_heart: #14 [Hydrab0t stats test14](https://github.com/AlQaholic007/test/pull/14), by [AlQaholic007](https://github.com/AlQaholic007)')
  })

  test('that checks return string if there are open pull requests', () => {
    expect(markdownPullRequests(openPullRequest, headDate, tailDate)).toContain('# PULL REQUESTS')
    expect(markdownPullRequests(openPullRequest, headDate, tailDate)).toContain('Last week, 2 pull requests were created, updated or merged.')
    expect(markdownPullRequests(openPullRequest, headDate, tailDate)).toContain('## OPEN PULL REQUEST')
    expect(markdownPullRequests(openPullRequest, headDate, tailDate)).toContain('Last week, 2 pull requests were opened.')
    expect(markdownPullRequests(openPullRequest, headDate, tailDate)).toContain(':green_heart: #15 [Hydrab0t stats test15](https://github.com/AlQaholic007/test/pull/15), by [AlQaholic007](https://github.com/AlQaholic007)')
    expect(markdownPullRequests(openPullRequest, headDate, tailDate)).toContain(':green_heart: #14 [Hydrab0t stats test14](https://github.com/AlQaholic007/test/pull/14), by [AlQaholic007](https://github.com/AlQaholic007)')
  })

  test('that checks return string if there are updated pull requests', () => {
    expect(markdownPullRequests(updatedPullRequest, headDate, tailDate)).toContain('# PULL REQUESTS')
    expect(markdownPullRequests(updatedPullRequest, headDate, tailDate)).toContain('Last week, 2 pull requests were created, updated or merged.')
    expect(markdownPullRequests(updatedPullRequest, headDate, tailDate)).toContain('## UPDATED PULL REQUEST')
    expect(markdownPullRequests(updatedPullRequest, headDate, tailDate)).toContain('Last week, 2 pull requests were updated.')
    expect(markdownPullRequests(updatedPullRequest, headDate, tailDate)).toContain(':yellow_heart: #17 [Hydrab0t stats test17](https://github.com/AlQaholic007/test/pull/17), by [AlQaholic007](https://github.com/AlQaholic007)')
    expect(markdownPullRequests(updatedPullRequest, headDate, tailDate)).toContain(':yellow_heart: #16 [Hydrab0t stats test16](https://github.com/AlQaholic007/test/pull/16), by [AlQaholic007](https://github.com/AlQaholic007)')
  })

  test('that checks return string if there are merged pull requests', () => {
    expect(markdownPullRequests(mergedPullRequest, headDate, tailDate)).toContain('# PULL REQUESTS')
    expect(markdownPullRequests(mergedPullRequest, headDate, tailDate)).toContain('Last week, 2 pull requests were created, updated or merged.')
    expect(markdownPullRequests(mergedPullRequest, headDate, tailDate)).toContain('## MERGED PULL REQUEST')
    expect(markdownPullRequests(mergedPullRequest, headDate, tailDate)).toContain('Last week, 2 pull requests were merged.')
    expect(markdownPullRequests(mergedPullRequest, headDate, tailDate)).toContain(':purple_heart: #25 [Hydrab0t stats test25](https://github.com/AlQaholic007/test/pull/25), by [AlQaholic007](https://github.com/AlQaholic007)')
    expect(markdownPullRequests(mergedPullRequest, headDate, tailDate)).toContain(':purple_heart: #24 [Hydrab0t stats test24](https://github.com/AlQaholic007/test/pull/24), by [AlQaholic007](https://github.com/AlQaholic007)')
  })

  test('that checks return string if there are some pull requests', () => {
    expect(markdownPullRequests(allPullRequest, headDate, tailDate)).toContain('# PULL REQUESTS')
    expect(markdownPullRequests(allPullRequest, headDate, tailDate)).toContain('Last week, 3 pull requests were created, updated or merged.')
    expect(markdownPullRequests(allPullRequest, headDate, tailDate)).toContain('## OPEN PULL REQUEST')
    expect(markdownPullRequests(allPullRequest, headDate, tailDate)).toContain('Last week, 1 pull request was opened.')
    expect(markdownPullRequests(allPullRequest, headDate, tailDate)).toContain(':green_heart: #14 [Hydrab0t stats test14](https://github.com/AlQaholic007/test/pull/14), by [AlQaholic007](https://github.com/AlQaholic007)')
    expect(markdownPullRequests(allPullRequest, headDate, tailDate)).toContain('## UPDATED PULL REQUEST')
    expect(markdownPullRequests(allPullRequest, headDate, tailDate)).toContain('Last week, 1 pull request was updated.')
    expect(markdownPullRequests(allPullRequest, headDate, tailDate)).toContain(':yellow_heart: #16 [Hydrab0t stats test16](https://github.com/AlQaholic007/test/pull/16), by [AlQaholic007](https://github.com/AlQaholic007)')
    expect(markdownPullRequests(allPullRequest, headDate, tailDate)).toContain('## MERGED PULL REQUEST')
    expect(markdownPullRequests(allPullRequest, headDate, tailDate)).toContain('Last week, 1 pull request was merged.')
    expect(markdownPullRequests(allPullRequest, headDate, tailDate)).toContain(':purple_heart: #24 [Hydrab0t stats test24](https://github.com/AlQaholic007/test/pull/24), by [AlQaholic007](https://github.com/AlQaholic007)')
  })

  test('that checks return string if the pull requests is null', () => {
    expect(markdownPullRequests(onePullRequest, headDate, tailDate)).toContain('# PULL REQUESTS')
    expect(markdownPullRequests(onePullRequest, headDate, tailDate)).toContain('Last week, 1 pull request was created, updated or merged.')
    expect(markdownPullRequests(onePullRequest, headDate, tailDate)).toContain('## OPEN PULL REQUEST')
    expect(markdownPullRequests(onePullRequest, headDate, tailDate)).toContain('Last week, 1 pull request was opened.')
    expect(markdownPullRequests(onePullRequest, headDate, tailDate)).toContain(':green_heart: #14 [Hydrab0t stats test14](https://github.com/AlQaholic007/test/pull/14), by [AlQaholic007](https://github.com/AlQaholic007)')
  })
})
