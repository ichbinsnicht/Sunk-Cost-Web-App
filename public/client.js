import { io } from './socketIo/socket.io.esm.min.js'
import { arange } from './math.js'}
import { Renderer } from './renderer.js'
import { Input } from './input.js'

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

    this.canvas = document.getElementById('canvas')
    this.context = canvas.getContext('2d')
  
    // variables
    this.state = 'startup'
    this.id = 'id'
    this.study = 'study'
    this.session = 'session'
    this.preSurveyQuestion = 0
    this.startPreSurveyTime = 0
    this.endPreSurveyTime = 0
    this.instructionsPage = 1
    this.clicked = false
    this.winPrize = 0
    this.giftURL = ''
    this.period = 1
    this.step = 'choice1'
    this.stage = 1
    this.countdown = 60 // seconds
    this.time = 0

    this.socket = io()
    // URL: http://localhost:3000?PROLIFIC_PID=1&STUDY_ID=GiftCard&SESSION_ID=Session
    this.urlParams = new URLSearchParams(window.location.search)
    this.urlParams.forEach((value, key) => {
      console.log('key', key)
      console.log('value', value)
      if (key === 'PROLIFIC_PID') id = value
      if (key === 'STUDY_ID') study = value
      if (key === 'SESSION_ID') session = value
    })
    this.renderer = new Renderer(this)
    this.input = new Input(this)
  }
}
