export function arange1 (n) {
  return [...Array(n).keys()]
}

export function arange2 (a, b) {
  return [...Array(b - a + 1).keys()].map(i => i + a)
}

export function choose (choices) {
  return choices[Math.floor(Math.random() * choices.length)]
}

export function unique (array) {
  return [...new Set(array)]
}
