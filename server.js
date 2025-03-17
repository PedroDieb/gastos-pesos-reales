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
  fs.readFile(dataFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Erro ao ler os dados');
    }
    res.send(JSON.parse(data));
  });
});

app.post('/data', (req, res) => {
  fs.writeFile(dataFilePath, JSON.stringify(req.body, null, 2), (err) => {
    if (err) {
      return res.status(500).send('Erro ao salvar os dados');
    }
    res.send('Dados salvos com sucesso');
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});