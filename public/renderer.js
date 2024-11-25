export class Renderer {
  constructor (client) {
    this.client = client
    this.input = client.input
    this.draw()
  }

  draw () {
    window.requestAnimationFrame(() => this.draw())
    if (this.client.input == null) return
    this.input = this.client.input
    this.drawing = true
    this.client.countdownText.innerHTML = `Countdown: ${this.client.countdown}`
    const feedback = this.client.step === 'feedback1' || this.client.step === 'feedback2'
    const practiceComplete = this.client.practicePeriodsComplete
    this.client.stageTitle.innerHTML = practiceComplete ? '' : `Practice ${this.client.period} `
    if (this.client.stage === 1) {
      this.client.stageTitle.innerHTML += 'Stage 1'
      this.client.currentStageText.innerHTML = 'Stage 1'
      this.client.feedbackStageText.innerHTML = 'Stage 1'
      this.client.probText1.innerHTML = '60%'
      this.client.probText2.innerHTML = '40%'
    } else {
      this.client.stageTitle.innerHTML += 'Stage 2'
      this.client.currentStageText.innerHTML = 'Stage 2'
      this.client.feedbackStageText.innerHTML = 'Stage 2'
      this.client.probText1.innerHTML = '100%'
      this.client.probText2.innerHTML = '0%'
    }
    const black = 'rgb(0, 0, 0, 0)'
    const green = 'rgb(0, 255, 0, 1)'
    const blue = 'rgb(0, 0, 255, 1)'
    this.client.dollarBox.style.outline = `solid 2vh ${black}`
    this.client.giftCardBox.style.outline = `solid 2vh ${black}`
    this.client.dollarBox.style.border = `solid 2vh ${black}`
    this.client.giftCardBox.style.border = `solid 2vh ${black}`
    if (this.client.input.clicked) {
      const choice = this.client.choice[this.client.stage]
      if (choice === 0) {
        this.client.dollarBox.style.border = `solid 2vh ${blue}`
        this.client.giftCardBox.style.border = `solid 2vh ${black}`
        this.client.choiceText.innerHTML = 'You chose the $1 bonus.'
        this.client.prizeText1.innerHTML = '$1 bonus'
        this.client.prizeText2.innerHTML = '$6 Starbucks gift card'
      } else {
        this.client.dollarBox.style.border = `solid 2vh ${black}`
        this.client.giftCardBox.style.border = `solid 2vh ${blue}`
        this.client.choiceText.innerHTML = 'You chose the $6 Starbucks gift card.'
        this.client.prizeText1.innerHTML = '$6 Starbucks gift card'
        this.client.prizeText2.innerHTML = '$1 bonus'
      }
    } else {
      this.client.choiceText.innerHTML = 'Please select an option.'
      this.client.prizeText1.innerHTML = 'the option you chose'
      this.client.prizeText2.innerHTML = 'the other option'
    }
    if (feedback) {
      this.client.stageTitle.innerHTML += ' Feedback'
      this.client.probTextBox.style.display = 'none'
      this.client.outcomeTextBox.style.display = 'block'
      const forced = this.client.forced[this.client.stage]
      const choice = this.client.choice[this.client.stage]
      const prize = forced ? 1 - choice : choice
      const prizeText = prize === 0 ? '$1 bonus' : '$6 Starbucks gift card'
      this.client.outcomeText.innerHTML = `${prizeText}`
      if (prize === 0) this.client.dollarBox.style.outline = `solid 2vh ${green}`
      if (prize === 1) this.client.giftCardBox.style.outline = `solid 2vh ${green}`
    } else {
      this.client.probTextBox.style.display = 'block'
      this.client.outcomeTextBox.style.display = 'none'
      this.client.dollarBox.style.outline = `solid 2vh ${black}`
      this.client.giftCardBox.style.outline = `solid 2vh ${black}`
    }
    this.writeOutcome()
  }

  writeOutcome = function () {
    const completeTextDiv = this.client.completeTextDiv
    const endowment = this.client.endowment
    const bonus = this.client.bonus
    const giftValue = this.client.giftValue
    const winPrize = this.client.winPrize
    const giftBitLinkDiv = this.client.giftBitLinkDiv
    const completionURL = this.client.completionURL
    const giftURL = this.client.giftURL
    const paymentLink = this.client.paymentLink
    const copyURLDiv = this.client.copyURLDiv
    const bonusDiv = this.client.bonusDiv
    completeTextDiv.innerHTML = ''
    completeTextDiv.innerHTML += `You will receive $${endowment.toFixed(0)} upon completion.<br>`
    const bonusTextA = `You won the $${bonus.toFixed(0)} bonus.`
    const bonusTextB = `You did not win the $${bonus.toFixed(0)} bonus.`
    const giftCardTextA = `You won the $${giftValue.toFixed(0)} Starbucks gift card.`
    const giftCardTextB = `You did not win the $${giftValue.toFixed(0)} Starbucks gift card.`
    completeTextDiv.innerHTML += winPrize ? bonusTextB : giftCardTextB
    completeTextDiv.innerHTML += '<br>'
    completeTextDiv.innerHTML += winPrize ? giftCardTextA : bonusTextA
    giftBitLinkDiv.innerHTML = ''
    console.log('winPrize', winPrize)
    console.log('completionURL', completionURL)
    console.log('giftURL', giftURL)
    paymentLink.href = completionURL
    paymentLink.target = '_self'
    copyURLDiv.style.display = 'none'
    bonusDiv.style.display = 'none'
    if (winPrize) {
      giftBitLinkDiv.innerHTML += `Your gift card URL: <br> ${giftURL}`
      paymentLink.target = '_blank'
      copyURLDiv.style.display = 'block'
    } else {
      bonusDiv.style.display = 'block'
    }
  }
}
