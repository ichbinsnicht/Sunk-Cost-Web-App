import { arange2 } from './public/math.js'

export class Game {
  constructor (server) {
    this.server = server
    this.scribe = this.server.scribe
    this.numSubjects = 0
    this.subjects = {}
    this.numPracticePeriods = 1 // 3 practice periods (internal: 1)
    this.numPeriods = 1 // 1 period, numPeriods > numPracticePeriods (internal: 1)
    this.choice1Length = 10 // 10 secs choice1 (lab: 15, internal: 3)
    this.feedback1Length = 5 // 5 secs choice1 (lab: 5, internal: 3)
    this.choice2Length = 10 // 10 secs choice1 (lab: 15, internal: 3)
    this.feedback2Length = 5 // 5 secs choice1 (lab: 5, internal: 3)
    this.endowment = 2 //  online: 2 {internal: 3}
    this.bonus = 1 // online: {4,6}
    this.giftValue = 6 // online: {6,9}
    setInterval(() => this.updateSubjects(), 1000)
  }

  setupHist (subject) {
    const nPeriods = Math.max(this.numPracticePeriods, this.numPeriods)
    arange2(1, nPeriods).forEach(i => {
      subject.hist[i] = {
        choice: { 1: 0, 2: 0 },
        score: { 1: 0, 2: 0 },
        forcedScore: { 1: Math.random() * 0.5, 2: 0 },
        forced: { 1: 1 * (Math.random() > 0.5), 2: 0 },
        outcomeRandom: Math.random()
      }
    })
  }

  createSubject (msg, socket) {
    this.numSubjects += 1
    const subject = {
      id: msg.id,
      study: msg.study,
      session: msg.session,
      socket,
      startTime: this.scribe.getDateString(),
      preSurveyEndTime: '',
      experimentEndTime: '',
      preSurveySubmitted: false,
      instructionsComplete: false,
      experimentStarted: false,
      practicePeriodsComplete: false,
      step: 'choice1',
      stage: 1,
      state: 'startup',
      period: 1,
      countdown: this.choice1Length,
      choice1: 0,
      investment2: 0,
      outcomeRandom: 0,
      winPrize: 0,
      giftAmount: 0,
      giftURL: '',
      totalCost: 0,
      earnings: 0,
      clicked: false,
      hist: {}
    }
    this.subjects[msg.id] = subject
    this.setupHist(subject)
    console.log(`subject ${msg.id} connected`)
  }

  calculateOutcome () {
    Object.values(this.subjects).forEach(subject => {
      const currentHist = subject.hist[subject.period]
      subject.outcomeRandom = currentHist.outcomeRandom
      subject.score1 = currentHist.score[1]
      subject.score2 = currentHist.score[2]
      subject.totalScore = currentHist.score[1] + currentHist.score[2]
      subject.winPrize = (subject.totalScore > currentHist.outcomeRandom) * 1
      subject.earnings = this.endowment + this.bonus * (1 - subject.winPrize)
    })
  }

  update (subject) { // add presurvey
    if (subject.state === 'startup') {
      subject.state = 'welcome'
    }
    if (subject.state === 'interface') {
      subject.countdown = Math.max(subject.countdown - 1, 0)
      if (subject.step === 'choice1' && subject.countdown <= 0 && subject.clicked) { // end choice1
        subject.countdown = this.feedback1Length
        subject.step = 'feedback1'
      }
      if (subject.step === 'feedback1' && subject.countdown <= 0) { // end feedback1
        subject.countdown = this.choice2Length
        subject.step = 'choice2'
      }
      if (subject.step === 'choice2' && subject.countdown <= 0 && subject.clicked) { // end choice2
        this.calculateOutcome()
        subject.countdown = this.feedback2Length
        subject.step = 'feedback2'
      }
      if (subject.step === 'feedback2' && subject.countdown <= 0) { // end feedback2
        if (subject.practicePeriodsComplete === false) {
          this.scribe.updateDataFile(subject)
        }
        const maxPeriod = subject.experimentStarted ? this.numPeriods : this.numPracticePeriods
        if (subject.period >= maxPeriod) {
          if (subject.experimentStarted) {
            subject.step = 'end'
            subject.state = 'experimentComplete'
          } else {
            subject.state = 'instructions'
            subject.practicePeriodsComplete = true
            subject.period = 1
            subject.step = 'choice1'
            subject.countdown = this.choice1Length
          }
        } else {
          subject.countdown = this.choice1Length
          subject.period += 1
          subject.step = 'choice1'
        }
      }
      subject.stage = subject.step === 'choice1' || subject.step === 'feedback1' ? 1 : 2
    }
  }

  updateSubjects () {
    const subjectsArray = Object.values(this.subjects)
    subjectsArray.forEach(subject => this.update(subject))
  }
}
