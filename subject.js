import { arange2, choose } from './public/math.js'

export class Subject {
  constructor (game, msg, socket) {
    this.game = game
    this.game.numSubjects += 1
    this.id = msg.id
    this.study = msg.study
    this.session = msg.session
    this.socket = socket
    this.startTime = this.game.server.scribe.getDateString()
    this.preSurveyEndTime = ''
    this.experimentEndTime = ''
    this.preSurveySubmitted = false
    this.instructionsComplete = false
    this.experimentStarted = false
    this.practicePeriodsComplete = true
    this.step = 'choice'
    this.state = 'startup'
    this.period = 1
    this.countdown = this.game.choice1Length
    this.numPeriods = this.game.numPeriods
    this.numPracticePeriods = this.game.numPracticePeriods
    this.winGiftCard = 0
    this.giftAmount = 0
    this.giftURL = ''
    this.totalCost = 0
    this.earnings = 0
    this.chosen = false
    this.forcedDirection = choose([0, 1]) // 0 - money, 1 - gift card
    this.hist = {}
    this.selectedStage = Math.random() < 0.5 ? 1 : 2 // make sure to use it
    this.setupHist()
  }

  setupHist () {
    const practice = 1 * !this.practicePeriodsComplete
    console.log('practice', practice)
    console.log('this.practicePeriodsComplete', this.practicePeriodsComplete)
    const nPractice = this.game.numPracticePeriods
    const nPaid = this.game.numPeriods
    const nPeriods = practice === 1 ? nPractice : nPaid
    arange2(1, nPeriods).forEach(period => {
      this.hist[period] = {
        choice: 0,
        ready: false,
        forced: Math.random() < 0.4
      }
    })
    console.log('this.hist', this.hist)
    console.log('nPeriods', nPeriods)
    console.log('nPaid', nPaid)
    console.log('nPractice', nPractice)
  }

  calculateOutcome () {
    const choice = this.hist[this.period].choice
    const forced = this.hist[this.period].forced
    this.winGiftCard = forced ? this.forcedDirection : choice
    this.earnings = this.game.endowment + this.game.bonus * (1 - this.winGiftCard)
  }

  update () { // add presurvey
    if (this.state === 'startup') {
      this.state = 'welcome'
    }
    if (this.state === 'interface') {
      if (this.chosen) {
        this.countdown = Math.max(this.countdown - 1, 0)
      }
      if (this.step === 'choice' && this.countdown <= 0) { // end choice1
        this.calculateOutcome()
        this.countdown = this.game.feedback1Length
        this.step = 'feedback'
      }
      if (this.step === 'feedback' && this.countdown <= 0) { // end feedback2
        if (this.practicePeriodsComplete === false) {
          this.game.server.scribe.updateDataFile(this)
        }
        const maxPeriod = this.experimentStarted ? this.numPeriods : this.numPracticePeriods
        console.log('this.period', this.period)
        console.log('maxPeriod', maxPeriod)
        console.log('this.numPeriods', this.numPeriods)
        console.log('this.numPracticePeriods', this.numPracticePeriods)
        console.log('experimentStarted', this.experimentStarted)
        if (this.period >= maxPeriod) {
          if (this.experimentStarted) {
            this.step = 'end'
            this.state = 'experimentComplete'
          } else {
            this.state = 'instructions'
            this.practicePeriodsComplete = true
            this.period = 1
            this.step = 'choice'
            this.countdown = this.game.choice1Length
            this.setupHist()
          }
        } else {
          this.countdown = this.game.choice1Length
          this.period += 1
          this.step = 'choice'
        }
      }
    }
  }
}
