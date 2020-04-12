const nock = require('nock')
const utils = require('../../lib/create-issue-branch/utils')
const myProbotApp = require('../../')
const {
  Probot
} = require('probot')
const issueAssignedPayload = require('../../__fixtures__/unit/create-issue-branch/issues.assigned')
nock.disableNetConnect()
let probot
beforeAll(() => {
  const logRequest = (r) => console.log(`No match: ${r.path}, method: ${r.method}, host: ${r.options.host}`)
  nock.emitter.on('no match', req => { logRequest(req) })
})
beforeEach(() => {
  probot = new Probot({})
  const app = probot.load(myProbotApp)
  app.app = {
    getInstallationAccessToken: () => Promise.resolve('test')
  }
  nock.cleanAll()
  jest.setTimeout(30000)
  nockAccessToken()
})
function issueAssignedWithEnhancementLabelPayload () {
  const issueCopy = JSON.parse(JSON.stringify(issueAssignedPayload))
  issueCopy.issue.labels.push({
    id: 1456956805,
    node_id: 'MDU6TGFiZWwxNDU2OTU2ODA1',
    url: 'https://api.github.com/repos/AlQaholic007/test/labels/enhancement',
    name: 'enhancement',
    color: 'a2eeef',
    default: true
  })
  return issueCopy
}
function issueAssignedWithBugAndEnhancementLabelsPayload () {
  const issueCopy = JSON.parse(JSON.stringify(issueAssignedPayload))
  issueCopy.issue.labels.push({
    id: 1456956799,
    node_id: 'MDU6TGFiZWwxNDU2OTU2Nzk5',
    url: 'https://api.github.com/repos/AlQaholic007/test/labels/bug',
    name: 'bug',
    color: 'd73a4a',
    default: true
  })
  issueCopy.issue.labels.push({
    id: 1456956805,
    node_id: 'MDU6TGFiZWwxNDU2OTU2ODA1',
    url: 'https://api.github.com/repos/AlQaholic007/test/labels/enhancement',
    name: 'enhancement',
    color: 'a2eeef',
    default: true
  })
  return issueCopy
}
function nockAccessToken () {
  nock('https://api.github.com')
    .post('/app/installations/1296032/access_tokens')
    .reply(200, { token: 'test' })
}
function nockEmptyConfig () {
  nock('https://api.github.com')
    .persist()
    .get('/repos/AlQaholic007/test/contents/.github/hydrabot.yml')
    .reply(404)
    .get('/repos/AlQaholic007/.github/contents/.github/hydrabot.yml')
    .reply(404)
}
function nockConfig (yamlConfig) {
  const encoding = 'base64'
  nock('https://api.github.com')
    .persist()
    .get('/repos/AlQaholic007/test/contents/.github/hydrabot.yml')
    .reply(200, { content: Buffer.from(yamlConfig).toString(encoding), encoding: encoding })
}
function nockExistingBranch (name, sha) {
  nock('https://api.github.com')
    .get(`/repos/AlQaholic007/test/git/refs/heads/${name}`)
    .reply(200, { object: { sha: sha } })
}
function nockNonExistingBranch (name) {
  nock('https://api.github.com')
    .get(`/repos/AlQaholic007/test/git/refs/heads/${name}`)
    .reply(404)
}
function nockComment () {
  nock('https://api.github.com')
  .post('/repos/AlQaholic007/test/issues/1/comments', () => {
    return true
  })
  .reply(201)
}

test('creates a branch when issue is assigned', async () => {
  nockNonExistingBranch('issue-1-Test_issue')
  nockExistingBranch('master', 12345678)
  nockEmptyConfig()
  nockComment()
  let createEndpointCalled = false
  nock('https://api.github.com')
    .post('/repos/AlQaholic007/test/git/refs', () => {
      createEndpointCalled = true
      return true
    })
    .reply(200)
  await probot.receive({ name: 'issues', payload: issueAssignedPayload })
  expect(createEndpointCalled).toBeTruthy()
})

test('do not create a branch when it already exists', async () => {
  nockExistingBranch('issue-1-Test_issue', 87654321)
  nockEmptyConfig()
  nockComment()
  let createEndpointCalled = false

  nock('https://api.github.com')
    .post('/repos/AlQaholic007/test/git/refs', () => {
      createEndpointCalled = true
      return true
    })
    .reply(200)

  await probot.receive({ name: 'issues', payload: issueAssignedPayload })

  expect(createEndpointCalled).toBeFalsy()
})

test('create short branch when configured a certain way', async () => {
  nockNonExistingBranch('issue-1')
  nockExistingBranch('master', 12345678)
  nockConfig('branchName: short')
  nockComment()
  let createEndpointCalled = false
  let branchRef = ''

  nock('https://api.github.com')
    .post('/repos/AlQaholic007/test/git/refs', (body) => {
      branchRef = body.ref
      createEndpointCalled = true
      return true
    })
    .reply(200)

  await probot.receive({ name: 'issues', payload: issueAssignedPayload })

  expect(createEndpointCalled).toBeTruthy()
  expect(branchRef).toBe('refs/heads/issue-1')
})

test('source branch is default branch by, well, default', async () => {
  nockNonExistingBranch('issue-1-Test_issue')
  nockExistingBranch('master', '12345678')
  nockExistingBranch('dev', 'abcd1234')
  nockEmptyConfig()
  nockComment()
  let sourceSha = ''

  nock('https://api.github.com')
    .post('/repos/AlQaholic007/test/git/refs', (body) => {
      sourceSha = body.sha
      return true
    })
    .reply(200)

  await probot.receive({ name: 'issues', payload: issueAssignedPayload })

  expect(sourceSha).toBe('12345678')
})

test('that it configures source branch based on issue label', async () => {
  nockNonExistingBranch('issue-1-Test_issue')
  nockExistingBranch('master', '12345678')
  nockExistingBranch('dev', 'abcd1234')
  nockComment()
  const ymlConfig = `branches:
  - label: enhancement
    name: dev
  - label: bug
    name: master`
  nockConfig(ymlConfig)
  let sourceSha = ''

  nock('https://api.github.com')
    .post('/repos/AlQaholic007/test/git/refs', (body) => {
      sourceSha = body.sha
      return true
    })
    .reply(200)

  await probot.receive({ name: 'issues', payload: issueAssignedWithEnhancementLabelPayload() })

  expect(sourceSha).toBe('abcd1234')
})

test('that it configures source branch based on issue label with wildcard pattern', async () => {
  nockNonExistingBranch('issue-1-Test_issue')
  nockExistingBranch('master', '12345678')
  nockExistingBranch('dev', 'abcd1234')
  nockComment()
  const ymlConfig = `branches:
  - label: ?nhance*
    name: dev`
  nockConfig(ymlConfig)
  let sourceSha = ''

  nock('https://api.github.com')
    .post('/repos/AlQaholic007/test/git/refs', (body) => {
      sourceSha = body.sha
      return true
    })
    .reply(200)

  await probot.receive({ name: 'issues', payload: issueAssignedWithEnhancementLabelPayload() })

  expect(sourceSha).toBe('abcd1234')
})

test('that it configures source branch based on catch-all fallthrough', async () => {
  nockNonExistingBranch('issue-1-Test_issue')
  nockExistingBranch('master', '12345678')
  nockExistingBranch('bug', 'abcd1234')
  nockExistingBranch('issues', 'fghi5678')
  nockComment()
  const ymlConfig = `branches:
  - label: bug
    name: bug
  - label: '*'
    name: issues`
  nockConfig(ymlConfig)
  let sourceSha = ''

  nock('https://api.github.com')
    .post('/repos/AlQaholic007/test/git/refs', (body) => {
      sourceSha = body.sha
      return true
    })
    .reply(200)

  await probot.receive({ name: 'issues', payload: issueAssignedPayload })

  expect(sourceSha).toBe('fghi5678')
})

test('that it configures source branch based on label where configuration contains catch-all fallthrough', async () => {
  nockNonExistingBranch('issue-1-Test_issue')
  nockExistingBranch('master', '12345678')
  nockExistingBranch('enhancement', 'abcd1234')
  nockExistingBranch('issues', 'fghi5678')
  nockComment()
  const ymlConfig = `branches:
  - label: enhancement
    name: enhancement
  - label: '*'
    name: issues`
  nockConfig(ymlConfig)
  let sourceSha = ''

  nock('https://api.github.com')
    .post('/repos/AlQaholic007/test/git/refs', (body) => {
      sourceSha = body.sha
      return true
    })
    .reply(200)

  await probot.receive({ name: 'issues', payload: issueAssignedWithEnhancementLabelPayload() })

  expect(sourceSha).toBe('abcd1234')
})

test('that if configured source branch does not exist use default branch', async () => {
  nockNonExistingBranch('issue-1-Test_issue')
  nockNonExistingBranch('dev')
  nockExistingBranch('master', '12345678')
  nockComment()
  const ymlConfig = `branches:
  - label: enhancement
    name: dev
  - label: bug
    name: master`
  nockConfig(ymlConfig)
  let sourceSha = ''

  nock('https://api.github.com')
    .post('/repos/AlQaholic007/test/git/refs', (body) => {
      sourceSha = body.sha
      return true
    })
    .reply(200)

  await probot.receive({ name: 'issues', payload: issueAssignedWithEnhancementLabelPayload() })

  expect(sourceSha).toBe('12345678')
})

test('that if multiple issue labels match configuration use first match', async () => {
  nockNonExistingBranch('issue-1-Test_issue')
  nockExistingBranch('master', '12345678')
  nockExistingBranch('dev', 'abcd1234')
  nockComment()
  const ymlConfig = `branches:
  - label: enhancement
    name: dev
  - label: bug
    name: master`
  nockConfig(ymlConfig)
  let sourceSha = ''

  nock('https://api.github.com')
    .post('/repos/AlQaholic007/test/git/refs', (body) => {
      sourceSha = body.sha
      return true
    })
    .reply(200)

  await probot.receive({ name: 'issues', payload: issueAssignedWithBugAndEnhancementLabelsPayload() })

  expect(sourceSha).toBe('abcd1234')
})

test('configuration with label branch and prefix', async () => {
  nockNonExistingBranch('feature/issue-1-Test_issue')
  nockExistingBranch('master', '12345678')
  nockExistingBranch('dev', 'abcd1234')
  nockComment()
  const ymlConfig = `branches:
  - label: enhancement
    name: dev
    prefix: feature/`
  nockConfig(ymlConfig)
  let sourceSha = ''
  let targetRef = ''

  nock('https://api.github.com')
    .post('/repos/AlQaholic007/test/git/refs', (body) => {
      sourceSha = body.sha
      targetRef = body.ref
      return true
    })
    .reply(200)

  await probot.receive({ name: 'issues', payload: issueAssignedWithBugAndEnhancementLabelsPayload() })

  expect(sourceSha).toBe('abcd1234')
  expect(targetRef).toBe('refs/heads/feature/issue-1-Test_issue')
})

test('configuration with label field missing', async () => {
  const ymlConfig = `branches:
  - name: dev
    prefix: feature/`
  nockConfig(ymlConfig)
  nockComment()

  nock('https://api.github.com')
    .get('/search/issues')
    .query(true)
    .reply(200, { items: [] })

  let issueTitle = ''
  nock('https://api.github.com')
    .post('/repos/AlQaholic007/test/issues', body => {
      issueTitle = body.title
      return true
    })
    .reply(200)

  await probot.receive({ name: 'issues', payload: issueAssignedWithBugAndEnhancementLabelsPayload() })
  expect(issueTitle).toBe('Error in create new issue branch configuration')
})

test('configuration with invalid YAML', async () => {
  const ymlConfig = `branches:
  - label:
    prefix: feature/`
  nockConfig(ymlConfig)
  nockComment()

  nock('https://api.github.com')
    .get('/search/issues')
    .query(true)
    .reply(200, { items: [] })

  let issueTitle = ''
  nock('https://api.github.com')
    .post('/repos/AlQaholic007/test/issues', body => {
      issueTitle = body.title
      return true
    })
    .reply(200)
  nock('https://api.github.com')
  .get(`/repos/AlQaholic007/test/git/refs/heads/issue-1-Test_issue`)
  .reply(200)

  await probot.receive({ name: 'issues', payload: issueAssignedWithBugAndEnhancementLabelsPayload() })
  expect(issueTitle).toBe('Error in create new issue branch configuration')
})

test('get full branch name from issue title', () => {
  expect(utils.makeGitSafe('feature/bug', true)).toBe('feature/bug')
  expect(utils.makeGitSafe('  feature/this is a bug ', true)).toBe('feature/this_is_a_bug')
  expect(utils.makeGitSafe('feature_bug')).toBe('feature_bug')
  expect(utils.makeGitSafe('hello/ world', true)).toBe('hello/_world')
  expect(utils.makeGitSafe('Issue name with slash/')).toBe('Issue_name_with_slash')
})

test('it to get branch name from issue', async () => {
  const ctx = { payload: { issue: { number: 12, title: 'Hello world', labels: [{ name: 'bug' }] } } }
  let config = { branchName: 'tiny' }
  expect(await utils.getBranchNameFromIssue(ctx, config)).toBe('i12')

  config = { branchName: 'short' }
  expect(await utils.getBranchNameFromIssue(ctx, config)).toBe('issue-12')

  config = { branchName: 'full' }
  expect(await utils.getBranchNameFromIssue(ctx, config)).toBe('issue-12-Hello_world')

  config = { branches: [{ label: 'bug', prefix: 'bug/' }] }
  expect(await utils.getBranchNameFromIssue(ctx, config)).toBe('bug/issue-12-Hello_world')

  config = { branches: [{ label: 'bug', prefix: 'Some bugs here/' }] }
  expect(await utils.getBranchNameFromIssue(ctx, config)).toBe('Some_bugs_here/issue-12-Hello_world')

  config = { branches: [{ label: 'bug', prefix: 'feature-2019-12-17T10:16:25Z' }] }
  expect(await utils.getBranchNameFromIssue(ctx, config)).toBe('feature-2019-12-17T10_16_25Zissue-12-Hello_world')

  config = { branches: [{ label: 'bug', prefix: 'feature\\' }] }
  expect(await utils.getBranchNameFromIssue(ctx, config)).toBe('feature_issue-12-Hello_world')
})

test('it to get branch configuration for issue', () => {
  const ctx = { payload: { issue: { labels: [{ name: 'enhancement' }] } } }
  const config = { branches: [{ label: 'enhancement', prefix: 'feature/' }] }
  const branchConfig = utils.getIssueBranchConfig(ctx, config)
  expect(branchConfig).toBeDefined()
  expect(branchConfig.prefix).toBe('feature/')
})

test('it to get branch configuration for issue with all matching wildcard fallthrough', () => {
  const ctx = { payload: { issue: { labels: [{ name: 'mylabel' }] } } }
  const config = { branches: [{ label: 'enhancement', prefix: 'feature/' }, { label: '*', prefix: 'issues/' }] }
  const branchConfig = utils.getIssueBranchConfig(ctx, config)
  expect(branchConfig).toBeDefined()
  expect(branchConfig.prefix).toBe('issues/')
})

test('if issue has no branch configuration', () => {
  const ctx = { payload: { issue: { labels: [{ name: 'bug' }] } } }
  const config = { branches: [{ label: 'enhancement', prefix: 'feature/' }] }
  const branchConfig = utils.getIssueBranchConfig(ctx, config)
  expect(branchConfig).toBeUndefined()
})

test('it to get issue branch prefix', () => {
  const ctx = { payload: { issue: { labels: [{ name: 'enhancement' }] } } }
  const config = { branches: [{ label: 'enhancement', prefix: 'feature/' }] }
  const prefix = utils.getIssueBranchPrefix(ctx, config)
  expect(prefix).toBe('feature/')
})

test('it get issue branch prefix for issue that has no branch configuration', () => {
  const ctx = { payload: { issue: { labels: [{ name: 'bug' }] } } }
  const config = { branches: [{ label: 'enhancement', prefix: 'feature/' }] }
  const prefix = utils.getIssueBranchPrefix(ctx, config)
  expect(prefix).toBe('')
})

test('it to interpolate string with object field expression', () => {
  const o = { hello: 'world' }
  const result = utils.interpolate(`hello \${hello}`, o)
  expect(result).toBe('hello world')
})

test('it to interpolate string with nested object field expression', () => {
  const o = { outer: { inner: 'world' } }
  const result = utils.interpolate(`hello \${outer.inner}`, o)
  expect(result).toBe('hello world')
})

test('it to interpolate string with undefined object field expression', () => {
  const o = { outer: { inner: 'world' } }
  const result = utils.interpolate(`hello \${inner.outer}`, o)
  expect(result).toBe('hello undefined')
})

test('it to interpolate string with issue assigned payload', () => {
  // eslint-disable-next-line no-template-curly-in-string
  const result = utils.interpolate(`Creator \${issue.user.login}, repo: \${repository.name}`, issueAssignedPayload)
  expect(result).toBe('Creator AlQaholic007, repo: test')
})

test('it get issue branch prefix with context expression interpolation', () => {
  const ctx = { payload: { issue: { labels: [{ name: 'enhancement' }], user: { login: 'AlQaholic007' } } } }
  // eslint-disable-next-line no-template-curly-in-string
  const config = { branches: [{ label: 'enhancement', prefix: 'feature/${issue.user.login}/' }] }
  const prefix = utils.getIssueBranchPrefix(ctx, config)
  expect(prefix).toBe('feature/AlQaholic007/')
})

test('it to get branch name from issue with only branch prefix configured', async () => {
  const ctx = { payload: { issue: { number: 12, title: 'Hello world', labels: [{ name: 'enhancement' }] } } }
  const config = { branchName: 'short', branches: [{ label: 'enhancement', prefix: 'feature/' }] }
  expect(await utils.getBranchNameFromIssue(ctx, config)).toBe('feature/issue-12')
})

test('that it creates branch with custom issue name', async () => {
  nockNonExistingBranch('foo-1-Test_issue')
  nockExistingBranch('master', 12345678)
  nockComment()
  nockConfig(`branchName: 'foo-\${issue.number}-\${issue.title}'`)
  let createEndpointCalled = false
  let branchRef = ''

  nock('https://api.github.com')
    .post('/repos/AlQaholic007/test/git/refs', (body) => {
      branchRef = body.ref
      createEndpointCalled = true
      return true
    })
    .reply(200)

  await probot.receive({ name: 'issues', payload: issueAssignedPayload })

  expect(createEndpointCalled).toBeTruthy()
  expect(branchRef).toBe('refs/heads/foo-1-Test_issue')
})

test('it to create branch with custom short issue name', async () => {
  nockNonExistingBranch('foo-1')
  nockExistingBranch('master', 12345678)
  nockComment()
  // eslint-disable-next-line no-template-curly-in-string
  nockConfig('branchName: \'foo-${issue.number}\'')
  let createEndpointCalled = false
  let branchRef = ''

  nock('https://api.github.com')
    .post('/repos/AlQaholic007/test/git/refs', (body) => {
      branchRef = body.ref
      createEndpointCalled = true
      return true
    })
    .reply(200)

  await probot.receive({ name: 'issues', payload: issueAssignedPayload })

  expect(createEndpointCalled).toBeTruthy()
  expect(branchRef).toBe('refs/heads/foo-1')
})

test('create branch with GitLab-like issue name', async () => {
  nockNonExistingBranch('1-Test_issue')
  nockExistingBranch('master', 12345678)
  nockComment()
  nockConfig(`branchName: '\${issue.number}-\${issue.title}'`)
  let createEndpointCalled = false
  let branchRef = ''

  nock('https://api.github.com')
    .post('/repos/AlQaholic007/test/git/refs', (body) => {
      branchRef = body.ref
      createEndpointCalled = true
      return true
    })
    .reply(200)

  await probot.receive({ name: 'issues', payload: issueAssignedPayload })

  expect(createEndpointCalled).toBeTruthy()
  expect(branchRef).toBe('refs/heads/1-Test_issue')
})

test('wildcard matching', () => {
  expect(utils.wildcardMatch('aap*', 'aap')).toBeTruthy()
  expect(utils.wildcardMatch('aap*', 'aapnoot')).toBeTruthy()
  expect(utils.wildcardMatch('??p', 'aap')).toBeTruthy()
  expect(utils.wildcardMatch('a??*', 'aapnoot')).toBeTruthy()
  expect(utils.wildcardMatch('*noot', 'aapnoot')).toBeTruthy()
  expect(utils.wildcardMatch('aap', 'aapnoot')).toBeFalsy()
  expect(utils.wildcardMatch('noot', 'aapnoot')).toBeFalsy()
  expect(utils.wildcardMatch('aap', 'Aap')).toBeFalsy()
})
