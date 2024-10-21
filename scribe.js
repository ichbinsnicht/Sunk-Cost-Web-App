import fs from 'fs'

export class Scribe {
  constructor (server) {
    this.server = server
    this.preSurveyReady = false
    this.dateString = this.getDateString()

    this.createDataFile()
    this.createPaymentFile()
    this.createBonusFile()
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

  createDataFile () {
    this.dataStream = fs.createWriteStream(`data/${this.dateString}-data.csv`)
    let csvString = 'study,session,subjectStartTime, subjectSurveyEndTime, subjectExperimentEndTime, period,practice,id,forced1,'
    csvString += 'forcedScore1,choice1,choice2,score1,score2,endowment,bonus,giftValue,totalScore,'
    csvString += 'outcomeRandom,winPrize,totalCost,earnings,giftAmount'
    csvString += '\n'
    this.dataStream.write(csvString)
  }

  updatePreSurveyFile (msg) {
    const subjects = this.server.game.subjects
    console.log('subjects', subjects)
    const subject = subjects[msg.id]
    subject.preSurveyEndTime = this.getDateString()
    if (!this.preSurveyReady) this.createPreSurveyFile(msg)
    let csvString = Object.values(msg).join(',')
    csvString += '\n'
    this.preSurveyStream.write(csvString)
  }

  updateDataFile (subject) {
    const endowment = this.server.endowment
    const bonus = this.server.bonus
    const giftValue = this.server.giftValue
    let csvString = ''
    csvString += `${subject.study},${subject.session},${subject.startTime},`
    csvString += `${subject.preSurveyEndTime},${subject.experimentEndTime},${subject.period},`
    csvString += `${1 - subject.practicePeriodsComplete},${subject.id},`
    csvString += `${subject.hist[subject.period].forced[1]},${subject.hist[subject.period].forcedScore[1]},`
    csvString += `${subject.hist[subject.period].choice[1]},${subject.hist[subject.period].choice[2]},`
    csvString += `${subject.hist[subject.period].score[1]},${subject.hist[subject.period].score[2]},`
    csvString += `${endowment},${bonus},${giftValue},${subject.totalScore},${subject.outcomeRandom},`
    csvString += `${subject.winPrize},${subject.totalCost},${subject.earnings},${subject.giftAmount}`
    csvString += '\n'
    this.dataStream.write(csvString)
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
    let csvString = 'id,study,session,time,period,step,stage,state,countdown,choiceX'
    csvString += '\n'
    this.clickStream.write(csvString)
  }

  updateClickFile (msg) {
    let csvString = ''
    csvString += `${msg.id},${msg.study},${msg.session},${msg.time},`
    csvString += `${msg.period},${msg.step},${msg.stage},`
    csvString += `${msg.state},${msg.countdown},${msg.choiceX}`
    csvString += '\n'
    this.clickStream.write(csvString)
  }

  createPaymentFile () {
    this.paymentStream = fs.createWriteStream(`data/${this.dateString}-payment.csv`)
    const csvString = 'date,id,earnings,winPrize,giftAmount,link\n'
    this.paymentStream.write(csvString)
  }

  updatePaymentFile (subject) {
    subject.experimentEndTime = this.getDateString()
    if (subject.winPrize) this.assignGift(subject)
    this.updateDataFile(subject)
    const date = subject.startTime.slice(0, 10)
    let csvString = `${date},${subject.id},${subject.earnings.toFixed(0)},`
    csvString += `${subject.winPrize},${subject.giftAmount},`
    csvString += `${subject.giftURL}\n`
    this.paymentStream.write(csvString)
  }

  createBonusFile () {
    this.bonusStream = fs.createWriteStream(`data/${this.dateString}-bonus.csv`)
  }

  updateBonusFile (subject) {
    if (subject.winPrize === 0) {
      const bonus = this.server.bonus
      const csvString = `${subject.id},${bonus.toFixed(2)}\n`
      this.bonusStream.write(csvString)
    }
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
    const giftValue = this.server.giftValue
    subject.giftAmount = subject.winPrize === 1 ? giftValue : 0
  }
}