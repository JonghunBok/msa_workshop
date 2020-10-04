const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json())

const axios = require('axios')

const port = process.env['NODE_PORT']

app.post('/', (req, res) => {
  console.log(req.body)

  res.send(port)
})

app.get('/', (req, res) => {
  axios
    .post(`http://localhost:${ +port + 2 }`, {
      port: port 
    })
    .then(internal_res => {
      res.send(`Hello From ${port}, got ${ internal_res.data } !`)
    })
    .catch(console.log)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})


