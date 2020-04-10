module.exports = {
  CONFIGURATION_FILE_PATH: '.github/hydrabot.yml',
  ERROR_INVALID_YML: 'Invalid hydrabot YML file format. Root hydrabot node is missing.',
  DEFAULT_PR_PASS: [{
    do: 'checks',
    state: 'completed',
    status: 'success',
    payload: {
      title: 'Hydrab0t Run has been Completed!',
      summary: `All the validators have returned 'pass'! \n Here are some stats of the run: \n {{validationCount}} validations were ran`
    }
  }],
  DEFAULT_PR_FAIL: [{
    do: 'checks',
    state: 'completed',
    status: 'failure',
    payload: {
      title: `Hydrab0t run returned Status ***{{toUpperCase validationStatus}}***`,
      summary: `### Status: {{toUpperCase validationStatus}}

        Here are some stats of the run:
        {{validationCount}} validations were ran.
        {{passCount}} PASSED
        {{failCount}} FAILED
      `,
      text: `{{#each validationSuites}}
#### {{{statusIcon status}}} Validator: {{toUpperCase name}}
{{#each validations }} * {{{statusIcon status}}} ***{{{ description }}}***
       Input : {{{details.input}}}
       Settings : {{{displaySettings details.settings}}}
       {{/each}}
{{/each}}`
    }
  }],
  DEFAULT_PR_ERROR: [{
    do: 'checks',
    state: 'completed',
    status: 'action_required',
    payload: {
      title: 'Hydrab0t found some failed checks!',
      summary: `Some or All of the validators have returned 'error' status, please check below for details
      Here are some stats of the run: \n {{validationCount}} validations were ran. \n {{passCount}} ***PASSED***
      {{failCount}} ***FAILED***
      {{errorCount}} ***ERRORED***`,
      text: `{{#each validationSuites}}
#### {{{statusIcon status}}} Validator: {{toUpperCase name}}
Status {{toUpperCase status}}
{{#each validations }} * {{{statusIcon status}}} ***{{{ description }}}***
       Input : {{{details.input}}}
       Settings : {{{displaySettings details.settings}}}
       {{#if details.error}}
       Error : {{{details.error}}}
       {{/if}}
       {{/each}}
{{/each}}`
    }
  }],
  DEFAULT_ISSUES_PASS: [{
    do: 'comment',
    payload: {
      body: `All the validators have returned 'pass'! \n Here are some stats of the run: \n {{validationCount}} validations were ran`
    }
  }],
  DEFAULT_ISSUES_FAIL: [{
    do: 'comment',
    payload: {
      body: `### Hydrab0t found some failed validations in your Issue
{{#each validationSuites}}
{{#ifEquals status "fail"}}
#### {{{statusIcon status}}} Validator: {{toUpperCase name}}
{{#each validations }} * {{{statusIcon status}}} ***{{{ description }}}***
Input : {{{details.input}}}
Settings : {{{displaySettings details.settings}}}
{{/each}}
{{/ifEquals}}
{{/each}}`
    }
  }],
  DEFAULT_ISSUES_ERROR: [{
    do: 'comment',
    payload: {
      body: `### We found some error in your hydrabot configuration
{{#each validationSuites}}
{{#ifEquals status "error"}}
#### {{{statusIcon status}}} Validator: {{toUpperCase name}}
{{#each validations }} * {{{statusIcon status}}} ***{{{ description }}}***
Input : {{{details.input}}}
Settings : {{{displaySettings details.settings}}}
{{#if details.error}}
Error : {{{details.error}}}
{{/if}}
{{/each}}
{{/ifEquals}}
{{/each}}
        `
    }
  }],
  DEFAULT_PR_VALIDATE: [{
    do: 'title',
    must_exclude: {
      regex: '^wip'
    }
  }, {
    do: 'label',
    must_exclude: {
      regex: 'work in progress|wip|do not merge'
    }
  }, {
    do: 'description',
    no_empty: {
      enabled: true
    }
  }]
}
