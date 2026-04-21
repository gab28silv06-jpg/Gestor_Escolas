-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 17-Abr-2026 às 12:30
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
(3, 2, 2, 1, 9, '4', 'Módulo 13'),
(4, 4, 1, 1, 10, '4', ''),
(6, 4, 36, 3, 12, '5', ''),
(7, 2, 3, 10, 13, '10', ''),
(8, 2, 1, 4, 14, '10', ''),
(9, 4, 36, 14, 15, '2', '');

-- --------------------------------------------------------

--
-- Estrutura da tabela `disciplinas`
--

CREATE TABLE `disciplinas` (
  `id_disciplina` int(11) NOT NULL,
  `nome_disciplina` varchar(100) DEFAULT NULL,
  `id_professor` int(11) DEFAULT NULL,
  `descricao` text DEFAULT NULL,
  `turma` varchar(50) DEFAULT NULL,
  `dia_semana` varchar(20) DEFAULT NULL,
  `hora_inicio` time DEFAULT NULL,
  `hora_fim` time DEFAULT NULL,
  `sala` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `disciplinas`
--

INSERT INTO `disciplinas` (`id_disciplina`, `nome_disciplina`, `id_professor`, `descricao`, `turma`, `dia_semana`, `hora_inicio`, `hora_fim`, `sala`) VALUES
(1, 'Arquitetura de Computadores', 2, '', '11º GPSI', 'Segunda', '10:45:00', '11:45:00', 'Sala 6'),
(2, 'Redes de Comunicação', 2, '', '10º GPSI', 'Segunda', '08:30:00', '10:30:00', 'Sala 5'),
(3, 'Programação de Sistemas Informáticos', 2, '', '10º GPSI', 'Segunda', '17:00:00', '18:00:00', 'Sala 6'),
(36, 'Matemática', NULL, '', NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estrutura da tabela `disponibilidade`
--

CREATE TABLE `disponibilidade` (
  `id_disponibilidade` int(11) NOT NULL,
  `id_professor` int(11) DEFAULT NULL,
  `dia_semana` varchar(20) DEFAULT NULL,
  `hora_inicio` time DEFAULT NULL,
  `hora_fim` time DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `disponibilidade`
--

INSERT INTO `disponibilidade` (`id_disponibilidade`, `id_professor`, `dia_semana`, `hora_inicio`, `hora_fim`) VALUES
(2, 2, 'Segunda', '08:00:00', '09:00:00'),
(3, 2, 'Segunda', '11:00:00', '12:00:00'),
(4, 2, 'Segunda', '09:00:00', '10:00:00'),
(5, 2, 'Segunda', '10:00:00', '11:00:00'),
(6, 2, 'Quinta', '14:00:00', '15:00:00'),
(8, 2, 'Quinta', '12:00:00', '13:00:00');

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
(1, 'Segunda', '08:00:00', '17:00:00'),
(4, 'Segunda', '10:00:00', '11:00:00'),
(5, 'Segunda', '11:00:00', '12:00:00'),
(6, 'Quinta', '14:00:00', '15:00:00'),
(7, 'Quinta', '12:00:00', '13:00:00'),
(8, 'Quinta', '13:00:00', '14:00:00'),
(9, 'Segunda', '08:30:00', '09:30:00'),
(10, 'Segunda', '09:30:00', '10:30:00'),
(12, 'Terça', '09:30:00', '10:45:00'),
(13, 'Quinta', '10:00:00', '11:00:00'),
(14, 'Sexta', '09:00:00', '10:00:00'),
(15, 'Quarta', '15:00:00', '15:50:00');

-- --------------------------------------------------------

--
-- Estrutura da tabela `professores`
--

CREATE TABLE `professores` (
  `id_professor` int(11) NOT NULL,
  `nome` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `disciplinas_permitidas` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `professores`
--

INSERT INTO `professores` (`id_professor`, `nome`, `email`, `disciplinas_permitidas`) VALUES
(2, 'professor', 'prof@gmail.com', 'Arquitetura de Computadores, Redes de Comunicação, Programação de Sistemas Informáticos'),
(4, 'professor 2', 'profprof@gmail.com', 'Matemática');

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
(1, '10º', 'GPSI'),
(3, '11º', 'GPSI'),
(4, '12º', 'GPSI'),
(5, '10º', 'IG'),
(6, '11º', 'IG'),
(7, '12º', 'IG'),
(9, '10º', 'ASC'),
(10, '11º', 'ASC'),
(11, '12º', 'ASC'),
(12, '10º', 'C&M'),
(13, '11º', 'C&M'),
(14, '12º', 'C&M');

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
  ADD KEY `id_professor` (`id_professor`),
  ADD KEY `id_disciplina` (`id_disciplina`),
  ADD KEY `id_turma` (`id_turma`),
  ADD KEY `id_horario` (`id_horario`);

--
-- Índices para tabela `disciplinas`
--
ALTER TABLE `disciplinas`
  ADD PRIMARY KEY (`id_disciplina`),
  ADD KEY `id_professor` (`id_professor`);

--
-- Índices para tabela `disponibilidade`
--
ALTER TABLE `disponibilidade`
  ADD PRIMARY KEY (`id_disponibilidade`),
  ADD KEY `id_professor` (`id_professor`);

--
-- Índices para tabela `horarios`
--
ALTER TABLE `horarios`
  ADD PRIMARY KEY (`id_horario`);

--
-- Índices para tabela `professores`
--
ALTER TABLE `professores`
  ADD PRIMARY KEY (`id_professor`);

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
  MODIFY `id_atribuicao` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de tabela `disciplinas`
--
ALTER TABLE `disciplinas`
  MODIFY `id_disciplina` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT de tabela `disponibilidade`
--
ALTER TABLE `disponibilidade`
  MODIFY `id_disponibilidade` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de tabela `horarios`
--
ALTER TABLE `horarios`
  MODIFY `id_horario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de tabela `professores`
--
ALTER TABLE `professores`
  MODIFY `id_professor` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

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
  ADD CONSTRAINT `atribuicoes_ibfk_1` FOREIGN KEY (`id_professor`) REFERENCES `professores` (`id_professor`),
  ADD CONSTRAINT `atribuicoes_ibfk_2` FOREIGN KEY (`id_disciplina`) REFERENCES `disciplinas` (`id_disciplina`),
  ADD CONSTRAINT `atribuicoes_ibfk_3` FOREIGN KEY (`id_turma`) REFERENCES `turmas` (`id_turma`),
  ADD CONSTRAINT `atribuicoes_ibfk_4` FOREIGN KEY (`id_horario`) REFERENCES `horarios` (`id_horario`);

--
-- Limitadores para a tabela `disciplinas`
--
ALTER TABLE `disciplinas`
  ADD CONSTRAINT `disciplinas_ibfk_1` FOREIGN KEY (`id_professor`) REFERENCES `professores` (`id_professor`),
  ADD CONSTRAINT `disciplinas_ibfk_2` FOREIGN KEY (`id_professor`) REFERENCES `professores` (`id_professor`);

--
-- Limitadores para a tabela `disponibilidade`
--
ALTER TABLE `disponibilidade`
  ADD CONSTRAINT `disponibilidade_ibfk_1` FOREIGN KEY (`id_professor`) REFERENCES `professores` (`id_professor`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
