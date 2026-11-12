const express = require('express');
const app = express();
const PORT = 3000;

// Middleware to read JSON request bodies
app.use(express.json());

// Echo route
app.post('/echo/:id', (req, res) => {
    console.log(req.params);
    console.log(req.query);
    console.log(req.body);

    res.json({
        params: req.params,
        query: req.query,
        body: req.body
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});