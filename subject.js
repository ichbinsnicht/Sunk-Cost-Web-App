import { arange2 } from './public/math.js'
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
    this.bonusPercent = 100
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
        possible: Math.random() < 0.5 || period > 1 ? 1 : 0,
        happen: 0
      }
    })
  }

  calculateOutcome () {
    const happen1 = this.hist[1].happen
    const happen2 = this.hist[2].happen
    const probWinGiftCard = 40 * (happen1 + happen2)
    this.winGiftCard = Math.random() < probWinGiftCard / 100 ? 1 : 0
    this.earnings = this.game.endowment + this.game.bonus * (1 - this.winGiftCard)
    const giftValue = this.game.giftValue
    this.giftAmount = this.winGiftCard === 1 ? giftValue : 0
  }

  nextPeriod () {
    console.log(`Period ${this.period} complete`)
    if (this.period >= this.numPeriods) {
      this.endTime = new Date().getTime()
      this.timeTaken = this.endTime - this.startTime
      this.calculateOutcome()
    }
    this.game.server.scribe.updateDataFile(this)
    if (this.period >= this.numPeriods) {
      this.step = 'end'
      this.state = 'experimentComplete'
      this.game.server.scribe.updatePaymentFile(this)
      this.game.server.scribe.updateBonusFile(this)
      const reply = { id: this.id }
      if (this.winGiftCard === 1) {
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
    const chosen = this.hist[this.period].choice !== 0
    if (this.state === 'interface' && chosen) {
      if (this.countdown === 1) {
        const choice = this.hist[this.period].choice
        const possible = this.hist[this.period].possible
        const happen = choice === 1 && possible === 1 ? 1 : 0
        this.hist[this.period].happen = happen
      }
      this.countdown = Math.max(this.countdown - 1, 0)
    }
  }
}
