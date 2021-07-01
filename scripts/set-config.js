const fs = require('fs')
const path = require('path')

const projectId = process.argv[2]
const configPath = path.join(path.resolve(), `./config/${projectId || 'default'}.json`)

if (!(configPath && fs.existsSync(configPath))) {
  return
}

const collectConfigLines = (o, propPath, configLines) => {
  propPath = propPath || ''
  configLines = configLines || []
  for (const key of Object.keys(o)) {
    const newPropPath = propPath + key
    if (typeof o[key] === 'object') {
      collectConfigLines(o[key], newPropPath + '.', configLines)
    } else if (o[key] != null && o[key] !== '') {
      configLines.push(`${newPropPath}=${JSON.stringify(o[key])}`)
    }
  }
}

const config = require(configPath)
const configLines = []
collectConfigLines(config, '', configLines)

const cp = require('child_process')
const option = projectId ? `-P ${projectId}` : ''
cp.execSync(`firebase ${option} functions:config:set ${configLines.join(' ')}`)
