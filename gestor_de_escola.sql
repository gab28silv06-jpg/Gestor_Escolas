-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 24-Abr-2026 às 20:28
-- Versão do servidor: 10.4.32-MariaDB
-- versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `gestor_de_escola`
--

-- --------------------------------------------------------

--
-- Estrutura da tabela `alunos`
--

CREATE TABLE `alunos` (
  `id_aluno` int(11) NOT NULL,
  `nome` varchar(100) DEFAULT NULL,
  `data_nascimento` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `atribuicoes`
--

CREATE TABLE `atribuicoes` (
  `id_atribuicao` int(11) NOT NULL,
  `id_professor` int(11) DEFAULT NULL,
  `id_disciplina` int(11) DEFAULT NULL,
  `id_turma` int(11) DEFAULT NULL,
  `id_horario` int(11) DEFAULT NULL,
  `sala` varchar(50) DEFAULT NULL,
  `descricao` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `atribuicoes`
--

INSERT INTO `atribuicoes` (`id_atribuicao`, `id_professor`, `id_disciplina`, `id_turma`, `id_horario`, `sala`, `descricao`) VALUES
(5, 3, 6, 8, 5, '2', NULL),
(6, 3, 6, 2, 6, '6', NULL),
(8, 2, 1, 2, 8, '3', NULL),
(9, 3, 7, 11, 9, '1', NULL),
(10, 2, 1, 2, 10, '5', NULL),
(11, 2, 1, 2, 11, '3', NULL),
(12, 3, 5, 11, 12, '3', NULL),
(13, 8, 7, 3, 13, '6', NULL);

-- --------------------------------------------------------

--
-- Estrutura da tabela `disciplinas`
--

CREATE TABLE `disciplinas` (
  `id_disciplina` int(11) NOT NULL,
  `nome_disciplina` varchar(100) DEFAULT NULL,
  `descricao` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `disciplinas`
--

INSERT INTO `disciplinas` (`id_disciplina`, `nome_disciplina`, `descricao`) VALUES
(1, 'Matemática', NULL),
(2, 'Inglês', ''),
(3, 'Física-Química', NULL),
(4, 'Arquitetura de Computadores', ''),
(5, 'Sistemas Operativos', ''),
(6, 'Redes de Comunicação', ''),
(7, 'Programação de Sistemas Informáticos', ''),
(8, 'Português', ''),
(10, 'Área de Integração', NULL),
(12, 'Educação Física', NULL);

-- --------------------------------------------------------

--
-- Estrutura da tabela `horarios`
--

CREATE TABLE `horarios` (
  `id_horario` int(11) NOT NULL,
  `dia_semana` varchar(20) DEFAULT NULL,
  `hora_inicio` time DEFAULT NULL,
  `hora_fim` time DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `horarios`
--

INSERT INTO `horarios` (`id_horario`, `dia_semana`, `hora_inicio`, `hora_fim`) VALUES
(1, 'Terça', '09:00:00', '10:00:00'),
(5, 'Segunda', '08:30:00', '14:00:00'),
(6, 'Quarta', '08:30:00', '10:45:00'),
(8, 'Segunda', '08:30:00', '09:30:00'),
(9, 'Terça', '09:30:00', '11:00:00'),
(10, 'Sexta', '08:00:00', '09:00:00'),
(11, 'Sexta', '17:10:00', '18:10:00'),
(12, 'Quinta', '09:30:00', '10:30:00'),
(13, 'Quinta', '08:30:00', '11:45:00');

-- --------------------------------------------------------

--
-- Estrutura da tabela `professores`
--

CREATE TABLE `professores` (
  `id_professor` int(11) NOT NULL,
  `nome` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `disciplinas_permitidas` text DEFAULT NULL,
  `turmas_atribuidas` text DEFAULT NULL,
  `is_admin` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `professores`
--

INSERT INTO `professores` (`id_professor`, `nome`, `email`, `disciplinas_permitidas`, `turmas_atribuidas`, `is_admin`) VALUES
(1, 'Diretor', 'admin@escola.pt', NULL, NULL, 1),
(2, 'Professor Teste', 'prof@gmail.com', 'Matemática, Inglês, Física-Química', NULL, 0),
(3, 'Professor Teste2', 'prof2@gmail.com', 'Arquitetura de Computadores, Sistemas Operativos, Redes de Comunicação, Programação de Sistemas Informáticos', NULL, 0),
(4, 'Professor Teste3', 'prof3@gmail.com', 'Redes de Comunicação, Programação de Sistemas Informáticos, Português, Área de Integração', NULL, 0),
(6, 'Professor Diretor', 'admin2@escola.pt', 'Matemática, Física-Química', NULL, 1),
(7, 'Professor Teste4', 'prof4@gmail.com', 'Português', NULL, 0),
(8, 'Professor Teste5', 'prof5@gmail.com', 'Programação de Sistemas Informáticos', NULL, 0),
(10, 'Professor Teste6', 'prof6@gmail.com', 'Programação de Sistemas Informáticos', NULL, 0);

-- --------------------------------------------------------

--
-- Estrutura da tabela `turmas`
--

CREATE TABLE `turmas` (
  `id_turma` int(11) NOT NULL,
  `ano` varchar(20) DEFAULT NULL,
  `curso` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `turmas`
--

INSERT INTO `turmas` (`id_turma`, `ano`, `curso`) VALUES
(2, '10º', 'GPSI'),
(3, '11º', 'GPSI'),
(4, '12º', 'GPSI'),
(5, '10º', 'IG'),
(6, '11º', 'IG'),
(7, '12º', 'IG'),
(8, '10º', 'ASC'),
(9, '11º', 'ASC'),
(10, '12º', 'ASC'),
(11, '10º', 'C&M'),
(12, '11º', 'C&M'),
(13, '12º', 'C&M');

--
-- Índices para tabelas despejadas
--

--
-- Índices para tabela `alunos`
--
ALTER TABLE `alunos`
  ADD PRIMARY KEY (`id_aluno`);

--
-- Índices para tabela `atribuicoes`
--
ALTER TABLE `atribuicoes`
  ADD PRIMARY KEY (`id_atribuicao`),
  ADD KEY `fk_prof` (`id_professor`),
  ADD KEY `fk_disc` (`id_disciplina`),
  ADD KEY `fk_turma` (`id_turma`),
  ADD KEY `fk_horario` (`id_horario`);

--
-- Índices para tabela `disciplinas`
--
ALTER TABLE `disciplinas`
  ADD PRIMARY KEY (`id_disciplina`);

--
-- Índices para tabela `horarios`
--
ALTER TABLE `horarios`
  ADD PRIMARY KEY (`id_horario`);

--
-- Índices para tabela `professores`
--
ALTER TABLE `professores`
  ADD PRIMARY KEY (`id_professor`),
  ADD UNIQUE KEY `email_unique` (`email`);

--
-- Índices para tabela `turmas`
--
ALTER TABLE `turmas`
  ADD PRIMARY KEY (`id_turma`);

--
-- AUTO_INCREMENT de tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `alunos`
--
ALTER TABLE `alunos`
  MODIFY `id_aluno` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `atribuicoes`
--
ALTER TABLE `atribuicoes`
  MODIFY `id_atribuicao` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de tabela `disciplinas`
--
ALTER TABLE `disciplinas`
  MODIFY `id_disciplina` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de tabela `horarios`
--
ALTER TABLE `horarios`
  MODIFY `id_horario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de tabela `professores`
--
ALTER TABLE `professores`
  MODIFY `id_professor` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de tabela `turmas`
--
ALTER TABLE `turmas`
  MODIFY `id_turma` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- Restrições para despejos de tabelas
--

--
-- Limitadores para a tabela `atribuicoes`
--
ALTER TABLE `atribuicoes`
  ADD CONSTRAINT `fk_atrib_disc` FOREIGN KEY (`id_disciplina`) REFERENCES `disciplinas` (`id_disciplina`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_atrib_horario` FOREIGN KEY (`id_horario`) REFERENCES `horarios` (`id_horario`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_atrib_prof` FOREIGN KEY (`id_professor`) REFERENCES `professores` (`id_professor`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_atrib_turma` FOREIGN KEY (`id_turma`) REFERENCES `turmas` (`id_turma`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
