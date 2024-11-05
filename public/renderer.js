export class Renderer {
  constructor (client) {
    this.client = client
    this.input = client.input
    setInterval(() => this.draw(), 50)
  }

  draw () {
    this.input = this.client.input
    this.drawing = true
    if (this.input.clicked) {
      const dollarBox = this.client.stage === 1 ? this.client.dollar1Box : this.client.dollar2Box
      const giftCardBox = this.client.stage === 1 ? this.client.giftCard1Box : this.client.giftCard2Box
      const choice = this.client.choice[this.client.stage]
      console.log('choice', choice)
      if (choice === 0) {
        dollarBox.style.border = 'solid  2vh rgb(0, 255, 0, 1)'
        giftCardBox.style.border = 'solid 2vh rgb(0, 0, 0, 0)'
      } else {
        dollarBox.style.border = 'solid 2vh rgb(0, 0, 0, 0)'
        giftCardBox.style.border = 'solid 2vh rgb(0, 255, 0, 1)'
      }
      console.log('dollarBox.style.border', dollarBox.style.border)
    }
  }
}
