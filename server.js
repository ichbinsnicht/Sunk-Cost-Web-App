import path from 'path'
import express from 'express'
import http from 'http'
import https from 'https'
import { Server as SocketIoServer } from 'socket.io'
import { fileURLToPath } from 'url'
import fs from 'fs-extra'
import { Game } from './game.js'
import { Scribe } from './scribe.js'

export class Server {
  constructor () {
    this.completionURL = 'https://app.prolific.com/submissions/complete?cc=C1NU8C6K'
    this.scribe = new Scribe(this)
    this.game = new Game(this)
    this.setup()
    this.setupIo()
  }

  setup () {
    this.filename = fileURLToPath(import.meta.url)
    this.dirname = path.dirname(this.filename)
    this.app = express()
    this.configPath = path.join(this.dirname, 'config.json')
    const configExists = fs.existsSync(this.configPath)
    this.config = configExists ? fs.readJSONSync(this.configPath) : {}
    if (!configExists) {
      this.config.port = 3000
      this.config.secure = false
    }
    this.server = this.config.secure ? this.makeSecureServer() : http.Server(this.app)
    console.log(this.config)
    this.io = new SocketIoServer(this.server)
    this.server.listen(this.config.port, () => {
      console.log(`listening on port ${this.config.port}`)
    })
    this.app.use(express.static(path.join(this.dirname, 'public')))
    this.app.get('/socketIo/:fileName', (req, res) => {
      res.sendFile(path.join(this.dirname, 'node_modules', 'socket.io', 'client-dist', req.params.fileName))
    })
    this.app.get('/manager', (req, res) => {
      res.sendFile(path.join(this.dirname, '/public/manager.html'))
    })
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(this.dirname, '/public/client.html'))
    })
  }

  makeSecureServer () {
    const key = fs.readFileSync('./_.trialparticipation.com_private_key.key')
    const cert = fs.readFileSync('./trialparticipation.com_ssl_certificate.cer')
    const credentials = { key, cert }
    return new https.Server(credentials, this.app)
  }

  setupIo () {
    const subjects = this.game.subjects
    this.io.on('connection', (socket) => {
      socket.emit('connected')
      console.log(`connected ${socket.id}`)
      socket.on('joinGame', (msg) => {
        console.log('joinGame', msg.id, socket.id)
        if (!subjects[msg.id]) this.game.createSubject(msg, socket)
        socket.emit('clientJoined', { id: msg.id, hist: subjects[msg.id].hist, period: subjects[msg.id].period })
      })
      socket.on('clientEngagement', (msg) => {
        this.scribe.updateEngagementFile(msg)
      })
      socket.on('beginPreSurvey', (msg) => {
        console.log('beginPreSurvey', msg.id)
        const subject = subjects[msg.id]
        if (subject.state === 'welcome') {
          subject.state = 'preSurvey'
        }
      })
      socket.on('submitPreSurvey', (msg) => {
        console.log('submitPreSurvey', msg.id)
        const subject = subjects[msg.id]
        this.scribe.updatePreSurveyFile(msg)
        if (subject.state === 'preSurvey') {
          subject.preSurveySubmitted = true
          subject.state = 'instructions'
        }
      })
      socket.on('beginPracticePeriods', (msg) => {
        const subject = subjects[msg.id]
        if (subject.state === 'instructions') {
          subject.state = 'interface'
          console.log('beginPracticePeriods', msg.id)
        }
      })
      socket.on('quizComplete', (msg) => {
        const subject = subjects[msg.id]
        console.log('quizComplete', subject.id)
        subject.onQuizComplete()
      })
      socket.on('beginExperiment', (msg) => {
        const subject = subjects[msg.id]
        if (subject.practicePeriodsComplete && subject.state === 'instructions') {
          subject.experimentStarted = true
          subject.setupHist(subject)
          subject.state = 'sliderTask'
        }
      })
      socket.on('sliderTaskComplete', (id) => {
        const subject = subjects[id]
        if (subject) {
          console.log('sliderTaskComplete', id)
          subject.state = 'interface'
        } else {
          console.error(`Subject with id ${id} not found`)
        }
      })
      socket.on('yesButton', (id) => {
        const subject = subjects[id]
        if (subject) {
          console.log('yesButton', id)
          subject.hist[subject.period].choice = 1
          console.log('subject.hist', subject.hist)
        } else {
          console.error(`Subject with id ${id} not found`)
        }
      })
      socket.on('noButton', (id) => {
        const subject = subjects[id]
        if (subject) {
          console.log('noButton', id)
          subject.hist[subject.period].choice = -1
          console.log('subject.hist', subject.hist)
        } else {
          console.error(`Subject with id ${id} not found`)
        }
      })

      socket.on('managerUpdate', (msg) => {
        const ids = Object.keys(subjects)
        const subjectsArray = Object.values(subjects)
        const subjectsData = subjectsArray.map(subject => {
          return {
            id: subject.id,
            step: subject.step,
            period: subject.period,
            countdown: subject.countdown,
            state: subject.state,
            earnings: subject.earnings,
            winGiftCard: subject.winGiftCard,
            practice: !subject.practicePeriodsComplete
          }
        })
        const reply = {
          numSubjects: this.game.numSubjects,
          ids,
          subjectsData
        }
        socket.emit('serverUpdateManager', reply)
      })
      socket.on('clientClick', (msg) => {
        this.scribe.updateClickFile(msg)
      })
      socket.on('nextPeriod', (msg) => {
        const subject = this.game.subjects[msg.id]
        const ready = subject.countdown <= 0 && subject.step !== 'end'
        if (ready) subject.nextPeriod()
      })
      socket.on('clientUpdate', (msg) => {
        const subject = this.game.subjects[msg.id]
        if (subject) {
          const reply = {
            period: subject.period,
            state: subject.state,
            experimentStarted: subject.experimentStarted,
            practicePeriodsComplete: subject.practicePeriodsComplete,
            numPracticePeriods: this.game.numPracticePeriods,
            endowment: this.game.endowment,
            step: subject.step,
            countdown: subject.countdown,
            winGiftCard: subject.winGiftCard,
            giftValue: this.game.giftValue,
            earnings: subject.earnings,
            hist: subject.hist,
            bonus: this.game.bonus,
            numPeriods: this.game.numPeriods,
            baseEndowment: this.game.baseEndowment,
            extraEndowment: this.game.extraEndowment,
            completionURL: subject.state === 'experimentComplete' ? this.completionURL : '',
            giftURL: subject.state === 'experimentComplete' ? subject.giftURL : ''
          }
          socket.emit('serverUpdateClient', reply)
        } else { // restart server: solving issue that client does not know that
          this.game.createSubject(msg, socket)
          socket.emit('clientJoined', { id: msg.id })
          console.log('clientJoined', msg.id)
        }
      })
    })
  }
}
