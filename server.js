const express = require('express');
const db = require('./db');
const app = express();
app.use(express.json());
app.use(express.static('public'));

// --- AUTENTICAÇÃO ---
app.post('/login', async (req, res) => {
    const { email, nome } = req.body;
    try {
        const [rows] = await db.execute(
            'SELECT * FROM professores WHERE email = ? AND nome = ?',
            [email, nome]
        );
        if (rows.length > 0) {
            const user = rows[0];
            // No futuro, aqui poderíamos usar JWT ou Sessões.
            // Para já, enviamos o perfil completo incluindo 'is_admin'.
            res.json({ 
                message: "Login realizado", 
                user: {
                    id: user.id_professor,
                    nome: user.nome,
                    email: user.email,
                    is_admin: user.is_admin
                }
            });
        } else {
            res.status(401).json({ error: "Utilizador não encontrado. Verifique o Nome e Email." });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- HORÁRIO DO PROFESSOR (Acesso: Professor e Admin) ---
app.get('/meu-horario/:id_professor', async (req, res) => {
    const { id_professor } = req.params;
    try {
        const [rows] = await db.execute(`
            SELECT a.*, d.nome_disciplina, t.ano as ano_turma, t.curso as curso_turma, 
                   h.dia_semana, h.hora_inicio, h.hora_fim
            FROM atribuicoes a
            JOIN disciplinas d ON a.id_disciplina = d.id_disciplina
            JOIN turmas t ON a.id_turma = t.id_turma
            JOIN horarios h ON a.id_horario = h.id_horario
            WHERE a.id_professor = ?
        `, [id_professor]);
        
        const formatado = rows.map(r => ({
            id_atribuicao: r.id_atribuicao,
            nome_disciplina: r.nome_disciplina,
            turma: `${r.ano_turma}º ${r.curso_turma}`,
            sala: `Sala ${r.sala}`,
            dia_semana: r.dia_semana,
            hora_inicio: r.hora_inicio,
            hora_fim: r.hora_fim,
            descricao: r.descricao
        }));
        
        res.json(formatado);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ROTAS ADMINISTRATIVAS (Acesso: Apenas Diretor/Admin) ---

// DISCIPLINAS
app.get('/disciplinas', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM disciplinas');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/disciplinas', async (req, res) => {
    const { nome_disciplina, descricao } = req.body;
    try {
        await db.execute('INSERT INTO disciplinas (nome_disciplina, descricao) VALUES (?, ?)', [nome_disciplina, descricao]);
        res.json({ message: "Disciplina criada!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/disciplinas/:id', async (req, res) => {
    const { id } = req.params;
    const { nome_disciplina, descricao } = req.body;
    try {
        await db.execute('UPDATE disciplinas SET nome_disciplina = ?, descricao = ? WHERE id_disciplina = ?', [nome_disciplina, descricao, id]);
        res.json({ message: "Disciplina atualizada!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/disciplinas/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM disciplinas WHERE id_disciplina = ?', [id]);
        res.json({ message: "Disciplina removida!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// TURMAS
app.get('/turmas', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM turmas');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/turmas', async (req, res) => {
    const { ano, curso } = req.body;
    try {
        await db.execute('INSERT INTO turmas (ano, curso) VALUES (?, ?)', [ano, curso]);
        res.json({ message: "Turma criada!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/turmas/:id', async (req, res) => {
    const { id } = req.params;
    const { ano, curso } = req.body;
    try {
        await db.execute('UPDATE turmas SET ano = ?, curso = ? WHERE id_turma = ?', [ano, curso, id]);
        res.json({ message: "Turma atualizada!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/turmas/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM atribuicoes WHERE id_turma = ?', [id]);
        await db.execute('DELETE FROM turmas WHERE id_turma = ?', [id]);
        res.json({ message: "Turma eliminada!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ATRIBUIÇÕES
app.get('/atribuicoes', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT a.*, p.nome as nome_professor, d.nome_disciplina, t.ano as ano_turma, t.curso as curso_turma, h.dia_semana, h.hora_inicio, h.hora_fim
            FROM atribuicoes a
            LEFT JOIN professores p ON a.id_professor = p.id_professor
            LEFT JOIN disciplinas d ON a.id_disciplina = d.id_disciplina
            LEFT JOIN turmas t ON a.id_turma = t.id_turma
            LEFT JOIN horarios h ON a.id_horario = h.id_horario
        `);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/atribuicoes', async (req, res) => {
    const { id_professor, id_disciplina, id_turma, sala, dia_semana, hora_inicio, hora_fim, descricao } = req.body;
    try {
        // Validação de conflitos (Sala/Horário)
        const [conflitos] = await db.execute(`
            SELECT a.* FROM atribuicoes a
            JOIN horarios h ON a.id_horario = h.id_horario
            WHERE a.sala = ? AND h.dia_semana = ? 
            AND ((h.hora_inicio < ? AND h.hora_fim > ?) OR (h.hora_inicio < ? AND h.hora_fim > ?) OR (h.hora_inicio >= ? AND h.hora_fim <= ?))
        `, [sala, dia_semana, hora_fim, hora_inicio, hora_inicio, hora_inicio, hora_inicio, hora_fim]);

        if (conflitos.length > 0) return res.status(409).json({ error: `Conflito: A sala ${sala} já está ocupada!` });

        const [hResult] = await db.execute('INSERT INTO horarios (dia_semana, hora_inicio, hora_fim) VALUES (?, ?, ?)', [dia_semana, hora_inicio, hora_fim]);
        await db.execute('INSERT INTO atribuicoes (id_professor, id_disciplina, id_turma, id_horario, sala, descricao) VALUES (?, ?, ?, ?, ?, ?)', [id_professor, id_disciplina, id_turma, hResult.insertId, sala, descricao]);
        res.json({ message: "Atribuição criada!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/atribuicoes/:id', async (req, res) => {
    const { id } = req.params;
    const { id_professor, id_disciplina, id_turma, sala, dia_semana, hora_inicio, hora_fim, descricao } = req.body;
    try {
        const [rows] = await db.execute('SELECT id_horario FROM atribuicoes WHERE id_atribuicao = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ error: "Atribuição não encontrada" });
        const id_horario = rows[0].id_horario;

        // Validação de conflitos (Excluindo a própria atribuição)
        const [conflitos] = await db.execute(`
            SELECT a.* FROM atribuicoes a
            JOIN horarios h ON a.id_horario = h.id_horario
            WHERE a.sala = ? AND h.dia_semana = ? AND a.id_atribuicao != ?
            AND ((h.hora_inicio < ? AND h.hora_fim > ?) OR (h.hora_inicio < ? AND h.hora_fim > ?) OR (h.hora_inicio >= ? AND h.hora_fim <= ?))
        `, [sala, dia_semana, id, hora_fim, hora_inicio, hora_inicio, hora_inicio, hora_inicio, hora_fim]);

        if (conflitos.length > 0) return res.status(409).json({ error: `Conflito de sala!` });

        await db.execute('UPDATE horarios SET dia_semana = ?, hora_inicio = ?, hora_fim = ? WHERE id_horario = ?', [dia_semana, hora_inicio, hora_fim, id_horario]);
        await db.execute('UPDATE atribuicoes SET id_professor = ?, id_disciplina = ?, id_turma = ?, sala = ?, descricao = ? WHERE id_atribuicao = ?', [id_professor, id_disciplina, id_turma, sala, descricao, id]);
        res.json({ message: "Atribuição atualizada!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/atribuicoes/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.execute('SELECT id_horario FROM atribuicoes WHERE id_atribuicao = ?', [id]);
        if (rows.length > 0) {
            const id_horario = rows[0].id_horario;
            await db.execute('DELETE FROM atribuicoes WHERE id_atribuicao = ?', [id]);
            await db.execute('DELETE FROM horarios WHERE id_horario = ?', [id_horario]);
        }
        res.json({ message: "Atribuição removida!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PROFESSORES (Gestão de Professores - Apenas Admin)
app.get('/admin/professores', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM professores');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/admin/professores', async (req, res) => {
    const { nome, email, disciplinas_permitidas, is_admin } = req.body;
    try {
        await db.execute('INSERT INTO professores (nome, email, disciplinas_permitidas, is_admin) VALUES (?, ?, ?, ?, ?)', [nome, email, disciplinas_permitidas, is_admin || 0]);
        res.json({ message: "Professor criado!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/admin/professores/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, email, disciplinas_permitidas, is_admin } = req.body;
    try {
        await db.execute('UPDATE professores SET nome = ?, email = ?, disciplinas_permitidas = ?, is_admin = ? WHERE id_professor = ?', [nome, email, disciplinas_permitidas, is_admin || 0, id]);
        res.json({ message: "Professor atualizado!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/admin/professores/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM atribuicoes WHERE id_professor = ?', [id]);
        await db.execute('DELETE FROM professores WHERE id_professor = ?', [id]);
        res.json({ message: "Professor eliminado!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(3000, () => console.log("Backend com Autenticação em http://localhost:3000"));
