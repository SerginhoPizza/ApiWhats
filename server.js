const sessoes = {};
const TEMPO_EXPIRACAO = 15 * 60 * 1000; // 15 minutos

const axios = require("axios");

const TOKEN = "EAAb9fSVsaAYBQ49s5L9kKwx0uKktfHlSn4nHWr3b8HimiZAUxSXFcc92AFZANf7NjQIQsxLKTx4GlMkQRgR45DC8iZAfwM3PBZAWt4nWequPR3ZA5TpPEVwIs1qB5lJUYdIwvJ4IDKH9TXtpCPvuqPeZCa8K4pZBev4578XGF56HW9Gv0ZAge7ZC7idyVPymSwWWWiwZDZD";
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
  const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

  if (!message) return res.sendStatus(200);

  const from = message.from;
  const text = message.text?.body?.trim();
  const agora = Date.now();

  if (!sessoes[from]) {
    sessoes[from] = {
      etapa: "menu_principal",
      ultimaInteracao: agora,
      etapaAnterior: null
    };
    await enviarMensagem(from, menuPrincipal());
    return res.sendStatus(200);
  }

  const sessao = sessoes[from];

  // ⏳ Expiração
  if (agora - sessao.ultimaInteracao > TEMPO_EXPIRACAO) {
    sessao.etapa = "menu_principal";
    await enviarMensagem(from, "⏳ Sessão reiniciada por inatividade.");
    await enviarMensagem(from, menuPrincipal());
    sessao.ultimaInteracao = agora;
    return res.sendStatus(200);
  }

  sessao.ultimaInteracao = agora;

  // 🔹 MENU PRINCIPAL
  if (sessao.etapa === "menu_principal") {
    if (text === "1") {
      sessao.etapa = "submenu_atendimento";
      await enviarMensagem(from, submenuAtendimento());
    } 
    else if (text === "2") {
      sessao.etapa = "submenu_ajuda";
      await enviarMensagem(from, submenuAjuda());
    } 
    else {
      await enviarMensagem(from, menuPrincipal());
    }
  }

  // 🔹 SUBMENU ATENDIMENTO
  else if (sessao.etapa === "submenu_atendimento") {
    if (text === "1") {
      await enviarMensagem(from, "👉 Entre em contato via WhatsApp: https://wa.me/5515991058622");
    }
    else if (text === "2") {
      await enviarMensagem(from, "📞 Clique para ligar -> (15) 3011-1222 | (15) 3326-2222 ");
    }
    else if (text === "0") {
      sessao.etapa = "menu_principal";
      await enviarMensagem(from, menuPrincipal());
    }
    else {
      await enviarMensagem(from, submenuAtendimento());
    }
  }


  // 🔹 SUBMENU AJUDA
  else if (sessao.etapa === "submenu_ajuda") {
    if (text === "9") {
      sessao.etapa = "menu_principal";
      await enviarMensagem(from, menuPrincipal());
    }
    else if (text === "0") {
      sessao.etapa = "menu_principal";
      await enviarMensagem(from, menuPrincipal());
    }
    else {
      await enviarMensagem(from, submenuAjuda());
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

Faça seu pedido pelo nosso cardápio online, basta clicar no link abaixo:
site.anota.ai/Serginhospizzaria

Caso não queira pedir pelo link, basta escolher uma das opções abaixo:

1️⃣ - Falar com Atendente
2️⃣ - Dúvidas! 

*Dica do Chef:* Ao escolher a opção, aguarde um segundinho que eu já te direciono!
`;
  
}

function submenuAtendimento() {
  return `📞 *Escolha a forma de atendimento:*

1️⃣ - WhatsApp (Mensagem de Texto)
2️⃣ - Ligação

Digite o número desejado
0️⃣ - Voltar ao menu principal`;
}

function submenuAjuda() {
  return `🙋 *Dúvidas*

📌 *Por que usamos atendimento automático?*
Devido ao alto volume de pedidos por mensagens, o WhatsApp estava bloqueando nosso atendimento humano.
Pensando em melhorar sua experiência, automatizamos este número via WhatsApp Oficial e disponibilizamos outros canais de atendimento caso prefira.

📌 *Como fazer pedido pelo link?*
• Ao clicar no link da opção 1, você será direcionado ao nosso cardápio online no Anota Aí  
• Escolha a categoria desejada (Pizza, Lanche, Bebida…)  
• Ao escolher Pizza, selecione o tamanho  
• Escolha o sabor, adicionais e borda  
• Pizza grande permite até dois sabores  
• Finalize informando nome, telefone e endereço, caso seja entrega  

🎁 *Programa Fidelidade*
A cada 10 pedidos, no 11º você ganha 50% de desconto em uma pizza de qualquer sabor.
Para resgatar, ao finalizar o 11º pedido aparecerá a opção de resgate.
Para consultar seus pontos, volte ao menu principal e escolha a opção 2 e entre contato conosco.

Digite:
9️⃣ - Voltar ao menu anterior
0️⃣ - Voltar ao menu principal`;
}


















