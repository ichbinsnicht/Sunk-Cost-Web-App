export class Input {
  constructor (client) {
    this.client = client
    this.renderer = client.renderer
    this.instructions = client.instructions
    this.mouseX = 50
    this.clicked = false
    this.joinGame()
    window.beginPreSurvey = () => this.beginPreSurvey()
    window.nextPreSurveyForm = () => this.nextPreSurveyForm()
    this.nextPreSurveyForm()
    window.previousInstructionsPage = () => this.previousInstructionsPage()
    window.nextInstructionsPage = () => this.nextInstructionsPage()
    window.beginPracticePeriods = () => this.beginPracticePeriods()
    window.beginExperiment = () => this.beginExperiment()
    window.requestPayment = () => this.requestPayment()
    window.goToGiftCard = () => this.goToGiftCard()
    window.copyGiftLink = () => this.copyGiftLink()
    window.onkeydown = (event) => this.onkeydown(event)
    window.onmousedown = (event) => this.onmousedown(event)
  }

  joinGame () { // method of class Input
    console.log('id', this.client.id)
    const msg = {
      id: this.client.id,
      study: this.client.study,
      session: this.client.session
    }
    this.client.socket.emit('joinGame', msg)
  }

  beginPreSurvey () {
    console.log('beginPreSurvey')
    const msg = { id: this.client.id }
    this.client.socket.emit('beginPreSurvey', msg)
  }

  nextPreSurveyForm () {
    this.client.preSurveyForms.forEach(div => {
      div.style.display = 'none'
    })
    this.client.preSurveyQuestion++
    if (this.client.preSurveyQuestion <= this.client.preSurveyForms.length) {
      const nextDiv = this.client.preSurveyForms[this.client.preSurveyQuestion - 1]
      nextDiv.style.display = 'block'
    } else {
      console.log('submitPreSurvey')
      this.client.endPreSurveyTime = Date.now()
      const msg = {
        id: this.client.id,
        preSurveyDuration: (this.client.endPreSurveyTime - this.client.startPreSurveyTime) / 1000
      }
      this.client.preSurveyForms.forEach(form => {
        const formData = new FormData(form)
        formData.forEach((value, key) => {
          console.log(key, value)
          msg[key] = value
        })
      })
      this.client.socket.emit('submitPreSurvey', msg)
      return false
    }
  }

  previousInstructionsPage () {
    this.instructions.instructionsPage--
    console.log('this.instructions.instructionsPage', this.instructions.instructionsPage)
  }

  nextInstructionsPage () {
    this.instructions.instructionsPage++
    console.log('this.instructions.instructionsPage', this.instructions.instructionsPage)
  }

  beginPracticePeriods () {
    this.clicked = false
    const msg = { id: this.client.id }
    this.client.beginPracticePeriodsButton.style.display = 'none'
    this.client.socket.emit('beginPracticePeriods', msg)
    console.log('beginPracticePeriods')
  }

  beginExperiment () {
    this.clicked = false
    const msg = { id: this.client.id }
    this.client.socket.emit('beginExperiment', msg)
  }

  requestPayment () {
    const msg = { id: this.client.id }
    this.client.socket.emit('requestPayment', msg)
  }

  goToGiftCard () {
    if (this.client.winPrize) setTimeout(() => { window.location.href = this.client.giftURL }, 100)
  }

  copyGiftLink () {
    navigator.clipboard.writeText(this.client.giftURL)
  }

  onkeydown (event) {
    if (event.key === 'Enter' && this.client.state === 'startup') this.joinGame()
  }

  onmousedown (event) {
    console.log('this.client.countdown', this.client.countdown)
    const mouseEvent = event
    this.mouseX = mouseEvent.pageX - document.body.clientWidth / 2
    this.updateChoice()
    const stepChoice1 = this.client.step === 'choice1'
    const stepChoice2 = this.client.step === 'choice2'
    const stepChoice = stepChoice1 || stepChoice2
    const stateInterface = this.client.state === 'interface'
    if (stateInterface && stepChoice) this.clicked = true
    const msg = {
      id: this.client.id,
      study: this.client.study,
      session: this.client.session,
      time: this.client.time,
      period: this.client.period,
      step: this.client.step,
      stage: this.client.stage,
      state: this.client.state,
      countdown: this.client.countdown,
      mouseX: this.mouseX
    }
    this.client.socket.emit('clientClick', msg)
  }

  updateChoice () {
    if (this.client.step === 'choice1' || this.client.step === 'choice2') {
      const choice = this.mouseX < 0 ? 0 : 1
      this.client.choice[this.client.stage] = choice
      const forced = this.client.forced[this.client.stage]
      const score = forced * (1 - choice) + (1 - forced) * choice
      this.client.score[this.client.stage] = score
    }
  }
}
