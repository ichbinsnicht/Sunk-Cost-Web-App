export class Input {
  constructor (client) {
    this.client = client
    this.renderer = client.renderer
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

  previousInstructionsPage () { this.client.instructionsPage-- }
  nextInstructionsPage () { this.client.instructionsPage++ }

  beginPracticePeriods () {
    this.client.clicked = false
    const msg = { id: this.client.id }
    this.client.beginPracticePeriodsButton.style.display = 'none'
    this.client.socket.emit('beginPracticePeriods', msg)
    console.log('beginPracticePeriods')
  }

  beginExperiment () {
    this.client.clicked = false
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
    const x0 = this.client.canvas.width / 2 - this.client.canvas.height / 2
    const canvasRect = this.client.canvas.getBoundingClientRect()
    const mouseX = (mouseEvent.pageX - x0 - canvasRect.left) * 100 / this.client.canvas.height
    const mouseGraphX = (mouseX - this.renderer.graphX) / this.renderer.graphWidth
    const choiceX = Math.round(0.5 * mouseGraphX * 100) / 100
    const inbounds = mouseGraphX >= 0 && mouseGraphX <= 1
    this.client.clicked = this.client.clicked || inbounds
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
}
