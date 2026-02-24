const express = require("express");
const app = express();

app.use(express.json());

const VERIFY_TOKEN = "meu_token_123";

// Rota GET (verificação da Meta)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verificado!");
    res.status(200).send(challenge);
  } else {
    console.log("Falha na verificação do webhook");
    res.sendStatus(403);
  }
});

// Rota POST (receber mensagens)
app.post("/webhook", (req, res) => {
  const body = req.body;

  if (body.object) {
    const message =
      body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (message) {
      const from = message.from;
      const text = message.text?.body;

      console.log("Número:", from);
      console.log("Mensagem:", text);
    }
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});


