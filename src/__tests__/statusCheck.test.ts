import { jest } from '@jest/globals'

const mockCreateStatusCheck = jest.fn<(options: unknown) => Promise<{ id: number }>>()
const mockUpdateStatusCheck = jest.fn<(options: unknown) => Promise<object>>()

async function loadStatusCheck(checkRunId: number | null) {
  jest.resetModules()
  jest.unstable_mockModule('../constants.js', () => ({
    default: {
      OWNER: 'ataylorme',
      REPO: 'eslint-annotate-github-action',
      SHA: '8e80ec28fec6ef9763aacbabb452bcb5d92315ca',
      checkName: 'ESLint Report Analysis',
      checkRunId,
      getTimestamp: () => '2026-01-01T00:00:00.000Z',
    },
  }))
  jest.unstable_mockModule('../createStatusCheck.js', () => ({ default: mockCreateStatusCheck }))
  jest.unstable_mockModule('../updateStatusCheck.js', () => ({ default: mockUpdateStatusCheck }))

  const { default: openStatusCheck } = await import('../openStatusCheck.js')
  const { default: closeStatusCheck } = await import('../closeStatusCheck.js')
  return { openStatusCheck, closeStatusCheck }
}

describe('status check lifecycle', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateStatusCheck.mockResolvedValue({ id: 42 })
    mockUpdateStatusCheck.mockResolvedValue({})
  })

  describe('without check-run-id', () => {
    it('creates an in-progress check run', async () => {
      const { openStatusCheck } = await loadStatusCheck(null)

      await expect(openStatusCheck()).resolves.toBe(42)
      expect(mockCreateStatusCheck).toHaveBeenCalledWith({
        owner: 'ataylorme',
        repo: 'eslint-annotate-github-action',
        started_at: '2026-01-01T00:00:00.000Z',
        head_sha: '8e80ec28fec6ef9763aacbabb452bcb5d92315ca',
        status: 'in_progress',
        name: 'ESLint Report Analysis',
      })
    })

    it('completes the check run with the conclusion', async () => {
      const { closeStatusCheck } = await loadStatusCheck(null)

      await closeStatusCheck('failure', 42, '1 error', 'report')

      expect(mockUpdateStatusCheck).toHaveBeenCalledWith({
        conclusion: 'failure',
        owner: 'ataylorme',
        repo: 'eslint-annotate-github-action',
        completed_at: '2026-01-01T00:00:00.000Z',
        status: 'completed',
        check_run_id: 42,
        output: { title: 'ESLint Report Analysis', summary: '1 error', text: 'report' },
      })
    })
  })

  describe('with check-run-id', () => {
    it('uses the given check run without creating one', async () => {
      const { openStatusCheck } = await loadStatusCheck(1234)

      await expect(openStatusCheck()).resolves.toBe(1234)
      expect(mockCreateStatusCheck).not.toHaveBeenCalled()
    })

    it('writes the output but leaves the status and conclusion alone', async () => {
      const { closeStatusCheck } = await loadStatusCheck(1234)

      await closeStatusCheck('failure', 1234, '1 error', 'report')

      expect(mockUpdateStatusCheck).toHaveBeenCalledWith({
        owner: 'ataylorme',
        repo: 'eslint-annotate-github-action',
        check_run_id: 1234,
        output: { title: 'ESLint Report Analysis', summary: '1 error', text: 'report' },
      })
    })
  })
})
