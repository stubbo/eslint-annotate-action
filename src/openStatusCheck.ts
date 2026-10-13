import createStatusCheck from './createStatusCheck.js'
import constants from './constants.js'
const { OWNER, REPO, SHA, getTimestamp, checkName, checkRunId } = constants

/**
 * Returns the ID of the check run to annotate: the one given as `check-run-id`,
 * or a newly created in-progress check run.
 */
export default async function openStatusCheck(): Promise<number> {
  if (checkRunId !== null) {
    return checkRunId
  }

  const response = await createStatusCheck({
    owner: OWNER,
    repo: REPO,
    started_at: getTimestamp(),
    head_sha: SHA,
    status: 'in_progress',
    name: checkName,
  })

  return response.id
}
