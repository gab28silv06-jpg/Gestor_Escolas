  async function carregarTodos() {
    const profTbody = document.getElementById('professores-tbody');
    const discTbody = document.getElementById('disciplinas-tbody');
    const turmasTbody = document.getElementById('turmas-tbody');
    document.getElementById('prof-count').innerText = '—';
    document.getElementById('disc-count').innerText = '—';
    document.getElementById('turma-count').innerText = '—';

    try {
      const res = await fetch('/admin/professores');
      if (!res.ok) throw new Error('Erro a obter professores');
      const professores = await res.json();

      profTbody.innerHTML = '';
      if (!Array.isArray(professores) || professores.length === 0) {
        profTbody.innerHTML = '<tr><td colspan="5" class="text-center small-muted">Nenhum professor encontrado.</td></tr>';
      } else {
        professores.forEach(p => {
          const tr = document.createElement('tr');
          tr.innerHTML = `<td><span class="badge bg-secondary">#${p.id_professor}</span></td>
                          <td>${p.nome || '—'}</td>
                          <td><a href="mailto:${p.email}">${p.email || '—'}</a></td>
                          <td>${(p.disciplinas_permitidas||'').split(',').map(s=>s.trim()).filter(Boolean).join(', ') || '<span class="small-muted">Nenhuma</span>'}</td>
                          <td>
                            <button class="btn btn-sm btn-warning me-1" onclick="editProfessor(${p.id_professor})">Editar</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteProfessor(${p.id_professor})">Apagar</button>
                          </td>`;
          profTbody.appendChild(tr);
        });
      }
      const professorById = Object.fromEntries((professores||[]).map(p => [p.id_professor, p.nome || '—']));
      document.getElementById('prof-count').innerText = (professores||[]).length;

      // Disciplina - trazer com todos os campos
      const rDisc = await fetch('/disciplinas');
      if (!rDisc.ok) throw new Error('Erro a obter disciplinas');
      const disciplinas = await rDisc.json();

      discTbody.innerHTML = '';
      if (!Array.isArray(disciplinas) || disciplinas.length === 0) {
        discTbody.innerHTML = '<tr><td colspan="11" class="text-center small-muted">Nenhuma disciplina encontrada.</td></tr>';
      } else {
        disciplinas.forEach(d => {
          const tr = document.createElement('tr');
          tr.innerHTML = `<td><span class="badge bg-secondary">#${d.id_disciplina}</span></td>
                          <td>${d.nome_disciplina || '—'}</td>
                          <td>${d.descricao || '—'}</td>
                          <td>${d.turma || '—'}</td>
                          <td>${d.sala ?? '—'}</td>
                          <td>${d.id_professor ?? '—'}</td>
                          <td>${professorById[d.id_professor] || '—'}</td>
                          <td>${d.dia_semana || '—'}</td>
                          <td>${d.hora_inicio || '—'}</td>
                          <td>${d.hora_fim || '—'}</td>
                          <td>
                            <button class="btn btn-sm btn-warning me-1" onclick="editDisciplina(${d.id_disciplina})">Editar</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteDisciplina(${d.id_disciplina})">Apagar</button>
                          </td>`;
          discTbody.appendChild(tr);
        });
      }
      document.getElementById('disc-count').innerText = Array.isArray(disciplinas) ? disciplinas.length : 0;

      // Turmas - todas colunas
      const rTurmas = await fetch('/turmas');
      if (!rTurmas.ok) throw new Error('Erro a obter turmas');
      const turmas = await rTurmas.json();

      turmasTbody.innerHTML = '';
      if (!Array.isArray(turmas) || turmas.length === 0) {
        turmasTbody.innerHTML = '<tr><td colspan="4" class="text-center small-muted">Nenhuma turma encontrada.</td></tr>';
        document.getElementById('turma-count').innerText = 0;
      } else {
        turmas.sort((a,b)=> (String(a.ano||'')).localeCompare(String(b.ano||'')) || (String(a.curso||'')).localeCompare(String(b.curso||'')));
        turmas.forEach(t => {
          const tr = document.createElement('tr');
          tr.innerHTML = `<td>${t.ano ?? t.ano_turma ?? '—'}</td>
                          <td>${t.curso || t.nome || t.designacao || '—'}</td>
                          <td>
                            ${t.id_turma ? `<button class="btn btn-sm btn-warning me-1" onclick="editTurma(${t.id_turma})">Editar</button><button class="btn btn-sm btn-danger" onclick="deleteTurma(${t.id_turma})">Apagar</button>` : '—'}
                          </td>`;
          turmasTbody.appendChild(tr);
        });
        document.getElementById('turma-count').innerText = turmas.length;
      }

    } catch (err) {
      console.error(err);
      profTbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Erro a carregar dados.</td></tr>';
      discTbody.innerHTML = '<tr><td colspan="10" class="text-center text-danger">Erro a carregar dados.</td></tr>';
      turmasTbody.innerHTML = '<tr><td colspan="3" class="text-center text-danger">Erro a carregar dados.</td></tr>';
      document.getElementById('prof-count').innerText = '-';
      document.getElementById('disc-count').innerText = '-';
      document.getElementById('turma-count').innerText = '-';
    }
  }

  document.getElementById('btn-refresh').addEventListener('click', () => carregarTodos());
  window.addEventListener('DOMContentLoaded', carregarTodos);

  // CRUD Functions
  let currentEditId = null;

  // Professor Modal
  function openProfessorModal(id = null) {
    currentEditId = id;
    const modal = document.getElementById('professorModal');
    const form = document.getElementById('professorForm');
    form.reset();
    if (id) {
      // Load data for edit
      fetch(`/admin/professores/${id}`)
        .then(r => r.json())
        .then(p => {
          document.getElementById('profNome').value = p.nome || '';
          document.getElementById('profEmail').value = p.email || '';
          document.getElementById('profDisciplinas').value = p.disciplinas_permitidas || '';
        });
    }
    new bootstrap.Modal(modal).show();
  }

  function saveProfessor() {
    const data = {
      nome: document.getElementById('profNome').value,
      email: document.getElementById('profEmail').value,
      disciplinas_permitidas: document.getElementById('profDisciplinas').value
    };
    const method = currentEditId ? 'PUT' : 'POST';
    const url = currentEditId ? `/admin/professores/${currentEditId}` : '/admin/professores';
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(r => r.json())
    .then(() => {
      bootstrap.Modal.getInstance(document.getElementById('professorModal')).hide();
      carregarTodos();
    });
  }

  function editProfessor(id) {
    openProfessorModal(id);
  }

  function deleteProfessor(id) {
    if (confirm('Tem certeza que deseja apagar este professor?')) {
      fetch(`/admin/professores/${id}`, { method: 'DELETE' })
      .then(() => carregarTodos());
    }
  }

  // Turma Modal
  function openTurmaModal(id = null) {
    currentEditId = id;
    const modal = document.getElementById('turmaModal');
    const form = document.getElementById('turmaForm');
    form.reset();
    if (id) {
      fetch(`/turmas/${id}`)
        .then(r => r.json())
        .then(t => {
          document.getElementById('turmaAno').value = t.ano || '';
          document.getElementById('turmaCurso').value = t.curso || '';
        });
    }
    new bootstrap.Modal(modal).show();
  }

  function saveTurma() {
    const data = {
      ano: document.getElementById('turmaAno').value,
      curso: document.getElementById('turmaCurso').value
    };
    const method = currentEditId ? 'PUT' : 'POST';
    const url = currentEditId ? `/turmas/${currentEditId}` : '/turmas';
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(r => r.json())
    .then(() => {
      bootstrap.Modal.getInstance(document.getElementById('turmaModal')).hide();
      carregarTodos();
    });
  }

  function editTurma(id) {
    openTurmaModal(id);
  }

  function deleteTurma(id) {
    if (confirm('Tem certeza que deseja apagar esta turma?')) {
      fetch(`/turmas/${id}`, { method: 'DELETE' })
      .then(() => carregarTodos());
    }
  }

  // Disciplina Modal
  function openDisciplinaModal(id = null) {
    currentEditId = id;
    const modal = document.getElementById('disciplinaModal');
    const form = document.getElementById('disciplinaForm');
    form.reset();
    if (id) {
      fetch(`/disciplinas/${id}`)
        .then(r => r.json())
        .then(d => {
          document.getElementById('discNome').value = d.nome_disciplina || '';
          document.getElementById('discDescricao').value = d.descricao || '';
          document.getElementById('discTurma').value = d.turma || '';
          document.getElementById('discSala').value = d.sala || '';
          document.getElementById('discProfessor').value = d.id_professor || '';
          document.getElementById('discDia').value = d.dia_semana || '';
          document.getElementById('discInicio').value = d.hora_inicio || '';
          document.getElementById('discFim').value = d.hora_fim || '';
        });
    }
    new bootstrap.Modal(modal).show();
  }

  function saveDisciplina() {
    const data = {
      nome_disciplina: document.getElementById('discNome').value,
      descricao: document.getElementById('discDescricao').value,
      turma: document.getElementById('discTurma').value,
      sala: parseInt(document.getElementById('discSala').value) || null,
      id_professor: parseInt(document.getElementById('discProfessor').value) || null,
      dia_semana: document.getElementById('discDia').value,
      hora_inicio: document.getElementById('discInicio').value,
      hora_fim: document.getElementById('discFim').value
    };
    const method = currentEditId ? 'PUT' : 'POST';
    const url = currentEditId ? `/disciplinas/${currentEditId}` : '/disciplinas';
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(r => r.json())
    .then(() => {
      bootstrap.Modal.getInstance(document.getElementById('disciplinaModal')).hide();
      carregarTodos();
    });
  }

  function editDisciplina(id) {
    openDisciplinaModal(id);
  }

  function deleteDisciplina(id) {
    if (confirm('Tem certeza que deseja apagar esta disciplina?')) {
      fetch(`/disciplinas/${id}`, { method: 'DELETE' })
      .then(() => carregarTodos());
    }
  }