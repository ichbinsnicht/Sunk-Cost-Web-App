/* global io */
const infoDiv = document.getElementById('infoDiv')
const subjectsTable = document.getElementById('subjectsTable')
const socket = io()

let numSubjects = 0
let message = {}
let subjects = []

document.onmousedown = function () {
  console.log(message)
}
socket.on('connected', function (msg) {
  console.log('connected')
  setInterval(update, 100)
})
socket.on('serverUpdateManager', function (msg) {
  message = msg
  numSubjects = msg.numSubjects
  subjects = msg.subjectsData

  let infoString = ''
  infoString += `${numSubjects} Subjects <br>`
  infoDiv.innerHTML = infoString
  let tableString = ''
  tableString += `<tr>
    <td>ID</td>
    <td>State</td>
    <td>Practice</td>
    <td>Period</td>
    <td>Step</td>
    <td>Countdown</td>
    <td>Selected Period</td>
    <td>Earnings</td>
    <td>WinPrize</td>
  </tr>`
  subjects.forEach(subject => {
    const earnings = subject.selectedEarnings.toFixed(0)
    const winPrize = subject.selectedWinPrize === 1
    const experimentComplete = subject.state === 'experimentComplete' || subject.state === 'postSurvey'
    const payReady = (subject.period > subject.selectedPeriod || experimentComplete) && !subject.practice
    const earningsMessage = payReady ? earnings : 'NA'
    const winPrizeMessage = payReady ? winPrize : 'NA'
    tableString += `<tr>
        <td>${subject.id}</td>
        <td>${subject.state}</td>
        <td>${subject.practice}</td>
        <td>${subject.period}</td>
        <td>${subject.step}</td>
        <td>${subject.countdown}</td>
        <td>${subject.selectedPeriod}</td>
        <td>${earningsMessage}</td>
        <td>${winPrizeMessage}</td>
    </tr>`
  })
  subjectsTable.innerHTML = tableString
})

const update = function () {
  const msg = {}
  socket.emit('managerUpdate', msg)
}
