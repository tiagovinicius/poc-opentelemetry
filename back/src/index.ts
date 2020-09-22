import express from 'express';
import cors from 'cors';
import { TracerFactory } from './telemetry';

const app = express();
const port = 3001;

const { trace, traceRequest } = TracerFactory.create();

const someManager = (...args) => trace({ component: 'managers', method: 'someManager' },
    (name) => `Hello ${name}!`
)(...args);

const anotherManager = (...args) => trace({ component: 'managers', method: 'anotherManager' },
    () => { throw new Error('Some exception raised by the application'); }
)(...args);

const someActionThatWillSucceed = (...args) => trace({ component: 'actions', method: 'someActionThatWillSucceed' },
(req, res) => {
      const { name } = req.query;
      res.json(someManager(name));
    }
)(...args);

const someActionThatWillFail = (...args) => trace({ component: 'actions', method: 'someActionThatWillFail' },
() => anotherManager()
)(...args);

app.use(cors());
// app.use(traceRequest);
app.get('/will-succeed/', someActionThatWillSucceed);
app.get('/will-fail/', someActionThatWillFail);

app.listen(port, () => {});

