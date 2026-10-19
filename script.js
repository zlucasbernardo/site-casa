// ----- Dados -----
const PESSOAS = ["Vitor", "Caio", "Lucas", "Micaella", "Derick", "Daniel"];

// Referência: segunda-feira 10/08/2026 = Vitor (índice 0).
// A rotação avança 1 pessoa por dia útil (seg a sex), de forma contínua.
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

// ----- Lógica de Datas -----
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

// Quantidade de dias úteis entre REF e a data informada
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

function ultimoDiaUtilAnterior(date) {
  const cur = startOfDay(date);
  cur.setDate(cur.getDate() - 1);
  while (cur.getDay() === 0 || cur.getDay() === 6) {
    cur.setDate(cur.getDate() - 1);
  }
  return cur;
}

// Segunda 17/08/2026 = "BIN PRETO"; alterna a cada semana
const REF_BIN = new Date(2026, 7, 17);
const BIN = ["Colocar BIN PRETO na Rua", "Colocar BIN Reciclável + Orgânico na Rua"];

function binDaSegunda(date) {
  const diffMs = startOfDay(date) - startOfDay(REF_BIN);
  const semanas = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));
  return BIN[((semanas % 2) + 2) % 2];
}

function atividadesDoDia(date) {
  const base = ATIVIDADES[date.getDay()];
  if (!base) return [];
  const lista = [...base];
  if (date.getDay() === 1 && startOfDay(date) >= startOfDay(REF_BIN)) {
    lista[3] = binDaSegunda(date);
  }
  return lista;
}

// Formatadores
const fmtLongo = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
});
const fmtCurto = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });
const fmtDiaSemana = new Intl.DateTimeFormat("pt-BR", { weekday: "short" });
const fmtMes = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// ----- Renderização Inicial -----
const hoje = new Date();

document.getElementById("dateLabel").textContent = cap(fmtLongo.format(hoje));

const pessoa = responsavel(hoje);
document.getElementById("personName").textContent = pessoa || "Sem escala (fim de semana)";

// Exibição do responsável anterior de forma segura
const ontem = ultimoDiaUtilAnterior(hoje);
const pessoaOntem = responsavel(ontem);
const ontemLabel = document.getElementById("yesterdayLabel");

if (ontemLabel) {
  if (pessoaOntem) {
    ontemLabel.innerHTML = `Ontem: <strong>${pessoaOntem}</strong> (${fmtCurto.format(ontem)})`;
  } else {
    ontemLabel.textContent = "Ontem não houve escala";
  }
}

// Lista de tarefas
const lista = document.getElementById("taskList");
const tarefas = atividadesDoDia(hoje);

if (tarefas.length === 0) {
  lista.innerHTML = '<li class="empty">Nenhuma atividade programada para hoje.</li>';
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
    const ats = atividadesDoDia(data);
    const cols = [0, 1, 2, 3]
      .map((i) => `<td class="act">${ats[i] || "—"}</td>`)
      .join("");

    linhas.push(
      `<tr class="${classes}">
        <td>${fmtCurto.format(data)}</td>
        <td>${cap(fmtDiaSemana.format(data).replace(".", ""))}</td>
        <td>${responsavel(data) || "—"}</td>
        ${cols}
      </tr>`
    );
  }

  document.getElementById("monthTable").innerHTML = `
    <thead>
      <tr>
        <th>Data</th>
        <th>Dia</th>
        <th>Responsável</th>
        <th>Ativ. 1</th>
        <th>Ativ. 2</th>
        <th>Ativ. 3</th>
        <th>Ativ. 4</th>
      </tr>
    </thead>
    <tbody>${linhas.join("")}</tbody>
  `;
  document.getElementById("monthTitle").textContent = "Escala de " + cap(fmtMes.format(hoje));
}
montarMes();

// ----- Controle do Modal -----
const overlay = document.getElementById("overlay");
const openBtn = document.getElementById("openBtn");
const closeBtn = document.getElementById("closeBtn");

const abrirModal = () => {
  overlay.hidden = false;
  closeBtn.focus();
};

const fecharModal = () => {
  overlay.hidden = true;
  openBtn.focus();
};

openBtn.addEventListener("click", abrirModal);
closeBtn.addEventListener("click", fecharModal);

overlay.addEventListener("click", (e) => {
  if (e.target === overlay) fecharModal();
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !overlay.hidden) {
    fecharModal();
  }
});
