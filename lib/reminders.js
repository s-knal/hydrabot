const moment = require('moment')
const metadata = require('probot-metadata')
const parseReminder = require('parse-reminder')
const _ = require('underscore')

const LABEL = 'reminder'

module.exports = {
  async set (context, command) {
    const reminder = parseReminder(command.name + ' ' + command.arguments)

    if (reminder) {
      if (reminder.who === 'me') {
        reminder.who = context.payload.sender.login
      }

      let labels = _.map(context.payload.issue.labels, (eachLabel) => eachLabel.name)
      if (!_.find(labels, (name) => name === LABEL)) {
        labels.push(LABEL)
      }
      await context.github.issues.replaceLabels({
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        issue_number: context.payload.issue.number,
        labels
      })
      await metadata(context).set(reminder)

      await context.github.issues.createComment(context.issue({
        body: `@${context.payload.sender.login} set a reminder for **${moment(reminder.when).format('MMMM Do YYYY, h:mm:ss a')} UTC**`
      }))
    } else {
      await context.github.issues.createComment(context.issue({
        body: `@${context.payload.sender.login} we had trouble parsing your reminder. Try:\n\n\`/remind me [what] [when]\``
      }))
      throw new Error(`Unable to parse reminder: remind ${command.arguments}`)
    }
  },

  async check (context) {
    const {owner, repo} = context.repo()
    const q = `label:"${LABEL}" repo:${owner}/${repo}`

    const resp = await context.github.search.issues({q})

    await Promise.all(resp.data.items.map(async issue => {
      // Issue objects from the API don't include owner/repo params, so
      // setting them here with `context.repo` so we don't have to worry
      // about it later. :/
      issue = context.repo(issue)
      const {owner, repo, number} = issue

      const reminder = await metadata(context, issue).get()

      if (!reminder) {
        // Malformed metadata, not much we can do
        await context.github.issues.removeLabel({owner,
          repo,
          number,
          name: LABEL
        })
      } else if (moment(reminder.when) < moment()) {
        const labels = issue.labels
        const frozenLabel = labels.find(({name}) => name === LABEL)
        const pos = labels.indexOf(frozenLabel)
        labels.splice(pos, 1)

        await context.github.issues.update({owner, repo, number, labels, state: 'open'})

        await context.github.issues.createComment({
          owner,
          repo,
          number,
          body: `:wave: @${reminder.who}, ${reminder.what}`
        })
      }
    }))
  }
}
