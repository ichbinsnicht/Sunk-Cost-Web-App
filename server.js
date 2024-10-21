import path from 'path'
import express from 'express'
import http from 'http'
import https from 'https'
import { Server as SocketIoServer } from 'socket.io'
import { fileURLToPath } from 'url'
import fs from 'fs-extra'
import { sendMesssage } from './prolific.js'
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
      socket.on('joinGame', (msg) => {
        console.log('joinGame', msg.id)
        if (!subjects[msg.id]) this.game.createSubject(msg, socket)
        socket.emit('clientJoined', { id: msg.id, hist: subjects[msg.id].hist, period: subjects[msg.id].period })
        console.log('Object.keys(subjects)', Object.keys(subjects))
      })
      socket.on('clientEngagement', (msg) => {
        this.scribe.updateEngagementFile(msg)
      })
      socket.on('clientClick', (msg) => {
        this.scribe.updateClickFile(msg)
      })
      socket.on('beginPreSurvey', (msg) => {
        console.log('beginPreSurvey')
        const subject = subjects[msg.id]
        if (subject.state === 'welcome') {
          subject.state = 'preSurvey'
        }
      })
      socket.on('submitPreSurvey', (msg) => {
        console.log('submitPreSurvey')
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
      socket.on('beginExperiment', (msg) => {
        const subject = subjects[msg.id]
        if (subject.practicePeriodsComplete && subject.state === 'instructions') {
          subject.experimentStarted = true
          this.game.setupHist(subject)
          subject.state = 'interface'
        }
      })
      socket.on('requestPayment', (msg) => {
        const subject = subjects[msg.id]
        if (subject.state === 'experimentComplete') {
          this.scribe.updatePaymentFile(subject)
          this.scribe.updateBonusFile(subject)
          const reply = {
            id: subject.id
          }
          if (subject.winPrize) sendMesssage(subject.id, `Your gift card is here: ${subject.giftURL}`)
          socket.emit('paymentComplete', reply)
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
            winPrize: subject.winPrize,
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
      socket.on('clientUpdate', (msg) => {
        const subject = subjects[msg.id]
        if (subject) {
          subject.clicked = msg.clicked
          const step = subject.step
          const histPeriod = subject.hist[msg.period]
          const choosing = step === 'choice1' || step === 'choice2'
          if (subject.period === msg.period && step === msg.step) {
            if (choosing) {
              histPeriod.choice[msg.stage] = msg.currentChoice
              histPeriod.score[msg.stage] = msg.currentScore
            }
          }
          const reply = {
            period: subject.period,
            state: subject.state,
            experimentStarted: subject.experimentStarted,
            practicePeriodsComplete: subject.practicePeriodsComplete,
            numPracticePeriods: this.game.numPracticePeriods,
            endowment: this.game.endowment,
            step: subject.step,
            stage: subject.stage,
            countdown: subject.countdown,
            outcomeRandom: subject.outcomeRandom,
            winPrize: subject.winPrize,
            giftValue: this.game.giftValue,
            totalCost: subject.totalCost,
            earnings: subject.earnings,
            hist: subject.hist,
            bonus: this.game.bonus,
            completionURL: subject.state === 'experimentComplete' ? this.completionURL : '',
            giftURL: subject.state === 'experimentComplete' ? subject.giftURL : ''
          }
          socket.emit('serverUpdateClient', reply)
        } else { // restart server: solving issue that client does not know that
          this.game.createSubject(msg, socket)
          socket.emit('clientJoined', { id: msg.id })
        }
      })
    })
  }
}
