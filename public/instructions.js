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
      This is an experiment about decision making. You will receive $${endowment} just for participating. Depending on the decisions you make, you will also receive either a bonus of $${bonus} or a $${giftValue} Starbucks gift card.
      ${this.imageHTML}
      This experiment will have two stages: stage 1 and stage 2. In each stage, you will make a choice which may affect your probability of receiving the $${bonus} bonus or the $${giftValue} Starbucks gift card.`
    const instructionsString2 = `
      Stage 1:<br>
      <ul>
          <li> You will choose a number between 0% and 100%, called Choice 1.</li>
          <li> There is a 50% chance that Probability 1 will equal Choice 1.</li>
          <li> Otherwise, Probability 1 will be chosen randomly.</li>
      </ul>
      <br>Stage 2:<br>
      <ul>
          <li> You will choose a number between 0% and 100%, called Choice 2.</li>
          <li> Probability 2 will equal Choice 2.</li>
      </ul>`
    const instructionsString3 = `
      During each stage, you can select your choice by clicking on the graph with your mouse. Your choice will be locked in at the end of the stage.
      
      <br><br> At the end of the experiment, one of the two stages will be chosen at random. Your chance of receiving the $${giftValue} Starbucks gift card will be the probability selected in that stage. Your chance of receiving the $${bonus} bonus will be 100% minus your chance of receiving the $${giftValue} Starbucks gift card. <br><br>`

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
