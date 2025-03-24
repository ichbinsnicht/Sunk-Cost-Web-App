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
    let csvString = 'study,session,startTime,surveyEndTime,quizEndTime,experimentEndTime,'
    csvString += 'period,id,forced,forcedGiftCard,overruled,'
    csvString += 'choice,endowment,bonus,giftValue,'
    csvString += 'winGiftCard,totalCost,earnings,giftAmount'
    csvString += '\n'
    this.dataStream.write(csvString)
  }

  updateDataFile (subject) {
    console.log('subject.period', subject.period)
    if (subject.period >= subject.numPeriods) subject.experimentEndTime = this.getDateString()
    const endowment = this.server.game.endowment
    const bonus = this.server.game.bonus
    const giftValue = this.server.game.giftValue
    const forced = subject.hist[subject.period].forced ? 1 : 0
    const forcedGiftCard = subject.forcedGiftCard
    const choice = subject.hist[subject.period].choice
    const overruled = forcedGiftCard === choice ? 0 : forced
    let csvString = ''
    csvString += `${subject.study},${subject.session},${subject.startTime},`
    csvString += `${subject.preSurveyEndTime},${subject.quizEndTime},`
    csvString += `${subject.experimentEndTime},${subject.period},`
    csvString += `${subject.id},`
    csvString += `${forced},${forcedGiftCard},${overruled},`
    csvString += `${choice},`
    csvString += `${endowment},${bonus},${giftValue},`
    csvString += `${subject.winGiftCard},${subject.totalCost},${subject.earnings},${subject.giftAmount}`
    csvString += '\n'
    this.dataStream.write(csvString)
    console.log('csvString', csvString)
  }

  updatePreSurveyFile (msg) {
    const subjects = this.server.game.subjects
    const subject = subjects[msg.id]
    subject.preSurveyEndTime = this.getDateString()
    if (!this.preSurveyReady) this.createPreSurveyFile(msg)
    let csvString = Object.values(msg).join(',')
    csvString += '\n'
    this.preSurveyStream.write(csvString)
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
    csvString += `${msg.state},${msg.countdown},${msg.mouseX}`
    csvString += '\n'
    this.clickStream.write(csvString)
  }

  createPaymentFile () {
    this.paymentStream = fs.createWriteStream(`data/${this.dateString}-payment.csv`)
    const csvString = 'date,id,period,earnings,winGiftCard,link\n'
    this.paymentStream.write(csvString)
  }

  updatePaymentFile (subject) {
    if (subject.winGiftCard) this.assignGift(subject)
    const date = subject.startTime.slice(0, 10)
    const winGiftCard = subject.hist[subject.randomPeriod].winGiftCard
    const earnings = subject.hist[subject.randomPeriod].earnings
    let csvString = `${date},${subject.id},${subject.randomPeriod},${earnings.toFixed(0)},`
    csvString += `${winGiftCard},`
    csvString += `${subject.giftURL}\n`
    this.paymentStream.write(csvString)
  }

  createBonusFile () {
    this.bonusStream = fs.createWriteStream(`data/${this.dateString}-bonus.csv`)
  }

  updateBonusFile (subject) {
    const winGiftCard = subject.hist[subject.randomPeriod].winGiftCard
    if (winGiftCard === 0) {
      const bonus = this.server.game.bonus
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
  }
}
