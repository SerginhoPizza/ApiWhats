const axios = require("axios");

const TOKEN = "EAARbTE5PR8MBQ5Tm0bCbmhBGyZCH9J9tiZBczF0zyQYkRucxaAhjL1wLWQlN1WJIZAq1yHe8gxlu8ZBJTZAhTQ9Fim8aZCQfTZBakI8sMPkTj2pjsB8T5Gy6ZBgv7UBtgNvwjTZCZBVlwtPoLCUjhDkzlZBbjhOzjZAR9JuRsmhG5XXYZAIZCQZBwuHFVpUCmVkbSS0EnOXm6I1A2WgAaj7wqQfxPyCDhUocNYorB1fxyq2AVPDk43MTZCPVUoOnJRKzBciiZB820R76FJcXjCS2qWfUQmvcchH9crgZDZD";
const PHONE_NUMBER_ID = "1066289309890791";

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
app.post("/webhook", async (req, res) => {
  const body = req.body;

  const message =
    body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

  if (message) {
    const from = message.from;
    const text = message.text?.body;

    console.log("Mensagem recebida:", text);

    // resposta automática simples
    await enviarMensagem(from, "Olá! 👋 Recebemos sua mensagem.");
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

//Enviar mensagem dentro das 24hrs
async function enviarMensagem(to, text) {
  await axios.post(
    `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to: to,
      text: { body: text }
    },
    {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json"
      }
    }
  );
}



