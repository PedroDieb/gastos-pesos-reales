const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

const dataFilePath = path.join(__dirname, 'data.json');

app.get('/data', (req, res) => {
  try {
    fs.readFile(dataFilePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Erro ao ler os dados:', err);
        return res.status(500).send('Erro ao ler os dados');
      }
      res.send(JSON.parse(data));
    });
  } catch (error) {
    console.error('Erro ao processar a requisição GET /data:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

app.post('/data', (req, res) => {
  try {
    fs.writeFile(dataFilePath, JSON.stringify(req.body, null, 2), (err) => {
      if (err) {
        console.error('Erro ao salvar os dados:', err);
        return res.status(500).send('Erro ao salvar os dados');
      }
      res.send('Dados salvos com sucesso');
    });
  } catch (error) {
    console.error('Erro ao processar a requisição POST /data:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});