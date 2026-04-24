const express = require('express');
const db = require('./db');
const app = express();
app.use(express.json());
app.use(express.static('public'));

// Middleware de Log
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.get('/', (req, res) => {
    res.redirect('/login.html');
});

// --- FUNÇÃO AUXILIAR DE VALIDAÇÃO DE CONFLITOS ---
async function verificarConflitos(id_professor, id_turma, sala, dia_semana, hora_inicio, hora_fim, id_atribuicao_excluir = null) {
    // Esta consulta verifica se existe QUALQUER sobreposição de horário no mesmo dia
    // A lógica (H1_inicio < H2_fim AND H1_fim > H2_inicio) cobre:
    // 1. Início dentro de outro horário
    // 2. Fim dentro de outro horário
    // 3. Horário contido noutro
    // 4. Horário que contém outro totalmente
    
    let query = `
        SELECT a.*, p.nome as nome_professor, d.nome_disciplina, t.ano, t.curso, h.hora_inicio, h.hora_fim
        FROM atribuicoes a
        JOIN horarios h ON a.id_horario = h.id_horario
        JOIN professores p ON a.id_professor = p.id_professor
        JOIN disciplinas d ON a.id_disciplina = d.id_disciplina
        JOIN turmas t ON a.id_turma = t.id_turma
        WHERE h.dia_semana = ?
        AND (h.hora_inicio < ? AND h.hora_fim > ?)
    `;
    
    let params = [dia_semana, hora_fim, hora_inicio];

    if (id_atribuicao_excluir) {
        query += " AND a.id_atribuicao != ?";
        params.push(id_atribuicao_excluir);
    }

    const [aulasSobrepostas] = await db.execute(query, params);

    for (const aula of aulasSobrepostas) {
        // 1. Conflito de Sala
        if (aula.sala == sala) {
            return `A Sala ${sala} já está ocupada pela disciplina ${aula.nome_disciplina} (${aula.hora_inicio}-${aula.hora_fim}).`;
        }
        // 2. Conflito de Professor
        if (aula.id_professor == id_professor) {
            return `O Professor ${aula.nome_professor} já tem uma aula de ${aula.nome_disciplina} neste horário (${aula.hora_inicio}-${aula.hora_fim}).`;
        }
        // 3. Conflito de Turma
        if (aula.id_turma == id_turma) {
            return `A Turma ${aula.ano} ${aula.curso} já tem uma aula de ${aula.nome_disciplina} neste horário (${aula.hora_inicio}-${aula.hora_fim}).`;
        }
    }

    return null; // Sem conflitos
}

// --- ROTAS ---

app.post('/login', async (req, res) => {
    const { email, nome } = req.body;
    try {
        const [rows] = await db.execute('SELECT * FROM professores WHERE email = ? AND nome = ?', [email, nome]);
        if (rows.length > 0) {
            const user = rows[0];
            res.json({ message: "Login realizado", user: { id: user.id_professor, nome: user.nome, email: user.email, is_admin: user.is_admin } });
        } else {
            res.status(401).json({ error: "Utilizador não encontrado." });
        }
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/meu-horario/:id_professor', async (req, res) => {
    const { id_professor } = req.params;
    try {
        const [rows] = await db.execute(`
            SELECT a.*, d.nome_disciplina, t.ano as ano_turma, t.curso as curso_turma, h.dia_semana, h.hora_inicio, h.hora_fim
            FROM atribuicoes a
            JOIN disciplinas d ON a.id_disciplina = d.id_disciplina
            JOIN turmas t ON a.id_turma = t.id_turma
            JOIN horarios h ON a.id_horario = h.id_horario
            WHERE a.id_professor = ?
        `, [id_professor]);
        res.json(rows.map(r => ({
            id_atribuicao: r.id_atribuicao, nome_disciplina: r.nome_disciplina,
            turma: `${r.ano_turma} ${r.curso_turma}`, sala: `Sala ${r.sala}`,
            dia_semana: r.dia_semana, hora_inicio: r.hora_inicio, hora_fim: r.hora_fim
        })));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// CRUD DISCIPLINAS, TURMAS E PROFESSORES (Simplificado para o exemplo, mantendo a lógica anterior)
app.get('/disciplinas', async (req, res) => {
    const [rows] = await db.execute('SELECT * FROM disciplinas'); res.json(rows);
});
app.post('/disciplinas', async (req, res) => {
    await db.execute('INSERT INTO disciplinas (nome_disciplina, descricao) VALUES (?, ?)', [req.body.nome_disciplina, req.body.descricao || null]);
    res.json({ message: "OK" });
});
app.put('/disciplinas/:id', async (req, res) => {
    await db.execute('UPDATE disciplinas SET nome_disciplina = ?, descricao = ? WHERE id_disciplina = ?', [req.body.nome_disciplina, req.body.descricao || null, req.params.id]);
    res.json({ message: "OK" });
});
app.delete('/disciplinas/:id', async (req, res) => {
    await db.execute('DELETE FROM disciplinas WHERE id_disciplina = ?', [req.params.id]); res.json({ message: "OK" });
});

app.get('/turmas', async (req, res) => {
    const [rows] = await db.execute('SELECT * FROM turmas'); res.json(rows);
});
app.post('/turmas', async (req, res) => {
    await db.execute('INSERT INTO turmas (ano, curso) VALUES (?, ?)', [req.body.ano, req.body.curso]); res.json({ message: "OK" });
});
app.put('/turmas/:id', async (req, res) => {
    await db.execute('UPDATE turmas SET ano = ?, curso = ? WHERE id_turma = ?', [req.body.ano, req.body.curso, req.params.id]); res.json({ message: "OK" });
});
app.delete('/turmas/:id', async (req, res) => {
    await db.execute('DELETE FROM atribuicoes WHERE id_turma = ?', [req.params.id]);
    await db.execute('DELETE FROM turmas WHERE id_turma = ?', [req.params.id]); res.json({ message: "OK" });
});

app.get('/admin/professores', async (req, res) => {
    const [rows] = await db.execute('SELECT * FROM professores'); res.json(rows);
});
app.post('/admin/professores', async (req, res) => {
    const { nome, email, disciplinas_permitidas, turmas_atribuidas, is_admin } = req.body;
    await db.execute('INSERT INTO professores (nome, email, disciplinas_permitidas, turmas_atribuidas, is_admin) VALUES (?, ?, ?, ?, ?)', [nome, email, disciplinas_permitidas || null, turmas_atribuidas || null, is_admin || 0]);
    res.json({ message: "OK" });
});
app.put('/admin/professores/:id', async (req, res) => {
    if (req.params.id === '1') {
        return res.status(403).json({ error: 'Administrador #1 não pode ser alterado.' });
    }
    const { nome, email, disciplinas_permitidas, turmas_atribuidas, is_admin } = req.body;
    await db.execute('UPDATE professores SET nome = ?, email = ?, disciplinas_permitidas = ?, turmas_atribuidas = ?, is_admin = ? WHERE id_professor = ?', [nome, email, disciplinas_permitidas || null, turmas_atribuidas || null, is_admin || 0, req.params.id]);
    res.json({ message: "OK" });
});
app.delete('/admin/professores/:id', async (req, res) => {
    if (req.params.id === '1') {
        return res.status(403).json({ error: 'Administrador #1 não pode ser eliminado.' });
    }
    await db.execute('DELETE FROM atribuicoes WHERE id_professor = ?', [req.params.id]);
    await db.execute('DELETE FROM professores WHERE id_professor = ?', [req.params.id]); res.json({ message: "OK" });
});

// --- GESTÃO DE ATRIBUIÇÕES COM VALIDAÇÃO TRIPLA ---

app.get('/atribuicoes', async (req, res) => {
    const [rows] = await db.execute(`
        SELECT a.*, p.nome as nome_professor, d.nome_disciplina, t.ano as ano_turma, t.curso as curso_turma, h.dia_semana, h.hora_inicio, h.hora_fim
        FROM atribuicoes a
        LEFT JOIN professores p ON a.id_professor = p.id_professor
        LEFT JOIN disciplinas d ON a.id_disciplina = d.id_disciplina
        LEFT JOIN turmas t ON a.id_turma = t.id_turma
        LEFT JOIN horarios h ON a.id_horario = h.id_horario
    `);
    res.json(rows);
});

app.post('/atribuicoes', async (req, res) => {
    const { id_professor, id_disciplina, id_turma, sala, dia_semana, hora_inicio, hora_fim, descricao } = req.body;
    try {
        const erroConflito = await verificarConflitos(id_professor, id_turma, sala, dia_semana, hora_inicio, hora_fim);
        if (erroConflito) return res.status(409).json({ error: erroConflito });

        const [hResult] = await db.execute('INSERT INTO horarios (dia_semana, hora_inicio, hora_fim) VALUES (?, ?, ?)', [dia_semana, hora_inicio, hora_fim]);
        await db.execute('INSERT INTO atribuicoes (id_professor, id_disciplina, id_turma, id_horario, sala, descricao) VALUES (?, ?, ?, ?, ?, ?)', [id_professor, id_disciplina, id_turma, hResult.insertId, sala, descricao || null]);
        res.json({ message: "Atribuição criada!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/atribuicoes/:id', async (req, res) => {
    const { id } = req.params;
    const { id_professor, id_disciplina, id_turma, sala, dia_semana, hora_inicio, hora_fim, descricao } = req.body;
    try {
        const erroConflito = await verificarConflitos(id_professor, id_turma, sala, dia_semana, hora_inicio, hora_fim, id);
        if (erroConflito) return res.status(409).json({ error: erroConflito });

        const [rows] = await db.execute('SELECT id_horario FROM atribuicoes WHERE id_atribuicao = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ error: "Não encontrado" });
        
        await db.execute('UPDATE horarios SET dia_semana = ?, hora_inicio = ?, hora_fim = ? WHERE id_horario = ?', [dia_semana, hora_inicio, hora_fim, rows[0].id_horario]);
        await db.execute('UPDATE atribuicoes SET id_professor = ?, id_disciplina = ?, id_turma = ?, sala = ?, descricao = ? WHERE id_atribuicao = ?', [id_professor, id_disciplina, id_turma, sala, descricao || null, id]);
        res.json({ message: "Atualizado!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/atribuicoes/:id', async (req, res) => {
    const { id } = req.params;
    const [rows] = await db.execute('SELECT id_horario FROM atribuicoes WHERE id_atribuicao = ?', [id]);
    if (rows.length > 0) {
        await db.execute('DELETE FROM atribuicoes WHERE id_atribuicao = ?', [id]);
        await db.execute('DELETE FROM horarios WHERE id_horario = ?', [rows[0].id_horario]);
    }
    res.json({ message: "Removido!" });
});

app.listen(3000, () => console.log("Servidor em http://localhost:3000"));
