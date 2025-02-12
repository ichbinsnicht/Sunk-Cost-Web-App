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
    const practiceComplete = this.client.practicePeriodsComplete
    this.client.stageTitle.innerHTML = practiceComplete ? '' : `Practice ${this.client.period} `
    if (this.client.stage === 1) {
      this.client.stageTitle.innerHTML += 'Stage 1'
      this.client.currentStageText1.innerHTML = 'Stage 1'
      this.client.currentStageText2.innerHTML = 'Stage 1'
      this.client.currentStageText3.innerHTML = 'Stage 1'
      this.client.feedbackStageText.innerHTML = 'Stage 1 Feedback'
      this.client.probText1.innerHTML = '60%'
      this.client.probText2.innerHTML = '40%'
    } else {
      this.client.stageTitle.innerHTML += 'Stage 2'
      this.client.currentStageText1.innerHTML = 'Stage 2'
      this.client.currentStageText2.innerHTML = 'Stage 2'
      this.client.currentStageText3.innerHTML = 'Stage 2'
      this.client.feedbackStageText.innerHTML = 'Stage 2'
      this.client.probText1.innerHTML = '100%'
      this.client.probText2.innerHTML = '0%'
    }
    if (this.client.input.chosen) {
      const choice = this.client.choice
      this.client.requestText.style.display = 'none'
      this.client.choiceText.style.display = 'block'
      if (choice === 0) {
        this.client.choseItemText.innerHTML = '$1 bonus'
        this.client.prizeText1.innerHTML = '$1 bonus'
        this.client.prizeText2.innerHTML = '$6 Starbucks gift card'
      } else {
        this.client.choseItemText.innerHTML = '$6 Starbucks gift card'
        this.client.prizeText1.innerHTML = '$6 Starbucks gift card'
        this.client.prizeText2.innerHTML = '$1 bonus'
      }
    } else {
      this.client.requestText.style.display = 'block'
      this.client.choiceText.style.display = 'none'
      this.client.prizeText1.innerHTML = 'the option you chose'
      this.client.prizeText2.innerHTML = 'the other option'
    }
    if (feedback) {
      this.client.stageTitle.innerHTML += ' Feedback'
      this.client.probTextBox.style.display = 'none'
      this.client.outcomeTextBox.style.display = 'block'
      this.client.requestText.style.display = 'none'
      this.client.choiceText.style.display = 'block'
      this.client.wonTextBox.style.display = 'block'
      const choice = this.client.choice
      const prize = choice
      const prizeText = prize === 0 ? '$1 bonus' : '$6 Starbucks gift card'
      this.client.outcomeText.innerHTML = `${prizeText}`
      this.client.wonItemText.innerHTML = `${prizeText}`
      this.client.wonItemText.style.color = 'rgb(0, 136, 255)'
      this.client.outcomeText.style.color = 'rgb(255, 0, 0)'
    } else {
      this.client.probTextBox.style.display = 'block'
      this.client.outcomeTextBox.style.display = 'none'
      this.client.wonTextBox.style.display = 'none'
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
    completeTextDiv.innerHTML += `You will get $${endowment.toFixed(0)} upon completion.<br>`
    const bonusTextA = `You won the $${bonus.toFixed(0)} bonus.`
    const bonusTextB = `You did not win the $${bonus.toFixed(0)} bonus.`
    const giftCardTextA = `You won the $${giftValue.toFixed(0)} Starbucks gift card.`
    const giftCardTextB = `You did not win the $${giftValue.toFixed(0)} Starbucks gift card.`
    completeTextDiv.innerHTML += winPrize ? bonusTextB : giftCardTextB
    completeTextDiv.innerHTML += '<br>'
    completeTextDiv.innerHTML += winPrize ? giftCardTextA : bonusTextA
    giftBitLinkDiv.innerHTML = ''
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
