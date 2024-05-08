const express = require('express');
const app = express();
const port = 3001;
const dotenv = require('dotenv');
const { Surreal } = require('surrealdb.node');
const db = new Surreal();
dotenv.config()
const routes = require('./routes');
const cors = require('cors');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

async function connect() {
    try {
        await db.connect('ws:0.0.0.0:8000')

        await db.signin({
            username: 'admin',
            password: 'pixel070219',
        });

        await db.use({ ns: 'pixelking', db: 'pixelking' });

        console.log('Connected to database');
    } catch {
        console.log('Failed to connect to database');
    }
}

connect();

app.use(routes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
