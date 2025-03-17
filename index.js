// TO DO:
// - update quiz
// - run experiment

// For each session:
// -----------------------------------
// remaining.csv (needs to be empty)
// ledger.csv (needs to be empty)
// links.csv (for that session)

// Literature:
// ML and Standard Errors List etc. https://www.linkedin.com/posts/johnalist_using-machine-learning-for-efficient-flexible-activity-7261775230426136579-Jvx-?utm_source=share&utm_medium=member_desktop

// set up web server
// --------------------------
// update stage times and practice period numbers for experiment (index.js)
// npm install
// config.json for https
//    port: 443
//    secure: true
// move files (links.csv, ledger.csv, remaining.csv) to links folder
// call nohup on server (README.md)

// For test:
// - set up prolific study with 10 subjects
// - set up gift bit links on server (links.csv)
// - server should communicate with prolific
// - send out invitations

// For testing purposes with API:
// http://localhost:3000/?PROLIFIC_PID=6650ce123adb3cef7f74e354&STUDY_ID=GiftCard&SESSION_ID=Session
// https://trialparticipation.com/?PROLIFIC_PID=6650ce123adb3cef7f74e354&STUDY_ID=GiftCard&SESSION_ID=Session
// Manuel: 6650ce123adb3cef7f74e354
// Daniel: 6650ce878485cd00aa153bd6

// SETUP Prolific
// - Pilot: Prolific students
// - Desktop Only on Prolific
// -->  mobile excluded due to canvas setup
//
// - prolific details
//   URL parameters for login:
//   http://localhost:3000/?PROLIFIC_PID=1&STUDY_ID=GiftCard&SESSION_ID=Something
//   https://trialparticipation.com/?PROLIFIC_PID=1&STUDY_ID=GiftCard&SESSION_ID=Something
//
// - giftbit.com
// - https://app.giftbit.com/app/order/pay/bda63b3c49eb433995fccd4996eb54e2
// - https://docs.prolific.com/docs/api-docs/public/#tag/Messages/operation/SendMessage

// TODO B
// Work on ML 'application'

// TODO D Alternative to Prolific. Mturk
// Sandbox
// Notify Workers (Email): https://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_NotifyWorkersOperation.html
// Bonus Payment for Workers: https://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_SendBonusOperation.html

// - ML analysis
//
// Alternative version:
// Fall 2024. Full Experiment.
// - Between Spring and Fall 2024: ML analysis to improve SE (barrier: can ML predict out of sample better? if so, then move forward)
// 1) create ML repository
// - Create Firm-Employee Field Experimental Website
//
// PUSH: adjust parameters to the true values
//

import { Server } from './server.js'

const server = new Server()
console.log('server', server.completionURL)
