import { Subject } from './subject.js'

export class Game {
  constructor (server) {
    this.server = server
    this.scribe = this.server.scribe
    this.numSubjects = 0
    this.subjects = {}
    this.numPeriods = 10 // 10 periods (minimize fatigue based on pilots), numPeriods > numPracticePeriods (internal: 1)
    this.choiceLength = 4 // 30 secs choice1 (lab: 15, internal: 3)
    this.baseEndowment = 2 // 2 (lab: 2, internal: 3)
    this.extraEndowment = 0
    this.endowment = this.baseEndowment + this.extraEndowment
    this.bonus = 1 // online: {4,6}
    this.giftValue = 6 // online: {6,9}
    setInterval(() => this.updateSubjects(), 1000)
  }

  createSubject (msg, socket) {
    this.subjects[msg.id] = new Subject(this, msg, socket)
    console.log(`subject ${msg.id} connected`)
  }

  updateSubjects () {
    const subjectsArray = Object.values(this.subjects)
    subjectsArray.forEach(subject => subject.update())
  }
}
