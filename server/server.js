const express = require('express');
const app = express();
const port = 3001;
const routes = require('./routes');
const cors = require('cors');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(routes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})