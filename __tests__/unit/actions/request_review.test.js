const RequestReview = require('../../../lib/actions/request_review')
const Helper = require('../../../__fixtures__/unit/helper')

const settings = {
  reviewers: ['AlQaholic007']
}

let result = {
  status: 'pass',
  validations: [{
    status: 'pass',
    name: 'Label'
  }]
}

test('check that user is requested a review if user is an collaborator', async () => {
  const requester = new RequestReview()
  const options = {
    collaborators: [{login: 'AlQaholic007'}]
  }

  const context = createMockContext(options)

  await requester.afterValidate(context, settings, result)
  expect(context.github.pulls.createReviewRequest.mock.calls.length).toBe(1)
  expect(context.github.pulls.createReviewRequest.mock.calls[0][0].reviewers[0]).toBe('AlQaholic007')
})

test('that requested Reviewers are not requested again', async () => {
  const requester = new RequestReview()
  const options = {
    requestedReviewers: [{login: 'AlQaholic007'}]
  }

  const context = createMockContext(options)

  await requester.afterValidate(context, settings, result)
  expect(context.github.pulls.createReviewRequest.mock.calls.length).toBe(0)
})

test('that non collaborator is not requested reviews', async () => {
  const requester = new RequestReview()
  const options = {
    collaborators: []
  }

  const context = createMockContext(options)

  await requester.afterValidate(context, settings, result)
  expect(context.github.pulls.createReviewRequest.mock.calls.length).toBe(0)
})

const createMockContext = (options) => {
  let context = Helper.mockContext(options)

  context.github.pulls.createReviewRequest = jest.fn()
  return context
}
