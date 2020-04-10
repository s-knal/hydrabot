const MetaData = require('../../lib/metaData')

const dataText = '<!-- #hydrabot-data {"id":1,"event":"issues","action":"milestoned"} #hydrabot-data -->'

test('#deserialize', () => {
  let json = MetaData.deserialize(`
    #### :x: Validator: TITLE * :x:
      ***title must begins with "feat,test,chore"
      *** Input : use-case: title Settings : \`\`\`{"begins_with":{"match":["feat","test","chore"]}}\`\`\`
      <!-- #hydrabot-data { "id": 1, "event": "pull_request", "action": "unlabeled" } #hydrabot-data -->
  `)
  expect(json.id).toBe(1)
  expect(json.event).toBe('pull_request')
  expect(json.action).toBe('unlabeled')
})

test('#serialize', () => {
  let obj = {
    id: 1,
    event: 'issues',
    action: 'milestoned'
  }

  let seText = MetaData.serialize(obj)
  expect(seText).toBe(dataText)
  expect(MetaData.deserialize(seText)).toEqual(obj)
})

test('#exists', () => {
  expect(MetaData.exists(dataText)).toBe(true)
  expect(MetaData.exists('abc <!-- #hydrabot-data')).toBe(false)
  expect(MetaData.exists('abc #hydrabot-data -->')).toBe(false)
  expect(MetaData.exists(undefined)).toBe(false)
})
