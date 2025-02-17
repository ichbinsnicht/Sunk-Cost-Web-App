import { Subject } from './subject.js'

export class Game {
  constructor (server) {
    this.server = server
    this.scribe = this.server.scribe
    this.numSubjects = 0
    this.subjects = {}
    this.numPracticePeriods = 2 // 2 practice periods (internal: 1)
    this.numPeriods = 1 // 1 period, numPeriods > numPracticePeriods (internal: 1)
    this.choice1Length = 15 // 30 secs choice1 (lab: 15, internal: 3)
    this.feedback1Length = 5 // 15 secs choice1 (lab: 5, internal: 3)
    this.choice2Length = 10 // 30 secs choice1 (lab: 15, internal: 3)
    this.feedback2Length = 10 // 15 secs choice1 (lab: 5, internal: 3)
    this.endowment = 2 //  online: 2 {internal: 3}
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
