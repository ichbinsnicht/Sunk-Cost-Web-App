// load client-side socket.io
import { io } from './socketIo/socket.io.esm.min.js'

// getting Elements from HTML
const instructionsDiv = document.getElementById('instructionsDiv')
const instructionsTextDiv = document.getElementById('instructionsTextDiv')
const welcomeDiv = document.getElementById('welcomeDiv')
const pleaseWaitDiv = document.getElementById('pleaseWaitDiv')
const preSurveyDiv = document.getElementById('preSurveyDiv')
const beginPracticePeriodsButton = document.getElementById('beginPracticePeriodsButton')
const beginExperimentButton = document.getElementById('beginExperimentButton')
const previousPageButton = document.getElementById('previousPageButton')
const nextPageButton = document.getElementById('nextPageButton')
const interfaceDiv = document.getElementById('interfaceDiv')
const experimentCompleteDiv = document.getElementById('experimentCompleteDiv')
const completeButtonDiv = document.getElementById('completeButtonDiv')
const paymentDiv = document.getElementById('paymentDiv')
const completeTextDiv = document.getElementById('completeTextDiv')
const paymentLink = document.getElementById('paymentLink')
const giftBitLinkDiv = document.getElementById('giftBitLinkDiv')
const copyURLDiv = document.getElementById('copyURLDiv')
const bonusDiv = document.getElementById('bonusDiv')
const preSurveyForms = [
  document.getElementById('preSurveyForm1'),
  document.getElementById('preSurveyForm2'),
  document.getElementById('preSurveyForm3'),
  document.getElementById('preSurveyForm4'),
  document.getElementById('preSurveyForm5'),
  document.getElementById('preSurveyForm6'),
  document.getElementById('preSurveyForm7'),
  document.getElementById('preSurveyForm8'),
  document.getElementById('preSurveyForm9'),
  document.getElementById('preSurveyForm10')
]
preSurveyForms.forEach(form => {
  form.onsubmit = function (event) {
    event.preventDefault()
    window.nextPreSurveyForm(event)
  }
})
const canvas = document.getElementById('canvas')
const context = canvas.getContext('2d')

// graphical parameters
const graphWidth = 70
const graphX = 0.5 * (100 - graphWidth)
const lineY1 = -90
const lineY2 = -65
const tickFont = '1.5pt monospace'
const labelFont = '1.5pt monospace'
const black = 'rgb(0,0,0)'
const blue = 'rgb(0,150,256)'
const darkBlue = 'rgb(0,50,256)'
const green = 'rgb(0,200,0)'
const darkGreen = 'rgb(0,150,0)'

// variables
let state = 'startup'
let id = 'id'
let study = 'study'
let session = 'session'
let joined = false
let xScale = 1
let yScale = 1
let mouseX = 50
let countdown = 60 // seconds
let period = 1
let step = 'choice1'
let stage = 1
let experimentStarted = false
let practicePeriodsComplete = false
let numPracticePeriods = 0
let choice = { 1: 0, 2: 0 }
let score = { 1: 0, 2: 0 }
let forcedScore = { 1: 0, 2: 0 }
let forced = { 1: 0, 2: 0 }
let hist = {}
let mouseEvent = { x: 0, y: 0 }
let startPreSurveyTime = 0
let endPreSurveyTime = 0
let bonus = 0
let endowment = 0
let giftValue = 0
let winPrize = 0
let completionURL = ''
let giftURL = ''
let preSurveyQuestion = 0
let instructionsPage = 1
let engagement = 0
let drawing = false
let time = 0
let clicked = false

const imageStyle = `width:${1.5 * 14.2}vh;height:${1.5 * 9}vh;margin-left:auto;margin-right:auto;margin-top:3vmin;margin-bottom:3vmin;display:block;`
const imageHTML = `<img src="GiftCard.png" style="${imageStyle}"/>`

// probForcingInstructionsString
function getInstructionString () {
  const instructionsString1 = `
    This is an experiment about decision making. You will receive $${endowment.toFixed(0)} just for participating. Depending on the decisions you make, you will also receive either a bonus of $${bonus.toFixed(0)} or a $${giftValue.toFixed(0)} Starbucks gift card.
    ${imageHTML}
    This experiment will have two stages: stage 1 and stage 2. In each stage, you will make a choice which may affect your probability of receiving the $${bonus.toFixed(0)} bonus or the $${giftValue.toFixed(0)} Starbucks gift card.`
  const instructionsString2 = `
  Stage 1:<br>
  <ul>
      <li> You will choose a number between 0% and 100%, called Choice 1.</li>
      <li> There is a 50% chance that Probability 1 will equal Choice 1.</li>
      <li> Otherwise, Probability 1 will be chosen randomly.</li>
  </ul>
  <br>Stage 2:<br>
  <ul>
      <li> You will choose a number between 0% and 100%, called Choice 2.</li>
      <li> Probability 2 will equal Choice 2.</li>
  </ul>`
  const instructionsString3 = `
  During each stage, you can select your choice by clicking on the graph with your mouse. Your choice will be locked in at the end of the stage.
  
  <br><br> At the end of the experiment, one of the two stages will be chosen at random. Your chance of receiving the $${giftValue.toFixed(0)} Starbucks gift card will be the probability selected in that stage. Your chance of receiving the $${bonus.toFixed(0)} bonus will be 100% minus your chance of receiving the $${giftValue.toFixed(0)} Starbucks gift card. <br><br>`

  const readyPracticeString = `First, you will participate in ${numPracticePeriods} practice periods. The practice periods will not affect your final earnings. They are just for practice. Afterwards, you will start the experiment. <br><br> Please click the button below to begin the practice periods.`
  const readyExperimentString = 'Please click the button below to begin the experiment.'

  const readyString = practicePeriodsComplete ? readyExperimentString : readyPracticeString
  const instructionsString4 = readyString

  const instructionsStrings = [
    instructionsString1,
    instructionsString2,
    instructionsString3,
    instructionsString4
  ]

  return instructionsStrings[instructionsPage - 1]
}

const socket = io() // browser based socket
const arange = n => [...Array(n).keys()]
// URL
// http://localhost:3000?PROLIFIC_PID=1&STUDY_ID=GiftCard&SESSION_ID=Session
const urlParams = new URLSearchParams(window.location.search)
urlParams.forEach((value, key) => {
  console.log('key', key)
  console.log('value', value)
  if (key === 'PROLIFIC_PID') id = value
  if (key === 'STUDY_ID') study = value
  if (key === 'SESSION_ID') session = value
})

window.joinGame = function () {
  console.log('id', id)
  const msg = { id, study, session }
  socket.emit('joinGame', msg)
}
window.joinGame()

window.beginPreSurvey = function () {
  console.log('beginPreSurvey')
  const msg = { id }
  socket.emit('beginPreSurvey', msg)
}
window.nextPreSurveyForm = function (event) {
  preSurveyForms.forEach(div => {
    div.style.display = 'none'
  })
  preSurveyQuestion++
  if (preSurveyQuestion <= preSurveyForms.length) {
    const nextDiv = preSurveyForms[preSurveyQuestion - 1]
    nextDiv.style.display = 'block'
  } else {
    console.log('submitPreSurvey')
    endPreSurveyTime = Date.now()
    const msg = {
      id,
      preSurveyDuration: (endPreSurveyTime - startPreSurveyTime) / 1000
    }
    preSurveyForms.forEach(form => {
      const formData = new FormData(form)
      formData.forEach((value, key) => {
        console.log(key, value)
        msg[key] = value
      })
    })
    socket.emit('submitPreSurvey', msg)
    return false
  }
}
window.nextPreSurveyForm()

window.previousInstructionsPage = function () { instructionsPage-- }
window.nextInstructionsPage = function () { instructionsPage++ }

window.beginPracticePeriods = function () {
  clicked = false
  const msg = { id }
  beginPracticePeriodsButton.style.display = 'none'
  socket.emit('beginPracticePeriods', msg)
  console.log('beginPracticePeriods')
}

window.beginExperiment = function () {
  clicked = false
  const msg = { id }
  socket.emit('beginExperiment', msg)
}

window.requestPayment = function () {
  const msg = { id }
  socket.emit('requestPayment', msg)
}
window.goToGiftCard = function () {
  if (winPrize) setTimeout(() => { window.location.href = giftURL }, 100)
}
window.copyGiftLink = function () {
  navigator.clipboard.writeText(giftURL)
}

document.onkeydown = function (event) {
  if (event.key === 'Enter' && state === 'startup') window.joinGame()
}

document.onmousedown = function (e) {
  mouseEvent = e
  const x0 = canvas.width / 2 - canvas.height / 2
  const canvasRect = canvas.getBoundingClientRect()
  mouseX = (mouseEvent.pageX - x0 - canvasRect.left) * 100 / canvas.height
  const mouseGraphX = (mouseX - graphX) / graphWidth
  const choiceX = Math.round(0.5 * mouseGraphX * 100) / 100
  const inbounds = mouseGraphX >= 0 && mouseGraphX <= 1
  clicked = clicked || inbounds
  const msg = {
    id,
    study,
    session,
    time,
    period,
    step,
    stage,
    state,
    countdown,
    choiceX
  }
  socket.emit('clientClick', msg)
}

socket.on('connected', function (msg) {
  console.log('connected')
})
socket.on('clientJoined', function (msg) {
  console.log(`client ${msg.id} joined`)
  console.log('period:', period)
  console.log('choice:', choice)
  joined = true
  id = msg.id
  period = msg.period
  hist = msg.hist
  choice = hist[period].choice
  score = hist[period].score
  forcedScore = hist[period].forcedScore
  console.log('hist', hist)
  setInterval(update, 10)
  setInterval(measureEngagement, 1000)
})
socket.on('paymentComplete', function (msg) {
  completeButtonDiv.style.display = 'none'
  paymentDiv.style.display = 'block'
  console.log('paymentComplete', msg)
  console.log('completeButtonDiv', completeButtonDiv.style.display)
  console.log('paymentDiv', paymentDiv.style.display)
})
socket.on('serverUpdateClient', function (msg) {
  joined = true
  if (period !== msg.period || experimentStarted !== msg.experimentStarted) {
    score = { 1: 0, 2: 0 }
  }
  if (state !== 'preSurvey' && msg.state === 'preSurvey') {
    startPreSurveyTime = Date.now()
  }
  if (step !== msg.step) {
    console.log('msg.ExperimentStarted', msg.experimentStarted)
    console.log('msg.period', msg.period)
    console.log('msg.step', msg.step)
    clicked = false
  }
  instructionsTextDiv.innerHTML = getInstructionString()
  step = msg.step
  stage = msg.stage
  experimentStarted = msg.experimentStarted
  practicePeriodsComplete = msg.practicePeriodsComplete
  numPracticePeriods = msg.numPracticePeriods
  countdown = msg.countdown
  period = msg.period
  hist = msg.hist
  bonus = msg.bonus
  winPrize = msg.winPrize
  giftValue = msg.giftValue
  endowment = msg.endowment
  forcedScore = msg.hist[msg.period].forcedScore
  forced = msg.hist[msg.period].forced
  completionURL = msg.completionURL
  giftURL = msg.giftURL
  state = msg.state
})
function measureEngagement () {
  engagement = drawing ? 1 : 0
  drawing = false
  time++
  const msg = {
    id,
    study,
    session,
    time,
    period,
    step,
    stage,
    state,
    engagement
  }
  if (state === 'interface') socket.emit('clientEngagement', msg)
}
function update () {
  if (step === 'choice1' || step === 'choice2') updateChoice()
  const msg = {
    id,
    study,
    session,
    period,
    step,
    stage,
    currentChoice: choice[stage],
    currentScore: score[stage],
    clicked
  }
  socket.emit('clientUpdate', msg)
  beginPracticePeriodsButton.style.display = (!practicePeriodsComplete && instructionsPage === 4) ? 'inline' : 'none'
  beginExperimentButton.style.display = practicePeriodsComplete ? 'inline' : 'none'
  previousPageButton.style.display = instructionsPage === 1 ? 'none' : 'inline'
  nextPageButton.style.display = instructionsPage === 4 ? 'none' : 'inline'
  instructionsDiv.style.display = 'none'
  welcomeDiv.style.display = 'none'
  pleaseWaitDiv.style.display = 'none'
  preSurveyDiv.style.display = 'none'
  interfaceDiv.style.display = 'none'
  experimentCompleteDiv.style.display = 'none'
  if (joined && state === 'startup') {
    pleaseWaitDiv.style.display = 'block'
  }
  if (joined && state === 'welcome') {
    welcomeDiv.style.display = 'block'
  }
  if (joined && state === 'preSurvey') {
    preSurveyDiv.style.display = 'block'
  }
  if (joined && state === 'instructions') {
    instructionsDiv.style.display = 'block'
  }
  if (joined && state === 'interface') {
    interfaceDiv.style.display = 'block'
  }
  if (joined && state === 'experimentComplete') {
    experimentCompleteDiv.style.display = 'block'
  }
}

const draw = function () {
  window.requestAnimationFrame(draw)
  setupCanvas()
  context.clearRect(0, 0, canvas.width, canvas.height)
  if (joined && state === 'interface') drawInterface()
  if (joined && state === 'experimentComplete') writeOutcome()
  drawing = true
}
const setupCanvas = function () {
  xScale = 1 * window.innerWidth
  yScale = 1 * window.innerHeight
  canvas.width = xScale
  canvas.height = yScale
  const xTranslate = xScale / 2 - yScale / 2
  const yTranslate = yScale
  context.setTransform(yScale / 100, 0, 0, yScale / 100, xTranslate, yTranslate)
}
const updateChoice = function () {
  const mouseGraphX = (mouseX - graphX) / graphWidth
  if (mouseGraphX >= 0 && mouseGraphX <= 1) {
    if (step === 'choice1' || step === 'choice2') {
      choice[stage] = Math.round(0.5 * mouseGraphX * 100) / 100
      score[stage] = forced[stage] * forcedScore[stage] + (1 - forced[stage]) * choice[stage]
    }
  }
}
const drawInterface = function () {
  drawTop()
  drawCountdownText()
  if (step === 'feedback1') drawFeedback1Text()
  if (step === 'choice2' || step === 'feedback2') drawBottom()
  if (step === 'feedback2' || (step === 'choice2' && clicked)) {
    drawBarGiftCard()
    drawBarBonus()
  }
}
const drawTop = function () {
  context.fillStyle = black
  context.strokeStyle = 'black'
  context.lineWidth = 0.25
  context.beginPath()
  context.moveTo(graphX, lineY1)
  context.lineTo(graphX + graphWidth, lineY1)
  context.stroke()
  const numTicks = 6
  const tickLength = 2
  const tickSpace = 1
  context.font = tickFont
  context.textAlign = 'center'
  context.textBaseline = 'top'
  arange(numTicks).forEach(i => {
    const weight = i / (numTicks - 1)
    const x = (1 - weight) * graphX + weight * (graphX + graphWidth)
    const yBottom = lineY1 + tickLength
    context.beginPath()
    context.moveTo(x, lineY1)
    context.lineTo(x, yBottom)
    context.stroke()
    const xScoreLabel = `${weight * 50}%`
    context.textBaseline = 'top'
    context.fillText(xScoreLabel, x, yBottom + tickSpace)
  })
  context.font = labelFont
  if (step !== 'choice1') {
    context.textBaseline = 'bottom'
    context.fillStyle = darkGreen
    const score1String = `${(score[1] * 100).toFixed(0)}%`
    context.fillText(`Probability 1: ${score1String}`, graphX + graphWidth * 2 * score[1], lineY1 - tickLength - 0.5)
    context.beginPath()
    context.arc(graphX + graphWidth * 2 * score[1], lineY1, 1.5, 0, 2 * Math.PI)
    context.fill()
  }
  if (clicked || step !== 'choice1') {
    context.textBaseline = 'bottom'
    context.fillStyle = black
    const choice1String = `${(choice[1] * 100).toFixed(0)}%`
    context.fillText(`Choice 1: ${choice1String}`, graphX + graphWidth * 2 * choice[1], lineY1 - tickLength - 4)
    context.beginPath()
    context.arc(graphX + graphWidth * 2 * choice[1], lineY1, 0.75, 0, 2 * Math.PI)
  }
  context.textBaseline = 'bottom'
  context.fillStyle = black
  const mouseClickString1 = 'Please click on the graph to select your choice.'
  const mouseClickString = step === 'choice1' ? mouseClickString1 : ''
  context.fillText(mouseClickString, graphX + graphWidth * 0.5, lineY1 + 10)
  context.fill()
  context.fillStyle = black
  context.textBaseline = 'middle'
  context.textAlign = 'left'
}
const drawBottom = function () {
  context.fillStyle = black
  context.strokeStyle = 'black'
  context.lineWidth = 0.25
  context.beginPath()
  context.moveTo(graphX, lineY2)
  context.lineTo(graphX + graphWidth, lineY2)
  context.stroke()
  const numTicks = 6
  const tickLength = 2
  const tickSpace = 1
  context.font = tickFont
  context.textAlign = 'center'
  context.textBaseline = 'top'
  arange(numTicks).forEach(i => {
    const weight = i / (numTicks - 1)
    const x = (1 - weight) * graphX + weight * (graphX + graphWidth)
    const yBottom = lineY2 + tickLength
    context.beginPath()
    context.moveTo(x, lineY2)
    context.lineTo(x, yBottom)
    context.stroke()
    const xScoreLabel = `${weight * 50}%`
    context.textBaseline = 'top'
    context.fillText(xScoreLabel, x, yBottom + tickSpace)
  })
  context.font = labelFont
  if (clicked || step !== 'choice2') {
    context.textBaseline = 'bottom'
    context.fillStyle = green
    const score2String = `${(score[2] * 100).toFixed(0)}%`
    context.fillText(`Probability 2: ${score2String}`, graphX + graphWidth * 2 * score[2], lineY2 - tickLength - 0.5)
    context.beginPath()
    context.fillStyle = green
    context.arc(graphX + graphWidth * 2 * score[2], lineY2, 1.5, 0, 2 * Math.PI)
    context.fill()
    context.textBaseline = 'bottom'
    context.fillStyle = black
    const choice2String = `${(choice[2] * 100).toFixed(0)}%`
    context.fillText(`Choice 2: ${choice2String}`, graphX + graphWidth * 2 * choice[2], lineY2 - tickLength - 4)
    context.beginPath()
    context.arc(graphX + graphWidth * 2 * choice[2], lineY2, 0.75, 0, 2 * Math.PI)
    context.fill()
  }
  context.textBaseline = 'top'
  const mouseClickString1 = 'Please click on the graph to select your choice.'
  const mouseClickString = step === 'choice2' ? mouseClickString1 : ''
  context.fillText(mouseClickString, graphX + graphWidth * 0.5, lineY2 + 10)
  if (step === 'feedback2' || (step === 'choice2' && clicked)) {
    const probGiftCard = (score[1] + score[2]) * 100
    const probMoney = (1 - score[1] - score[2]) * 100
    const giftCardChance = `You have a ${probGiftCard.toFixed(0)}% chance of winning the $${giftValue.toFixed(0)} gift card.`
    const moneyChance = `You have a ${probMoney.toFixed(0)}% chance of winning the $${bonus.toFixed(0)} bonus.`
    context.fillStyle = darkGreen
    context.fillText(giftCardChance, graphX + 0.5 * graphWidth, lineY2 + 21)
    context.fillStyle = darkBlue
    context.fillText(moneyChance, graphX + 0.5 * graphWidth, lineY2 + 24.5)
  }
  if (step === 'feedback2') {
    context.textAlign = 'center'
    context.fillStyle = 'darkRed'
    const lineComplete = 'Stage 2 Complete'
    context.fillText(lineComplete, graphX + 0.5 * graphWidth, lineY2 + 29)
  }
}
const drawCountdownText = function () {
  context.fillStyle = 'black'
  context.textBaseline = 'top'
  context.textAlign = 'center'
  context.fillText(`Countdown: ${countdown}`, graphX + 0.5 * graphWidth, lineY2 + 17.5)
}
const drawFeedback1Text = function () {
  context.textBaseline = 'top'
  context.textAlign = 'center'
  context.fillStyle = darkGreen
  const score1CompleteString = 'Probability 1 Implemented'
  context.fillText(score1CompleteString, graphX + 0.5 * graphWidth, lineY2 - 10)
}
const drawBarGiftCard = function () {
  context.fillStyle = black
  context.strokeStyle = 'black'
  context.lineWidth = 0.25
  context.beginPath()
  const barX = 70
  const baseY = -10
  const barWidth = 10
  const barHeight = 20
  context.moveTo(barX - 0.5 * barWidth, baseY - barHeight)
  context.lineTo(barX - 0.5 * barWidth, baseY)
  context.lineTo(barX + 0.5 * barWidth, baseY)
  context.lineTo(barX + 0.5 * barWidth, baseY - barHeight)
  context.stroke()
  context.fillStyle = green
  const winProb = (score[1] + score[2]) * 100
  const barLevelTotal = barHeight * winProb / 100
  context.fillRect(barX - 0.5 * barWidth, baseY - barLevelTotal, barWidth, barLevelTotal)
  context.fillStyle = darkGreen
  const score1 = score[1] * 100
  const barLevel1 = barHeight * score1 / 100
  context.fillRect(barX - 0.5 * barWidth, baseY - barLevel1, barWidth, barLevel1)
  const numTicks = 3
  const tickLength = 2
  const tickSpace = 1
  context.font = tickFont
  context.fillStyle = black
  context.textAlign = 'center'
  context.textBaseline = 'top'
  arange(numTicks).forEach(i => {
    const weight = i / (numTicks - 1)
    const y = (1 - weight) * baseY + weight * (baseY - barHeight)
    const xRight1 = barX - 0.5 * barWidth
    const xLeft1 = barX - 0.5 * barWidth - tickLength
    context.beginPath()
    context.moveTo(xRight1, y)
    context.lineTo(xLeft1, y)
    context.stroke()
    const xRight2 = barX + 0.5 * barWidth + tickLength
    const xLeft2 = barX + 0.5 * barWidth
    context.beginPath()
    context.moveTo(xRight2, y)
    context.lineTo(xLeft2, y)
    context.stroke()
    const yWinProbLabel = `${100 * weight}%`
    context.textBaseline = 'middle'
    context.textAlign = 'left'
    context.fillText(yWinProbLabel, barX + 0.5 * barWidth + tickLength + tickSpace, y)
    context.textAlign = 'right'
    context.fillText(yWinProbLabel, barX - 0.5 * barWidth - tickLength - tickSpace, y)
  })
  context.fillStyle = darkGreen
  context.textAlign = 'center'
  const winProbString = `$${giftValue.toFixed(0)} Gift Card: ${winProb.toFixed(0)}%`
  context.fillText(winProbString, barX, baseY + 5)
}
const drawBarBonus = function () {
  context.fillStyle = black
  context.strokeStyle = 'black'
  context.lineWidth = 0.25
  context.beginPath()
  const barX = 30
  const baseY = -10
  const barWidth = 10
  const barHeight = 20
  context.moveTo(barX - 0.5 * barWidth, baseY - barHeight)
  context.lineTo(barX - 0.5 * barWidth, baseY)
  context.lineTo(barX + 0.5 * barWidth, baseY)
  context.lineTo(barX + 0.5 * barWidth, baseY - barHeight)
  context.stroke()
  context.fillStyle = blue
  const winProb = 100 - (score[1] + score[2]) * 100
  if (stage === 2) {
    const barLevelTotal = barHeight * winProb / 100
    context.fillRect(barX - 0.5 * barWidth, baseY - barLevelTotal, barWidth, barLevelTotal)
  }
  context.fillStyle = darkBlue
  const score1 = 50 - score[1] * 100
  const barLevel1 = barHeight * score1 / 100
  context.fillRect(barX - 0.5 * barWidth, baseY - barLevel1, barWidth, barLevel1)
  const numTicks = 3
  const tickLength = 2
  const tickSpace = 1
  context.font = tickFont
  context.fillStyle = black
  context.textAlign = 'center'
  context.textBaseline = 'top'
  arange(numTicks).forEach(i => {
    const weight = i / (numTicks - 1)
    const y = (1 - weight) * baseY + weight * (baseY - barHeight)
    const xRight1 = barX - 0.5 * barWidth
    const xLeft1 = barX - 0.5 * barWidth - tickLength
    context.beginPath()
    context.moveTo(xRight1, y)
    context.lineTo(xLeft1, y)
    context.stroke()
    const xRight2 = barX + 0.5 * barWidth + tickLength
    const xLeft2 = barX + 0.5 * barWidth
    context.beginPath()
    context.moveTo(xRight2, y)
    context.lineTo(xLeft2, y)
    context.stroke()
    const yWinProbLabel = `${100 * weight}%`
    context.textBaseline = 'middle'
    context.textAlign = 'left'
    context.fillText(yWinProbLabel, barX + 0.5 * barWidth + tickLength + tickSpace, y)
    context.textAlign = 'right'
    context.fillText(yWinProbLabel, barX - 0.5 * barWidth - tickLength - tickSpace, y)
  })
  context.fillStyle = darkBlue
  context.textAlign = 'center'
  const winProbString1 = `$${bonus.toFixed(0)} Bonus: ${score1.toFixed(0)}%`
  const winProbString2 = `$${bonus.toFixed(0)} Bonus: ${winProb.toFixed(0)}%`
  const winProbString = step === 'choice1' || step === 'feedback1' ? winProbString1 : winProbString2
  context.fillText(winProbString, barX, baseY + 5)
}

const writeOutcome = function () {
  completeTextDiv.innerHTML = ''
  completeTextDiv.innerHTML += `You will receive $${endowment.toFixed(0)} upon completion.<br>`
  const bonusTextA = `You won the $${bonus.toFixed(0)} bonus.`
  const bonusTextB = `You did not win the $${bonus.toFixed(0)} bonus.`
  const giftCardTextA = `You won the $${giftValue.toFixed(0)} Starbucks gift card.`
  const giftCardTextB = `You did not win the $${giftValue.toFixed(0)} Starbucks gift card.`
  completeTextDiv.innerHTML += winPrize ? bonusTextB : giftCardTextB
  completeTextDiv.innerHTML += '<br>'
  completeTextDiv.innerHTML += winPrize ? giftCardTextA : bonusTextA
  giftBitLinkDiv.innerHTML = ''
  console.log('winPrize', winPrize)
  console.log('completionURL', completionURL)
  console.log('giftURL', giftURL)
  paymentLink.href = completionURL
  paymentLink.target = '_self'
  copyURLDiv.style.display = 'none'
  bonusDiv.style.display = 'none'
  if (winPrize) {
    giftBitLinkDiv.innerHTML += `Your gift card URL: <br> ${giftURL}`
    paymentLink.target = '_blank'
    copyURLDiv.style.display = 'block'
  } else {
    bonusDiv.style.display = 'block'
  }
}

draw()
