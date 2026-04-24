const express = require("express");
const router = express.Router();

const conn = require("../db");


// VER TODOS OS PROFESSORES

router.get("/", (req, res) => {

    const sql = `
    SELECT *
    FROM professores
    `;

    conn.query(sql, (err, result) => {

        if (err) return res.send(err);

        res.json(result);

    });

});


// VER UM PROFESSOR

router.get("/:id", (req, res) => {

    const id = req.params.id;

    const sql = `
    SELECT *
    FROM professores
    WHERE id_professor = ?
    `;

    conn.query(sql, [id], (err, result) => {

        if (err) return res.send(err);

        res.json(result);

    });

});


module.exports = router;