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
    This experiment will have two stages: stage 1 and stage 2. In each stage, you will win either the $${bonus.toFixed(0)} bonus or the $${giftValue.toFixed(0)} Starbucks gift card. At the end of the experiment, one of the two stages will be randomly selected and you will receive what you won in that stage.`
  const instructionsString2 = `
  Stage 1:<br>
  <ul>
      <li> You will choose either the $${bonus.toFixed(0)} bonus or the $${giftValue.toFixed(0)} Starbucks gift card.</li>
      <li> There is a 60% chance that you will win the option you selected.</li>
      <li> There is a 40% chance that you will win the other option.</li>
  </ul>
  <br>Stage 2:<br>
  <ul>
      <li> You will choose either the $${bonus.toFixed(0)} bonus or the $${giftValue.toFixed(0)} Starbucks gift card.</li>
      <li> You will win the option you selected.</li>
  </ul> <br>
  At the end of the experiment, one of the two stages will be randomly selected and you will receive what you won in that stage.
  `
  const instructionsString3 = `At the end of the experiment, one of the two stages will be selected at random. If you won the $${giftValue.toFixed(0)} Starbucks gift card in the selected stage, then you will receive the gift card. If you won the $${bonus.toFixed(0)} bonus in the selected stage, then you will receive the bonus. <br><br>`

  const readyPracticeString = `First, you will participate in ${numPracticePeriods} practice period. The practice period will not affect your final earnings. It is just for practice. Afterwards, you will start the experiment. <br><br> Please click the button below to begin the practice.`
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
