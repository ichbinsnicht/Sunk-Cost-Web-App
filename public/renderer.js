import { arange1 } from './math.js'
export class Renderer {
  constructor (client) {
    this.client = client
    this.input = client.input

    // graphical parameters
    this.graphWidth = 70 // gone soon
    this.graphX = 0.5 * (100 - this.graphWidth) // gone soon
    this.boxWidth = 30
    this.boxSeparation = 20
    this.boxHeight = 30
    this.boxX1 = 0.5 * (100 - 2 * this.boxWidth - this.boxSeparation)
    this.boxX2 = this.boxX1 + this.boxWidth + this.boxSeparation
    this.lineY1 = -90
    this.lineY2 = -65
    this.tickFont = '1.5pt monospace'
    this.labelFont = '1.5pt monospace'
    this.black = 'rgb(0,0,0)'
    this.blue = 'rgb(0,150,256)'
    this.darkBlue = 'rgb(0,50,256)'
    this.green = 'rgb(0,200,0)'
    this.darkGreen = 'rgb(0,150,0)'
    this.drawing = false
    this.xScale = 1
    this.yScale = 1
  }

  draw () {
    window.requestAnimationFrame(() => this.draw())
    this.input = this.client.input
    this.setupCanvas()
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    if (this.client.joined && this.client.state === 'interface') this.drawInterface()
    if (this.client.joined && this.client.state === 'experimentComplete') this.writeOutcome()
    this.drawing = true
  }

  setupCanvas () {
    this.xScale = 1 * window.innerWidth
    this.yScale = 1 * window.innerHeight
    this.canvas.width = this.xScale
    this.canvas.height = this.yScale
    const xTranslate = this.xScale / 2 - this.yScale / 2
    const yTranslate = this.yScale
    this.context.setTransform(this.yScale / 100, 0, 0, this.yScale / 100, xTranslate, yTranslate)
  }

  drawInterface () {
    this.drawTop()
    this.drawCountdownText()
    const step = this.client.step
    if (step === 'feedback1') this.drawFeedback1Text()
    if (step === 'choice2' || step === 'feedback2') this.drawBottom()
    if (step === 'feedback2' || (step === 'choice2' && this.input.clicked)) {
      this.drawBarGiftCard()
      this.drawBarBonus()
    }
  }

  drawTop () {
    this.context.fillStyle = this.black
    this.context.strokeStyle = 'black'
    this.context.lineWidth = 0.25
    this.context.beginPath()
    const graphX = this.graphX
    const lineY1 = this.lineY1
    const graphWidth = this.graphWidth
    this.context.moveTo(graphX, lineY1)
    this.context.lineTo(graphX + graphWidth, lineY1)
    this.context.stroke()
    const numTicks = 6
    const tickLength = 2
    const tickSpace = 1
    this.context.font = this.tickFont
    this.context.textAlign = 'center'
    this.context.textBaseline = 'top'
    arange1(numTicks).forEach(i => {
      const weight = i / (numTicks - 1)
      const x = (1 - weight) * graphX + weight * (graphX + graphWidth)
      const yBottom = lineY1 + tickLength
      this.context.beginPath()
      this.context.moveTo(x, lineY1)
      this.context.lineTo(x, yBottom)
      this.context.stroke()
      const xScoreLabel = `${weight * 50}%`
      this.context.textBaseline = 'top'
      this.context.fillText(xScoreLabel, x, yBottom + tickSpace)
    })
    this.context.font = this.labelFont
    const step = this.client.step
    const score = this.client.score
    const choice = this.client.choice
    if (step !== 'choice1') {
      this.context.textBaseline = 'bottom'
      this.context.fillStyle = this.darkGreen
      const score1String = `${(score[1] * 100).toFixed(0)}%`
      this.context.fillText(`Probability 1: ${score1String}`, graphX + graphWidth * 2 * score[1], lineY1 - tickLength - 0.5)
      this.context.beginPath()
      this.context.arc(graphX + graphWidth * 2 * score[1], lineY1, 1.5, 0, 2 * Math.PI)
      this.context.fill()
    }
    if (this.input.clicked || step !== 'choice1') {
      this.context.textBaseline = 'bottom'
      this.context.fillStyle = this.black
      const choice1String = `${(choice[1] * 100).toFixed(0)}%`
      this.context.fillText(`Choice 1: ${choice1String}`, graphX + graphWidth * 2 * choice[1], lineY1 - tickLength - 4)
      this.context.beginPath()
      this.context.arc(graphX + graphWidth * 2 * choice[1], lineY1, 0.75, 0, 2 * Math.PI)
    }
    this.context.textBaseline = 'bottom'
    this.context.fillStyle = this.black
    const mouseClickString1 = 'Please click on the graph to select your choice.'
    const mouseClickString = step === 'choice1' ? mouseClickString1 : ''
    this.context.fillText(mouseClickString, graphX + graphWidth * 0.5, lineY1 + 10)
    this.context.fill()
    this.context.fillStyle = this.black
    this.context.textBaseline = 'middle'
    this.context.textAlign = 'left'
  }

  drawCountdownText () {
    this.context.fillStyle = this.black
    this.context.textBaseline = 'top'
    this.context.textAlign = 'center'
    const x = this.graphX + 0.5 * this.graphWidth
    const y = this.lineY2 + 17.5
    this.context.fillText(`Countdown: ${this.client.countdown}`, x, y)
  }

  drawFeedback1Text () {
    this.context.textBaseline = 'top'
    this.context.textAlign = 'center'
    this.context.fillStyle = this.darkGreen
    const score1CompleteString = 'Probability 1 Implemented'
    const x = this.graphX + 0.5 * this.graphWidth
    const y = this.lineY2 - 10
    this.context.fillText(score1CompleteString, x, y)
  }

  drawBottom () {
    this.context.fillStyle = this.black
    this.context.strokeStyle = 'black'
    this.context.lineWidth = 0.25
    this.context.beginPath()
    const graphX = this.graphX
    const graphWidth = this.graphWidth
    const lineY2 = this.lineY2
    this.context.moveTo(graphX, lineY2)
    this.context.lineTo(graphX + graphWidth, lineY2)
    this.context.stroke()
    const numTicks = 6
    const tickLength = 2
    const tickSpace = 1
    this.context.font = this.tickFont
    this.context.textAlign = 'center'
    this.context.textBaseline = 'top'
    arange1(numTicks).forEach(i => {
      const weight = i / (numTicks - 1)
      const x = (1 - weight) * graphX + weight * (graphX + graphWidth)
      const yBottom = lineY2 + tickLength
      this.context.beginPath()
      this.context.moveTo(x, lineY2)
      this.context.lineTo(x, yBottom)
      this.context.stroke()
      const xScoreLabel = `${weight * 50}%`
      this.context.textBaseline = 'top'
      this.context.fillText(xScoreLabel, x, yBottom + tickSpace)
    })
    this.context.font = this.labelFont
    const step = this.client.step
    if (this.input.clicked || step !== 'choice2') {
      this.context.textBaseline = 'bottom'
      this.context.fillStyle = this.green
      const score2String = `${(this.client.score[2] * 100).toFixed(0)}%`
      const scoreX = graphX + graphWidth * 2 * this.client.score[2]
      const scoreY = lineY2 - tickLength - 0.5
      this.context.fillText(`Probability 2: ${score2String}`, scoreX, scoreY)
      this.context.beginPath()
      this.context.fillStyle = this.green
      const arcY = lineY2
      this.context.arc(scoreX, arcY, 1.5, 0, 2 * Math.PI)
      this.context.fill()
      this.context.textBaseline = 'bottom'
      this.context.fillStyle = this.black
      const choice2String = `${(this.client.choice[2] * 100).toFixed(0)}%`
      const choiceX = graphX + graphWidth * 2 * this.client.choice[2]
      const choiceY = lineY2 - tickLength - 4
      this.context.fillText(`Choice 2: ${choice2String}`, choiceX, choiceY)
      this.context.beginPath()
      this.context.arc(choiceX, arcY, 0.75, 0, 2 * Math.PI)
      this.context.fill()
    }
    this.context.textBaseline = 'top'
    const mouseClickString1 = 'Please click on the graph to select your choice.'
    const mouseClickString = step === 'choice2' ? mouseClickString1 : ''
    this.context.fillText(mouseClickString, graphX + graphWidth * 0.5, lineY2 + 10)
    if (step === 'feedback2' || (step === 'choice2' && this.clicked)) {
      const probGiftCard = (this.client.score[1] + this.client.score[2]) * 100
      const probMoney = (1 - this.client.score[1] - this.client.score[2]) * 100
      const giftCardChance = `You have a ${probGiftCard.toFixed(0)}% chance of winning the $${this.client.giftValue.toFixed(0)} gift card.`
      const moneyChance = `You have a ${probMoney.toFixed(0)}% chance of winning the $${this.client.bonus.toFixed(0)} bonus.`
      this.context.fillStyle = this.darkGreen
      this.context.fillText(giftCardChance, graphX + 0.5 * graphWidth, lineY2 + 21)
      this.context.fillStyle = this.darkBlue
      this.context.fillText(moneyChance, graphX + 0.5 * graphWidth, lineY2 + 24.5)
    }
    if (step === 'feedback2') {
      this.context.textAlign = 'center'
      this.context.fillStyle = 'darkRed'
      const lineComplete = 'Stage 2 Complete'
      this.context.fillText(lineComplete, graphX + 0.5 * graphWidth, lineY2 + 29)
    }
  }

  drawBarGiftCard () {
    this.context.fillStyle = this.black
    this.context.strokeStyle = 'black'
    this.context.lineWidth = 0.25
    this.context.beginPath()
    const barX = 70
    const baseY = -10
    const barWidth = 10
    const barHeight = 20
    this.context.moveTo(barX - 0.5 * barWidth, baseY - barHeight)
    this.context.lineTo(barX - 0.5 * barWidth, baseY)
    this.context.lineTo(barX + 0.5 * barWidth, baseY)
    this.context.lineTo(barX + 0.5 * barWidth, baseY - barHeight)
    this.context.stroke()
    this.context.fillStyle = this.green
    const winProb = (this.client.score[1] + this.client.score[2]) * 100
    const barLevelTotal = barHeight * winProb / 100
    this.context.fillRect(barX - 0.5 * barWidth, baseY - barLevelTotal, barWidth, barLevelTotal)
    this.context.fillStyle = this.darkGreen
    const score1 = this.client.score[1] * 100
    const barLevel1 = barHeight * score1 / 100
    this.context.fillRect(barX - 0.5 * barWidth, baseY - barLevel1, barWidth, barLevel1)
    const numTicks = 3
    const tickLength = 2
    const tickSpace = 1
    this.context.font = this.tickFont
    this.context.fillStyle = this.black
    this.context.textAlign = 'center'
    this.context.textBaseline = 'top'
    arange1(numTicks).forEach(i => {
      const weight = i / (numTicks - 1)
      const y = (1 - weight) * baseY + weight * (baseY - barHeight)
      const xRight1 = barX - 0.5 * barWidth
      const xLeft1 = barX - 0.5 * barWidth - tickLength
      this.context.beginPath()
      this.context.moveTo(xRight1, y)
      this.context.lineTo(xLeft1, y)
      this.context.stroke()
      const xRight2 = barX + 0.5 * barWidth + tickLength
      const xLeft2 = barX + 0.5 * barWidth
      this.context.beginPath()
      this.context.moveTo(xRight2, y)
      this.context.lineTo(xLeft2, y)
      this.context.stroke()
      const yWinProbLabel = `${100 * weight}%`
      this.context.textBaseline = 'middle'
      this.context.textAlign = 'left'
      this.context.fillText(yWinProbLabel, barX + 0.5 * barWidth + tickLength + tickSpace, y)
      this.context.textAlign = 'right'
      this.context.fillText(yWinProbLabel, barX - 0.5 * barWidth - tickLength - tickSpace, y)
    })
    this.context.fillStyle = this.darkGreen
    this.context.textAlign = 'center'
    const winProbString = `$${this.client.giftValue.toFixed(0)} Gift Card: ${winProb.toFixed(0)}%`
    this.context.fillText(winProbString, barX, baseY + 5)
  }

  drawBarBonus () {
    this.context.fillStyle = this.black
    this.context.strokeStyle = 'black'
    this.context.lineWidth = 0.25
    this.context.beginPath()
    const barX = 30
    const baseY = -10
    const barWidth = 10
    const barHeight = 20
    this.context.moveTo(barX - 0.5 * barWidth, baseY - barHeight)
    this.context.lineTo(barX - 0.5 * barWidth, baseY)
    this.context.lineTo(barX + 0.5 * barWidth, baseY)
    this.context.lineTo(barX + 0.5 * barWidth, baseY - barHeight)
    this.context.stroke()
    this.context.fillStyle = this.blue
    const score = this.client.score
    const stage = this.client.stage
    const winProb = 100 - (score[1] + score[2]) * 100
    if (stage === 2) {
      const barLevelTotal = barHeight * winProb / 100
      this.context.fillRect(barX - 0.5 * barWidth, baseY - barLevelTotal, barWidth, barLevelTotal)
    }
    this.context.fillStyle = this.darkBlue
    const score1 = 50 - score[1] * 100
    const barLevel1 = barHeight * score1 / 100
    this.context.fillRect(barX - 0.5 * barWidth, baseY - barLevel1, barWidth, barLevel1)
    const numTicks = 3
    const tickLength = 2
    const tickSpace = 1
    this.context.font = this.tickFont
    this.context.fillStyle = this.black
    this.context.textAlign = 'center'
    this.context.textBaseline = 'top'
    arange1(numTicks).forEach(i => {
      const weight = i / (numTicks - 1)
      const y = (1 - weight) * baseY + weight * (baseY - barHeight)
      const xRight1 = barX - 0.5 * barWidth
      const xLeft1 = barX - 0.5 * barWidth - tickLength
      this.context.beginPath()
      this.context.moveTo(xRight1, y)
      this.context.lineTo(xLeft1, y)
      this.context.stroke()
      const xRight2 = barX + 0.5 * barWidth + tickLength
      const xLeft2 = barX + 0.5 * barWidth
      this.context.beginPath()
      this.context.moveTo(xRight2, y)
      this.context.lineTo(xLeft2, y)
      this.context.stroke()
      const yWinProbLabel = `${100 * weight}%`
      this.context.textBaseline = 'middle'
      this.context.textAlign = 'left'
      this.context.fillText(yWinProbLabel, barX + 0.5 * barWidth + tickLength + tickSpace, y)
      this.context.textAlign = 'right'
      this.context.fillText(yWinProbLabel, barX - 0.5 * barWidth - tickLength - tickSpace, y)
    })
    this.context.fillStyle = this.darkBlue
    this.context.textAlign = 'center'
    const bonus = this.client.bonus
    const winProbString1 = `$${bonus.toFixed(0)} Bonus: ${score1.toFixed(0)}%`
    const winProbString2 = `$${bonus.toFixed(0)} Bonus: ${winProb.toFixed(0)}%`
    const step = this.client.step
    const winProbString = step === 'choice1' || step === 'feedback1' ? winProbString1 : winProbString2
    this.context.fillText(winProbString, barX, baseY + 5)
  }

  writeOutcome () {
    this.client.completeTextDiv.innerHTML = ''
    const endowment = this.client.endowment
    const bonus = this.client.bonus
    const giftValue = this.client.giftValue
    const winPrize = this.client.winPrize
    const completionURL = this.client.completionURL
    const giftURL = this.client.giftURL
    this.client.completeTextDiv.innerHTML += `You will receive $${endowment.toFixed(0)} upon completion.<br>`
    const bonusTextA = `You won the $${bonus.toFixed(0)} bonus.`
    const bonusTextB = `You did not win the $${bonus.toFixed(0)} bonus.`
    const giftCardTextA = `You won the $${giftValue.toFixed(0)} Starbucks gift card.`
    const giftCardTextB = `You did not win the $${giftValue.toFixed(0)} Starbucks gift card.`
    this.client.completeTextDiv.innerHTML += winPrize ? bonusTextB : giftCardTextB
    this.client.completeTextDiv.innerHTML += '<br>'
    this.client.completeTextDiv.innerHTML += winPrize ? giftCardTextA : bonusTextA
    this.client.giftBitLinkDiv.innerHTML = ''
    console.log('winPrize', winPrize)
    console.log('completionURL', completionURL)
    console.log('giftURL', giftURL)
    this.client.paymentLink.href = completionURL
    this.client.paymentLink.target = '_self'
    this.client.copyURLDiv.style.display = 'none'
    this.client.bonusDiv.style.display = 'none'
    if (winPrize) {
      this.client.giftBitLinkDiv.innerHTML += `Your gift card URL: <br> ${giftURL}`
      this.client.paymentLink.target = '_blank'
      this.client.copyURLDiv.style.display = 'block'
    } else {
      this.client.bonusDiv.style.display = 'block'
    }
  }
}
