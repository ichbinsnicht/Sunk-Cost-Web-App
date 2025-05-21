export class Quiz {
  constructor (client) {
    this.quiz1 = document.getElementById('quiz1')
    this.quiz2 = document.getElementById('quiz2')
    this.submitQuizButton = document.getElementById('submitQuizButton')
    this.beginExperimentText = document.getElementById('beginExperimentText')
    this.client = client
    window.nextPage = () => this.nextPage()
    window.submitQuiz = () => this.submitQuiz()
  }

  submitQuiz () {
    const correctAnswer1 = Number(this.quiz1.value) === this.client.endowment
    const correctAnswer2 = this.quiz2.value === 'random'

    if (!correctAnswer1) {
      window.alert('Question 1 is incorrect. Please try again.')
      return
    }
    if (!correctAnswer2) {
      window.alert('Question 2 is incorrect. Please try again.')
      return
    }
    console.log('All Correct!')
    this.client.quizComplete = true
    this.client.socket.emit('quizComplete', { id: this.client.id })
  }
}
