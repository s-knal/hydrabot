const checkDuplicates = require('../../../lib/weekly/markdown/checkDuplicates')
const defaultConfig = require('../../../lib/weekly/markdown/defaultConfig')
const fixConfig = require('../../../lib/weekly/markdown/fixConfig')
const getDate = require('../../../lib/weekly/markdown/getDate')
const getLongDate = require('../../../lib/weekly/markdown/getLongMonth')
const getNumDayFromLongDay = require('../../../lib/weekly/markdown/getNumDayFromLongDay')
const { weeklyDigest } = require('../../../lib/weekly/index')
const {
  falseConfig
} = require('../../../__fixtures__/unit/payload')
const moment = require('moment')
const Mockdate = require('mockdate')
Mockdate.set(moment.utc('2020-04-08'))
let headDate = moment.utc().format()
let tailDate = moment.utc().subtract(7, 'days').format()

jest.mock('../../../lib/weekly/markdown/markdownBody', () => () => Promise.resolve('This is the markdownBody.'))

describe('Tests weekly stats with different configs', () => {
  const owner = 'AlQaholic007'
  const repo = 'test'
  const context = {
    github: {
      paginate: jest.fn(),
      issues: {
        listForRepo: jest.fn(),
        create: jest.fn()
      },
      pulls: {
        listAll: jest.fn()
      },
      repos: {
        listCommits: jest.fn(),
        listReleases: jest.fn()
      },
      activity: {
        listStargazersForRepo: jest.fn()
      }
    }
  }
  test('that weekly stats are working when config is defined with all parameters false', async () => {
    let { title, labels, body } = await weeklyDigest(context, {
      owner,
      repo,
      headDate,
      tailDate,
      falseConfig
    })
    expect(title).toBeDefined()
    expect(labels).toContain('hydrabot-stats')
    expect(body).toBeDefined()
  })

  test('that weekly stats are working with default config', async () => {
    let { title, labels, body } = await weeklyDigest(context, {
      owner,
      repo,
      headDate,
      tailDate,
      defaultConfig
    })
    expect(title).toBeDefined()
    expect(labels).toContain('hydrabot-stats')
    expect(body).toBeDefined()
  })
})

describe('Tests different markDown utility functions', () => {
  test('that checkDuplicates is working', async () => {
    const owner = 'AlQaholic007'
    const repo = 'test'
    let context = {
      github: {
        search: {
          issues: jest.fn().mockReturnValue(Promise.resolve({
            data: {
              total_count: 1,
              items: [{
                html_url: 'https://github.com/AlQaholic007/test'
              }]
            }
          }))
        }
      }
    }
    console.log(context.github.search.issues())
    let { hasDuplicates } = await checkDuplicates(context, {
      owner,
      repo,
      headDate: headDate
    })
    expect(hasDuplicates).toBe(true)
  })

  test('that fixConfig is working', async () => {
    const emptyConfig = {}
    const testConfig = {
      publishDay: 0,
      canPublishIssues: true,
      canPublishPullRequests: true
    }
    // returns and fixes configs
    expect(fixConfig(emptyConfig)).toBeDefined()
    expect(fixConfig(emptyConfig)).toEqual(defaultConfig)
    // returns and fixes configs if some configs are missing
    expect(fixConfig(testConfig)).toBeDefined()
    expect(fixConfig(testConfig)).toEqual(defaultConfig)
    // checks config if the received config is null
    expect(fixConfig(testConfig)).toBeDefined()
    expect(fixConfig(null)).toEqual(defaultConfig)
  })

  test('that headDate method returns current date', () => {
    let date = moment.utc().format()
    expect(getDate.headDate()).toEqual(date)
  })

  test('that tailDate method returns current date - 7 days', () => {
    let date = moment.utc().subtract(7, 'days').format()
    expect(getDate.tailDate()).toEqual(date)
  })

  test('that checks if getDayBeforeDate method returns day before today', () => {
    let date = moment.utc().subtract(1, 'days').format()
    let testDate = moment.utc('2020-04-08')
    expect(getDate.getDayBeforeDate(testDate)).toEqual(date)
  })

  test('that getLongMonth works', () => {
    expect(getLongDate(0)).toBe('January')
  })

  test('that getNumDayFromLong works', () => {
    expect(getNumDayFromLongDay(0)).toEqual(0)
    expect(getNumDayFromLongDay('sun')).toBe(0)
    expect(getNumDayFromLongDay('Sunday')).toBe(0)
  })
})
