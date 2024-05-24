// TODO A
// create data file for billing purposes (adj of payment file)
// Setting up Gift card linkage:
// 1) starting point: gift card link csv (use gift card links from // expProgramWebApplication\links)
// 2) in order of completion,
//    send link to the participant and do not use the same link from CSV file
// 3) edit csv while the experiment is running
// 4) have a ledger of usage
// 5) create billing file for gift cards with columns:
// 6) experimentcomplete Button.
//    a) button trigger function to send msg to server
//    b) msg from server to client comes back. redirect to Prolific
// 7) Dynamic construction of instruction string due to incentive amounts

// TODO B
// 1) Update interface: link to prolific at the end
// 2) test accounts through Prolific: https://docs.prolific.com/docs/api-docs/public/#tag/Testing
// 3) API.
//  3a) Send custom emails about gift cards
//  3b) Send bonus payments
// 2) check mobile/tablet compatibility

// TODO C
// Work on ML 'application'

// TODO D Alternative to Prolific. Mturk
// Sandbox
// Notify Workers (Email): https://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_NotifyWorkersOperation.html
// Bonus Payment for Workers: https://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_SendBonusOperation.html
//
// - Pilot: Prolific students
// ---> shareable link version for a gift card.
//
// - prolific details
//   URL parameters for login:
//   http://localhost:3000/?PROLIFIC_PID=1&STUDY_ID=GiftCard&SESSION_ID=Something
//   https://trialparticipation.com/?PROLIFIC_PID=1&STUDY_ID=GiftCard&SESSION_ID=Something
//
// - giftbit.com
// - https://app.giftbit.com/app/order/pay/bda63b3c49eb433995fccd4996eb54e2
// - https://docs.prolific.com/docs/api-docs/public/#tag/Messages/operation/SendMessage

// - ML analysis
//
// Alternative version:
// Fall 2024. Full Experiment.
// - Between Spring and Fall 2024: ML analysis to improve SE (barrier: can ML predict out of sample better? if so, then move forward)
// 1) create ML repository
// - Create Firm-Employee Field Experimental Website
//
// PUSH: adjust parameters to the true values
//

// potential to-dos: multiple periods

import { io } from './server.js'
import fs from 'fs'

// parameters
const subjects = {}
const numPracticePeriods = 1 // 3 practice periods
const numPeriods = 1 // 1 period, numPeriods > numPracticePeriods (internal: 1)
const choice1Length = 3 // 15 secs choice1 (internal: 5)
const feedback1Length = 3 // 5 secs feedback1 (internal: 2)
const choice2Length = 3 // 15 secs choice2 (internal: 5)
const feedback2Length = 3 // 5 secs feedback2 (internal: 5)
const endowment = 3 //  online: 3
const bonus = 4 // online: {4,6}
const giftAmount = 6 // online: {6,9}

// variables and guestList
let numSubjects = 0
let dataStream
let preSurveyStream
let paymentStream
let preSurveyReady = false
const dateString = getDateString()

createDataFile()
createPaymentFile()

function arange (a, b) {
  return [...Array(b - a + 1).keys()].map(i => i + a)
}

function choose (x) {
  return x[Math.floor(Math.random() * x.length)]
}

function formatTwo (x) {
  let y = x.toFixed(0)
  if (y < 10) y = '0' + y
  return y
}
function getDateString () {
  const d = new Date()
  const year = d.getFullYear()
  const month = formatTwo(d.getMonth() + 1)
  const day = formatTwo(d.getDate())
  const hours = formatTwo(d.getHours())
  const minutes = formatTwo(d.getMinutes())
  const seconds = formatTwo(d.getSeconds())
  const dateString = year + '-' + month + '-' + day + '-' + hours + minutes + seconds
  return dateString
}

function createPreSurveyFile (msg) {
  preSurveyStream = fs.createWriteStream(`data/${dateString}-preSurvey.csv`)
  let csvString = Object.keys(msg).join(',')
  csvString += '\n'
  preSurveyStream.write(csvString)
  preSurveyReady = true
}
function updatePreSurveyFile (msg) {
  if (!preSurveyReady) createPreSurveyFile(msg)
  let csvString = Object.values(msg).join(',')
  csvString += '\n'
  preSurveyStream.write(csvString)
}

function createDataFile () {
  dataStream = fs.createWriteStream(`data/${dateString}-data.csv`)
  let csvString = 'study,session,subjectStartTime,period,practice,id,forced1,'
  csvString += 'forcedScore1,choice1,choice2,score1,score2,endowment,bonus,totalScore,'
  csvString += 'outcomeRandom,winPrize,totalCost,earnings,selectedPeriod'
  csvString += '\n'
  dataStream.write(csvString)
}
function updateDataFile (subject) {
  let csvString = ''
  csvString += `${subject.study},${subject.session},${subject.startTime},${subject.period},`
  csvString += `${1 - subject.practicePeriodsComplete},${subject.id},`
  csvString += `${subject.hist[subject.period].forced[1]},${subject.hist[subject.period].forcedScore[1]},`
  csvString += `${subject.hist[subject.period].choice[1]},${subject.hist[subject.period].choice[2]},`
  csvString += `${subject.hist[subject.period].score[1]},${subject.hist[subject.period].score[2]},`
  csvString += `${endowment},${bonus},${subject.totalScore},${subject.outcomeRandom},`
  csvString += `${subject.winPrize},${subject.totalCost},${subject.earnings},`
  csvString += `${subject.selectedPeriod}`
  csvString += '\n'
  dataStream.write(csvString)
}

function createPaymentFile () {
  paymentStream = fs.createWriteStream(`data/${dateString}-payment.csv`)
  const csvString = 'date,id,earnings,winPrize,giftAmount,link\n'
  paymentStream.write(csvString)
}
function updatePaymentFile (subject) {
  calculateSelectedOutcome()
  assignGift(subject)
  const date = subject.startTime.slice(0, 10)
  console.log('giftAmount', subject.giftAmount)
  let csvString = `${date},${subject.id},${subject.selectedEarnings.toFixed(0)},`
  csvString += `${subject.selectedWinPrize},${subject.giftAmount},`
  csvString += `${subject.link}\n`
  console.log('csvString', csvString)
  paymentStream.write(csvString)
}
function assignGift (subject) {
  const links = fs.readFileSync('links/links.csv', 'utf8').split('\n')
  const ledger = fs.readFileSync('links/ledger.csv', 'utf8').split('\n')
    .filter(x => x.length > 0)
  const link = links.find(link => !ledger.includes(link))
  ledger.push(link)
  const remainingLinks = links.filter(link => !ledger.includes(link))
  fs.writeFileSync('links/ledger.csv', ledger.join('\n'))
  fs.writeFileSync('links/remaining.csv', remainingLinks.join('\n'))
  subject.link = link
  subject.GiftAmount = subject.WinPrize === 1 ? giftAmount : 0
  console.log(links)
  console.log(ledger)
}
io.on('connection', function (socket) {
  socket.emit('connected')
  socket.on('joinGame', function (msg) {
    console.log('joinGame', msg.id)
    if (!subjects[msg.id]) createSubject(msg, socket) // restart client: client joins but server has record
    socket.emit('clientJoined', { id: msg.id, hist: subjects[msg.id].hist, period: subjects[msg.id].period })
    console.log('Object.keys(subjects)', Object.keys(subjects))
  })
  socket.on('beginPreSurvey', function (msg) {
    console.log('beginPreSurvey')
    const subject = subjects[msg.id]
    if (subject.state === 'welcome') {
      subject.state = 'preSurvey'
    }
  })
  socket.on('submitPreSurvey', function (msg) {
    console.log('submitPreSurvey')
    const subject = subjects[msg.id]
    updatePreSurveyFile(msg)
    if (subject.state === 'preSurvey') {
      subject.preSurveySubmitted = true
      subject.state = 'instructions'
    }
  })
  socket.on('beginPracticePeriods', function (msg) {
    const subject = subjects[msg.id]
    if (subject.state === 'instructions') {
      subject.state = 'interface'
      console.log('beginPracticePeriods', msg.id)
    }
  })

  socket.on('beginExperiment', function (msg) {
    const subject = subjects[msg.id]
    if (subject.practicePeriodsComplete && subject.state === 'instructions') {
      subject.experimentStarted = true
      setupHist(subject)
      subject.state = 'interface'
    }
  })
  socket.on('completeExperiment', function (msg) {
    const subject = subjects[msg.id]
    if (subject.state === 'experimentComplete') {
      updatePaymentFile(subject)
      subject.state = 'prolific'
      const reply = {
        id: subject.id,
        url: 'https://app.prolific.com/submissions/complete?cc=C1NU8C6K'
      }
      socket.emit('experimentComplete', reply)
    }
  })

  socket.on('managerUpdate', function (msg) {
    const ids = Object.keys(subjects)
    const subjectsArray = Object.values(subjects)
    const subjectsData = subjectsArray.map(subject => {
      return {
        id: subject.id,
        step: subject.step,
        period: subject.period,
        countdown: subject.countdown,
        state: subject.state,
        selectedEarnings: subject.selectedEarnings,
        selectedWinPrize: subject.selectedWinPrize,
        practice: !subject.practicePeriodsComplete,
        selectedPeriod: subject.selectedPeriod
      }
    })
    const reply = {
      numSubjects,
      ids,
      subjectsData
    }
    socket.emit('serverUpdateManager', reply)
  })
  socket.on('clientUpdate', function (msg) { // callback function; msg from client, send msg to client
    const subject = subjects[msg.id]
    if (subject) {
      const step = subject.step
      const histPeriod = subject.hist[msg.period]
      const choosing = step === 'choice1' || step === 'choice2'
      if (subject.period === msg.period && step === msg.step) {
        if (choosing) {
          histPeriod.choice[msg.stage] = msg.currentChoice
          histPeriod.score[msg.stage] = msg.currentScore
        }
      }
      const reply = {
        period: subject.period,
        state: subject.state,
        experimentStarted: subject.experimentStarted,
        practicePeriodsComplete: subject.practicePeriodsComplete,
        numPracticePeriods,
        endowment,
        step: subject.step,
        stage: subject.stage,
        countdown: subject.countdown,
        selectedPeriod: subject.selectedPeriod,
        outcomeRandom: subject.outcomeRandom,
        winPrize: subject.winPrize,
        totalCost: subject.totalCost,
        earnings: subject.earnings,
        hist: subject.hist,
        bonus
      }
      socket.emit('serverUpdateClient', reply)
    } else { // restart server: solving issue that client does not know that
      createSubject(msg, socket)
      socket.emit('clientJoined', { id: msg.id })
    }
  })
})

function setupHist (subject) {
  const nPeriods = Math.max(numPracticePeriods, numPeriods)
  arange(1, nPeriods).forEach(i => {
    subject.hist[i] = {
      choice: { 1: 0, 2: 0 },
      score: { 1: 0, 2: 0 },
      forcedScore: { 1: 0, 2: 0 },
      forced: { 1: 1 * (Math.random() > 0.5), 2: 0 },
      outcomeRandom: Math.random()
    }
  })
}

function createSubject (msg, socket) {
  numSubjects += 1
  const subject = {
    id: msg.id,
    study: msg.study,
    session: msg.session,
    socket,
    startTime: getDateString(),
    preSurveySubmitted: false,
    instructionsComplete: false,
    experimentStarted: false,
    practicePeriodsComplete: false,
    step: 'choice1',
    stage: 1,
    state: 'startup',
    period: 1,
    countdown: choice1Length,
    choice1: 0,
    investment2: 0,
    selectedPeriod: choose(arange(1, numPeriods)),
    outcomeRandom: 0,
    winPrize: 0,
    giftAmount: 0,
    link: '',
    totalCost: 0,
    earnings: 0,
    selectedEarnings: 0,
    selectedWinPrize: 0,
    hist: {}
  }
  subjects[msg.id] = subject
  setupHist(subject)
  console.log(`subject ${msg.id} connected`)
}
function calculateOutcome () {
  Object.values(subjects).forEach(subject => {
    const currentHist = subject.hist[subject.period]
    subject.outcomeRandom = currentHist.outcomeRandom
    subject.score1 = currentHist.score[1]
    subject.score2 = currentHist.score[2]
    subject.totalScore = currentHist.score[1] + currentHist.score[2]
    subject.winPrize = (subject.totalScore > currentHist.outcomeRandom) * 1
    subject.earnings = endowment + bonus * (1 - subject.winPrize)
  })
}
function calculateSelectedOutcome () {
  Object.values(subjects).forEach(subject => {
    console.log('subject.selectedPeriod', subject.selectedPeriod)
    const selectedHist = subject.hist[subject.selectedPeriod]
    console.log('subject.hist', subject.hist)
    console.log('selectedHist', selectedHist)
    const outcomeRandom = selectedHist.outcomeRandom
    const score1 = selectedHist.score[1]
    const score2 = selectedHist.score[2]
    const totalScore = score1 + score2
    subject.selectedWinPrize = (totalScore > outcomeRandom) * 1
    subject.selectedEarnings = endowment + bonus * (1 - subject.selectedWinPrize)
    console.log('subject.selectedEarnings', subject.selectedEarnings)
    console.log('subject.selectedWinPrize', subject.selectedWinPrize)
  })
}
function update (subject) { // add presurvey
  if (subject.state === 'startup') {
    subject.state = 'welcome'
  }
  if (subject.state === 'interface') {
    subject.countdown = subject.countdown - 1
    if (subject.step === 'choice1' && subject.countdown <= 0) { // end choice1
      subject.countdown = feedback1Length
      subject.step = 'feedback1'
    }
    if (subject.step === 'feedback1' && subject.countdown <= 0) { // end feedback1
      subject.countdown = choice2Length
      subject.step = 'choice2'
    }
    if (subject.step === 'choice2' && subject.countdown <= 0) { // end choice2
      calculateOutcome()
      calculateSelectedOutcome()
      subject.countdown = feedback2Length
      subject.step = 'feedback2'
    }
    if (subject.step === 'feedback2' && subject.countdown <= 0) { // end feedback2
      updateDataFile(subject) // change to subject-specific
      const maxPeriod = subject.experimentStarted ? numPeriods : numPracticePeriods
      if (subject.period >= maxPeriod) {
        if (subject.experimentStarted) {
          subject.step = 'end'
          subject.state = 'experimentComplete'
        } else {
          subject.state = 'instructions'
          subject.practicePeriodsComplete = true
          subject.period = 1
          subject.step = 'choice1'
          subject.countdown = choice1Length
        }
      } else {
        subject.countdown = choice1Length
        subject.period += 1
        subject.step = 'choice1'
      }
    }
    subject.stage = subject.step === 'choice1' || subject.step === 'feedback1' ? 1 : 2
  }
}
function updateSubjects () {
  const subjectsArray = Object.values(subjects)
  subjectsArray.forEach(subject => update(subject))
}
setInterval(updateSubjects, 1000)
