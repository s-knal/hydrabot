process.env.TZ = 'UTC'
const { Hydrabot } = require('./lib/hydrabot')
const logger = require('./lib/logger')

module.exports = (robot) => {
  logger.init(robot.log)
  let hydrabot = new Hydrabot(process.env.NODE_ENV)
  hydrabot.start(robot)
}
