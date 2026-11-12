const express = require('express');
const sql = require('mssql');

const app = express();
app.use(express.json());

const dbConfig = {
    server: 'localhost',
    database: 'NPBookstore',
    user: 'Travis',
    password: 'travis',
    options: {
        trustServerCertificate: true
    }
};

// GET all authors
app.get('/authors', async (req, res) => {
    let connection;

    try {
        connection = await sql.connect(dbConfig);

        const result = await connection.request().query(
            'SELECT * FROM Author'
        );

        res.status(200).json(result.recordset);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
    finally {
        if (connection) {
            await connection.close();
        }
    }
});

// GET author by ID
app.get('/authors/:id', async (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid author ID' });
    }

    let connection;

    try {
        connection = await sql.connect(dbConfig);

        const result = await connection.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Author WHERE AuthorID = @id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Author not found' });
        }

        res.status(200).json(result.recordset[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
    finally {
        if (connection) {
            await connection.close();
        }
    }
});

// POST new author
app.post('/authors', async (req, res) => {
    let connection;

    try {
        connection = await sql.connect(dbConfig);
        console.log(req.headers['content-type']);
        console.log(req.body);
        const result = await connection.request()
            .input('AuthorID', sql.Int, req.body.AuthorID)
            .input('Name', sql.VarChar, req.body.Name)
            .query(`
                INSERT INTO Author (AuthorID, Name)
                OUTPUT INSERTED.*
                VALUES (@AuthorID, @Name)
            `);

        res.status(201).json(result.recordset[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
    finally {
        if (connection) {
            await connection.close();
        }
    }
});

// PUT update author
app.put('/authors/:id', async (req, res) => {
    const id = parseInt(req.params.id);

    let connection;

    try {
        connection = await sql.connect(dbConfig);
        const result = await connection.request()
            .input('id', sql.Int, id)
            .input('Name', sql.VarChar, req.body.Name)
            .query(`
                UPDATE Author
                SET Name = @Name
                WHERE AuthorID = @id
            `);
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Author not found' });
        }

        res.status(200).json({ message: 'Author updated successfully' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
    finally {
        if (connection) {
            await connection.close();
        }
    }
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});