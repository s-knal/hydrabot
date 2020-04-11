const { NoResponse, defaults } = require('./needs-info')

async function needsInfoSweeper (context, log) {
  const config = await context.config('hydrabot.yml')
  if (config) {
    const configWithDefaults = Object.assign({}, defaults, config)
    const noResponse = new NoResponse(context, configWithDefaults, log)
    return noResponse.sweep()
  }
}

async function needsInfoExecutor (context, log) {
  const config = await context.config('hydrabot.yml')
  if (config) {
    const configWithDefaults = Object.assign({}, defaults, config.needsInfo)
    const noResponse = new NoResponse(context, configWithDefaults, log)
    return noResponse.unmark(context.issue())
  }
}

module.exports = {
  needsInfoSweeper,
  needsInfoExecutor
}
