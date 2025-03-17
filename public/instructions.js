export class Instructions {
  constructor (client) {
    this.endowment1 = document.getElementById('endowment1')
    this.endowment2 = document.getElementById('endowment2')
    this.bonus1 = document.getElementById('bonus1')
    this.bonus2 = document.getElementById('bonus2')
    this.giftValue1 = document.getElementById('giftValue1')
    this.giftValue2 = document.getElementById('giftValue2')
    this.instructionsTextDiv1 = document.getElementById('instructionsTextDiv1')
    this.instructionsTextDiv2 = document.getElementById('instructionsTextDiv2')
    this.instructionsTextDiv3Experiment = document.getElementById('instructionsTextDiv3Experiment')
    this.instructionsPage = 1
    this.client = client
  }

  updateInstructions () {
    const endowment = this.client.endowment.toFixed(0)
    const bonus = this.client.bonus.toFixed(0)
    const giftValue = this.client.giftValue.toFixed(0)
    this.endowment1.innerHTML = endowment
    this.endowment2.innerHTML = endowment
    this.bonus1.innerHTML = bonus
    this.bonus2.innerHTML = bonus
    this.giftValue1.innerHTML = giftValue
    this.giftValue2.innerHTML = giftValue
    this.instructionsTextDiv1.style.display = this.instructionsPage === 1 ? 'block' : 'none'
    this.instructionsTextDiv2.style.display = this.instructionsPage === 2 ? 'block' : 'none'
    this.instructionsTextDiv3Experiment.style.display = this.instructionsPage === 3 ? 'block' : 'none'
  }
}
