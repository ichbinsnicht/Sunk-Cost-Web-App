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

  previousInstructionsPage () { this.instructions.instructionsPage-- }
  nextInstructionsPage () { this.instructions.instructionsPage++ }

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
    const mouseEvent = event
    const x0 = this.renderer.canvas.width / 2 - this.renderer.canvas.height / 2
    const canvasRect = this.renderer.canvas.getBoundingClientRect()
    this.mouseX = (mouseEvent.pageX - x0 - canvasRect.left) * 100 / this.renderer.canvas.height
    const mouseGraphX = (this.mouseX - this.renderer.graphX) / this.renderer.graphWidth
    const choiceX = Math.round(0.5 * mouseGraphX * 100) / 100
    const inbounds = mouseGraphX >= 0 && mouseGraphX <= 1
    this.clicked = this.clicked || inbounds
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
      choiceX
    }
    this.client.socket.emit('clientClick', msg)
  }

  updateChoice () {
    const graphX = this.renderer.graphX
    const graphWidth = this.renderer.graphWidth
    const mouseGraphX = (this.mouseX - graphX) / graphWidth
    if (mouseGraphX >= 0 && mouseGraphX <= 1) {
      if (this.client.step === 'choice1' || this.client.step === 'choice2') {
        const choice = Math.round(0.5 * mouseGraphX * 100) / 100
        this.client.choice[this.client.stage] = choice
        const forced = this.client.forced[this.client.stage]
        const forcedScore = this.client.forcedScore[this.client.stage]
        const score = forced * forcedScore + (1 - forced) * choice
        this.client.score[this.client.stage] = score
      }
    }
  }
}
