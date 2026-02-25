const sessoes = {};
const TEMPO_EXPIRACAO = 15 * 60 * 1000; // 15 minutos

const axios = require("axios");

const TOKEN = "EAARbTE5PR8MBQ5Tm0bCbmhBGyZCH9J9tiZBczF0zyQYkRucxaAhjL1wLWQlN1WJIZAq1yHe8gxlu8ZBJTZAhTQ9Fim8aZCQfTZBakI8sMPkTj2pjsB8T5Gy6ZBgv7UBtgNvwjTZCZBVlwtPoLCUjhDkzlZBbjhOzjZAR9JuRsmhG5XXYZAIZCQZBwuHFVpUCmVkbSS0EnOXm6I1A2WgAaj7wqQfxPyCDhUocNYorB1fxyq2AVPDk43MTZCPVUoOnJRKzBciiZB820R76FJcXjCS2qWfUQmvcchH9crgZDZD";
const PHONE_NUMBER_ID = "1066289309890791";

const express = require("express");
const app = express();

app.use(express.json());

const VERIFY_TOKEN = "meu_token_123";

//Caminho do servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

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
    const text = message.text?.body?.trim();

    const agora = Date.now();

    // Criar sessão se não existir
    if (!sessoes[from]) {
      sessoes[from] = {
        etapa: "menu",
        ultimaInteracao: agora
      };
    }

    const sessao = sessoes[from];

    // 🔄 Verifica expiração
    if (agora - sessao.ultimaInteracao > TEMPO_EXPIRACAO) {
      sessao.etapa = "menu";
      await enviarMensagem(from, "Sessão reiniciada por inatividade ⏳");
      await enviarMensagem(from, menuPrincipal());
      sessao.ultimaInteracao = agora;
      return res.sendStatus(200);
    }

    sessao.ultimaInteracao = agora;

    // 📋 ETAPA MENU
    if (sessao.etapa === "menu") {

      if (text === "1") {
        await enviarMensagem(from, "📋 Aqui está nosso cardápio...");
        await enviarMensagem(from, menuPrincipal());
      }

      else if (text === "2") {
        await enviarMensagem(from, "Você escolheu Atendimento 👨‍💼");
        await enviarMensagem(from, "Em breve você será atendido.");
        
        // Aqui poderia redirecionar para humano
        
        sessao.etapa = "aguardando_atendimento";
      }

      else if (text === "3") {
        await enviarMensagem(from, "❓ Como podemos ajudar?");
        await enviarMensagem(from, menuPrincipal());
      }

      else {
        await enviarMensagem(from, menuPrincipal());
      }
    }

    // 👨‍💼 ETAPA ATENDIMENTO
    else if (sessao.etapa === "aguardando_atendimento") {
      await enviarMensagem(from, "Um atendente já foi acionado. Aguarde...");
    }

  }

  res.sendStatus(200);
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

//Menu automático
function menuPrincipal() {
  return `
🍕 *Boas-vindo(a) ao Serginhos Pizza e Bar!*
Que alegria ter você por aqui. Estamos prontos para preparar a melhor pizza para a sua noite!

❔ *Como fazer seu pedido:*
Para facilitar, escolha uma das opções abaixo digitando apenas o número correspondente. Se estiver em dúvida, a opção 3 foi feita para você! 

1️⃣ - Pedir pelo Cardápio Online
2️⃣ - Falar com Atendente
3️⃣ - Primeira vez aqui? Me ajude! 

*Dica do Chef:* Ao escolher a opção, aguarde um segundinho que eu já te direciono!
`;
  
}






