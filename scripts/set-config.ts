const path = require('path')
const config = require(path.join(path.resolve(), './.runtimeconfig.json'))
const cp = require('child_process')

type ConfigValue = { [key: string]: ConfigValue | string }

const collectConfigLines = (o: ConfigValue, propPath: string): string[] => {
  let configLines: string[] = []
  for (const key of Object.keys(o)) {
    const v = o[key]
    const _propPath = propPath + key
    if (typeof v === 'object') {
      configLines = [...configLines, ...collectConfigLines(v, _propPath + '.')]
    } else if (v != null && v !== '') {
      configLines.push(`${_propPath}=${JSON.stringify(v)}`)
    }
  }
  return configLines
}

const configLines = collectConfigLines(config, '')
cp.execSync(`firebase functions:config:set ${configLines.join(' ')}`)
