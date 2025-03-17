document.addEventListener('DOMContentLoaded', function() {
  const cotacaoReaisInput = document.getElementById('cotacao-reais');
  const cotacaoDolarElement = document.getElementById('cotacao-dolar');
  const totalPesosElement = document.getElementById('total-pesos');
  const totalReaisElement = document.getElementById('total-reais');
  const tabelaFixos = document.getElementById('tabela-fixos').getElementsByTagName('tbody')[0];
  const tabelaVariaveis = document.getElementById('tabela-variaveis').getElementsByTagName('tbody')[0];
  const addFixoBtn = document.getElementById('add-linha-fixo');
  const addVariavelBtn = document.getElementById('add-linha-variavel');
  const ALUGUEL_DOLAR = 430;
  let cotacaoDolarBlue = 0;

  async function fetchCotacaoDolar() {
    try {
      const response = await fetch('https://dolarapi.com/v1/dolares/blue');
      const data = await response.json();
      cotacaoDolarBlue = data.venta;
      cotacaoDolarElement.textContent = cotacaoDolarBlue.toFixed(2);
      atualizarTotais();
    } catch (error) {
      cotacaoDolarElement.textContent = 'Erro ao carregar';
      console.error('Erro ao buscar cotação do Dólar Blue:', error);
    }
  }

  function atualizarTotais() {
    const cotacaoReais = parseFloat(cotacaoReaisInput.value);
    let totalPesos = 0;
    let totalReais = 0;

    // Calcular valor do aluguel em pesos e reais
    const valorAluguelPesos = ALUGUEL_DOLAR * cotacaoDolarBlue;
    const valorAluguelReais = valorAluguelPesos / cotacaoReais;

    // Atualizar totais para gastos fixos
    document.querySelectorAll('#tabela-fixos tbody tr').forEach(row => {
      const descricao = row.querySelector('td:nth-child(1) input').value;
      let valorPesos = parseFloat(row.querySelector('td:nth-child(2) input').value);
      if (descricao.toLowerCase() === 'aluguel') {
        valorPesos = valorAluguelPesos;
        row.querySelector('td:nth-child(2) input').value = valorPesos.toFixed(2);
      }
      const valorReais = valorPesos / cotacaoReais;
      row.querySelector('td:nth-child(3) input').value = valorReais.toFixed(2);
      totalPesos += valorPesos;
      totalReais += valorReais;
    });

    // Atualizar totais para gastos variáveis
    document.querySelectorAll('#tabela-variaveis tbody tr').forEach(row => {
      const valorPesos = parseFloat(row.querySelector('td:nth-child(2) input').value);
      const valorReais = valorPesos / cotacaoReais;
      row.querySelector('td:nth-child(3) input').value = valorReais.toFixed(2);
      totalPesos += valorPesos;
      totalReais += valorReais;
    });

    totalPesosElement.textContent = totalPesos.toFixed(2);
    totalReaisElement.textContent = totalReais.toFixed(2);

    // Salvar dados no localStorage
    salvarDados();
  }

  function salvarDados() {
    const cotacaoReais = cotacaoReaisInput.value;
    const fixos = [];
    const variaveis = [];

    document.querySelectorAll('#tabela-fixos tbody tr').forEach(row => {
      fixos.push({
        descricao: row.querySelector('td:nth-child(1) input').value,
        valorPesos: row.querySelector('td:nth-child(2) input').value
      });
    });

    document.querySelectorAll('#tabela-variaveis tbody tr').forEach(row => {
      variaveis.push({
        descricao: row.querySelector('td:nth-child(1) input').value,
        valorPesos: row.querySelector('td:nth-child(2) input').value
      });
    });

    console.log('Salvando dados no localStorage:', { cotacaoReais, fixos, variaveis });
    localStorage.setItem('cotacaoReais', cotacaoReais);
    localStorage.setItem('fixos', JSON.stringify(fixos));
    localStorage.setItem('variaveis', JSON.stringify(variaveis));
  }

  function carregarDados() {
    const cotacaoReais = localStorage.getItem('cotacaoReais');
    const fixos = JSON.parse(localStorage.getItem('fixos')) || [];
    const variaveis = JSON.parse(localStorage.getItem('variaveis')) || [];

    console.log('Carregando dados do localStorage:', { cotacaoReais, fixos, variaveis });

    if (cotacaoReais) {
      cotacaoReaisInput.value = cotacaoReais;
    }

    fixos.forEach(item => {
      const row = criarLinha(tabelaFixos);
      row.querySelector('td:nth-child(1) input').value = item.descricao;
      row.querySelector('td:nth-child(2) input').value = item.valorPesos;
    });

    variaveis.forEach(item => {
      const row = criarLinha(tabelaVariaveis);
      row.querySelector('td:nth-child(1) input').value = item.descricao;
      row.querySelector('td:nth-child(2) input').value = item.valorPesos;
    });

    atualizarTotais();
  }

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
    pesosInput.addEventListener('input', atualizarTotais);
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
      atualizarTotais();
    });
    cellRemove.appendChild(removeBtn);

    return newRow;
  }

  cotacaoReaisInput.addEventListener('input', atualizarTotais);
  addFixoBtn.addEventListener('click', () => criarLinha(tabelaFixos));
  addVariavelBtn.addEventListener('click', () => criarLinha(tabelaVariaveis));

  // Chamar a função para inicializar os valores
  carregarDados();
  fetchCotacaoDolar();
});
