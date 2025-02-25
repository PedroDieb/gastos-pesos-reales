// Seleciona elementos
const cotacaoInput = document.getElementById('cotacao');
const tabelaFixos = document.getElementById('tabela-fixos').getElementsByTagName('tbody')[0];
const tabelaVariaveis = document.getElementById('tabela-variaveis').getElementsByTagName('tbody')[0];

const addFixoBtn = document.getElementById('add-linha-fixo');
const addVariavelBtn = document.getElementById('add-linha-variavel');

const totalPesosSpan = document.getElementById('total-pesos');
const totalReaisSpan = document.getElementById('total-reais');

// Função para criar uma nova linha (gasto)
function criarLinha(tbody) {
  const newRow = tbody.insertRow();

  // Descrição
  let cellDesc = newRow.insertCell(0);
  cellDesc.setAttribute('data-label', 'Descrição');
  const descInput = document.createElement('input');
  descInput.type = 'text';
  descInput.placeholder = 'Ex: Aluguel';
  cellDesc.appendChild(descInput);

  // Valor em Pesos
  let cellPesos = newRow.insertCell(1);
  cellPesos.setAttribute('data-label', 'Valor (Pesos)');
  const pesosInput = document.createElement('input');
  pesosInput.type = 'number';
  pesosInput.min = '0';
  pesosInput.step = '0.01';
  pesosInput.value = '0';
  pesosInput.addEventListener('input', calcularTotais); 
  cellPesos.appendChild(pesosInput);

  // Valor em Reais
  let cellReais = newRow.insertCell(2);
  cellReais.setAttribute('data-label', 'Valor (Reais)');
  const reaisInput = document.createElement('input');
  reaisInput.type = 'number';
  reaisInput.min = '0';
  reaisInput.step = '0.01';
  reaisInput.value = '0';
  reaisInput.disabled = true; // será calculado automaticamente
  cellReais.appendChild(reaisInput);

  // Botão de remover
  let cellRemove = newRow.insertCell(3);
  cellRemove.setAttribute('data-label', 'Ação');
  const removeBtn = document.createElement('button');
  removeBtn.textContent = 'Remover';
  removeBtn.addEventListener('click', () => {
    tbody.removeChild(newRow);
    calcularTotais();
  });
  cellRemove.appendChild(removeBtn);

  // Sempre que cria uma linha nova, recalcula
  calcularTotais();
}

// Função para calcular os totais
function calcularTotais() {
  const cotacao = parseFloat(cotacaoInput.value) || 0;

  let totalPesos = 0;
  let totalReais = 0;

  // Calcula tabela de fixos
  for (let i = 0; i < tabelaFixos.rows.length; i++) {
    let row = tabelaFixos.rows[i];
    let pesos = parseFloat(row.cells[1].getElementsByTagName('input')[0].value) || 0;
    let reaisInput = row.cells[2].getElementsByTagName('input')[0];

    let reaisCalculado = pesos * cotacao;

    // Atribui ao input (desabilitado) o valor calculado
    reaisInput.value = reaisCalculado.toFixed(2);

    totalPesos += pesos;
    totalReais += reaisCalculado;
  }

  // Calcula tabela de variáveis
  for (let i = 0; i < tabelaVariaveis.rows.length; i++) {
    let row = tabelaVariaveis.rows[i];
    let pesos = parseFloat(row.cells[1].getElementsByTagName('input')[0].value) || 0;
    let reaisInput = row.cells[2].getElementsByTagName('input')[0];

    let reaisCalculado = pesos * cotacao;
    reaisInput.value = reaisCalculado.toFixed(2);

    totalPesos += pesos;
    totalReais += reaisCalculado;
  }

  // Exibe totais
  totalPesosSpan.textContent = totalPesos.toFixed(2);
  totalReaisSpan.textContent = totalReais.toFixed(2);
}

// Listeners
addFixoBtn.addEventListener('click', () => criarLinha(tabelaFixos));
addVariavelBtn.addEventListener('click', () => criarLinha(tabelaVariaveis));

// Quando a cotação mudar, recalcula
cotacaoInput.addEventListener('input', calcularTotais);

// (Opcional) Criar algumas linhas iniciais de exemplo
criarLinha(tabelaFixos);
criarLinha(tabelaVariaveis);
