const fs = require('fs')
const path = require('path')
const { Application } = require('probot')
const myProbotApp = require('../../')
const deployLabelAppliedPayload = require('../../__fixtures__/unit/deploy/deploy-test_label.applied.json')
const nonDeployLabelAppliedPayload = require('../../__fixtures__/unit/deploy/bug_label.applied.json')
const configFile = '../../__fixtures__/unit/deploy/deploy.yml'

function readMockConfig (fileName) {
  let configData
  try {
    const filePath = path.resolve(__dirname, fileName)
    configData = fs.readFileSync(filePath, 'utf8')
  } catch (error) {
    console.log(error)
  }
  return configData
}

function initialize (configFile) {
  let configData = Buffer.from(readMockConfig(configFile)).toString('base64')
  return {
    issues: {
      removeLabel: jest.fn().mockReturnValue(Promise.resolve({})),
      createComment: jest.fn().mockReturnValue(Promise.resolve({}))
    },
    repos: {
      createDeployment: jest.fn().mockReturnValue(Promise.resolve({})),
      getContents: jest.fn().mockReturnValue(Promise.resolve({
        data: {
          content: configData
        }
      }))
    }
  }
}

describe('Deploy Hydrab0t app', () => {
  let app, github
  beforeEach(() => {
    app = new Application()
    app.load(myProbotApp)
    github = initialize(configFile)
    app.auth = () => Promise.resolve(github)
  })
  test('creates a deployment when a deploy label is applied to a PR', async () => {
    // Simulates delivery of an issues.opened webhook
    await app.receive({
      name: 'pull_request.labeled',
      payload: deployLabelAppliedPayload
    })
    expect(github.repos.createDeployment).toHaveBeenCalled()
    expect(github.issues.removeLabel).toHaveBeenCalled()
  })
  test('does not create a deployment when a non deploy label is applied to a PR', async () => {
    await app.receive({
      name: 'pull_request.labeled',
      payload: nonDeployLabelAppliedPayload
    })
    expect(github.repos.createDeployment).not.toHaveBeenCalled()
    expect(github.issues.removeLabel).not.toHaveBeenCalled()
  })
  test('creates a comment when deployment fails', async () => {
    github.repos.createDeployment.mockImplementation(() => Promise.reject(new Error('{"message":"Conflict merging master into b4c150464b1236cc782cc590b391034f608056ec.","documentation_url":"https://developer.github.com/enterprise/2.14/v3/repos/deployments/#create-a-deployment"}')))
    await app.receive({
      name: 'pull_request.labeled',
      payload: deployLabelAppliedPayload
    })
    expect(github.repos.createDeployment).toHaveBeenCalled()
    expect(github.issues.removeLabel).toHaveBeenCalled()
    expect(github.issues.createComment).toHaveBeenCalled()
  })
  test('does not create a deployment when config is not valid', async () => {
    github = initialize('../../__fixtures__/unit/deploy/deploy-bad-config.yml')
    app.auth = () => Promise.resolve(github)
    await app.receive({
      name: 'pull_request.labeled',
      payload: nonDeployLabelAppliedPayload
    })
    expect(github.repos.createDeployment).not.toHaveBeenCalled()
    expect(github.issues.removeLabel).not.toHaveBeenCalled()
  })
})
