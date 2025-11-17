
/** aux functions */

const isObject = (val: any) => val && typeof val === 'object'
const mergeArrayWithDedupe = (a: any, b: any) => Array.from(new Set([...a, ...b]))

/**
 * Recursively merge existing one from new object.
 *
 * @param {Object} target Existing one.
 * @param {Object} obj New one.
 */
export function deepMerge(target: any, obj: any): any {
  for (const key of Object.keys(obj)) {
    const oldVal = target[key]
    const newVal = obj[key]

    if (Array.isArray(oldVal) && Array.isArray(newVal)) {
      target[key] = mergeArrayWithDedupe(oldVal, newVal)
    } else if (isObject(oldVal) && isObject(newVal)) {
      target[key] = deepMerge(oldVal, newVal)
    } else {
      target[key] = newVal
    }
  }

  return target
}

/**
 * Sort dependencies from package.json.
 *
 * @param packageJson Object representation of package.json
 * @returns
 */
export function sortDependencies(packageJson: any): any {
  const sorted: any = {}

  const depTypes = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']

  for (const depType of depTypes) {
    if (packageJson[depType]) {
      sorted[depType] = {}

      Object.keys(packageJson[depType])
        .sort()
        .forEach((name) => {
          sorted[depType][name] = packageJson[depType][name]
        })
    }
  }

  return {
    ...packageJson,
    ...sorted,
  }
}
