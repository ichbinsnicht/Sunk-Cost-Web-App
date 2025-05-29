import { arange1, arange2, choose } from './math.js'

export class Renderer {
  constructor (client) {
    this.client = client
    this.input = client.input
    console.log('beforeCardImageDiv', this.beforeCardImageDiv)
    console.log('afterCardImageDiv', this.afterCardImageDiv)
    this.countdownText = document.getElementById('countdownText')
    this.countdownSpan = document.getElementById('choiceSpan')
    this.requestText = document.getElementById('requestText')
    this.sliderTargetSpan = document.getElementById('sliderTargetSpan')
    this.sliderValueSpan = document.getElementById('sliderValueSpan')
    this.bonusTicketsEarnedSpan = document.getElementById('bonusTicketsEarnedSpan')
    this.giftCardTicketSpan = document.getElementById('giftCardTicketSpan')
    this.bonusTicketSpan = document.getElementById('bonusTicketSpan')
    this.sliderCount = 2 // 20 default
    this.slider = document.getElementById('slider')
    this.sliderProgress = 0
    this.slider.value = Math.round(Math.random() * 100)
    this.sliderTargets = []
    arange1(this.sliderCount).forEach(i => {
      const oldValue = i === 0 ? this.slider.value : this.sliderTargets[i - 1]
      const increment = choose(arange2(1, 99))
      this.sliderTargets[i] = (oldValue + increment) % 101
    })
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
    const choice1 = this.client.hist[1].choice === 1
    const choice2 = this.client.hist[2].choice === 1
    const possible1 = this.client.hist[1].possible === 1
    const possible2 = this.client.hist[2].possible === 1
    const happen1 = choice1 && possible1 ? 1 : 0
    const happen2 = choice2 && possible2 ? 1 : 0
    const bonusPercent = 100 - 40 * happen1 - 40 * happen2
    this.bonusTicketSpan.innerHTML = bonusPercent
    this.giftCardTicketSpan.innerHTML = 100 - bonusPercent
    this.countdownText.innerHTML = `Countdown: ${this.client.countdown}`
    const chosen = this.client.hist[this.client.period].choice !== 0
    this.requestText.style.display = chosen ? 'none' : 'block'
    this.countdownText.style.display = chosen ? 'block' : 'none'
    // console.log('countdownText.style.display', this.countdownText.style.display)
    this.writeOutcome()
  }

  writeOutcome = function () {
    if (this.client.state !== 'experimentComplete') return // guard statement
    const completeTextDiv = this.client.completeTextDiv
    const endowment = this.client.endowment
    const winGiftCard = this.client.winGiftCard
    const bonus = this.client.bonus
    const giftValue = this.client.giftValue
    const giftBitLinkDiv = this.client.giftBitLinkDiv
    const completionURL = this.client.completionURL
    const giftURL = this.client.giftURL
    const paymentLink = this.client.paymentLink
    const copyURLDiv = this.client.copyURLDiv
    const bonusDiv = this.client.bonusDiv
    completeTextDiv.innerHTML = ''
    completeTextDiv.innerHTML += `You will get $${endowment.toFixed(0)} upon completion.<br>`
    const bonusText = `You will also receive a $${bonus.toFixed(0)} Prolific bonus.<br>`
    const giftCardTextA = `You won the $${giftValue.toFixed(0)} Starbucks gift card.`
    const giftCardTextB = `You did not win the $${giftValue.toFixed(0)} Starbucks gift card.`
    completeTextDiv.innerHTML += winGiftCard === 0 ? bonusText : ''
    completeTextDiv.innerHTML += winGiftCard === 1 ? giftCardTextA : giftCardTextB
    giftBitLinkDiv.innerHTML = ''
    paymentLink.href = completionURL
    paymentLink.target = '_self'
    copyURLDiv.style.display = 'none'
    bonusDiv.style.display = 'none'
    if (winGiftCard === 1) {
      giftBitLinkDiv.innerHTML += `Your gift card URL: <br> ${giftURL}`
      paymentLink.target = '_blank'
      copyURLDiv.style.display = 'block'
    } else {
      bonusDiv.style.display = 'block'
    }
  }
}
