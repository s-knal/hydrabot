const {Hydrabot} = require('../../lib/hydrabot')

describe('Hydrabot', () => {
  test('starting in dev mode and flexed correctly', async () => {
    let hydrabot = startHydrabot('development')
    expect(hydrabot.schedule).toBeCalledWith(mockRobot, { interval: 15 * 60 * 1000 })
    expect(hydrabot.flex).toHaveBeenCalledTimes(1)
  })

  test('starting in production mode and flexed correctly', async () => {
    let hydrabot = startHydrabot('production')
    expect(hydrabot.schedule).toBeCalledWith(mockRobot, { interval: 24 * 60 * 60 * 1000 })
    expect(hydrabot.flex).toBeCalledWith(mockRobot)
  })
})

const startHydrabot = (mode, version) => {
  process.env.HYDRABOT_SCHEDULER = true
  let hydrabot = new Hydrabot(mode, version)
  hydrabot.schedule = jest.fn()
  hydrabot.flex = jest.fn()
  hydrabot.start(mockRobot)
  return hydrabot
}

const mockRobot = {
  on: jest.fn(),
  log: {
    child: () => {
      return {
        debug: jest.fn(),
        info: jest.fn()
      }
    }
  }
}
