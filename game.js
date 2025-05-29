import { Subject } from './subject.js'

export class Game {
  constructor (server) {
    this.server = server
    this.scribe = this.server.scribe
    this.numSubjects = 0
    this.subjects = {}
    this.numPeriods = 2 // 2 periods
    this.choiceLength = 10 // 30 secs choice1 (lab: 15, internal: 3)
    this.endowment = 2 // 2 (lab: 2, internal: 3)
    this.bonus = 0.25 // online: {4,6}
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
