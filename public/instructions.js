export class Instructions {
  constructor (client) {
    this.imageStyle = `width:${1.5 * 14.2}vh;height:${1.5 * 9}vh;margin-left:auto;margin-right:auto;margin-top:3vmin;margin-bottom:3vmin;display:block;`
    this.imageHTML = `<img src="GiftCard.png" style="${this.imageStyle}"/>`
    this.instructionsPage = 1
    this.client = client
  }

  getInstructionString () {
    const endowment = this.client.endowment.toFixed(0)
    const bonus = this.client.bonus.toFixed(0)
    const giftValue = this.client.giftValue.toFixed(0)
    const numPracticePeriods = this.client.numPracticePeriods
    const instructionsString1 = `
      This is an experiment about decision making. You will receive $${endowment} just for participating. Depending on the decisions you make, you will also receive either a $${bonus} bonus or a $${giftValue} Starbucks gift card.
      ${this.imageHTML}
      This experiment will have two stages: stage 1 and stage 2. In each stage, you will make a choice which will affect your probability of receiving the $${bonus} bonus or the $${giftValue} Starbucks gift card.`
    const instructionsString2 = `
      Stage 1:<br>
      <ul>
          <li> You will choose either the $${bonus} bonus or the $${giftValue} Starbucks gift card.</li>
          <li> There is a <b>60%</b> chance that you will win the option you chose.</li>
          <li> There is a <b>40%</b> chance that you will win the other option.</li>
      </ul>
      <br>Stage 2:<br>
      <ul>
          <li> You will choose either the $${bonus} bonus or the $${giftValue} Starbucks gift card.</li>
          <li> There is a <b>100%</b> chance that you will win the option you chose. </li>
          <li> There is a <b>0%</b> chance that you will win the other option.</li>
      </ul>`
    const instructionsString3 = `
    
      <br><br> At the end of the experiment, one of the two stages will be chosen at random. You will receive the option you won in the randomly chosen stage. You will also receive $${endowment} just for participating. <br><br>`

    const readyPracticeString = `
      First, you will participate in ${numPracticePeriods} practice periods. The practice periods will not affect your final earnings. They are just for practice. Afterwards, you will start the experiment. <br><br> Please click the button below to begin the practice periods.`
    const readyExperimentString = 'Please click the button below to begin the experiment.'

    const readyString = this.client.practicePeriodsComplete
      ? readyExperimentString
      : readyPracticeString
    const instructionsString4 = readyString

    const instructionsStrings = [
      instructionsString1,
      instructionsString2,
      instructionsString3,
      instructionsString4
    ]

    return instructionsStrings[this.instructionsPage - 1]
  }
}
