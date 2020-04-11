const markdownStargazers = require('../../../lib/weekly/markdown/markdownStargazers')

const moment = require('moment')
const MockDate = require('mockdate')
MockDate.set(moment.utc('2020-04-24'))
let headDate = moment().utc().format()
let tailDate = moment().utc().subtract(7, 'days').format()

const { stargazers } = require('../../../__fixtures__/unit/payload')
let emptyStargazers = stargazers.emptyStargazers.data
let nullStargazers = stargazers.nullStargazers.data
let uselessStargazers = stargazers.uselessStargazers.data
let manyStargazers = stargazers.manyStargazers.data
let allStargazers = stargazers.allStargazers.data

describe('Tests for markdownStargazers', () => {
  test('that checks return string if stargazers data is empty', () => {
    expect(markdownStargazers(emptyStargazers, headDate, tailDate)).toContain('# STARGAZERS')
    expect(markdownStargazers(emptyStargazers, headDate, tailDate)).toContain('Last week there were no stargazers.')
  })
  test('that checks return string if stargazers data is null', () => {
    expect(markdownStargazers(nullStargazers, headDate, tailDate)).toContain('# STARGAZERS')
    expect(markdownStargazers(nullStargazers, headDate, tailDate)).toContain('Last week there were no stargazers.')
  })
  test('that checks return string if stargazers data is useless', () => {
    expect(markdownStargazers(uselessStargazers, headDate, tailDate)).toContain('# STARGAZERS')
    expect(markdownStargazers(uselessStargazers, headDate, tailDate)).toContain('Last week there were no stargazers.')
  })
  test('that checks return string if there are many stargazers', () => {
    expect(markdownStargazers(manyStargazers, headDate, tailDate)).toContain('# STARGAZERS')
    expect(markdownStargazers(manyStargazers, headDate, tailDate)).toContain('Last week there were 3 stargazers.')
    expect(markdownStargazers(manyStargazers, headDate, tailDate)).toContain(':star: [vidhi-mody](https://github.com/vidhi-mody)')
    expect(markdownStargazers(manyStargazers, headDate, tailDate)).toContain(':star: [AlQaholic007](https://github.com/AlQaholic007)')
    expect(markdownStargazers(manyStargazers, headDate, tailDate)).toContain(':star: [nehal-doshi](https://github.com/nehal-doshi)')
    expect(markdownStargazers(manyStargazers, headDate, tailDate)).toContain('You all are the stars! :star2:')
  })
  test('that checks return string if there are some stargazers', () => {
    expect(markdownStargazers(allStargazers, headDate, tailDate)).toContain('# STARGAZERS')
    expect(markdownStargazers(allStargazers, headDate, tailDate)).toContain('Last week there was 1 stargazer.')
    expect(markdownStargazers(allStargazers, headDate, tailDate)).toContain(':star: [AlQaholic007](https://github.com/AlQaholic007)')
    expect(markdownStargazers(allStargazers, headDate, tailDate)).toContain('You are the star! :star2:')
  })
})
