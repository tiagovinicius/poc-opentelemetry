import express from 'express';
import cors from 'cors';

const app = express();
const port = 3001;

const manager = (name) => `Hello ${name}!`;
const action = (req, res) => {
  const { name } = req.query;
  res.json(manager(name));
};

app.use(cors());
app.get('/', action);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});
