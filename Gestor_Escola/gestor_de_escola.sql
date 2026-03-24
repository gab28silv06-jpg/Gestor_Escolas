CREATE DATABASE IF NOT EXISTS gestor_de_escola CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gestor_de_escola;

CREATE TABLE IF NOT EXISTS professores (
    id_professor INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    disciplinas_permitidas TEXT,
);

CREATE TABLE IF NOT EXISTS disciplinas (
    id_disciplina INT AUTO_INCREMENT PRIMARY KEY,
    nome_disciplina VARCHAR(100) NOT NULL,
    descricao TEXT,
    turma VARCHAR(20) NOT NULL,
    sala INT NOT NULL CHECK (sala BETWEEN 1 AND 12),
    id_professor INT NOT NULL,
    dia_semana ENUM('Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta') NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    FOREIGN KEY (id_professor) REFERENCES professores(id_professor) ON DELETE CASCADE,
    INDEX idx_dia_hora (dia_semana, hora_inicio),
    INDEX idx_professor (id_professor)
);

CREATE TABLE IF NOT EXISTS turmas (
    id_turma INT AUTO_INCREMENT PRIMARY KEY,
    ano VARCHAR(50),
    curso VARCHAR(100)
);

INSERT INTO professores (nome, email, disciplinas_permitidas) VALUES
('Ana Silva', 'ana.silva@escola.pt', 'Matemática, Física'),
('João Pereira', 'joao.pereira@escola.pt', 'Português, Literatura'),
('Carla Costa', 'carla.costa@escola.pt', 'Biologia, Química'),
('Ricardo Fernandes', 'ricardo.fernandes@escola.pt', 'História, Geografia');

INSERT INTO disciplinas (nome_disciplina, descricao, turma, sala, id_professor, dia_semana, hora_inicio, hora_fim) VALUES
('Matemática', 'Funções e equações', '10ºA', 5, 1, 'Segunda', '08:00:00', '08:45:00'),
('Física', 'Mecânica básica', '11ºB', 7, 1, 'Terça', '09:30:00', '10:15:00'),
('Português', 'Análise de texto', '10ºC', 3, 2, 'Quarta', '11:15:00', '12:00:00'),
('Literatura', 'Romantismo', '11ºA', 9, 2, 'Quinta', '10:30:00', '11:15:00'),
('Biologia', 'Células e tecidos', '10ºB', 6, 3, 'Sexta', '14:00:00', '14:45:00'),
('Química', 'Reações químicas', '11ºC', 8, 3, 'Segunda', '13:15:00', '14:00:00'),
('História', 'Idade Média', '10ºD', 4, 4, 'Terça', '12:00:00', '12:30:00'),
('Geografia', 'Recursos naturais', '11ºB', 2, 4, 'Quinta', '08:45:00', '09:30:00');


INSERT INTO turmas (ano, curso) VALUES
('10º', 'A'),
('11º', 'B'),
('10º', 'C'),
('11º', 'A'),
('10º', 'B'),
('11º', 'C'),
('10º', 'D');