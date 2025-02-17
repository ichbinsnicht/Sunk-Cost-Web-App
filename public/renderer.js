export class Renderer {
  constructor (client) {
    this.client = client
    this.input = client.input
    this.draw()
  }

  draw () {
    window.requestAnimationFrame(() => this.draw())
    if (this.client.input == null) return // guard statement
    if (this.client.hist[this.client.period] == null) return // guard statement
    const sliderMin = this.client.hist[this.client.period].min
    const sliderMax = this.client.hist[this.client.period].max
    document.documentElement.style.setProperty('--sliderMin', `${sliderMin}%`)
    document.documentElement.style.setProperty('--sliderMax', `${sliderMax}%`)
    this.input = this.client.input
    this.drawing = true
    this.client.countdownText.innerHTML = `Countdown: ${this.client.countdown}`
    const feedback = this.client.step === 'feedback'
    this.client.stepTitle.innerHTML = 'Choice'
    if (this.client.input.chosen) {
      this.client.requestText.style.display = 'none'
      this.client.choiceText.style.display = 'block'
      this.client.probTextGiftCard.innerHTML = `${(this.client.choice * 100).toFixed(0)}`
      this.client.probTextBonus.innerHTML = `${(100 - this.client.choice * 100).toFixed(0)}`
    } else {
      this.client.requestText.style.display = 'block'
      this.client.choiceText.style.display = 'none'
    }
    if (feedback) {
      this.client.stepTitle.innerHTML = ' Feedback'
      this.client.requestText.style.display = 'none'
      this.client.choiceText.style.display = 'block'
      this.client.wonTextBox.style.display = 'block'
      const choice = this.client.choice
      const prize = choice
      const prizeText = prize === 0 ? '$1 bonus' : '$6 Starbucks gift card'
      this.client.wonItemText.innerHTML = `${prizeText}`
      this.client.wonItemText.style.color = 'rgb(0, 136, 255)'
    }
    this.writeOutcome()
  }

  writeOutcome = function () {
    const completeTextDiv = this.client.completeTextDiv
    const endowment = this.client.endowment
    const bonus = this.client.bonus
    const giftValue = this.client.giftValue
    const winGiftCard = this.client.winGiftCard
    const giftBitLinkDiv = this.client.giftBitLinkDiv
    const completionURL = this.client.completionURL
    const giftURL = this.client.giftURL
    const paymentLink = this.client.paymentLink
    const copyURLDiv = this.client.copyURLDiv
    const bonusDiv = this.client.bonusDiv
    completeTextDiv.innerHTML = ''
    completeTextDiv.innerHTML += `You will get $${endowment.toFixed(0)} upon completion.<br>`
    const bonusTextA = `You won the $${bonus.toFixed(0)} bonus.`
    const bonusTextB = `You did not win the $${bonus.toFixed(0)} bonus.`
    const giftCardTextA = `You won the $${giftValue.toFixed(0)} Starbucks gift card.`
    const giftCardTextB = `You did not win the $${giftValue.toFixed(0)} Starbucks gift card.`
    completeTextDiv.innerHTML += winGiftCard ? bonusTextB : giftCardTextB
    completeTextDiv.innerHTML += '<br>'
    completeTextDiv.innerHTML += winGiftCard ? giftCardTextA : bonusTextA
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
