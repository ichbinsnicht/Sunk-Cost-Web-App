import { arange1 } from './math.js'

export class Renderer {
  constructor (client) {
    this.client = client
    this.input = client.input
    console.log('beforeCardImageDiv', this.beforeCardImageDiv)
    console.log('afterCardImageDiv', this.afterCardImageDiv)
    this.countdownText = document.getElementById('countdownText')
    this.countdownSpan = document.getElementById('choiceSpan')
    this.investmentYesText = document.getElementById('investmentYesText')
    this.investmentNoText = document.getElementById('investmentNoText')
    this.requestText = document.getElementById('requestText')
    this.stepTitle = document.getElementById('stepTitle')
    this.sliderTargetSpan = document.getElementById('sliderTargetSpan')
    this.sliderValueSpan = document.getElementById('sliderValueSpan')
    this.bonusTicketsEarnedSpan = document.getElementById('bonusTicketsEarnedSpan')
    this.giftCardPercentSpan = document.getElementById('giftCardPercentSpan')
    this.bonusPercentSpan = document.getElementById('bonusPercentSpan')
    this.sliderCount = 2 // 20 default
    this.slider = document.getElementById('slider')
    this.sliderTargets = arange1(this.sliderCount).map(i => Math.round(Math.random() * 100))
    this.sliderProgress = 0
    this.slider.value = Math.round(Math.random() * 100)
    this.slider.onchange = () => {
      const sliderTarget = this.sliderTargets[this.sliderProgress]
      if (this.slider.value === sliderTarget.toString()) {
        this.sliderProgress++
        this.slider.value = Math.round(Math.random() * 100)
      }
      if (this.sliderProgress >= this.sliderCount) {
        this.client.socket.emit('sliderTaskComplete', this.client.id)
      }
    }
    this.draw()
  }

  drawSliderTask () {
    const sliderTarget = this.sliderTargets[this.sliderProgress]
    this.sliderTargetSpan.innerHTML = sliderTarget
    this.sliderValueSpan.innerHTML = this.slider.value
    this.bonusTicketsEarnedSpan.innerHTML = this.sliderProgress * 100 / this.sliderCount
  }

  draw () {
    window.requestAnimationFrame(() => this.draw())
    if (!this.client.joined) return // guard statement
    if (this.client.input == null) return // guard statement
    if (this.client.hist[this.client.period] == null) return // guard statement
    this.drawSliderTask()
    this.input = this.client.input
    this.drawing = true
    this.bonusPercentSpan.innerHTML = this.client.bonusPercent
    this.giftCardPercentSpan.innerHTML = 100 - this.client.bonusPercent
    this.countdownText.innerHTML = `Countdown: ${this.client.countdown}`
    this.stepTitle.innerHTML = 'Choice'
    const chosen = this.client.hist[this.client.period].choice !== 0
    this.requestText.style.display = chosen ? 'none' : 'block'
    this.countdownText.style.display = chosen ? 'block' : 'none'
    // console.log('countdownText.style.display', this.countdownText.style.display)
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
