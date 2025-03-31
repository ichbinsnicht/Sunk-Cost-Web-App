import { arange2, choose } from './public/math.js'
import { sendMesssage } from './prolific.js'

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
    this.quizEndTime = ''
    this.experimentEndTime = ''
    this.quizSubmitted = false
    this.preSurveySubmitted = false
    this.instructionsComplete = false
    this.practicePeriodsComplete = true
    this.step = 'choice'
    this.state = 'startup'
    this.period = 1
    this.countdown = this.game.choiceLength
    this.numPeriods = this.game.numPeriods
    this.numPracticePeriods = this.game.numPracticePeriods
    this.winGiftCard = 0
    this.giftAmount = 0
    this.giftURL = ''
    this.totalCost = 0
    this.earnings = 0
    this.randomPeriod = choose(arange2(1, this.numPeriods))
    this.chosen = false
    this.forcedGiftCard = 1 // choose([0, 1])  // 0 - money, 1 - gift card
    this.hist = {}
    this.selectedStage = Math.random() < 0.5 ? 1 : 2 // make sure to use it
    this.setupHist()
  }

  setupHist () {
    const practice = 1 * !this.practicePeriodsComplete
    console.log('practice', practice)
    console.log('this.practicePeriodsComplete', this.practicePeriodsComplete)
    arange2(1, this.numPeriods).forEach(period => {
      this.hist[period] = {
        choice: 0,
        ready: false,
        forced: Math.random() < 0.4,
        winGiftCard: 0,
        earnings: 0
      }
    })
    console.log('this.hist', this.hist)
  }

  calculateOutcome () {
    const choice = this.hist[this.period].choice
    const forced = this.hist[this.period].forced
    this.winGiftCard = forced ? this.forcedGiftCard : choice
    this.earnings = this.game.endowment + this.game.bonus * (1 - this.winGiftCard)
    this.hist[this.period].winGiftCard = this.winGiftCard
    this.hist[this.period].earnings = this.earnings
    const giftValue = this.game.giftValue
    this.giftAmount = this.winGiftCard === 1 ? giftValue : 0
  }

  nextPeriod () {
    this.game.server.scribe.updateDataFile(this)
    if (this.period >= this.numPeriods) {
      this.step = 'end'
      this.state = 'experimentComplete'
      this.game.server.scribe.updatePaymentFile(this)
      this.game.server.scribe.updateBonusFile(this)
      const reply = { id: this.id }
      if (this.winGiftCard) {
        sendMesssage(this.id, `Your gift card is here: ${this.giftURL}`)
      }
      this.socket.emit('paymentComplete', reply)
      return
    }
    this.countdown = this.game.choiceLength
    this.period += 1
    this.step = 'choice'
    console.log('this.period', this.period)
    console.log('this.numPeriods', this.numPeriods)
  }

  onQuizComplete () {
    this.quizEndTime = this.game.server.scribe.getDateString()
    this.quizSubmitted = true
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
        this.countdown = this.game.feedbackLength
        this.step = 'feedback'
      }
    }
  }
}
