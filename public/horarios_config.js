// Configuração de Intervalos Escolares
// Define os períodos de aula e os intervalos entre eles

const PERIODOS_AULAS = [
    { inicio: "08:30", fim: "09:20", intervalo_duracao: 10 },
    { inicio: "09:30", fim: "10:30", intervalo_duracao: 15 },
    { inicio: "10:45", fim: "11:40", intervalo_duracao: 5 },
    { inicio: "11:45", fim: "12:35", intervalo_duracao: 10 },
    { inicio: "12:35", fim: "14:00", intervalo_duracao: 85 }, // Almoço (sem intervalo após)
    { inicio: "14:00", fim: "14:50", intervalo_duracao: 10 },
    { inicio: "15:00", fim: "15:50", intervalo_duracao: 10 },
    { inicio: "16:00", fim: "16:50", intervalo_duracao: 10 },
    { inicio: "17:00", fim: "18:00", intervalo_duracao: 0 }  // Última aula
];

// Função para converter tempo "HH:MM" em minutos desde a meia-noite
function tempoEmMinutos(tempo) {
    const [h, m] = tempo.split(':').map(Number);
    return h * 60 + m;
}

// Função para converter minutos em "HH:MM"
function minutosEmTempo(minutos) {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Função para calcular a altura de um bloco no grid (em pixels)
// Assume que cada hora = 60px (1 minuto = 1px)
function calcularAltura(inicio, fim) {
    const inicioMin = tempoEmMinutos(inicio);
    const fimMin = tempoEmMinutos(fim);
    return (fimMin - inicioMin);
}

// Função para calcular a posição top de um bloco no grid
// Assume que o dia começa às 08:00
function calcularTop(inicio) {
    const inicioMin = tempoEmMinutos(inicio);
    const inicioDoiaMin = tempoEmMinutos("08:00");
    return (inicioMin - inicioDoiaMin);
}

// Função para determinar se um horário tem intervalo após ele
function obterIntervaloPosAula(fimAula) {
    for (let periodo of PERIODOS_AULAS) {
        if (periodo.fim === fimAula && periodo.intervalo_duracao > 0) {
            return {
                inicio: fimAula,
                duracao: periodo.intervalo_duracao,
                fim: minutosEmTempo(tempoEmMinutos(fimAula) + periodo.intervalo_duracao)
            };
        }
    }
    return null;
}

// Função para verificar se um tempo pertence a um intervalo
function tempoEhIntervalo(tempo) {
    const tempoMin = tempoEmMinutos(tempo);
    for (let periodo of PERIODOS_AULAS) {
        const fimAulaMin = tempoEmMinutos(periodo.fim);
        const fimIntervaloMin = fimAulaMin + periodo.intervalo_duracao;
        if (tempoMin >= fimAulaMin && tempoMin < fimIntervaloMin) {
            return true;
        }
    }
    return false;
}

// Função para obter todos os intervalos do dia
function obterTodosIntervalos() {
    const intervalos = [];
    for (let periodo of PERIODOS_AULAS) {
        if (periodo.intervalo_duracao > 0) {
            intervalos.push({
                inicio: periodo.fim,
                fim: minutosEmTempo(tempoEmMinutos(periodo.fim) + periodo.intervalo_duracao),
                duracao: periodo.intervalo_duracao
            });
        }
    }
    return intervalos;
}

// Exportar para uso em Node.js (se aplicável)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PERIODOS_AULAS,
        tempoEmMinutos,
        minutosEmTempo,
        calcularAltura,
        calcularTop,
        obterIntervaloPosAula,
        tempoEhIntervalo,
        obterTodosIntervalos
    };
}
