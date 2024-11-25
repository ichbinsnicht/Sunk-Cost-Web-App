import { arange2 } from './public/math.js'

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
    this.practicePeriodsComplete = false
    this.step = 'choice1'
    this.stage = 1
    this.state = 'startup'
    this.period = 1
    this.countdown = this.game.choice1Length
    this.numPeriods = this.game.numPeriods
    this.numPracticePeriods = this.game.numPracticePeriods
    this.score1 = 0
    this.score2 = 0
    this.winPrize = 0
    this.giftAmount = 0
    this.giftURL = ''
    this.totalCost = 0
    this.earnings = 0
    this.clicked = false
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
    arange2(1, nPeriods).forEach(i => {
      const forced1 = practice * (i % 2 === 0) + (1 - practice) * (Math.random() < 0.4)
      this.hist[i] = {
        choice: { 1: 0, 2: 0 },
        ready: { 1: false, 2: false },
        score: { 1: 0, 2: 0 },
        forced: { 1: forced1, 2: 0 }
      }
    })
    console.log('this.hist', this.hist)
    console.log('nPeriods', nPeriods)
    console.log('nPaid', nPaid)
    console.log('nPractice', nPractice)
  }

  calculateOutcome () {
    const currentHist = this.hist[this.period]
    this.score1 = currentHist.score[1]
    this.score2 = currentHist.score[2]
    this.winPrize = this.selectedStage === 1 ? this.score1 : this.score2
    this.earnings = this.game.endowment + this.game.bonus * (1 - this.winPrize)
  }

  update () { // add presurvey
    if (this.state === 'startup') {
      this.state = 'welcome'
    }
    if (this.state === 'interface') {
      this.countdown = Math.max(this.countdown - 1, 0)
      if (this.step === 'choice1' && this.countdown <= 0 && this.clicked) { // end choice1
        this.countdown = this.game.feedback1Length
        this.step = 'feedback1'
      }
      if (this.step === 'feedback1' && this.countdown <= 0) { // end feedback1
        this.countdown = this.game.choice2Length
        this.step = 'choice2'
      }
      if (this.step === 'choice2' && this.countdown <= 0 && this.clicked) { // end choice2
        this.calculateOutcome()
        this.countdown = this.game.feedback2Length
        this.step = 'feedback2'
      }
      if (this.step === 'feedback2' && this.countdown <= 0) { // end feedback2
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
            this.step = 'choice1'
            this.countdown = this.game.choice1Length
            this.setupHist()
          }
        } else {
          this.countdown = this.game.choice1Length
          this.period += 1
          this.step = 'choice1'
        }
      }
      this.stage = this.step === 'choice1' || this.step === 'feedback1' ? 1 : 2
    }
  }
}
