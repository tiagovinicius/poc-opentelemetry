
const express = require('express')
const app = express()
const port = 3001

app.get('/', (req, res) => {
  const { name } = req.query
  res.send(`Hello ${name}!`)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
