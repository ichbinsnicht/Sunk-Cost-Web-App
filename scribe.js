import fs from 'fs'
import { unique } from './public/math.js'

export class Scribe {
  constructor (server) {
    this.server = server
    this.preSurveyReady = false
    this.dateString = this.getDateString()

    this.createDataFile()
    this.createPaymentFile()
    this.createEngagementFile()
    this.createClickFile()
  }

  formatTwo (x) {
    let y = x.toFixed(0)
    if (y < 10) y = '0' + y
    return y
  }

  getDateString () {
    const d = new Date()
    const year = d.getFullYear()
    const month = this.formatTwo(d.getMonth() + 1)
    const day = this.formatTwo(d.getDate())
    const hours = this.formatTwo(d.getHours())
    const minutes = this.formatTwo(d.getMinutes())
    const seconds = this.formatTwo(d.getSeconds())
    const dateString = year + '-' + month + '-' + day + '-' + hours + minutes + seconds
    return dateString
  }

  createPreSurveyFile (msg) {
    this.preSurveyStream = fs.createWriteStream(`data/${this.dateString}-preSurvey.csv`)
    let csvString = Object.keys(msg).join(',')
    csvString += '\n'
    this.preSurveyStream.write(csvString)
    this.preSurveyReady = true
  }

  updatePreSurveyFile (msg) {
    const subjects = this.server.game.subjects
    const subject = subjects[msg.id]
    subject.preSurveyEndTime = new Date().getTime()
    if (!this.preSurveyReady) this.createPreSurveyFile(msg)
    let csvString = Object.values(msg).join(',')
    csvString += '\n'
    this.preSurveyStream.write(csvString)
  }

  createDataFile () {
    this.dataStream = fs.createWriteStream(`data/${this.dateString}-data.csv`)
    let csvString = 'study,session,startTime,surveyEndTime,quizEndTime,endTime,'
    csvString += 'timeTaken,period,id,possible,happen,'
    csvString += 'choice,endowment,bonus,giftValue,'
    csvString += 'winGiftCard,totalCost,earnings,giftAmount'
    csvString += '\n'
    this.dataStream.write(csvString)
  }

  updateDataFile (subject) {
    console.log('subject.period', subject.period)
    const endowment = this.server.game.endowment
    const bonus = this.server.game.bonus
    const giftValue = this.server.game.giftValue
    const possible = subject.hist[subject.period].possible
    const happen = subject.hist[subject.period].happen
    const choice = subject.hist[subject.period].choice === 1 ? 1 : 0
    let csvString = ''
    csvString += `${subject.study},${subject.session},${subject.startTime},`
    csvString += `${subject.preSurveyEndTime},${subject.quizEndTime},`
    csvString += `${subject.endTime},${subject.timeTaken},${subject.period},`
    csvString += `${subject.id},`
    csvString += `${possible},${happen},`
    csvString += `${choice},`
    csvString += `${endowment},${bonus},${giftValue},`
    csvString += `${subject.winGiftCard},${subject.totalCost},${subject.earnings},`
    csvString += `${subject.giftAmount}`
    csvString += '\n'
    this.dataStream.write(csvString)
    console.log('csvString', csvString)
  }

  createEngagementFile () {
    this.engagementStream = fs.createWriteStream(`data/${this.dateString}-engagement.csv`)
    let csvString = 'id,study,session,time,period,step,stage,state,engagement'
    csvString += '\n'
    this.engagementStream.write(csvString)
  }

  updateEngagementFile (msg) {
    let csvString = ''
    csvString += `${msg.id},${msg.study},${msg.session},${msg.time},`
    csvString += `${msg.period},${msg.step},${msg.stage},`
    csvString += `${msg.state},${msg.engagement}`
    csvString += '\n'
    this.engagementStream.write(csvString)
  }

  createClickFile () {
    this.clickStream = fs.createWriteStream(`data/${this.dateString}-click.csv`)
    let csvString = 'id,study,session,time,period,step,stage,state,countdown,mouseX,mouseY'
    csvString += '\n'
    this.clickStream.write(csvString)
  }

  updateClickFile (msg) {
    let csvString = ''
    csvString += `${msg.id},${msg.study},${msg.session},${msg.time},`
    csvString += `${msg.period},${msg.step},${msg.stage},`
    csvString += `${msg.state},${msg.countdown},${msg.mouseX},${msg.mouseY}`
    csvString += '\n'
    this.clickStream.write(csvString)
  }

  createPaymentFile () {
    this.paymentStream = fs.createWriteStream(`data/${this.dateString}-payment.csv`)
    const csvString = 'date,id,earnings,winGiftCard,link\n'
    this.paymentStream.write(csvString)
  }

  updatePaymentFile (subject) {
    console.log('subject.hist', subject.hist)
    const date = this.dateString
    const winGiftCard = subject.winGiftCard
    const earnings = subject.earnings
    if (winGiftCard) this.assignGift(subject)
    let csvString = `${date},${subject.id},${earnings.toFixed(0)},`
    csvString += `${winGiftCard},`
    csvString += `${subject.giftURL}\n`
    this.paymentStream.write(csvString)
  }

  updateBonusFile () {
    const subjects = Object.values(this.server.game.subjects)
    const readySubjects = subjects.filter(subject => subject.step === 'end')
    const bonus = this.server.game.bonus
    const studies = unique(subjects.map(subject => subject.study))
    studies.forEach(study => {
      let bonusString = ''
      const studySubjects = readySubjects.filter(subject => subject.study === study)
      studySubjects.forEach(subject => {
        const winGiftCard = subject.winGiftCard
        if (winGiftCard === 0) {
          const csvString = `${subject.id},${bonus.toFixed(2)}\n`
          bonusString += csvString
        }
      })
      fs.writeFileSync(`data/${this.dateString}-bonus-${study}.csv`, bonusString)
    })
  }

  assignGift (subject) {
    const links = fs.readFileSync('links/links.csv', 'utf8').split('\n')
    const ledger = fs.readFileSync('links/ledger.csv', 'utf8').split('\n')
      .filter(x => x.length > 0)
    const link = links.find(link => !ledger.includes(link))
    ledger.push(link)
    const remainingLinks = links.filter(link => !ledger.includes(link))
    fs.writeFileSync('links/ledger.csv', ledger.join('\n'))
    fs.writeFileSync('links/remaining.csv', remainingLinks.join('\n'))
    subject.giftURL = link
  }
}
