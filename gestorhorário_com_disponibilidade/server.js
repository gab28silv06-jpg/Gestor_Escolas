const express = require('express');
const db = require('./db');
const app = express();
app.use(express.json());
app.use(express.static('public'));

// ==========================================
// LOGIN
// ==========================================
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

// ==========================================
// DISCIPLINAS
// ==========================================

// GET: Horário completo do professor (a partir de atribuicoes)
app.get('/meu-horario/:id_professor', async (req, res) => {
    const { id_professor } = req.params;
    try {
        const [rows] = await db.execute(`
            SELECT
                a.id_atribuicao,
                a.id_professor,
                a.id_disciplina,
                d.nome_disciplina,
                a.id_turma,
                COALESCE(t.ano, d.turma) AS turma,
                a.sala,
                a.descricao,
                h.dia_semana,
                h.hora_inicio,
                h.hora_fim,
                a.id_horario
            FROM atribuicoes a
            LEFT JOIN disciplinas d ON a.id_disciplina = d.id_disciplina
            LEFT JOIN horarios h ON a.id_horario = h.id_horario
            LEFT JOIN turmas t ON a.id_turma = t.id_turma
            WHERE a.id_professor = ?
            ORDER BY
                FIELD(h.dia_semana, 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'),
                h.hora_inicio
        `, [id_professor]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET: Listar disciplinas (para o dropdown)
app.get('/disciplinas', async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT DISTINCT id_disciplina, nome_disciplina FROM disciplinas ORDER BY nome_disciplina'
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST: Nova disciplina
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

// PUT: Editar disciplina
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

// DELETE: Eliminar disciplina
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
// DISPONIBILIDADE
// ==========================================

// GET: Disponibilidade de um professor (retorna também id_horario se existir)
app.get('/disponibilidade/:id_professor', async (req, res) => {
    const { id_professor } = req.params;
    try {
        const [rows] = await db.execute(`
            SELECT 
                d.id_disponibilidade,
                d.dia_semana,
                d.hora_inicio,
                d.hora_fim,
                p.nome AS nome_professor,
                h.id_horario
            FROM disponibilidade d
            JOIN professores p ON d.id_professor = p.id_professor
            LEFT JOIN horarios h ON h.dia_semana = d.dia_semana AND h.hora_inicio = d.hora_inicio AND h.hora_fim = d.hora_fim
            WHERE d.id_professor = ?
            ORDER BY 
                FIELD(d.dia_semana, 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'),
                d.hora_inicio
        `, [id_professor]);

        res.json(rows);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao obter disponibilidade', detalhes: err.message });
    }
});

// POST: Criar disponibilidade (cria também um slot em `horarios` se necessário)
app.post('/disponibilidade', async (req, res) => {
    const { id_professor, dia_semana, hora_inicio, hora_fim } = req.body;
    if (!id_professor || !dia_semana || !hora_inicio || !hora_fim) {
        return res.status(400).json({ error: 'Parâmetros em falta.' });
    }
    try {
        // garantir que existe entrada em horarios (para poder ser usada em atribuicoes)
        const [existing] = await db.execute(
            'SELECT id_horario FROM horarios WHERE dia_semana = ? AND hora_inicio = ? AND hora_fim = ?',
            [dia_semana, hora_inicio, hora_fim]
        );
        let id_horario;
        if (existing.length > 0) {
            id_horario = existing[0].id_horario;
        } else {
            const [r] = await db.execute(
                'INSERT INTO horarios (dia_semana, hora_inicio, hora_fim) VALUES (?, ?, ?)',
                [dia_semana, hora_inicio, hora_fim]
            );
            id_horario = r.insertId;
        }

        const [ins] = await db.execute(
            'INSERT INTO disponibilidade (id_professor, dia_semana, hora_inicio, hora_fim) VALUES (?, ?, ?, ?)',
            [id_professor, dia_semana, hora_inicio, hora_fim]
        );

        res.json({ message: 'Disponibilidade adicionada.', id_disponibilidade: ins.insertId, id_horario });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT: Atualizar disponibilidade (garante horario correspondente e devolve id_horario)
app.put('/disponibilidade/:id', async (req, res) => {
    const { id } = req.params;
    const { dia_semana, hora_inicio, hora_fim } = req.body;
    if (!dia_semana || !hora_inicio || !hora_fim) {
        return res.status(400).json({ error: 'Parâmetros em falta.' });
    }
    try {
        // garantir existência em horarios
        const [existing] = await db.execute(
            'SELECT id_horario FROM horarios WHERE dia_semana = ? AND hora_inicio = ? AND hora_fim = ?',
            [dia_semana, hora_inicio, hora_fim]
        );
        let id_horario;
        if (existing.length > 0) id_horario = existing[0].id_horario;
        else {
            const [r] = await db.execute(
                'INSERT INTO horarios (dia_semana, hora_inicio, hora_fim) VALUES (?, ?, ?)',
                [dia_semana, hora_inicio, hora_fim]
            );
            id_horario = r.insertId;
        }

        const [result] = await db.execute(
            'UPDATE disponibilidade SET dia_semana = ?, hora_inicio = ?, hora_fim = ? WHERE id_disponibilidade = ?',
            [dia_semana, hora_inicio, hora_fim, id]
        );
        if (result.affectedRows > 0) res.json({ message: 'Disponibilidade atualizada.', id_horario });
        else res.status(404).json({ error: 'Disponibilidade não encontrada.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE: Apagar disponibilidade
app.delete('/disponibilidade/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.execute('DELETE FROM disponibilidade WHERE id_disponibilidade = ?', [id]);
        if (result.affectedRows > 0) res.json({ message: 'Disponibilidade eliminada.' });
        else res.status(404).json({ error: 'Disponibilidade não encontrada.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// ADMIN (PAINEL DO DIRETOR)
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

// PUT: Editar professor
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

// DELETE: Apagar professor (e as suas aulas)
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

// ==========================================
// TURMAS
// ==========================================

// GET: Listar todas as turmas
app.get('/turmas', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM turmas');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST: Garantir um horario (cria se não existir) — usado pelo frontend para obter id_horario por intervalo
app.post('/horarios/ensure', async (req, res) => {
    const { dia_semana, hora_inicio, hora_fim } = req.body;
    if (!dia_semana || !hora_inicio || !hora_fim) return res.status(400).json({ error: 'Parâmetros em falta.' });
    try {
        const [existing] = await db.execute(
            'SELECT id_horario FROM horarios WHERE dia_semana = ? AND hora_inicio = ? AND hora_fim = ?',
            [dia_semana, hora_inicio, hora_fim]
        );
        if (existing.length > 0) return res.json({ id_horario: existing[0].id_horario });
        const [r] = await db.execute(
            'INSERT INTO horarios (dia_semana, hora_inicio, hora_fim) VALUES (?, ?, ?)',
            [dia_semana, hora_inicio, hora_fim]
        );
        return res.json({ id_horario: r.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CRUD para atribuicoes
// GET: listar atribuicoes de um professor (opcional)
app.get('/atribuicoes/:id_professor', async (req, res) => {
    const { id_professor } = req.params;
    try {
        const [rows] = await db.execute(
            `SELECT a.*, d.nome_disciplina, h.dia_semana, h.hora_inicio, h.hora_fim
             FROM atribuicoes a
             LEFT JOIN disciplinas d ON a.id_disciplina = d.id_disciplina
             LEFT JOIN horarios h ON a.id_horario = h.id_horario
             WHERE a.id_professor = ?`,
            [id_professor]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST: criar atribuicao
app.post('/atribuicoes', async (req, res) => {
    const { id_professor, id_disciplina, id_turma, id_horario, sala, descricao } = req.body;
    if (!id_professor || !id_disciplina || !id_horario) {
        return res.status(400).json({ error: 'Parâmetros em falta. id_professor, id_disciplina e id_horario são obrigatórios.' });
    }
    try {
        const [ins] = await db.execute(
            `INSERT INTO atribuicoes (id_professor, id_disciplina, id_turma, id_horario, sala, descricao)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [id_professor, id_disciplina, id_turma || null, id_horario, sala || null, descricao || null]
        );
        res.json({ message: 'Atribuição criada.', id_atribuicao: ins.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT: atualizar atribuicao
app.put('/atribuicoes/:id', async (req, res) => {
    const { id } = req.params;
    const { id_disciplina, id_turma, id_horario, sala, descricao } = req.body;
    try {
        const [result] = await db.execute(
            `UPDATE atribuicoes SET id_disciplina = ?, id_turma = ?, id_horario = ?, sala = ?, descricao = ? WHERE id_atribuicao = ?`,
            [id_disciplina, id_turma || null, id_horario, sala || null, descricao || null, id]
        );
        if (result.affectedRows > 0) res.json({ message: 'Atribuição atualizada.' });
        else res.status(404).json({ error: 'Atribuição não encontrada.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE: apagar atribuicao
app.delete('/atribuicoes/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.execute('DELETE FROM atribuicoes WHERE id_atribuicao = ?', [id]);
        if (result.affectedRows > 0) res.json({ message: 'Atribuição eliminada.' });
        else res.status(404).json({ error: 'Atribuição não encontrada.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => console.log("Backend a correr em http://localhost:3000"));