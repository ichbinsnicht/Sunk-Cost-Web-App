export class Quiz {
  constructor (client) {
    this.quiz1 = document.getElementById('quiz1')
    this.quiz2 = document.getElementById('quiz2')
    this.quiz3 = document.getElementById('quiz3')
    this.quiz4 = document.getElementById('quiz4')
    this.quiz5 = document.getElementById('quiz5')
    this.quiz6 = document.getElementById('quiz6')
    this.quiz7 = document.getElementById('quiz7')
    this.quiz8 = document.getElementById('quiz8')
    this.submitQuizButton = document.getElementById('submitQuizButton')
    this.client = client
    window.submitQuiz = () => this.submitQuiz()
  }

  nextPageQuiz () {
    const correctAnswer1 = parseFloat(this.quiz1.value) === 50
    const correctAnswer2 = parseFloat(this.quiz2.value) === 100
    const correctAnswer3 = parseFloat(this.quiz3.value) === 100
    const correctAnswer4 = parseFloat(this.quiz4.value) === 40
    if (!correctAnswer1) {
      window.alert('Question 1 is incorrect. Please try again.')
      return false
    }
    if (!correctAnswer2) {
      window.alert('Question 2 is incorrect. Please try again.')
      return false
    }
    if (!correctAnswer3) {
      window.alert('Question 3 is incorrect. Please try again.')
      return false
    }
    if (!correctAnswer4) {
      window.alert('Question 4 is incorrect. Please try again.')
      return false
    }
    console.log('All Correct!')
    return true
  }

  submitQuiz () {
    const correctAnswer5 = parseFloat(this.quiz5.value) === 80
    const correctAnswer6 = parseFloat(this.quiz6.value) === 60
    const correctAnswer7 = parseFloat(this.quiz7.value) === 0
    const correctAnswer8 = parseFloat(this.quiz8.value) === 0
    if (!correctAnswer5) {
      window.alert('Question 5 is incorrect. Please try again.')
      return
    }
    if (!correctAnswer6) {
      window.alert('Question 6 is incorrect. Please try again.')
      return
    }
    if (!correctAnswer7) {
      window.alert('Question 7 is incorrect. Please try again.')
      return
    }
    if (!correctAnswer8) {
      window.alert('Question 8 is incorrect. Please try again.')
      return
    }
    console.log('All Correct!')
    this.client.quizComplete = true
    this.client.socket.emit('quizComplete', { id: this.client.id })
    this.client.instructions.instructionsPage++
  }
}
