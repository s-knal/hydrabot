const Configuration = require('../../../lib/configuration/configuration')
const helper = require('../../../__fixtures__/unit/helper')

describe('Loading bad configuration', () => {
  test('bad YML', () => {
    let config = new Configuration(`
    version: 2
    hydrabot:
      when: pull_request.*
      - do: label:
    `)
    expect(config.errors.size).toBe(1)
    expect(config.errors.has(Configuration.ERROR_CODES.BAD_YML)).toBe(true)
  })

  test('No YML found', async () => {
    let config = await Configuration.instanceWithContext(helper.mockContext({ files: [] }))
    expect(config.warnings.size).toBe(1)
    expect(config.warnings.has(Configuration.WARNING_CODES.CONFIG_NOT_FOUND)).toBe(true)
  })

  test('wrong version', () => {
    let config = new Configuration(`
    version: not a number
    hydrabot:
    `)
    expect(config.errors.size).toBe(1)
    expect(config.errors.has(Configuration.ERROR_CODES.UNKOWN_VERSION)).toBe(true)
  })

  test('missing hydrabot node', () => {
    let config = new Configuration(`
    version: 2

    `)
    expect(config.errors.size).toBe(1)
    expect(config.errors.has(Configuration.ERROR_CODES.MISSING_HYDRABOT_NODE)).toBe(true)
  })

  test('multiple errors', () => {
    let yml = `
    version: foo
    hydrabto:
      when: bar
    `
    let config = new Configuration(yml)
    expect(config.errors.size).toBe(2)
  })
})

describe('config file fetching', () => {
  test('fetch from main branch if event is not pull_request', async () => {
    let configString = `
          hydrabot:
            issues:
              stale:
                days: 20
                message: Issue test
            pull_requests:
              stale:
                days: 20
                message: PR test
        `

    let context = createMockGhConfig(configString)
    let file = await Configuration.fetchConfigFile(context)
    const content = Buffer.from(file.data.content, 'base64').toString()
    expect(content).toBe(configString)
  })

  test('fetch from main branch if the event is PR relevant and file is not modified or added', async () => {
    let configString = `
          hydrabot:
            issues:
              stale:
                days: 20
                message: Issue test
            pull_requests:
              stale:
                days: 20
                message: PR test
        `
    let prConfig = `
          hydrabot:
            issues:
              stale:
                days: 20
                message: Issue test
        `
    let context = createMockGhConfig(
      configString,
      prConfig,
      { files: [ { filename: 'someFile', status: 'modified' } ] }
    )

    context.event = 'pull_request'
    let file = await Configuration.fetchConfigFile(context)
    let content = Buffer.from(file.data.content, 'base64').toString()
    expect(content).toBe(configString)

    context.event = 'pull_request_review'
    file = await Configuration.fetchConfigFile(context)
    content = Buffer.from(file.data.content, 'base64').toString()
    expect(content).toBe(configString)
  })

  test('fetch from head branch if the event is relevant to PR and file is modified or added', async () => {
    let configString = `
          hydrabot:
            issues:
              stale:
                days: 20
                message: Issue test
            pull_requests:
              stale:
                days: 20
                message: from HEAD
        `
    let prConfig = `
          hydrabot:
            issues:
              stale:
                days: 20
                message: From PR Config
        `
    let files = {files: [
      { filename: '.github/hydrabot.yml', status: 'modified' }
    ]}
    let context = createMockGhConfig(configString, prConfig, files)
    context.event = 'pull_request'
    let file = await Configuration.fetchConfigFile(context)
    let content = Buffer.from(file.data.content, 'base64').toString()
    expect(content).toBe(prConfig)

    context.event = 'pull_request_review'
    file = await Configuration.fetchConfigFile(context)
    content = Buffer.from(file.data.content, 'base64').toString()
    expect(content).toBe(prConfig)

    files = {files: [
      { file: '.github/hydrabot.yml', status: 'added' }
    ]}
    context = createMockGhConfig(configString, prConfig, files)
    context.event = 'pull_request'
    content = Buffer.from(file.data.content, 'base64').toString()
    expect(content).toBe(prConfig)
  })
})

describe('with version 2', () => {
  test('it loads correctly without version', () => {
    let config = new Configuration(`
      hydrabot:
        approvals: 5
        label: 'label regex'
        title: 'title regex'
    `)
    config.settings = config.settings.hydrabot
    expect(config.settings[0].when).toBeDefined()
    expect(config.settings[0].validate).toBeDefined()
    expect(config.hasErrors()).toBe(false)
  })
})

describe('with version 1', () => {
  // write test to test for bad yml
  test('that constructor loads settings correctly', () => {
    let config = new Configuration(`
      hydrabot:
        approvals: 5
        label: 'label regex'
        title: 'title regex'
    `)

    config.settings = config.settings.hydrabot
    let validate = config.settings[0].validate

    expect(validate.find(e => e.do === 'approvals').min.count).toBe(5)
    expect(validate.find(e => e.do === 'title').must_exclude.regex).toBe('title regex')
    expect(validate.find(e => e.do === 'label').must_exclude.regex).toBe('label regex')
  })

  test('that defaults are not injected when user defined configuration exists', () => {
    let config = new Configuration(`
      hydrabot:
        approvals: 1
      `)
    config.settings = config.settings.hydrabot
    let validate = config.settings[0].validate
    expect(validate.find(e => e.do === 'approvals').min.count).toBe(1)
    expect(validate.find(e => e.do === 'title')).toBeUndefined()
    expect(validate.find(e => e.do === 'label')).toBeUndefined()
  })

  test('that instanceWithContext returns the right Configuration', async () => {
    let context = createMockGhConfig(`
      hydrabot:
        approvals: 5
        label: 'label regex'
        title: 'title regex'
    `)

    Configuration.instanceWithContext(context).then(config => {
      let validate = config.settings.hydrabot[0].validate
      expect(validate.find(e => e.do === 'approvals').min.count).toBe(5)
      expect(validate.find(e => e.do === 'title').must_exclude.regex).toBe('title regex')
      expect(validate.find(e => e.do === 'label').must_exclude.regex).toBe('label regex')
    })

    expect(context.github.repos.getContents.mock.calls.length).toBe(1)
  })

  test('that instanceWithContext returns the right Configuration (pull_requests)', async () => {
    let context = createMockGhConfig(`
      hydrabot:
        pull_requests:
          label: 'label pull regex'
          title: 'title pull regex'
    `)

    await Configuration.instanceWithContext(context).then(config => {
      config.settings = config.settings.hydrabot
      let validate = config.settings[0].validate
      expect(config.settings[0].when).toBe('pull_request.*')
      expect(validate.find(e => e.do === 'title').must_exclude.regex).toBe('title pull regex')
      expect(validate.find(e => e.do === 'label').must_exclude.regex).toBe('label pull regex')
    })
    expect(context.github.repos.getContents.mock.calls.length).toBe(1)
  })

  test('that instanceWithContext returns the right Configuration (issues)', async () => {
    let context = createMockGhConfig(`
      hydrabot:
        issues:
          label: 'label issue regex'
          title: 'title issue regex'
    `)

    await Configuration.instanceWithContext(context).then(config => {
      config.settings = config.settings.hydrabot
      let validate = config.settings[0].validate
      expect(config.settings[0].when).toBe('issues.*')
      expect(validate.find(e => e.do === 'title').must_exclude.regex).toBe('title issue regex')
      expect(validate.find(e => e.do === 'label').must_exclude.regex).toBe('label issue regex')
    })
    expect(context.github.repos.getContents.mock.calls.length).toBe(1)
  })

  test('that instanceWithContext loads the configuration for stale correctly when specified for pull_requests and issues separately', async () => {
    let context = createMockGhConfig(`
      hydrabot:
        pull_requests:
          label: 'label issue regex'
          title: 'title issue regex'
          stale:
            days: 20
    `)

    await Configuration.instanceWithContext(context).then(config => {
      config.settings = config.settings.hydrabot
      let when = config.settings[2]
      expect(when.validate[0].do).toBe('stale')
      expect(when.validate[0].days).toBe(20)
      expect(when.pass[0].do).toBe('comment')
      expect(when.pass[0].payload.body).toBe(Configuration.DEFAULTS.stale.message)
    })

    context = createMockGhConfig(`
      hydrabot:
        issues:
          stale:
            days: 20
    `)

    await Configuration.instanceWithContext(context).then(config => {
      config.settings = config.settings.hydrabot
      let when = config.settings[1]
      expect(when.validate[0].do).toBe('stale')
      expect(when.validate[0].days).toBe(20)
      expect(when.pass[0].do).toBe('comment')
      expect(when.pass[0].payload.body).toBe(Configuration.DEFAULTS.stale.message)
    })

    context = createMockGhConfig(`
      hydrabot:
        issues:
          stale:
            days: 20
            message: Issue test
        pull_requests:
          stale:
            days: 20
            message: PR test
    `)

    await Configuration.instanceWithContext(context).then(config => {
      config.settings = config.settings.hydrabot
      let issueWhen = config.settings[1]
      let pullWhen = config.settings[4]

      expect(issueWhen.when).toBe('schedule.repository')
      expect(pullWhen.when).toBe('schedule.repository')
      expect(issueWhen.validate[0].do).toBe('stale')
      expect(issueWhen.validate[0].days).toBe(20)
      expect(issueWhen.pass[0].do).toBe('comment')
      expect(issueWhen.pass[0].payload.body).toBe('Issue test')
      expect(pullWhen.validate[0].do).toBe('stale')
      expect(pullWhen.validate[0].days).toBe(20)
      expect(pullWhen.pass[0].do).toBe('comment')
      expect(pullWhen.pass[0].payload.body).toBe('PR test')
    })
  })

  test('that instanceWithContext return error if hydrabot.yml is not found', async () => {
    let context = {
      repo: () => {
        return {repo: '', owner: ''}
      },
      payload: {
        pull_request: {
          number: 1
        }
      },
      github: {
        repos: {
          getContents: jest.fn().mockReturnValue(
            Promise.reject(
              new HttpError(
                '{"message":"Not Found","documentation_url":"https://developer.github.com/v3/repos/contents/#get-contents"}',
                404,
                'Not Found')
            )
          )
        }
      }
    }

    let config = await Configuration.instanceWithContext(context)
    expect(config.hasErrors()).toBe(true)
    expect(config.errors.has(Configuration.ERROR_CODES.NO_YML)).toBe(true)
  })

  test('that if pass, fail or error is undefined in v2 config, the config will not break', async () => {
    let settings = `
    hydrabot:
      issues:
        stale:
          days: 30
          message: 'There has not been any activity in the past month. Is there anything to follow-up?'`

    const config = new Configuration(settings)
    config.settings = config.settings.hydrabot

    expect(config.settings.length).toBe(2)
    expect(config.settings[0].fail).toBeDefined()
    expect(config.settings[0].error).toBeDefined()
  })
})

// helper method to return mocked configiration.
const createMockGhConfig = (json, prConfig, options) => {
  return {
    repo: jest.fn().mockReturnValue({
      repo: '',
      owner: ''
    }),
    payload: {
      pull_request: {
        number: 1,
        head: {
          ref: 1,
          sha: 1
        }
      }
    },
    github: {
      repos: {
        getContents: jest.fn(({ref}) => {
          return Promise.resolve({
            data: { content: ref ? Buffer.from(prConfig).toString('base64') : Buffer.from(json).toString('base64') }
          })
        })
      },
      pulls: {
        listFiles: () => {
          return { data: options.files }
        }
      }
    }
  }
}

// to mimic HttpError (https://github.com/octokit/rest.js/blob/fc8960ccf3415b5d77e50372d3bb873cfec80c55/lib/request/http-error.js)
class HttpError extends Error {
  constructor (message, code, status) {
    super(message)
    this.message = message
    this.code = code
    this.status = status
  }
}
