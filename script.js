// ----- Dados -----
const PESSOAS = ["Vitor", "Caio", "Lucas", "Rafael", "Derick", "Daniel"];

// Referência: segunda-feira 10/08/2026 = Vitor (índice 0).
// A rotação avança 1 pessoa por dia útil (seg a sex), de forma contínua.
const REF = new Date(2026, 7, 10);

const ATIVIDADES = {
  1: [ // Segunda
    "Varrer + Pano: Chão Cozinha",
    "Pano: Mesa",
    "Recolher: Lixo Reciclável",
    "Colocar BIN na Rua",
  ],
  2: [ // Terça
    "Varrer: Escada",
    "Varrer: Corredor Principal",
    "Varrer + Pano: Salão",
    "Recolher BIN da Rua",
  ],
  3: [ // Quarta
    "Varrer + Pano: Chão Banheiro",
    "Limpar: Privada",
    "Pano: Box + Espelho + Pia",
    "Recolher: Lixo Banheiro (caso sujo)",
  ],
  4: [ // Quinta
    "Pano: Balcões",
    "Pano: Fogão",
    "Recolher: Lixo Orgânico",
    "Limpar: Escorredor",
  ],
  5: [ // Sexta
    "Varrer + Pano: Chão Cozinha",
    "Pano: Mesa",
    "Recolher: Lixo Reciclável",
  ],
};

// ----- Lógica -----
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

// Quantidade de dias úteis entre REF e a data (pode ser negativa).
function diasUteisDesdeRef(date) {
  const a = startOfDay(REF);
  const b = startOfDay(date);
  const passo = b >= a ? 1 : -1;
  let count = 0;
  const cur = new Date(a);
  while (cur.getTime() !== b.getTime()) {
    cur.setDate(cur.getDate() + passo);
    const dow = cur.getDay();
    if (dow >= 1 && dow <= 5) count += passo;
  }
  return count;
}

function responsavel(date) {
  const dow = date.getDay();
  if (dow === 0 || dow === 6) return null;
  const n = diasUteisDesdeRef(date);
  const i = ((n % PESSOAS.length) + PESSOAS.length) % PESSOAS.length;
  return PESSOAS[i];
}

// Retorna a última data anterior a `date` que teve responsável (pula fins de semana).
function ultimoDiaUtilAnterior(date) {
  const cur = startOfDay(date);
  cur.setDate(cur.getDate() - 1);
  while (cur.getDay() === 0 || cur.getDay() === 6) {
    cur.setDate(cur.getDate() - 1);
  }
  return cur;
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

// ----- Render -----
const hoje = new Date();

document.getElementById("dateLabel").textContent = cap(fmtLongo.format(hoje));

const pessoa = responsavel(hoje);
document.getElementById("personName").textContent = pessoa || "Sem escala (fim de semana)";

const ontem = ultimoDiaUtilAnterior(hoje);
const pessoaOntem = responsavel(ontem);
const ontemLabel = document.getElementById("yesterdayLabel");
if (pessoaOntem) {
  ontemLabel.innerHTML = `Ontem: <strong>${pessoaOntem}</strong> (${fmtCurto.format(ontem)})`;
} else {
  ontemLabel.textContent = "Ontem não houve escala";
}

const lista = document.getElementById("taskList");
const tarefas = atividadesDoDia(hoje);
if (tarefas.length === 0) {
  lista.outerHTML = '<p class="empty" id="taskList">Nenhuma atividade programada para hoje.</p>';
} else {
  lista.innerHTML = tarefas
    .map((t, i) => `<li><span class="num">${i + 1}</span><span>${t}</span></li>`)
    .join("");
}

// Tabela do mês
function montarMes() {
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();
  const totalDias = new Date(ano, mes + 1, 0).getDate();
  const linhas = [];
  for (let d = 1; d <= totalDias; d++) {
    const data = new Date(ano, mes, d);
    const dow = data.getDay();
    const fds = dow === 0 || dow === 6;
    const ehHoje = d === hoje.getDate();
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

// Pop-up
const overlay = document.getElementById("overlay");
document.getElementById("openBtn").addEventListener("click", () => (overlay.hidden = false));
document.getElementById("closeBtn").addEventListener("click", () => (overlay.hidden = true));
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) overlay.hidden = true;
});
