/** @param {{ id: string|number, name: string }[]} peopleList */
export function buildWeightsFromSplit(splitBetween, peopleList) {
  const next = {}
  let any = false
  peopleList.forEach((p) => {
    const on = splitBetween.some((x) => x.id === p.id)
    next[p.id] = on ? 1 : 0
    if (on) any = true
  })
  if (!any) {
    peopleList.forEach((p) => {
      next[p.id] = 1
    })
  }
  return next
}

export function splitBetweenFromWeights(weights, peopleList) {
  return peopleList.filter((p) => (weights?.[p.id] ?? 0) > 0)
}
