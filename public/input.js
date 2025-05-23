export class Input {
  constructor (client) {
    this.client = client
    this.renderer = client.renderer
    this.instructions = client.instructions
    this.mouseX = 50
    this.chosen = false
    this.joinGame()
    window.beginPreSurvey = () => this.beginPreSurvey()
    window.nextPreSurveyForm = () => this.nextPreSurveyForm()
    this.nextPreSurveyForm()
    window.previousInstructionsPage = () => this.previousInstructionsPage()
    window.nextInstructionsPage = () => this.nextInstructionsPage()
    window.beginPracticePeriods = () => this.beginPracticePeriods()
    window.beginExperiment = () => this.beginExperiment()
    window.goToGiftCard = () => this.goToGiftCard()
    window.copyGiftLink = () => this.copyGiftLink()
    window.onmousedown = (event) => this.onmousedown(event)
    this.client.nextPeriodButton.onclick = () => this.nextPeriod()
  }

  nextPeriod () {
    console.log('nextPeriod')
    const msg = { id: this.client.id }
    this.client.socket.emit('nextPeriod', msg)
  }

  joinGame () {
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
    this.chosen = false
    const msg = { id: this.client.id }
    this.client.beginPracticePeriodsButton.style.display = 'none'
    this.client.socket.emit('beginPracticePeriods', msg)
    console.log('beginPracticePeriods')
  }

  beginExperiment () {
    this.chosen = false
    const msg = { id: this.client.id }
    this.client.socket.emit('beginExperiment', msg)
  }

  goToGiftCard () {
    if (this.client.winGiftCard) setTimeout(() => { window.location.href = this.client.giftURL }, 100)
  }

  copyGiftLink () {
    navigator.clipboard.writeText(this.client.giftURL)
  }

  onmousedown (event) {
    console.log('onmousedown')
    const mouseEvent = event
    this.mouseX = mouseEvent.pageX - document.body.clientWidth / 2
    this.mouseY = mouseEvent.pageY - document.body.clientHeight / 2
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
      mouseX: this.mouseX,
      mouseY: this.mouseY
    }
    this.client.socket.emit('clientClick', msg)
    const direction = this.client.stageImageDiv.style.flexDirection
    console.log('direction', direction)
    console.log('this.mouseX', this.mouseX)
    console.log('this.mouseY', this.mouseY)
    if (this.mouseY > 0) return
    const forced = this.client.hist[this.client.period].forced
    const forceDir = this.client.hist[this.client.period].forceDir
    const right = direction === 'row' ? 1 : 0
    const left = direction === 'row' ? 0 : 1
    const choice = this.mouseX > 0 ? right : left
    const sign = Math.sign(this.mouseX)
    const available = !forced || sign === forceDir
    if (this.client.state === 'interface' && available) {
      this.chosen = true
      this.client.choice = choice
    }
  }
}
