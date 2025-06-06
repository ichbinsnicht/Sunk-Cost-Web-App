// TO-DO

// also interface: mention that people got the gift card
// - double check parameters prior to execution
// - scale up everything (to better understand dynamics and heterogeneity, non-linearities)
//
// framing:
// company manager wants to engage in an investment: CEO approves or not
// CEO approves --> continue with investment (sunk cost fallacy)
//
// stated preferences as assistance for the design!
// add questions: individuals that have problem with authority
// (revealed preference against authority)
// wieviel wuerdet ihr zahlen, damit ihr selber eine Entscheidung treffen koennt?
// Authoritaet vs Praeferenzen gegen andere (Alex Staub)
// Autoritaet kann gegen meine eigene Praeferenzen gehen (Expertise, Einfacher)
// --> Aversion gegen Autoritaet

// Ihr seht was der Diktator euch geben wuerde, auch wenn ihr fuer eure Entscheidung getroffen HTMLTableCaptionElement.
// bekommt was sie wollen und nehmen immer was sie wollen (starke Praeferenzen, kein Problem mit Autoritaet)
// Nicht-Zahlen

// Are Prolific subjects more rational than lab subjects?
// - Best available proxy. Use cognitive reflection questions from our study and compare to others.

// Other thoughts from Vechta:
// - Hypothetical WTA of starbucks gift card?
// - How often do you visit starbucks?
// - Strategy method of $6 SB $1 cash (as a control variable)

// failure of current experiment: solution anchoring effect ((3-2), (1-2)  bonus switch)
// Anchoring - Further Design Thoughts:
// Stage 1 - Rationality
// pick bonus more often in T1 than in T2
//
// Stage 2 - Rationality
// pick bonus equally often for T1 and T2

// Stage 2 - Habit Formation
// pick bonus more often in T1 than in T2

// Stage 2 - Overreaction
// pick bonus less often in T1 than in T2

// mid-level manager chooses between two projects but is unsure which to pick:
// mid-level says: A (with some uncertainty)
// higher-level manager says: B
// mid-level manager is forced to use B
// next time, mid-level manager really chooses A (preference has strengthened).

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
