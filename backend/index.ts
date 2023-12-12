// import "dotenv/config.js";
import * as dotenv from 'dotenv';
dotenv.config();
import express,{Application,static as static_,json} from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { join } from 'path';
import compression from 'compression'
import session from 'express-session';
import chatRouter from "./routes/chat";
const app : Application = express();
app.use(morgan('common'));
app.use(json());
app.use(session({
    secret: 'ajksdhajdha',
    resave: false,
    saveUninitialized: true,
    })
)
app.use(cors({
    // origin: FRONTEND_URL,
    credentials:true
}));
app.use(compression())
app.use('/api/chat',chatRouter);

app.get('/hello', (req, res) => {
        // req.session.counter++
        res.send(`Hello there ${req.session.toString()} times ${typeof req.session}`)
})

app.use('/', static_(join(__dirname,'../frontend/dist')));

app.get('*', (_req, res) => {
    res.sendFile(join(__dirname, '../frontend/dist/index.html'));
})

const port = process.argv[2] || 3035;

app.listen(port, () => {
    console.log(`Server listening to http requests on http://localhost:${port}`)
    return
})