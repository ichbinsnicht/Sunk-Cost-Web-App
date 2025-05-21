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
    this.startTime = new Date().getTime()
    this.endTime = 0
    this.timeTaken = 0
    this.preSurveyEndTime = 0
    this.quizEndTime = 0
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
    this.hist = {}
    this.selectedStage = Math.random() < 0.5 ? 1 : 2 // make sure to use it
    this.setupHist()
  }

  setupHist () {
    const practice = 1 * !this.practicePeriodsComplete
    console.log('practice', practice)
    console.log('this.practicePeriodsComplete', this.practicePeriodsComplete)
    arange2(1, this.numPeriods).forEach(period => {
      const forcing =
        Math.random() < 0.5 &&
        period > 1 &&
        period < this.numPeriods &&
        !this.hist[period - 1].forced
      const forceDir = forcing ? choose([-1, 0, 1]) : 0
      this.hist[period] = {
        choice: 0,
        ready: false,
        forced: forceDir !== 0,
        forceDir,
        winGiftCard: 0,
        earnings: 0
      }
    })
  }

  calculateOutcome () {
    const choice = this.hist[this.period].choice
    const forced = this.hist[this.period].forced
    const cost = forced ? this.game.extraEndowment : 0
    this.winGiftCard = choice
    this.earnings = this.game.endowment + this.game.bonus * (1 - this.winGiftCard) - cost
    this.hist[this.period].winGiftCard = this.winGiftCard
    this.hist[this.period].earnings = this.earnings
    const giftValue = this.game.giftValue
    this.giftAmount = this.winGiftCard === 1 ? giftValue : 0
  }

  nextPeriod () {
    if (this.period >= this.numPeriods) {
      this.endTime = new Date().getTime()
      this.timeTaken = this.endTime - this.startTime
    }
    this.game.server.scribe.updateDataFile(this)
    if (this.period >= this.numPeriods) {
      this.step = 'end'
      this.state = 'experimentComplete'
      this.game.server.scribe.updatePaymentFile(this)
      this.game.server.scribe.updateBonusFile(this)
      const reply = { id: this.id }
      const winGiftCard = this.hist[this.randomPeriod].winGiftCard
      if (winGiftCard) {
        sendMesssage(this.id, `Your gift card is here: ${this.giftURL}`)
      }
      this.socket.emit('paymentComplete', reply)
    } else {
      this.countdown = this.game.choiceLength
      this.period += 1
      this.step = 'choice'
    }
  }

  onQuizComplete () {
    this.quizEndTime = new Date().getTime()
    this.quizSubmitted = true
  }

  update () { // add presurvey
    if (this.state === 'startup') {
      this.state = 'welcome'
    }
    if (this.state === 'interface' && this.chosen) {
      if (this.countdown === 1) {
        this.calculateOutcome()
      }
      this.countdown = Math.max(this.countdown - 1, 0)
    }
  }
}
