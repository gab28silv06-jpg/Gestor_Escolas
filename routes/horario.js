const express = require("express");
const router = express.Router();

const conn = require("../db");


// VER HORARIO COMPLETO

router.get("/", (req, res) => {

    const sql = `
    SELECT 
    horario.id_horario,
    horario.dia_semana,
    horario.hora_inicio,
    horario.hora_fim,
    disciplinas.nome_disciplina
    FROM horario
    JOIN disciplinas
    ON horario.id_disciplina =
    disciplinas.id_disciplina
    `;

    conn.query(sql, (err, result) => {

        if (err) return res.send(err);

        res.json(result);

    });

});

router.get("/prof/:id", (req, res) => {

    const id = req.params.id;

    const sql = `
    SELECT
    horario.*,
    disciplinas.nome_disciplina
    FROM horario

    JOIN disciplinas
    ON horario.id_disciplina =
    disciplinas.id_disciplina

    WHERE disciplinas.id_professor = ?
    `;

    conn.query(sql, [id], (err, result) => {

        if (err) return res.send(err);

        res.json(result);

    });

});

// ADICIONAR HORARIO

router.post("/", (req, res) => {

    const {
        id_disciplina,
        dia_semana,
        hora_inicio,
        hora_fim
    } = req.body;

    const sql = `
    INSERT INTO horario
    (id_disciplina, dia_semana, hora_inicio, hora_fim)
    VALUES (?, ?, ?, ?)
    `;

    conn.query(
        sql,
        [
            id_disciplina,
            dia_semana,
            hora_inicio,
            hora_fim
        ],
        () => {

            res.send("Horario criado");

        });

});


module.exports = router;