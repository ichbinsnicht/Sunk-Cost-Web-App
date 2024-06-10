// Message API for Prolific
//
// Prolific test accounts
// manuelhoffmann@g.harvard.edu: 6650ce123adb3cef7f74e354
// dgstephenson.econ+test@gmail.com: 6650ce878485cd00aa153bd6
//
// https://docs.prolific.com/docs/api-docs/public/#tag/Messages/operation/SendMessage

import https from 'https'

const prolificAuthorization = 'Token c-5FPy0ltEryNu_38lkMHZi-DVnC7odOgCtk379xD_lEKNT3z6r8Sb8njqGoJ4Em3oM_UW1zA7zSck1zLGisM6KbW4NrJjgY90J2Oso68aAzDQQFQxi_FCJp'

export function logStudies () {
  const options = {
    hostname: 'api.prolific.com',
    path: '/api/v1/studies/',
    method: 'GET',
    headers: {
      Authorization: prolificAuthorization
    },
    query: {
      state: 'ACTIVE'
    }
  }
  const request = https.request(options, response => {
    console.log(`statusCode: ${response.statusCode}`)
    let data = ''
    response.on('data', chunk => {
      data += chunk
    })
    response.on('end', () => {
      const studies = JSON.parse(data).results
      console.log('studies:')
      studies.forEach(study => {
        console.log(study.id, study.status)
      })
    })
  })
  request.on('error', (error) => {
    console.error(error)
  })
  request.end()
}

export function sendMesssage (recipient, message) {
  const postData = JSON.stringify({
    recipient_id: recipient,
    body: message,
    study_id: '66574c8610e94d979f32aa80'
  })
  const options = {
    hostname: 'api.prolific.com',
    path: '/api/v1/messages/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': postData.length,
      Authorization: prolificAuthorization
    },
    query: {
      state: 'ACTIVE'
    }
  }
  const request = https.request(options, response => {
    console.log(`statusCode: ${response.statusCode}`)
  })
  request.on('error', (error) => {
    console.error(error)
  })
  request.write(postData)
  request.end()
}
