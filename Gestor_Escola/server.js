const express = require('express');
const db = require('./db');
const path = require("path");
const app = express();
app.use(express.json());
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// LOGIN
app.post('/login', async (req, res) => {
    const { email, nome } = req.body;
    try {
        const [rows] = await db.execute(
            'SELECT * FROM professores WHERE email = ? AND nome = ?',
            [email, nome]
        );
        if (rows.length > 0) {
            res.json({ message: "Login realizado", professor: rows[0] });
        } else {
            res.status(401).json({ error: "Professor não encontrado." });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET horário do professor
app.get('/meu-horario/:id_professor', async (req, res) => {
    const { id_professor } = req.params;
    try {
        const [rows] = await db.execute(
            'SELECT * FROM disciplinas WHERE id_professor = ?',
            [id_professor]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST nova disciplina
app.post('/disciplinas', async (req, res) => {
    const { nome_disciplina, descricao, turma, sala, id_professor, dia_semana, hora_inicio, hora_fim } = req.body;
    try {
        await db.execute(
            `INSERT INTO disciplinas 
             (nome_disciplina, id_professor, descricao, turma, sala, dia_semana, hora_inicio, hora_fim) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [nome_disciplina, id_professor, descricao, turma, sala, dia_semana, hora_inicio, hora_fim]
        );
        res.json({ message: "Aula guardada com sucesso!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT editar disciplina
app.put('/disciplinas/:id', async (req, res) => {
    const { id } = req.params;
    const { nome_disciplina, descricao, turma, sala, dia_semana, hora_inicio, hora_fim } = req.body;
    try {
        await db.execute(
            `UPDATE disciplinas SET 
             nome_disciplina=?, descricao=?, turma=?, sala=?, dia_semana=?, hora_inicio=?, hora_fim=?
             WHERE id_disciplina=?`,
            [nome_disciplina, descricao, turma, sala, dia_semana, hora_inicio, hora_fim, id]
        );
        res.json({ message: "Atualizado!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE disciplina
app.delete('/disciplinas/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.execute(
            'DELETE FROM disciplinas WHERE id_disciplina = ?',
            [id]
        );
        if (result.affectedRows > 0) {
            res.json({ message: "Disciplina eliminada com sucesso!" });
        } else {
            res.status(404).json({ error: "Disciplina não encontrada." });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// ROTAS DO ADMIN (PAINEL DO DIRETOR)
// ==========================================

// GET: Listar todos os professores
app.get('/admin/professores', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM professores');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST: Criar novo professor
app.post('/admin/professores', async (req, res) => {
    const { nome, email, disciplinas_permitidas } = req.body;
    try {
        await db.execute(
            'INSERT INTO professores (nome, email, disciplinas_permitidas) VALUES (?, ?, ?)',
            [nome, email, disciplinas_permitidas || null]
        );
        res.json({ message: "Professor criado com sucesso!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT: Editar professor existente
app.put('/admin/professores/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, email, disciplinas_permitidas } = req.body;
    try {
        await db.execute(
            'UPDATE professores SET nome = ?, email = ?, disciplinas_permitidas = ? WHERE id_professor = ?',
            [nome, email, disciplinas_permitidas || null, id]
        );
        res.json({ message: "Professor atualizado com sucesso!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE: Apagar professor (apaga as aulas dele primeiro por causa da Foreign Key)
app.delete('/admin/professores/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM disciplinas WHERE id_professor = ?', [id]);
        await db.execute('DELETE FROM professores WHERE id_professor = ?', [id]);
        res.json({ message: "Professor e aulas eliminados!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET: Listar todas as disciplinas
app.get('/disciplinas', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM disciplinas');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET: Listar todas as turmas
app.get('/turmas', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM turmas');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET: Obter uma turma por ID
app.get('/turmas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.execute('SELECT * FROM turmas WHERE id_turma = ?', [id]);
    if (rows.length > 0) res.json(rows[0]);
    else res.status(404).json({ error: 'Turma não encontrada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: criar nova turma
app.post('/turmas', async (req, res) => {
  const { ano, curso } = req.body;
  try {
    await db.execute('INSERT INTO turmas (ano, curso) VALUES (?, ?)', [ano, curso]);
    res.json({ message: "Turma criada com sucesso!" });
  } catch (err) {
    console.error("POST /turmas error:", err);
    res.status(500).json({ error: err.message });
  }
});

// PUT: atualizar turma existente
app.put('/turmas/:id', async (req, res) => {
  const { id } = req.params;
  const { ano, curso } = req.body;
  try {
    const [result] = await db.execute('UPDATE turmas SET ano = ?, curso = ? WHERE id_turma = ?', [ano, curso, id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Turma não encontrada' });
    res.json({ message: "Turma atualizada com sucesso!" });
  } catch (err) {
    console.error("PUT /turmas/:id error:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE: apagar turma
app.delete('/turmas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.execute('DELETE FROM turmas WHERE id_turma = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Turma não encontrada' });
    res.json({ message: "Turma eliminada com sucesso!" });
  } catch (err) {
    console.error("DELETE /turmas/:id error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("Backend a correr em http://localhost:3000"));