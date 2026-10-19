// ----- Dados -----
const PESSOAS = ["Vitor", "Caio", "Lucas", "Micaella", "Derick", "Daniel"];

// Referência: segunda-feira 10/08/2026 = Vitor (índice 0).
// Mês em JavaScript é zero-indexed (7 = Agosto).
const REF = new Date(2026, 7, 10);

const ATIVIDADES = {
  1: [ // Segunda
    "Varrer e Mopar: Chão Cozinha",
    "Varrer e Mopar: Hall",
    "Recolher Lixo Cozinha/Reciclável",
    "Colocar BIN na Rua",
  ],
  2: [ // Terça
    "Limpar Banheiro Completo",
    "Recolher Lixo Banheiro",
    "Recolher Lixo Cozinha/Reciclável",
    "Recolher BIN da Rua",
  ],
  3: [ // Quarta
    "Limpar (Externo e Interno) AirFryer + Microondas",
    "Limpar superfícies: Balcões + Fogão + Escorredor + Pia",
    "Varrer Escada e Entrada",
    "Recolher Lixo Cozinha/Reciclável",
  ],
  4: [ // Quinta
    "Varrer e Mopar: Chão Cozinha",
    "Varrer e Mopar: Hall",
    "Recolher Lixo Cozinha/Reciclável",
    "Colocar BIN na Rua",
  ],
  5: [ // Sexta
    "Limpar Banheiro Completo",
    "Recolher Lixo Banheiro",
    "Recolher Lixo Cozinha/Reciclável",
    "Recolher BIN da Rua",
  ],
};

// ----- Lógica -----
// Força horário fixo (meio-dia) para evitar desvios de Horário de Verão (DST)
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);

// Quantidade de dias úteis entre REF e a data alvo
function diasUteisDesdeRef(date) {
  const a = startOfDay(REF);
  const b = startOfDay(date);
  
  if (a.getTime() === b.getTime()) return 0;

  const passo = b > a ? 1 : -1;
  let count = 0;
  const cur = new Date(a);

  // Comparações seguras (< e >) impedem loops infinitos
  while ((passo === 1 && cur < b) || (passo === -1 && cur > b)) {
    cur.setDate(cur.getDate() + passo);
    const dow = cur.getDay();
    if (dow >= 1 && dow <= 5) count += passo;
  }
  return count;
}

function responsavel(date) {
  const dow = date.getDay();
  if (dow === 0 || dow === 6) return null; // Fim de semana
  const n = diasUteisDesdeRef(date);
  const i = ((n % PESSOAS.length) + PESSOAS.length) % PESSOAS.length;
  return PESSOAS[i];
}

const atividadesDoDia = (date) => ATIVIDADES[date.getDay()] || [];

const fmtLongo = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
});
const fmtCurto = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });
const fmtDiaSemana = new Intl.DateTimeFormat("pt-BR", { weekday: "short" });
const fmtMes = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// ----- Render Principal -----
const hoje = new Date();

document.getElementById("dateLabel").textContent = cap(fmtLongo.format(hoje));

const pessoa = responsavel(hoje);
document.getElementById("personName").textContent = pessoa || "Sem escala (fim de semana)";

const lista = document.getElementById("taskList");
const tarefas = atividadesDoDia(hoje);

// Mantém a estrutura de lista preservada no DOM
if (tarefas.length === 0) {
  lista.innerHTML = '<li class="empty">Nenhuma atividade programada para hoje.</li>';
} else {
  lista.innerHTML = tarefas
    .map((t, i) => `<li><span class="num">${i + 1}</span><span>${t}</span></li>`)
    .join("");
}

// ----- Tabela do Mês -----
function montarMes() {
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();
  const totalDias = new Date(ano, mes + 1, 0).getDate();
  const linhas = [];

  for (let d = 1; d <= totalDias; d++) {
    const data = new Date(ano, mes, d);
    const dow = data.getDay();
    const fds = dow === 0 || dow === 6;

    // Verificação completa de data (dia, mês e ano)
    const ehHoje =
      data.getDate() === hoje.getDate() &&
      data.getMonth() === hoje.getMonth() &&
      data.getFullYear() === hoje.getFullYear();

    const classes = [ehHoje ? "today" : "", fds ? "weekend" : ""].filter(Boolean).join(" ");

    linhas.push(
      `<tr class="${classes}">
        <td>${fmtCurto.format(data)}</td>
        <td>${cap(fmtDiaSemana.format(data).replace(".", ""))}</td>
        <td>${responsavel(data) || "—"}</td>
      </tr>`
    );
  }

  document.getElementById("monthTable").innerHTML =
    `<thead><tr><th>Data</th><th>Dia</th><th>Responsável</th></tr></thead><tbody>${linhas.join("")}</tbody>`;
  document.getElementById("monthTitle").textContent = "Escala de " + cap(fmtMes.format(hoje));
}
montarMes();

// ----- Modal / Pop-up -----
const overlay = document.getElementById("overlay");
document.getElementById("openBtn").addEventListener("click", () => (overlay.hidden = false));
document.getElementById("closeBtn").addEventListener("click", () => (overlay.hidden = true));
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) overlay.hidden = true;
});
