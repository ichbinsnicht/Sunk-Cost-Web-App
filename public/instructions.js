export class Instructions {
  constructor (client) {
    this.endowment1 = document.getElementById('endowment1')
    this.endowment2 = document.getElementById('endowment2')
    this.instructionsTextDiv1 = document.getElementById('instructionsTextDiv1')
    this.instructionsTextDiv2 = document.getElementById('instructionsTextDiv2')
    this.instructionsTextDiv3 = document.getElementById('instructionsTextDiv3')
    this.instructionsTextDiv4 = document.getElementById('instructionsTextDiv4')
    this.instructionsPage = 1
    this.client = client
  }

  updateInstructions () {
    const endowment = this.client.endowment.toFixed(0)
    this.endowment1.innerHTML = endowment
    this.endowment2.innerHTML = endowment
    this.instructionsTextDiv1.style.display = this.instructionsPage === 1 ? 'block' : 'none'
    this.instructionsTextDiv2.style.display = this.instructionsPage === 2 ? 'block' : 'none'
    this.instructionsTextDiv3.style.display = this.instructionsPage === 3 ? 'block' : 'none'
    this.instructionsTextDiv4.style.display = this.instructionsPage === 4 ? 'block' : 'none'
  }
}
