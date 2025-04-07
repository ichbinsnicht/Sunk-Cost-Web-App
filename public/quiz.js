export class Quiz {
  constructor (client) {
    this.quiz1 = document.getElementById('quiz1')
    this.quiz2 = document.getElementById('quiz2')
    this.quiz3 = document.getElementById('quiz3')
    this.submitQuizButton = document.getElementById('submitQuizButton')
    this.understandingQuiz = document.getElementById('understandingQuiz')
    this.beginExperimentText = document.getElementById('beginExperimentText')
    this.client = client
    window.submitQuiz = () => this.submitQuiz()
  }

  submitQuiz () {
    const correctAnswer1 = Number(this.quiz1.value) === 1
    const correctAnswer2 = Number(this.quiz2.value) === 6
    const correctAnswer3 = Number(this.quiz3.value) === 50
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
    console.log('All Correct!')
    this.client.quizComplete = true
    this.client.socket.emit('quizComplete', { id: this.client.id })
  }
}
