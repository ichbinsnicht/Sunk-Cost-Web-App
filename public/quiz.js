export class Quiz {
  constructor (client) {
    this.quiz1 = document.getElementById('quiz1')
    this.quiz2 = document.getElementById('quiz2')
    this.quiz3 = document.getElementById('quiz3')
    this.quiz4 = document.getElementById('quiz4')
    this.quiz5 = document.getElementById('quiz5')
    this.quiz6 = document.getElementById('quiz6')
    this.submitQuizButton = document.getElementById('submitQuizButton')
    this.beginExperimentText = document.getElementById('beginExperimentText')
    this.client = client
    window.nextPage = () => this.nextPage()
    window.submitQuiz = () => this.submitQuiz()
  }

  nextPage () {
    console.log('nextPage')
    const correctAnswer1 = this.quiz1.value === '0'
    const correctAnswer2 = this.quiz2.value === `${this.client.extraEndowment}`
    const correctAnswer3 = this.quiz3.value === '50'
    if (!correctAnswer1) {
      window.alert('Question 1 is incorrect. Please try again.')
      return
    }
    if (!correctAnswer2) {
      window.alert('Question 2 is incorrect. Please try again.')
      return
    }
    if (!correctAnswer3) {
      window.alert('Question 3 is incorrect. Please try again.')
      return
    }
    this.client.instructions.instructionsPage++
    console.log('this.client.instructions.instructionsPage', this.client.instructions.instructionsPage)
  }

  submitQuiz () {
    const correctAnswer1 = this.quiz1.value === '0'
    const correctAnswer2 = this.quiz2.value === `${this.client.extraEndowment}`
    const correctAnswer3 = this.quiz3.value === '50'
    const correctAnswer4 = this.quiz4.value === 'random'
    const correctAnswer5 = this.quiz5.value === `${this.client.extraEndowment}`
    const correctAnswer6 = this.quiz6.value === '0'

    if (!correctAnswer1) {
      window.alert('Question 1 is incorrect. Please try again.')
      return
    }
    if (!correctAnswer2) {
      window.alert('Question 2 is incorrect. Please try again.')
      return
    }
    if (!correctAnswer3) {
      window.alert('Question 3 is incorrect. Please try again.')
      return
    }
    if (this.quiz4.value === 'choose') {
      window.alert('Please select an answer to Question 4.')
      return
    }
    if (!correctAnswer4) {
      window.alert('Question 4 is incorrect. Please try again.')
      return
    }
    if (!correctAnswer5) {
      window.alert('Question 5 is incorrect. Please try again.')
      return
    }
    if (!correctAnswer6) {
      window.alert('Question 6 is incorrect. Please try again.')
      return
    }
    console.log('All Correct!')
    this.client.quizComplete = true
    this.client.socket.emit('quizComplete', { id: this.client.id })
  }
}
