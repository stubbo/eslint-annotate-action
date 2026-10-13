import updateStatusCheck from './updateStatusCheck.js'
import constants from './constants.js'
import type { CheckUpdateParams } from './types.js'
const { OWNER, REPO, getTimestamp, checkName, checkRunId } = constants

/**
 * Writes the final output to the check run and, when the action created it,
 * completes it with a conclusion. A check run given as `check-run-id` belongs
 * to someone else (usually the job), so its status and conclusion are left alone.
 * @param conclusion - 'success' | 'failure' | 'neutral' | 'cancelled' | 'skipped' | 'timed_out' | 'action_required'
 */
export default async function closeStatusCheck(
  conclusion: CheckUpdateParams['conclusion'],
  checkId: number,
  summary: string,
  text: string,
): Promise<void> {
  const output = {
    title: checkName,
    summary,
    text,
  }

  if (checkRunId !== null) {
    await updateStatusCheck({
      owner: OWNER,
      repo: REPO,
      check_run_id: checkId,
      output,
    })
    return
  }

  await updateStatusCheck({
    conclusion,
    owner: OWNER,
    repo: REPO,
    completed_at: getTimestamp(),
    status: 'completed',
    check_run_id: checkId,
    output,
  })
}
