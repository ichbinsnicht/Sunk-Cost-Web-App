export class Instructions {
  constructor (client) {
    this.endowment1 = document.getElementById('endowment1')
    this.endowment2 = document.getElementById('endowment2')
    this.bonus1 = document.getElementById('bonus1')
    this.bonus2 = document.getElementById('bonus2')
    this.bonus3 = document.getElementById('bonus3')
    this.bonus4 = document.getElementById('bonus4')
    this.giftValue1 = document.getElementById('giftValue1')
    this.giftValue2 = document.getElementById('giftValue2')
    this.giftValue3 = document.getElementById('giftValue3')
    this.giftValue4 = document.getElementById('giftValue4')
    this.practicePeriods = document.getElementById('practicePeriods')
    this.instructionsTextDiv1 = document.getElementById('instructionsTextDiv1')
    this.instructionsTextDiv2 = document.getElementById('instructionsTextDiv2')
    this.instructionsTextDiv3 = document.getElementById('instructionsTextDiv3')
    this.instructionsTextDiv4Practice = document.getElementById('instructionsTextDiv4Practice')
    this.instructionsTextDiv4Experiment = document.getElementById('instructionsTextDiv4Experiment')
    this.instructionsPage = 1
    this.client = client
  }

  updateInstructions () {
    const endowment = this.client.endowment.toFixed(0)
    const bonus = this.client.bonus.toFixed(0)
    const giftValue = this.client.giftValue.toFixed(0)
    const numPracticePeriods = this.client.numPracticePeriods
    this.endowment1.innerHTML = endowment
    this.endowment2.innerHTML = endowment
    this.bonus1.innerHTML = bonus
    this.bonus2.innerHTML = bonus
    this.bonus3.innerHTML = bonus
    this.bonus4.innerHTML = bonus
    this.giftValue1.innerHTML = giftValue
    this.giftValue2.innerHTML = giftValue
    this.giftValue3.innerHTML = giftValue
    this.giftValue4.innerHTML = giftValue
    this.practicePeriods.innerHTML = numPracticePeriods
    this.instructionsTextDiv1.style.display = this.instructionsPage === 1 ? 'block' : 'none'
    this.instructionsTextDiv2.style.display = this.instructionsPage === 2 ? 'block' : 'none'
    this.instructionsTextDiv3.style.display = this.instructionsPage === 3 ? 'block' : 'none'
    const showPractice4 = this.instructionsPage === 4 && !this.client.practicePeriodsComplete
    const showExperiment4 = this.instructionsPage === 4 && this.client.practicePeriodsComplete
    this.instructionsTextDiv4Practice.style.display = showPractice4 ? 'block' : 'none'
    this.instructionsTextDiv4Experiment.style.display = showExperiment4 ? 'block' : 'none'
  }
}
