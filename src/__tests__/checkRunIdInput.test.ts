import { jest } from '@jest/globals'

async function loadConstants(checkRunId: string) {
  jest.resetModules()
  process.env['INPUT_CHECK-RUN-ID'] = checkRunId
  const { default: constants } = await import('../constants.js')
  return constants
}

describe('check-run-id input', () => {
  afterEach(() => {
    delete process.env['INPUT_CHECK-RUN-ID']
  })

  it('is null when not given', async () => {
    const constants = await loadConstants('')
    expect(constants.checkRunId).toBeNull()
  })

  it('parses a check run ID', async () => {
    const constants = await loadConstants('49513587381')
    expect(constants.checkRunId).toBe(49513587381)
  })

  it('rejects a value that is not a check run ID', async () => {
    await expect(loadConstants('abc')).rejects.toThrow('Input check-run-id must be a check run ID, got "abc"')
  })
})
