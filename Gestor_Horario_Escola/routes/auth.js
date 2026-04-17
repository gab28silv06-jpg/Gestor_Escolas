const express = require("express");
const router = express.Router();

const conn = require("../db");


router.post("/login", (req, res) => {

    const { email, password } = req.body;

    const sql =
    "SELECT * FROM professores WHERE email=? AND password=?";

    conn.query(sql,
        [email, password],
        (err, result) => {

            if (err) return res.send(err);

            if (result.length == 0) {

                res.send("Login errado");

            } else {

                res.json(result[0]);

            }

        });

});

module.exports = router;