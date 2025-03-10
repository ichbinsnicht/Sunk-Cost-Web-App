export class Renderer {
  constructor (client) {
    this.client = client
    this.input = client.input
    this.cardImageDiv = document.getElementById('cardImageDiv')
    this.dollarImageDiv = document.getElementById('dollarImageDiv')
    this.forcedText = document.getElementById('forcedText')
    this.unforcedText = document.getElementById('unforcedText')
    this.countdownText = document.getElementById('countdownText')
    this.choiceSpan = document.getElementById('choiceSpan')
    this.forcedSpan = document.getElementById('forcedSpan')
    this.unforcedSpan = document.getElementById('unforcedSpan')
    this.countdownSpan = document.getElementById('countdownSpan')
    this.draw()
  }

  draw () {
    window.requestAnimationFrame(() => this.draw())
    if (this.client.input == null) return // guard statement
    if (this.client.hist[this.client.period] == null) return // guard statement
    this.input = this.client.input
    this.drawing = true
    this.client.countdownText.innerHTML = `Countdown: ${this.client.countdown}`
    const feedback = this.client.step === 'feedback'
    this.client.stepTitle.innerHTML = 'Choice'
    this.forcedText.style.display = 'none'
    this.unforcedText.style.display = 'block'
    this.unforcedText.style.visibility = 'hidden'
    const forcedGiftCard = this.client.forcedGiftCard
    const giftString = '$6 gift card'
    const dollarString = '$1 bonus'
    this.forcedSpan.innerHTML = forcedGiftCard === 1 ? giftString : dollarString
    if (this.client.input.chosen) {
      this.countdownText.style.display = 'block'
      this.client.requestText.style.display = 'none'
      this.client.choiceText.style.display = 'block'
      const choice1 = this.client.choice === 1
      this.choiceSpan.innerHTML = choice1 ? giftString : dollarString
      this.unforcedSpan.innerHTML = choice1 ? giftString : dollarString
      this.cardImageDiv.style.outlineColor = choice1 ? 'rgb(0, 0, 255)' : 'rgba(0, 0, 0, 0)'
      this.dollarImageDiv.style.outlineColor = choice1 ? 'rgba(0, 0, 0, 0)' : 'rgb(0, 0, 255)'
    } else {
      this.countdownText.style.display = 'none'
      this.client.requestText.style.display = 'block'
      this.client.choiceText.style.display = 'none'
      this.cardImageDiv.style.outlineColor = 'rgba(0, 0, 0, 0)'
      this.dollarImageDiv.style.outlineColor = 'rgba(0, 0, 0, 0)'
    }
    if (feedback) {
      const choice1 = this.client.choice === 1
      this.choiceSpan.innerHTML = choice1 ? giftString : dollarString
      this.unforcedSpan.innerHTML = choice1 ? giftString : dollarString
      const forced = this.client.hist[this.client.period].forced
      const opposite = this.client.forcedGiftCard !== this.client.choice
      this.forcedText.style.display = forced && opposite ? 'block' : 'none'
      this.unforcedText.style.display = forced && opposite ? 'none' : 'block'
      this.unforcedText.style.visibility = 'visible'
      this.countdownText.style.display = 'block'
      this.client.stepTitle.innerHTML = ' Feedback'
      this.client.requestText.style.display = 'none'
      this.client.choiceText.style.display = 'block'
      if (forced && opposite) {
        const forced1 = this.client.forcedGiftCard === 1
        this.cardImageDiv.style.outlineColor = forced1 ? 'rgb(255, 0, 0)' : 'rgba(0, 0, 0, 0)'
        this.dollarImageDiv.style.outlineColor = forced1 ? 'rgba(0, 0, 0, 0)' : 'rgb(255, 0, 0)'
      } else {
        const choice1 = this.client.choice === 1
        this.cardImageDiv.style.outlineColor = choice1 ? 'rgb(0, 0, 255)' : 'rgba(0, 0, 0, 0)'
        this.dollarImageDiv.style.outlineColor = choice1 ? 'rgba(0, 0, 0, 0)' : 'rgb(0, 0, 255)'
      }
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
