const express = require("express");
const router = express.Router();

const conn = require("../db");


// =========================
// VER TODAS DISCIPLINAS
// =========================

router.get("/", (req, res) => {

    const sql = `
    SELECT *
    FROM disciplinas
    `;

    conn.query(sql, (err, result) => {

        if (err) return res.send(err);

        res.json(result);

    });

});



// =========================
// VER DISCIPLINAS DE UM PROFESSOR
// =========================

router.get("/prof/:id", (req, res) => {

    const id = req.params.id;

    const sql = `
    SELECT *
    FROM disciplinas
    WHERE id_professor = ?
    `;

    conn.query(sql, [id], (err, result) => {

        if (err) return res.send(err);

        res.json(result);

    });

});



// =========================
// ADICIONAR DISCIPLINA
// =========================

router.post("/", (req, res) => {

    const {
        nome_disciplina,
        descricao,
        data_inicio,
        data_fim,
        id_professor
    } = req.body;

    const sql = `
    INSERT INTO disciplinas
    (nome_disciplina, descricao, data_inicio, data_fim, id_professor)
    VALUES (?, ?, ?, ?, ?)
    `;

    conn.query(
        sql,
        [nome_disciplina, descricao, data_inicio, data_fim, id_professor],
        (err) => {

            if (err) return res.send(err);

            res.send("Disciplina criada");

        }
    );

});



// =========================
// EDITAR DISCIPLINA
// =========================

router.put("/:id", (req, res) => {

    const id = req.params.id;

    const {
        nome_disciplina,
        descricao,
        data_inicio,
        data_fim
    } = req.body;

    const sql = `
    UPDATE disciplinas
    SET nome_disciplina = ?,
        descricao = ?,
        data_inicio = ?,
        data_fim = ?
    WHERE id_disciplina = ?
    `;

    conn.query(
        sql,
        [
            nome_disciplina,
            descricao,
            data_inicio,
            data_fim,
            id
        ],
        (err) => {

            if (err) return res.send(err);

            res.send("Atualizado");

        }
    );

});



// =========================
// APAGAR DISCIPLINA
// =========================

router.delete("/:id", (req, res) => {

    const id = req.params.id;

    const sql = `
    DELETE FROM disciplinas
    WHERE id_disciplina = ?
    `;

    conn.query(sql, [id], (err) => {

        if (err) return res.send(err);

        res.send("Apagado");

    });

});


module.exports = router;