const markdownBody = require('../../../lib/weekly/markdown/markdownBody')
const defaultConfig = require('../../../lib/weekly/markdown/defaultConfig')
const {
  falseConfig
} = require('../../../__fixtures__/unit/payload')
const moment = require('moment')
const MockDate = require('mockdate')
MockDate.set(moment.utc('2020-04-08'))
let headDate = moment.utc().format()
let tailDate = moment.utc().subtract(7, 'days').format()

describe('Test for markdownBody function', () => {
  let owner = 'AlQaholic007'
  let repo = 'test'
  let context = {
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
  test('that markdownBody works', () => {
    expect(markdownBody(context, {
      owner,
      repo,
      headDate,
      tailDate
    }, defaultConfig)).toBeDefined()
  })

  test('that markdownBody works when the config values defined are all false', () => {
    expect(markdownBody(context, {
      owner,
      repo,
      headDate,
      tailDate
    }, falseConfig)).toBeDefined()
  })
})
