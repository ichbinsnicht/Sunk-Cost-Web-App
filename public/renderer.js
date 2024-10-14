export class Renderer() {
  constructor(client){
    this.client = client
    // graphical parameters
    this.graphWidth = 70 // gone soon
    this.graphX = 0.5 * (100 - graphWidth) // gone soon
    this.boxWidth = 30
    this.boxSeparation = 20
    this.boxHeight = 30
    this.boxX1 = 0.5 * (100 - 2 * boxWidth - boxSeparation)
    this.boxX2 = boxX1 + boxWidth + boxSeparation
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
    this.draw()
  }

  // continue here.

  const draw = function () {
    window.requestAnimationFrame(draw)
    setupCanvas()
    context.clearRect(0, 0, canvas.width, canvas.height)
    if (joined && state === 'interface') drawInterface()
    if (joined && state === 'experimentComplete') writeOutcome()
    drawing = true
  }
  const setupCanvas = function () {
    xScale = 1 * window.innerWidth
    yScale = 1 * window.innerHeight
    canvas.width = xScale
    canvas.height = yScale
    const xTranslate = xScale / 2 - yScale / 2
    const yTranslate = yScale
    context.setTransform(yScale / 100, 0, 0, yScale / 100, xTranslate, yTranslate)
  }
  const updateChoice = function () {
    const mouseGraphX = (mouseX - graphX) / graphWidth
    if (mouseGraphX >= 0 && mouseGraphX <= 1) {
      if (step === 'choice1' || step === 'choice2') {
        choice[stage] = Math.round(0.5 * mouseGraphX * 100) / 100
        score[stage] = forced[stage] * forcedScore[stage] + (1 - forced[stage]) * choice[stage]
      }
    }
  }
  const drawInterface = function () {
    drawTop()
    drawCountdownText()
    if (step === 'feedback1') drawFeedback1Text()
    if (step === 'choice2' || step === 'feedback2') drawBottom()
    if (step === 'feedback2' || (step === 'choice2' && clicked)) {
      drawBarGiftCard()
      drawBarBonus()
    }
  }
  const drawTop = function () {
    context.fillStyle = black
    context.strokeStyle = 'black'
    context.lineWidth = 0.25
    context.beginPath()
    context.rect(graphX + graphWidth, lineY1, 0.5 * graphWidth, 0.5 * (lineY2 - lineY1))
    context.stroke()
  }
  const drawTopOld = function () {
    context.fillStyle = black
    context.strokeStyle = 'black'
    context.lineWidth = 0.25
    context.beginPath()
    context.moveTo(graphX, lineY1)
    context.lineTo(graphX + graphWidth, lineY1)
    context.stroke()
    const numTicks = 6
    const tickLength = 2
    const tickSpace = 1
    context.font = tickFont
    context.textAlign = 'center'
    context.textBaseline = 'top'
    arange(numTicks).forEach(i => {
      const weight = i / (numTicks - 1)
      const x = (1 - weight) * graphX + weight * (graphX + graphWidth)
      const yBottom = lineY1 + tickLength
      context.beginPath()
      context.moveTo(x, lineY1)
      context.lineTo(x, yBottom)
      context.stroke()
      const xScoreLabel = `${weight * 50}%`
      context.textBaseline = 'top'
      context.fillText(xScoreLabel, x, yBottom + tickSpace)
    })
    context.font = labelFont
    if (step !== 'choice1') {
      context.textBaseline = 'bottom'
      context.fillStyle = darkGreen
      const score1String = `${(score[1] * 100).toFixed(0)}%`
      context.fillText(`Probability 1: ${score1String}`, graphX + graphWidth * 2 * score[1], lineY1 - tickLength - 0.5)
      context.beginPath()
      context.arc(graphX + graphWidth * 2 * score[1], lineY1, 1.5, 0, 2 * Math.PI)
      context.fill()
    }
    if (clicked || step !== 'choice1') {
      context.textBaseline = 'bottom'
      context.fillStyle = black
      const choice1String = `${(choice[1] * 100).toFixed(0)}%`
      context.fillText(`Choice 1: ${choice1String}`, graphX + graphWidth * 2 * choice[1], lineY1 - tickLength - 4)
      context.beginPath()
      context.arc(graphX + graphWidth * 2 * choice[1], lineY1, 0.75, 0, 2 * Math.PI)
    }
    context.textBaseline = 'bottom'
    context.fillStyle = black
    const mouseClickString1 = 'Please click on the graph to select your choice.'
    const mouseClickString = step === 'choice1' ? mouseClickString1 : ''
    context.fillText(mouseClickString, graphX + graphWidth * 0.5, lineY1 + 10)
    context.fill()
    context.fillStyle = black
    context.textBaseline = 'middle'
    context.textAlign = 'left'
  }
  const drawBottom = function () {
    context.fillStyle = black
    context.strokeStyle = 'black'
    context.lineWidth = 0.25
    context.beginPath()
    context.moveTo(graphX, lineY2)
    context.lineTo(graphX + graphWidth, lineY2)
    context.stroke()
    const numTicks = 6
    const tickLength = 2
    const tickSpace = 1
    context.font = tickFont
    context.textAlign = 'center'
    context.textBaseline = 'top'
    arange(numTicks).forEach(i => {
      const weight = i / (numTicks - 1)
      const x = (1 - weight) * graphX + weight * (graphX + graphWidth)
      const yBottom = lineY2 + tickLength
      context.beginPath()
      context.moveTo(x, lineY2)
      context.lineTo(x, yBottom)
      context.stroke()
      const xScoreLabel = `${weight * 50}%`
      context.textBaseline = 'top'
      context.fillText(xScoreLabel, x, yBottom + tickSpace)
    })
    context.font = labelFont
    if (clicked || step !== 'choice2') {
      context.textBaseline = 'bottom'
      context.fillStyle = green
      const score2String = `${(score[2] * 100).toFixed(0)}%`
      context.fillText(`Probability 2: ${score2String}`, graphX + graphWidth * 2 * score[2], lineY2 - tickLength - 0.5)
      context.beginPath()
      context.fillStyle = green
      context.arc(graphX + graphWidth * 2 * score[2], lineY2, 1.5, 0, 2 * Math.PI)
      context.fill()
      context.textBaseline = 'bottom'
      context.fillStyle = black
      const choice2String = `${(choice[2] * 100).toFixed(0)}%`
      context.fillText(`Choice 2: ${choice2String}`, graphX + graphWidth * 2 * choice[2], lineY2 - tickLength - 4)
      context.beginPath()
      context.arc(graphX + graphWidth * 2 * choice[2], lineY2, 0.75, 0, 2 * Math.PI)
      context.fill()
    }
    context.textBaseline = 'top'
    const mouseClickString1 = 'Please click on the graph to select your choice.'
    const mouseClickString = step === 'choice2' ? mouseClickString1 : ''
    context.fillText(mouseClickString, graphX + graphWidth * 0.5, lineY2 + 10)
    if (step === 'feedback2' || (step === 'choice2' && clicked)) {
      const probGiftCard = (score[1] + score[2]) * 100
      const probMoney = (1 - score[1] - score[2]) * 100
      const giftCardChance = `You have a ${probGiftCard.toFixed(0)}% chance of winning the $${giftValue.toFixed(0)} gift card.`
      const moneyChance = `You have a ${probMoney.toFixed(0)}% chance of winning the $${bonus.toFixed(0)} bonus.`
      context.fillStyle = darkGreen
      context.fillText(giftCardChance, graphX + 0.5 * graphWidth, lineY2 + 21)
      context.fillStyle = darkBlue
      context.fillText(moneyChance, graphX + 0.5 * graphWidth, lineY2 + 24.5)
    }
    if (step === 'feedback2') {
      context.textAlign = 'center'
      context.fillStyle = 'darkRed'
      const lineComplete = 'Stage 2 Complete'
      context.fillText(lineComplete, graphX + 0.5 * graphWidth, lineY2 + 29)
    }
  }
  const drawCountdownText = function () {
    context.fillStyle = 'black'
    context.textBaseline = 'top'
    context.textAlign = 'center'
    context.fillText(`Countdown: ${countdown}`, graphX + 0.5 * graphWidth, lineY2 + 17.5)
  }
  const drawFeedback1Text = function () {
    context.textBaseline = 'top'
    context.textAlign = 'center'
    context.fillStyle = darkGreen
    const score1CompleteString = 'Probability 1 Implemented'
    context.fillText(score1CompleteString, graphX + 0.5 * graphWidth, lineY2 - 10)
  }
  const drawBarGiftCard = function () {
    context.fillStyle = black
    context.strokeStyle = 'black'
    context.lineWidth = 0.25
    context.beginPath()
    const barX = 70
    const baseY = -10
    const barWidth = 10
    const barHeight = 20
    context.moveTo(barX - 0.5 * barWidth, baseY - barHeight)
    context.lineTo(barX - 0.5 * barWidth, baseY)
    context.lineTo(barX + 0.5 * barWidth, baseY)
    context.lineTo(barX + 0.5 * barWidth, baseY - barHeight)
    context.stroke()
    context.fillStyle = green
    const winProb = (score[1] + score[2]) * 100
    const barLevelTotal = barHeight * winProb / 100
    context.fillRect(barX - 0.5 * barWidth, baseY - barLevelTotal, barWidth, barLevelTotal)
    context.fillStyle = darkGreen
    const score1 = score[1] * 100
    const barLevel1 = barHeight * score1 / 100
    context.fillRect(barX - 0.5 * barWidth, baseY - barLevel1, barWidth, barLevel1)
    const numTicks = 3
    const tickLength = 2
    const tickSpace = 1
    context.font = tickFont
    context.fillStyle = black
    context.textAlign = 'center'
    context.textBaseline = 'top'
    arange(numTicks).forEach(i => {
      const weight = i / (numTicks - 1)
      const y = (1 - weight) * baseY + weight * (baseY - barHeight)
      const xRight1 = barX - 0.5 * barWidth
      const xLeft1 = barX - 0.5 * barWidth - tickLength
      context.beginPath()
      context.moveTo(xRight1, y)
      context.lineTo(xLeft1, y)
      context.stroke()
      const xRight2 = barX + 0.5 * barWidth + tickLength
      const xLeft2 = barX + 0.5 * barWidth
      context.beginPath()
      context.moveTo(xRight2, y)
      context.lineTo(xLeft2, y)
      context.stroke()
      const yWinProbLabel = `${100 * weight}%`
      context.textBaseline = 'middle'
      context.textAlign = 'left'
      context.fillText(yWinProbLabel, barX + 0.5 * barWidth + tickLength + tickSpace, y)
      context.textAlign = 'right'
      context.fillText(yWinProbLabel, barX - 0.5 * barWidth - tickLength - tickSpace, y)
    })
    context.fillStyle = darkGreen
    context.textAlign = 'center'
    const winProbString = `$${giftValue.toFixed(0)} Gift Card: ${winProb.toFixed(0)}%`
    context.fillText(winProbString, barX, baseY + 5)
  }
  const drawBarBonus = function () {
    context.fillStyle = black
    context.strokeStyle = 'black'
    context.lineWidth = 0.25
    context.beginPath()
    const barX = 30
    const baseY = -10
    const barWidth = 10
    const barHeight = 20
    context.moveTo(barX - 0.5 * barWidth, baseY - barHeight)
    context.lineTo(barX - 0.5 * barWidth, baseY)
    context.lineTo(barX + 0.5 * barWidth, baseY)
    context.lineTo(barX + 0.5 * barWidth, baseY - barHeight)
    context.stroke()
    context.fillStyle = blue
    const winProb = 100 - (score[1] + score[2]) * 100
    if (stage === 2) {
      const barLevelTotal = barHeight * winProb / 100
      context.fillRect(barX - 0.5 * barWidth, baseY - barLevelTotal, barWidth, barLevelTotal)
    }
    context.fillStyle = darkBlue
    const score1 = 50 - score[1] * 100
    const barLevel1 = barHeight * score1 / 100
    context.fillRect(barX - 0.5 * barWidth, baseY - barLevel1, barWidth, barLevel1)
    const numTicks = 3
    const tickLength = 2
    const tickSpace = 1
    context.font = tickFont
    context.fillStyle = black
    context.textAlign = 'center'
    context.textBaseline = 'top'
    arange(numTicks).forEach(i => {
      const weight = i / (numTicks - 1)
      const y = (1 - weight) * baseY + weight * (baseY - barHeight)
      const xRight1 = barX - 0.5 * barWidth
      const xLeft1 = barX - 0.5 * barWidth - tickLength
      context.beginPath()
      context.moveTo(xRight1, y)
      context.lineTo(xLeft1, y)
      context.stroke()
      const xRight2 = barX + 0.5 * barWidth + tickLength
      const xLeft2 = barX + 0.5 * barWidth
      context.beginPath()
      context.moveTo(xRight2, y)
      context.lineTo(xLeft2, y)
      context.stroke()
      const yWinProbLabel = `${100 * weight}%`
      context.textBaseline = 'middle'
      context.textAlign = 'left'
      context.fillText(yWinProbLabel, barX + 0.5 * barWidth + tickLength + tickSpace, y)
      context.textAlign = 'right'
      context.fillText(yWinProbLabel, barX - 0.5 * barWidth - tickLength - tickSpace, y)
    })
    context.fillStyle = darkBlue
    context.textAlign = 'center'
    const winProbString1 = `$${bonus.toFixed(0)} Bonus: ${score1.toFixed(0)}%`
    const winProbString2 = `$${bonus.toFixed(0)} Bonus: ${winProb.toFixed(0)}%`
    const winProbString = step === 'choice1' || step === 'feedback1' ? winProbString1 : winProbString2
    context.fillText(winProbString, barX, baseY + 5)
  }

  const writeOutcome = function () {
    completeTextDiv.innerHTML = ''
    completeTextDiv.innerHTML += `You will receive $${endowment.toFixed(0)} upon completion.<br>`
    const bonusTextA = `You won the $${bonus.toFixed(0)} bonus.`
    const bonusTextB = `You did not win the $${bonus.toFixed(0)} bonus.`
    const giftCardTextA = `You won the $${giftValue.toFixed(0)} Starbucks gift card.`
    const giftCardTextB = `You did not win the $${giftValue.toFixed(0)} Starbucks gift card.`
    completeTextDiv.innerHTML += winPrize ? bonusTextB : giftCardTextB
    completeTextDiv.innerHTML += '<br>'
    completeTextDiv.innerHTML += winPrize ? giftCardTextA : bonusTextA
    giftBitLinkDiv.innerHTML = ''
    console.log('winPrize', winPrize)
    console.log('completionURL', completionURL)
    console.log('giftURL', giftURL)
    paymentLink.href = completionURL
    paymentLink.target = '_self'
    copyURLDiv.style.display = 'none'
    bonusDiv.style.display = 'none'
    if (winPrize) {
      giftBitLinkDiv.innerHTML += `Your gift card URL: <br> ${giftURL}`
      paymentLink.target = '_blank'
      copyURLDiv.style.display = 'block'
    } else {
      bonusDiv.style.display = 'block'
    }
  }
}