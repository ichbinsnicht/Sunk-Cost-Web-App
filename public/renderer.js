export class Renderer {
  constructor (client) {
    this.client = client
    this.input = client.input
    this.cardImageDiv = document.getElementById('cardImageDiv')
    this.dollarImageDiv = document.getElementById('dollarImageDiv')
    this.forcedText = document.getElementById('forcedText')
    this.countdownText = document.getElementById('countdownText')
    this.forcedSpan = document.getElementById('forcedSpan')
    this.choiceSpan = document.getElementById('choiceSpan')
    this.countdownSpan = document.getElementById('choiceSpan')
    this.countdownText = document.getElementById('countdownText')
    this.requestText = document.getElementById('requestText')
    this.choiceText = document.getElementById('choiceText')
    this.stepTitle = document.getElementById('stepTitle')
    this.draw()
  }

  draw () {
    window.requestAnimationFrame(() => this.draw())
    if (!this.client.joined) return // guard statement
    if (this.client.input == null) return // guard statement
    if (this.client.hist[this.client.period] == null) return // guard statement
    this.input = this.client.input
    this.drawing = true
    const chosen = this.client.input.chosen || this.client.step !== 'choice'
    const step = this.client.step
    const forceDir = this.client.hist[this.client.period].forceDir
    const giftString = '$6 gift card'
    const dollarString = '$1 bonus'
    const forced = this.client.hist[this.client.period].forced
    const redColor = !forced || step === 'computer' ? 'rgba(0, 0, 0, 0)' : 'rgba(255, 0, 0, 1)'
    const forbidden0 = forceDir === 1 && forced
    const forbidden1 = forceDir === 0 && forced
    const choice1 = this.client.choice === 1 && chosen
    this.countdownText.innerHTML = `Countdown: ${this.client.countdown}`
    this.stepTitle.innerHTML = ['computer', 'choice'].includes(step)
      ? 'Choice'
      : 'Feedback'
    this.forcedSpan.innerHTML = forceDir === 1 ? dollarString : giftString
    this.choiceSpan.innerHTML = choice1 ? giftString : dollarString
    this.dollarImageDiv.style.outlineColor = forbidden0 ? redColor : 'rgba(0, 0, 0, 0)'
    this.cardImageDiv.style.outlineColor = forbidden1 ? redColor : 'rgba(0, 0, 0, 0)'
    this.forcedText.style.display = forced ? 'block' : 'none'
    this.requestText.style.display = 'none'
    this.choiceText.style.display = 'none'
    this.countdownText.style.display = 'none'
    if (this.client.step === 'choice') {
      this.requestText.style.display = chosen ? 'none' : 'block'
      this.countdownText.style.display = chosen ? 'block' : 'none'
      this.choiceText.style.display = chosen ? 'block' : 'none'
    }
    if (this.client.step === 'feedback') {
      this.choiceText.style.display = 'block'
      this.countdownText.style.display = 'block'
    }
    this.writeOutcome()
  }

  writeOutcome = function () {
    if (this.client.hist[this.client.randomPeriod] == null) return // guard statement
    const completeTextDiv = this.client.completeTextDiv
    const forced = this.client.hist[this.client.randomPeriod].forced
    const winGiftCard = this.client.hist[this.client.randomPeriod].winGiftCard
    const cost = forced ? this.client.extraEndowment : 0
    const baseEndowment = this.client.baseEndowment
    const bonus = this.client.bonus
    const extraMoney = this.client.extraEndowment - cost + (1 - winGiftCard) * bonus
    const giftValue = this.client.giftValue
    const giftBitLinkDiv = this.client.giftBitLinkDiv
    const completionURL = this.client.completionURL
    const giftURL = this.client.giftURL
    const paymentLink = this.client.paymentLink
    const copyURLDiv = this.client.copyURLDiv
    const bonusDiv = this.client.bonusDiv
    completeTextDiv.innerHTML = ''
    completeTextDiv.innerHTML += `You will get $${baseEndowment.toFixed(0)} upon completion.<br>`
    const bonusText = `You will also receive a $${extraMoney.toFixed(0)} Prolific bonus.<br>`
    const giftCardTextA = `You won the $${giftValue.toFixed(0)} Starbucks gift card.`
    const giftCardTextB = `You did not win the $${giftValue.toFixed(0)} Starbucks gift card.`
    completeTextDiv.innerHTML += extraMoney > 0 ? bonusText : ''
    completeTextDiv.innerHTML += winGiftCard ? giftCardTextA : giftCardTextB
    giftBitLinkDiv.innerHTML = ''
    paymentLink.href = completionURL
    paymentLink.target = '_self'
    copyURLDiv.style.display = 'none'
    bonusDiv.style.display = 'none'
    if (winGiftCard) {
      giftBitLinkDiv.innerHTML += `Your gift card URL: <br> ${giftURL}`
      paymentLink.target = '_blank'
      copyURLDiv.style.display = 'block'
    } else {
      bonusDiv.style.display = 'block'
    }
  }
}
