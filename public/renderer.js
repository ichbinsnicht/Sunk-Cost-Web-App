export class Renderer {
  constructor (client) {
    this.client = client
    this.input = client.input
    setInterval(() => this.draw(), 50)
  }

  draw () {
    this.input = this.client.input
    this.drawing = true
    this.client.countdownText.innerHTML = `Countdown: ${this.client.countdown}`
    const ready = this.client.hist[this.client.period].ready[this.client.stage]
    if (ready) {
      const choice = this.client.choice[this.client.stage]
      if (choice === 0) {
        this.client.dollarBox.style.border = 'solid  2vh rgb(0, 255, 0, 1)'
        this.client.giftCardBox.style.border = 'solid 2vh rgb(0, 0, 0, 0)'
        this.client.choiceText.innerHTML = 'You chose the $1 bonus.'
      } else {
        this.client.dollarBox.style.border = 'solid 2vh rgb(0, 0, 0, 0)'
        this.client.giftCardBox.style.border = 'solid 2vh rgb(0, 255, 0, 1)'
        this.client.choiceText.innerHTML = 'You chose the $6 Starbucks gift card.'
      }
    } else {
      this.client.choiceText.innerHTML = 'Please select an option.'
    }
  }
}
