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
  const backendUrl = 'https://gastos-pesos-reales-8eouocc82-pedrodiebs-projects.vercel.app';

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

    // Salvar dados no backend
    salvarDados();
  }

  async function salvarDados() {
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

    const data = { cotacaoReais, fixos, variaveis };

    try {
      const response = await fetch(`${backendUrl}/data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      const result = await response.text();
      console.log(result);
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
    }
  }

  async function carregarDados() {
    try {
      const response = await fetch(`${backendUrl}/data`);
      const data = await response.json();
      console.log('Carregando dados do backend:', data);

      if (data.cotacaoReais) {
        cotacaoReaisInput.value = data.cotacaoReais;
      }

      data.fixos.forEach(item => {
        const row = criarLinha(tabelaFixos);
        row.querySelector('td:nth-child(1) input').value = item.descricao;
        row.querySelector('td:nth-child(2) input').value = item.valorPesos;
      });

      data.variaveis.forEach(item => {
        const row = criarLinha(tabelaVariaveis);
        row.querySelector('td:nth-child(1) input').value = item.descricao;
        row.querySelector('td:nth-child(2) input').value = item.valorPesos;
      });

      atualizarTotais();
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  }

  function criarLinha(tabela) {
    const row = tabela.insertRow();
    row.innerHTML = `
      <td><input type="text" /></td>
      <td><input type="number" step="0.01" /></td>
      <td><input type="number" step="0.01" readonly /></td>
      <td><button class="remover-linha">Remover</button></td>
    `;
    row.querySelector('.remover-linha').addEventListener('click', () => {
      tabela.deleteRow(row.rowIndex - 1);
      atualizarTotais();
    });
    return row;
  }

  addFixoBtn.addEventListener('click', () => criarLinha(tabelaFixos));
  addVariavelBtn.addEventListener('click', () => criarLinha(tabelaVariaveis));

  cotacaoReaisInput.addEventListener('input', atualizarTotais);

  fetchCotacaoDolar();
  carregarDados();
});
