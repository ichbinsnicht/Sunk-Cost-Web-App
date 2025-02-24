import { io } from './socketIo/socket.io.esm.min.js'
import { Renderer } from './renderer.js'
import { Input } from './input.js'
import { Instructions } from './instructions.js'
import { Quiz } from './quiz.js'

export class Client {
  constructor () {
    console.log('Client created')
    this.instructionsDiv = document.getElementById('instructionsDiv')
    this.instructionsTextDiv = document.getElementById('instructionsTextDiv')
    this.welcomeDiv = document.getElementById('welcomeDiv')
    this.pleaseWaitDiv = document.getElementById('pleaseWaitDiv')
    this.preSurveyDiv = document.getElementById('preSurveyDiv')
    this.beginPracticePeriodsButton = document.getElementById('beginPracticePeriodsButton')
    this.beginExperimentButton = document.getElementById('beginExperimentButton')
    this.previousPageButton = document.getElementById('previousPageButton')
    this.nextPageButton = document.getElementById('nextPageButton')
    this.interfaceDiv = document.getElementById('interfaceDiv')
    this.experimentCompleteDiv = document.getElementById('experimentCompleteDiv')
    this.completeButtonDiv = document.getElementById('completeButtonDiv')
    this.paymentDiv = document.getElementById('paymentDiv')
    this.completeTextDiv = document.getElementById('completeTextDiv')
    this.paymentLink = document.getElementById('paymentLink')
    this.giftBitLinkDiv = document.getElementById('giftBitLinkDiv')
    this.copyURLDiv = document.getElementById('copyURLDiv')
    this.bonusDiv = document.getElementById('bonusDiv')
    this.countdownText = document.getElementById('countdownText')
    this.requestText = document.getElementById('requestText')
    this.choiceText = document.getElementById('choiceText')
    this.choseText = document.getElementById('choseText') // potential vestigial code
    this.choseItemText = document.getElementById('choseItemText') // potential vestigial code
    this.stepTitle = document.getElementById('stepTitle')
    this.probTextGiftCard = document.getElementById('probTextGiftCard')
    this.probTextBonus = document.getElementById('probTextBonus')
    this.feedbackStageText = document.getElementById('feedbackStageText')
    this.understandingQuiz = document.getElementById('understandingQuiz')
    this.beginExperimentText = document.getElementById('beginExperimentText')
    this.preSurveyForms = [
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
    this.preSurveyForms.forEach(form => {
      form.onsubmit = function (event) {
        event.preventDefault()
        window.nextPreSurveyForm(event)
      }
    })

    // variables
    this.state = 'startup'
    this.id = 'id'
    this.study = 'study'
    this.session = 'session'
    this.preSurveyQuestion = 0
    this.startPreSurveyTime = 0
    this.endPreSurveyTime = 0
    this.quizComplete = false
    this.winGiftCard = 0
    this.giftURL = ''
    this.period = 1
    this.step = 'choice'
    this.stage = 1
    this.countdown = 60 // seconds
    this.time = 0
    this.choice = 0
    this.hist = {}
    this.practicePeriodsComplete = false
    this.engagement = 0
    this.joined = false
    this.numPracticePeriods = 0
    this.bonus = 0
    this.giftValue = 0
    this.endowment = 0
    this.completionURL = ''

    this.socket = io()
    // URL: http://localhost:3000?PROLIFIC_PID=1&STUDY_ID=GiftCard&SESSION_ID=Session
    this.urlParams = new URLSearchParams(window.location.search)
    this.urlParams.forEach((value, key) => {
      console.log('key', key)
      console.log('value', value)
      if (key === 'PROLIFIC_PID') this.id = value
      if (key === 'STUDY_ID') this.study = value
      if (key === 'SESSION_ID') this.session = value
    })
    this.renderer = new Renderer(this)
    this.instructions = new Instructions(this)
    this.quiz = new Quiz(this)
    this.input = new Input(this)
    this.setup()
    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        window.location.reload()
      }
    })
  }

  setup () {
    this.socket.on('connected', (msg) => {
      console.log('connected')
    })
    this.socket.on('clientJoined', (msg) => {
      console.log(`client ${msg.id} joined`)
      console.log('period:', this.period)
      console.log('choice:', this.choice)
      this.joined = true
      this.id = msg.id
      this.period = msg.period
      this.hist = msg.hist
      this.choice = this.hist[this.period].choice
      console.log('hist', this.hist)
      setInterval(() => this.update(), 10)
      setInterval(() => this.measureEngagement(), 1000)
    })
    this.socket.on('paymentComplete', (msg) => {
      this.completeButtonDiv.style.display = 'none'
      this.paymentDiv.style.display = 'block'
      console.log('paymentComplete', msg)
      console.log('completeButtonDiv', this.completeButtonDiv.style.display)
      console.log('paymentDiv', this.paymentDiv.style.display)
    })
    this.socket.on('serverUpdateClient', (msg) => {
      this.joined = true
      if (this.state !== 'preSurvey' && msg.state === 'preSurvey') {
        this.startPreSurveyTime = Date.now()
      }
      if (this.step !== msg.step) {
        console.log('msg.ExperimentStarted', msg.experimentStarted)
        console.log('msg.period', msg.period)
        console.log('msg.step', msg.step)
      }
      if (this.period !== msg.period) {
        console.log('msg.period', msg.period)
        console.log('this.period', this.period)
        this.input.chosen = false
        console.log('this.input.chosen', this.input.chosen)
      }
      this.instructions.updateInstructions()
      this.step = msg.step
      this.experimentStarted = msg.experimentStarted
      this.practicePeriodsComplete = msg.practicePeriodsComplete
      this.numPracticePeriods = msg.numPracticePeriods
      this.countdown = msg.countdown
      this.period = msg.period
      this.hist = msg.hist
      this.bonus = msg.bonus
      this.winGiftCard = msg.winGiftCard
      this.giftValue = msg.giftValue
      this.endowment = msg.endowment
      this.completionURL = msg.completionURL
      this.giftURL = msg.giftURL
      this.state = msg.state
    })
  }

  update () {
    const msg = {
      id: this.id,
      study: this.study,
      session: this.session,
      period: this.period,
      step: this.step,
      stage: this.stage,
      currentChoice: this.choice, // change currentChoice to choice
      chosen: this.input.chosen
    }
    this.socket.emit('clientUpdate', msg)
    this.beginPracticePeriodsButton.style.display =
      (!this.practicePeriodsComplete && this.instructions.instructionsPage === 3)
        ? 'inline'
        : 'none'
    const showBeginExperimentButton =
      this.practicePeriodsComplete &&
      this.instructions.instructionsPage === 3 &&
      this.quizComplete
    this.beginExperimentButton.style.display =
      showBeginExperimentButton ? 'inline' : 'none'
    this.previousPageButton.style.display =
      this.instructions.instructionsPage === 1 ? 'none' : 'inline'
    this.nextPageButton.style.display =
      this.instructions.instructionsPage === 3 ? 'none' : 'inline'
    this.instructionsDiv.style.display = 'none'
    this.welcomeDiv.style.display = 'none'
    this.pleaseWaitDiv.style.display = 'none'
    this.preSurveyDiv.style.display = 'none'
    this.interfaceDiv.style.display = 'none'
    this.understandingQuiz.style.display = this.quizComplete ? 'none' : 'block'
    this.beginExperimentText.style.display = this.quizComplete ? 'block' : 'none'
    this.experimentCompleteDiv.style.display = 'none'
    if (this.joined && this.state === 'startup') {
      this.pleaseWaitDiv.style.display = 'block'
    }
    if (this.joined && this.state === 'welcome') {
      this.welcomeDiv.style.display = 'block'
    }
    if (this.joined && this.state === 'preSurvey') {
      this.preSurveyDiv.style.display = 'block'
    }
    if (this.joined && this.state === 'instructions') {
      this.instructionsDiv.style.display = 'block'
    }
    if (this.joined && this.state === 'interface') {
      this.interfaceDiv.style.display = 'flex'
    }
    if (this.joined && this.state === 'experimentComplete') {
      this.experimentCompleteDiv.style.display = 'block'
    }
  }

  measureEngagement () {
    this.engagement = this.renderer.drawing ? 1 : 0
    this.renderer.drawing = false
    this.time++
    const msg = {
      id: this.id,
      study: this.study,
      session: this.session,
      time: this.time,
      period: this.period,
      step: this.step,
      stage: this.stage,
      state: this.state,
      engagement: this.engagement
    }
    if (this.state === 'interface') {
      this.socket.emit('clientEngagement', msg)
    }
  }
}
