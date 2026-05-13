import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const bump = process.argv[2]
const commitMessageArg = process.argv.slice(3).join(' ').trim()
const allowedBumps = new Set(['patch', 'minor', 'major'])

if (!allowedBumps.has(bump)) {
  console.error('Usage: node scripts/sc-git.mjs <patch|minor|major> [commit message]')
  process.exit(1)
}

const isWindows = process.platform === 'win32'
const npmCmd = isWindows ? 'npm.cmd' : 'npm'
const firebaseCmd = isWindows ? 'firebase.cmd' : 'firebase'
const ignoredCommitPaths = new Set(['.firebase/hosting.ZGlzdA.cache'])

const run = (command, args, options = {}) => {
  console.log(`\n> ${[command, ...args].join(' ')}`)
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: false,
    ...options,
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

const read = (command, args) => {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    shell: false,
  })

  if (result.status !== 0) {
    process.stderr.write(result.stderr ?? '')
    process.exit(result.status ?? 1)
  }

  return result.stdout.trim()
}

const getChangedPaths = () =>
  read('git', ['status', '--short'])
    .split('\n')
    .map((line) => line.slice(3).trim())
    .filter(Boolean)

const hasCommittableChanges = () => getChangedPaths().some((filePath) => !ignoredCommitPaths.has(filePath))

const packageJson = () => JSON.parse(readFileSync('package.json', 'utf8'))

const initialBranch = read('git', ['branch', '--show-current'])
if (!initialBranch) {
  console.error('Cannot determine current git branch.')
  process.exit(1)
}

run('git', ['status', '--short', '--branch'])
run('git', ['diff', '--stat'])

if (!hasCommittableChanges()) {
  console.log('\nNothing to commit.')
  process.exit(0)
}

run(npmCmd, ['version', bump, '--no-git-tag-version'])
run(npmCmd, ['run', 'lint'])
run(npmCmd, ['run', 'format'])
run(npmCmd, ['run', 'typecheck'])
run('git', ['status', '--short'])
run('git', ['diff', '--stat'])
run('git', ['add', '-A', '--', '.', ':(exclude).firebase/hosting.ZGlzdA.cache'])

const version = packageJson().version
const commitMessage = commitMessageArg || process.env.SC_GIT_MESSAGE || `chore(release): v${version}`
run('git', ['commit', '-m', commitMessage])

if (initialBranch === 'main') {
  run('git', ['push', 'origin', 'main'])
} else {
  run('git', ['switch', 'main'])
  run('git', ['pull', '--ff-only', 'origin', 'main'])
  run('git', ['merge', '--ff-only', initialBranch])
  run('git', ['push', 'origin', 'main'])
}

const currentBranch = read('git', ['branch', '--show-current'])
if (currentBranch !== 'main') {
  console.error(`Refusing to build/deploy from ${currentBranch}. Expected main.`)
  process.exit(1)
}

run(npmCmd, ['run', 'build'])
run(firebaseCmd, ['deploy', '--only', 'hosting'])

console.log(`\nSC git completed for v${version}.`)
