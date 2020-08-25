
const express = require('express')
const cors = require('cors');
const app = express()
const port = 3001

app.use(cors())
app.get('/', (req, res) => {
  const { name } = req.query
  res.json(`Hello ${name}!`)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
