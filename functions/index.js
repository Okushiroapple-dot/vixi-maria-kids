const { onRequest } = require("firebase-functions/v2/https");
const cors = require("cors")({ origin: true });
const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();
const db = admin.firestore();

function buildPayer(payer) {
  if (!payer) return {};
  const obj = { email: String(payer.email || "") };

  if (payer.nome) {
    const parts = String(payer.nome).trim().split(/\s+/);
    obj.first_name = parts[0];
    obj.last_name  = parts.slice(1).join(" ") || parts[0];
  }

  const cpf = String(payer.cpf || "").replace(/\D/g, "");
  if (cpf.length === 11) {
    obj.identification = { type: "CPF", number: cpf };
  }

  const phone = String(payer.telefone || "").replace(/\D/g, "");
  if (phone.length >= 10) {
    obj.phone = { area_code: phone.slice(0, 2), number: phone.slice(2) };
  }

  if (payer.endereco) {
    const e = payer.endereco;
    const cep = String(e.cep || "").replace(/\D/g, "");
    if (cep) {
      obj.address = {
        zip_code:      cep,
        street_name:   String(e.rua    || ""),
        street_number: String(e.numero || ""),
      };
    }
  }

  return obj;
}

// ── WhatsApp notification for Débora ──────────
async function notifyDeboraPedido(orderData, status) {
  const apikey = process.env.CALLMEBOT_APIKEY;
  if (!apikey) return;

  const total = `R$ ${Number(orderData.total || 0).toFixed(2).replace('.', ',')}`;
  const nome  = orderData.payer?.nome || orderData.payer?.email || 'Cliente';
  const itens = (orderData.items || []).map(i => `${i.name} (${i.qty}x)`).join(', ');
  const cidade = orderData.endereco?.cidade || '';

  const emoji = status === 'pago' ? '✅' : status === 'recusado' ? '❌' : '⏳';
  const lines = [
    `${emoji} *Pedido ${status.toUpperCase()}*`,
    `👤 ${nome}${cidade ? ` — ${cidade}` : ''}`,
    `📦 ${itens || '—'}`,
    `💰 Total: ${total}`,
  ];
  const msg = encodeURIComponent(lines.join('\n'));

  try {
    await fetch(
      `https://api.callmebot.com/whatsapp.php?phone=5516991781559&text=${msg}&apikey=${apikey}`
    );
  } catch(e) {
    console.error('WhatsApp notify error:', e?.message);
  }
}

// ── Email de notificação para a admin (Débora) ───
async function notifyAdminByEmail(orderData, status) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const adminEmail = process.env.ADMIN_EMAIL || 'viximariakids@viximariakids.com';
  if (!smtpUser || !smtpPass) return;

  const nome   = orderData.payer?.nome  || orderData.payer?.email || 'Cliente';
  const tel    = orderData.payer?.telefone || '';
  const total  = `R$ ${Number(orderData.total || 0).toFixed(2).replace('.', ',')}`;
  const pix    = `R$ ${(Number(orderData.total || 0) * 0.9).toFixed(2).replace('.', ',')}`;
  const ref    = orderData.externalRef || orderData.id || '';
  const e      = orderData.endereco || {};
  const addr   = [e.rua, e.numero, e.compl, e.bairro, e.cidade, e.estado].filter(Boolean).join(', ');
  const cep    = e.cep ? `CEP ${e.cep}` : '';

  const statusEmoji = { pago:'✅', pendente:'🕐', recusado:'❌', cancelado:'🚫' };
  const emoji  = statusEmoji[status] || '📦';

  const itemRows = (orderData.items || []).map(i => {
    const sub = `R$ ${(Number(i.price) * (Number(i.qty) || 1)).toFixed(2).replace('.', ',')}`;
    return `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f0e6f6;">${i.name}${i.size ? ` <span style="background:#fce4ec;color:#e75480;padding:1px 6px;border-radius:4px;font-size:11px">${i.size}</span>` : ''}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0e6f6;text-align:center">${i.qty}x</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0e6f6;text-align:right">${sub}</td>
    </tr>`;
  }).join('');

  const waBtn = tel
    ? `<a href="https://wa.me/55${tel.replace(/\D/g,'')}" style="display:inline-block;background:#25d366;color:#fff;padding:10px 20px;border-radius:20px;text-decoration:none;font-weight:700;font-size:14px;margin-top:12px">💬 Chamar no WhatsApp</a>`
    : '';

  const html = `
<!DOCTYPE html><html lang="pt-BR">
<body style="margin:0;padding:0;background:#f5f0ff;font-family:'Nunito',Arial,sans-serif;">
  <div style="max-width:540px;margin:30px auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(100,0,200,.12)">
    <div style="background:linear-gradient(135deg,#1e001a,#4a0040);padding:28px 24px;text-align:center">
      <div style="font-size:36px">${emoji}</div>
      <h1 style="color:#fff;margin:8px 0 4px;font-size:22px">Novo Pedido — ${status.toUpperCase()}</h1>
      <p style="color:rgba(255,255,255,.7);margin:0;font-size:13px">Ref: ${ref}</p>
    </div>
    <div style="padding:24px">
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
        <tr style="background:#f5f0ff">
          <th style="padding:10px 12px;text-align:left;color:#4a0040;font-size:13px">Produto</th>
          <th style="padding:10px 12px;text-align:center;color:#4a0040;font-size:13px">Qtd</th>
          <th style="padding:10px 12px;text-align:right;color:#4a0040;font-size:13px">Subtotal</th>
        </tr>
        ${itemRows}
      </table>
      <p style="text-align:right;font-weight:700;font-size:18px;color:#1e001a;margin:0 0 4px">Total: ${total}</p>
      <p style="text-align:right;font-size:13px;color:#888;margin:0 0 20px">PIX: ${pix} (−10%)</p>

      <div style="background:#f5f0ff;border-radius:12px;padding:16px;font-size:14px;color:#333">
        <div style="margin-bottom:6px"><strong>👤 Cliente:</strong> ${nome}</div>
        ${tel ? `<div style="margin-bottom:6px"><strong>📱 Telefone:</strong> ${tel}</div>` : ''}
        ${addr ? `<div style="margin-bottom:6px"><strong>📍 Endereço:</strong> ${addr}${cep ? ', '+cep : ''}</div>` : ''}
        <div>${waBtn}</div>
      </div>

      <div style="text-align:center;margin-top:20px">
        <a href="https://vixi-maria-kids-8c494.web.app/admin.html?sec=orders" style="display:inline-block;background:#1e001a;color:#fff;padding:12px 28px;border-radius:20px;text-decoration:none;font-weight:700;font-size:14px">Ver pedido no painel →</a>
      </div>
    </div>
    <div style="background:#f5f0ff;padding:14px 24px;text-align:center">
      <p style="margin:0;color:#888;font-size:12px">🌸 Vixi Maria Kids — Painel Admin</p>
    </div>
  </div>
</body></html>`;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: smtpUser, pass: smtpPass },
  });

  const subjects = {
    pago:     `✅ Pedido PAGO — ${nome} — ${total}`,
    pendente: `🕐 Novo pedido pendente — ${nome} — ${total}`,
    recusado: `❌ Pagamento recusado — ${nome}`,
  };

  try {
    await transporter.sendMail({
      from:    `"Vixi Maria Kids 🌸" <${smtpUser}>`,
      to:      adminEmail,
      subject: subjects[status] || `📦 Pedido ${status} — ${nome}`,
      html,
    });
    console.log(`Admin notified by email: ${status} — ${ref}`);
  } catch(e) {
    console.error('Admin email error:', e?.message);
  }
}

// ── Email de rastreamento para o cliente ─────────
async function sendTrackingEmail(orderData, trackingCode) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (!smtpUser || !smtpPass) return;

  const customerEmail = orderData.payer?.email;
  if (!customerEmail) return;

  const nome        = orderData.payer?.nome || 'Cliente';
  const trackingUrl = `https://rastreamento.correios.com.br/app/resultado.app?objetos=${trackingCode}`;

  const html = `
<!DOCTYPE html><html lang="pt-BR">
<body style="margin:0;padding:0;background:#fff0f5;font-family:'Nunito',Arial,sans-serif;">
  <div style="max-width:520px;margin:30px auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(231,84,128,.15)">
    <div style="background:linear-gradient(135deg,#e75480,#ff8fab);padding:32px 24px;text-align:center">
      <div style="font-size:48px">🚚</div>
      <h1 style="color:#fff;margin:8px 0 4px;font-size:24px">Seu pedido está a caminho!</h1>
      <p style="color:rgba(255,255,255,.9);margin:0;font-size:14px">Boa notícia, ${nome}! ✨</p>
    </div>
    <div style="padding:28px 24px">
      <p style="color:#444;margin:0 0 20px;font-size:15px">Seu pedido foi despachado e já está nas mãos dos Correios. Você pode acompanhar em tempo real pelo código abaixo:</p>

      <div style="background:#fce4ec;border-radius:14px;padding:20px;text-align:center;margin-bottom:24px">
        <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#e75480;text-transform:uppercase;letter-spacing:1px">Código de rastreamento</p>
        <p style="margin:0;font-size:26px;font-weight:900;color:#1e001a;letter-spacing:4px;font-family:monospace">${trackingCode}</p>
      </div>

      <div style="text-align:center;margin-bottom:24px">
        <a href="${trackingUrl}" target="_blank"
           style="display:inline-block;background:#e75480;color:#fff;padding:14px 32px;border-radius:20px;text-decoration:none;font-weight:700;font-size:15px">
          📍 Rastrear meu pedido
        </a>
      </div>

      <p style="color:#888;font-size:13px;margin:0 0 8px">Você também pode rastrear diretamente no site dos Correios:</p>
      <a href="https://www.correios.com.br/rastreamento/" style="color:#e75480;font-size:13px;word-break:break-all">www.correios.com.br/rastreamento</a>

      <div style="background:#fce4ec;border-radius:12px;padding:16px;margin-top:24px;text-align:center">
        <p style="margin:0;color:#e75480;font-size:14px">Dúvidas? Fale com a gente! 💬</p>
        <a href="https://wa.me/5516991781559"
           style="display:inline-block;margin-top:10px;background:#25d366;color:#fff;padding:10px 24px;border-radius:20px;text-decoration:none;font-weight:700;font-size:14px">
          💬 Falar no WhatsApp
        </a>
      </div>
    </div>
    <div style="background:#fce4ec;padding:16px 24px;text-align:center">
      <p style="margin:0;color:#e75480;font-size:13px">🌸 Vixi Maria Kids — Ribeirão Preto/SP</p>
    </div>
  </div>
</body></html>`;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: smtpUser, pass: smtpPass },
  });

  try {
    await transporter.sendMail({
      from:    `"Vixi Maria Kids 🌸" <${smtpUser}>`,
      to:      customerEmail,
      subject: `🚚 Seu pedido está a caminho! Rastreie aqui — Vixi Maria Kids`,
      html,
    });
    console.log(`Tracking email sent to ${customerEmail}: ${trackingCode}`);
  } catch(e) {
    console.error('Tracking email error:', e?.message);
  }
}

// ── Email de confirmação para o cliente ──────────
async function sendConfirmationEmail(orderData) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (!smtpUser || !smtpPass) return;

  const customerEmail = orderData.payer?.email;
  if (!customerEmail) return;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: smtpUser, pass: smtpPass },
  });

  const nome   = orderData.payer?.nome || "Cliente";
  const total  = `R$ ${Number(orderData.total || 0).toFixed(2).replace('.', ',')}`;
  const cidade = orderData.endereco?.cidade || '';
  const ref    = orderData.externalRef || '';

  const itemRows = (orderData.items || [])
    .map(i => {
      const subtotal = `R$ ${(Number(i.price) * (Number(i.qty) || 1)).toFixed(2).replace('.', ',')}`;
      return `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #fce4ec;">${i.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #fce4ec;text-align:center;">${i.qty}x</td>
        <td style="padding:8px 12px;border-bottom:1px solid #fce4ec;text-align:right;">${subtotal}</td>
      </tr>`;
    })
    .join('');

  const enderecoHtml = cidade
    ? `<p style="margin:4px 0;color:#666;">📍 ${[
        orderData.endereco?.rua,
        orderData.endereco?.numero,
        orderData.endereco?.compl,
        orderData.endereco?.bairro,
        cidade,
        orderData.endereco?.estado,
      ].filter(Boolean).join(', ')}</p>`
    : '';

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<body style="margin:0;padding:0;background:#fff0f5;font-family:'Nunito',Arial,sans-serif;">
  <div style="max-width:520px;margin:30px auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(231,84,128,.15);">
    <div style="background:linear-gradient(135deg,#e75480,#ff8fab);padding:32px 24px;text-align:center;">
      <div style="font-size:40px;">🌸</div>
      <h1 style="color:#fff;margin:8px 0 4px;font-size:24px;">Pedido Confirmado!</h1>
      <p style="color:rgba(255,255,255,.9);margin:0;font-size:14px;">Obrigada pela compra, ${nome}! ✨</p>
    </div>
    <div style="padding:28px 24px;">
      <p style="color:#444;margin:0 0 16px;">Seu pagamento foi <strong style="color:#e75480;">aprovado</strong> e seu pedido já está sendo preparado com carinho. 💝</p>
      ${ref ? `<p style="color:#999;font-size:13px;margin:0 0 20px;">Pedido: <code style="background:#fce4ec;padding:2px 6px;border-radius:4px;">${ref}</code></p>` : ''}

      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <thead>
          <tr style="background:#fce4ec;">
            <th style="padding:10px 12px;text-align:left;color:#e75480;font-size:13px;">Produto</th>
            <th style="padding:10px 12px;text-align:center;color:#e75480;font-size:13px;">Qtd</th>
            <th style="padding:10px 12px;text-align:right;color:#e75480;font-size:13px;">Subtotal</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:12px;text-align:right;font-weight:700;color:#444;">Total:</td>
            <td style="padding:12px;text-align:right;font-weight:700;color:#e75480;font-size:18px;">${total}</td>
          </tr>
        </tfoot>
      </table>

      ${enderecoHtml}

      <div style="background:#fce4ec;border-radius:12px;padding:16px;margin-top:20px;text-align:center;">
        <p style="margin:0;color:#e75480;font-size:14px;">Dúvidas? Fale com a gente pelo WhatsApp! 💬</p>
        <a href="https://wa.me/5516991781559" style="display:inline-block;margin-top:10px;background:#e75480;color:#fff;padding:10px 24px;border-radius:20px;text-decoration:none;font-weight:700;font-size:14px;">💬 Falar no WhatsApp</a>
      </div>
    </div>
    <div style="background:#fce4ec;padding:16px 24px;text-align:center;">
      <p style="margin:0;color:#e75480;font-size:13px;">🌸 Vixi Maria Kids — Ribeirão Preto/SP</p>
    </div>
  </div>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"Vixi Maria Kids 🌸" <${smtpUser}>`,
      to:   customerEmail,
      subject: "✅ Pedido confirmado — Vixi Maria Kids!",
      html,
    });
    console.log(`Confirmation email sent to ${customerEmail}`);
  } catch (e) {
    console.error('Email send error:', e?.message);
  }
}

const MP_STATUS_MAP = {
  approved:   "pago",
  rejected:   "recusado",
  pending:    "pendente",
  in_process: "processando",
  cancelled:  "cancelado",
  refunded:   "estornado",
  charged_back: "estornado",
};

exports.refundMpPayment = onRequest(async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }
    try {
      const { orderId } = req.body;
      if (!orderId) {
        res.status(400).json({ error: "orderId obrigatório" });
        return;
      }

      const orderRef  = db.collection("orders").doc(orderId);
      const orderSnap = await orderRef.get();

      if (!orderSnap.exists) {
        res.status(404).json({ error: "Pedido não encontrado" });
        return;
      }

      const order     = orderSnap.data();
      const paymentId = order.mpPaymentId;

      if (!paymentId) {
        res.status(400).json({ error: "Pedido sem ID de pagamento — reembolso manual necessário" });
        return;
      }
      if (order.status === "estornado") {
        res.status(400).json({ error: "Pedido já estornado" });
        return;
      }

      // Call MP Refunds REST API (full refund)
      const mpRes = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}/refunds`,
        {
          method:  "POST",
          headers: {
            Authorization:  `Bearer ${process.env.MP_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      const mpData = await mpRes.json();

      if (!mpRes.ok) {
        console.error("MP Refund error:", mpData);
        res.status(mpRes.status).json({ error: mpData.message || "Erro no reembolso" });
        return;
      }

      const updateData = {
        status:    "estornado",
        refundId:  String(mpData.id),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await orderRef.update(updateData);

      if (order.userId) {
        const custRef  = db.collection("customers").doc(order.userId).collection("orders").doc(orderId);
        const custSnap = await custRef.get();
        if (custSnap.exists) await custRef.update(updateData);
      }

      notifyDeboraPedido({ ...order, ...updateData }, "estornado").catch(() => {});

      res.json({ ok: true, refundId: mpData.id });
    } catch (err) {
      console.error("Refund error:", err?.message || err);
      res.status(500).json({ error: "Erro ao realizar reembolso" });
    }
  });
});

exports.sendTrackingNotification = onRequest(async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }
    try {
      const { orderId, trackingCode } = req.body;
      if (!orderId || !trackingCode) {
        res.status(400).json({ error: "orderId e trackingCode obrigatórios" });
        return;
      }

      const orderRef  = db.collection("orders").doc(orderId);
      const orderSnap = await orderRef.get();
      if (!orderSnap.exists) { res.status(404).json({ error: "Pedido não encontrado" }); return; }

      const order = orderSnap.data();

      // Save tracking code and update status
      const updateData = {
        status:       "em_entrega",
        trackingCode: trackingCode.trim().toUpperCase(),
        updatedAt:    admin.firestore.FieldValue.serverTimestamp(),
      };
      await orderRef.update(updateData);

      // Mirror to customer subcollection
      if (order.userId) {
        const custRef  = db.collection("customers").doc(order.userId).collection("orders").doc(orderId);
        const custSnap = await custRef.get();
        if (custSnap.exists) await custRef.update(updateData);
      }

      // Send tracking email to customer
      await sendTrackingEmail({ ...order, ...updateData }, updateData.trackingCode);

      // Notify admin via WhatsApp
      notifyDeboraPedido({ ...order, ...updateData }, "em_entrega").catch(() => {});

      res.json({ ok: true });
    } catch (err) {
      console.error("sendTrackingNotification error:", err?.message || err);
      res.status(500).json({ error: "Erro ao enviar rastreamento" });
    }
  });
});

exports.createMpPreference = onRequest(async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      const { items, payer, baseUrl } = req.body;
      const isSandbox = process.env.MP_SANDBOX === 'true';

      if (!items || !items.length || !payer || !payer.email) {
        res.status(400).json({ error: "Dados incompletos" });
        return;
      }

      const client = new MercadoPagoConfig({
        accessToken: process.env.MP_ACCESS_TOKEN,
      });

      const preference = new Preference(client);

      const total = items.reduce((s, i) => s + Number(i.price) * (Number(i.qty) || 1), 0);
      const externalRef = `vixi_${Date.now()}`;

      const preferenceBody = {
        items: items.map((i) => ({
          id:          String(i.id),
          title:       String(i.name).slice(0, 256),
          quantity:    Number(i.qty) || 1,
          unit_price:  Number(i.price),
          currency_id: "BRL",
        })),
        payer: buildPayer(payer),
        back_urls: {
          success: `${baseUrl}/checkout-sucesso.html`,
          failure: `${baseUrl}/checkout-falha.html`,
          pending: `${baseUrl}/checkout-pendente.html`,
        },
        statement_descriptor: "Vixi Maria Kids",
        external_reference:   externalRef,
        notification_url:     "https://us-central1-vixi-maria-kids-8c494.cloudfunctions.net/mpWebhook",
        payment_methods: {
          excluded_payment_types: [
            { id: "ticket" },   // remove boleto
          ],
          installments:         3,
          default_installments: 1,
        },
      };

      // auto_return causes redirect issues in sandbox — only use in production
      if (!isSandbox) {
        preferenceBody.auto_return = "approved";
      }

      const result = await preference.create({ body: preferenceBody });

      const orderData = {
        items:          items.map(i => ({ id: i.id, name: i.name, qty: i.qty, price: i.price })),
        total,
        status:         "pendente",
        mpPreferenceId: result.id,
        externalRef,
        payer:          { email: payer.email, nome: payer.nome || "", telefone: payer.telefone || "" },
        endereco:       payer.endereco || {},
        createdAt:      admin.firestore.FieldValue.serverTimestamp(),
        updatedAt:      admin.firestore.FieldValue.serverTimestamp(),
      };

      if (payer.uid) {
        orderData.userId = payer.uid;
      }

      // Top-level orders collection — used by webhook and admin panel
      await db.collection("orders").doc(externalRef).set(orderData);

      // Notify admin by email when new order is created
      notifyAdminByEmail({ ...orderData, externalRef }, 'pendente').catch(() => {});

      // Customer subcollection — used by the customer's account page
      if (payer.uid) {
        await db
          .collection("customers")
          .doc(payer.uid)
          .collection("orders")
          .doc(externalRef)
          .set(orderData);
      }

      const checkoutUrl = isSandbox
        ? (result.sandbox_init_point || result.init_point)
        : result.init_point;

      res.json({
        id:                 result.id,
        init_point:         checkoutUrl,
        sandbox_init_point: result.sandbox_init_point,
      });
    } catch (err) {
      console.error("MP Error:", err?.message || err);
      res.status(500).json({ error: "Erro ao criar preferência de pagamento" });
    }
  });
});

// Webhook called by MercadoPago when payment status changes
exports.mpWebhook = onRequest(async (req, res) => {
  // MercadoPago may send GET to validate the endpoint
  if (req.method === "GET") {
    res.status(200).send("OK");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  try {
    const { type, data } = req.body;

    // Only handle payment notifications
    if (type !== "payment") {
      res.status(200).send("OK");
      return;
    }

    const paymentId = data?.id;
    if (!paymentId) {
      res.status(400).send("Missing payment ID");
      return;
    }

    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN,
    });

    const paymentClient = new Payment(client);
    const payment = await paymentClient.get({ id: String(paymentId) });

    const externalRef = payment.external_reference;
    const mpStatus    = payment.status;

    if (!externalRef) {
      res.status(200).send("OK");
      return;
    }

    const newStatus = MP_STATUS_MAP[mpStatus] || mpStatus;
    const updateData = {
      status:      newStatus,
      mpPaymentId: String(paymentId),
      updatedAt:   admin.firestore.FieldValue.serverTimestamp(),
    };

    // Update top-level order document
    const orderRef  = db.collection("orders").doc(externalRef);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      console.warn(`Order not found for externalRef: ${externalRef}`);
      res.status(200).send("OK");
      return;
    }

    await orderRef.update(updateData);

    // Notify Débora via WhatsApp on paid or rejected orders
    if (newStatus === 'pago' || newStatus === 'recusado') {
      notifyDeboraPedido(orderSnap.data(), newStatus).catch(() => {});
    }

    // Notify admin by email on paid or rejected
    if (newStatus === 'pago' || newStatus === 'recusado') {
      notifyAdminByEmail({ ...orderSnap.data(), externalRef }, newStatus).catch(() => {});
    }

    // Send confirmation email to customer on paid orders
    if (newStatus === 'pago') {
      sendConfirmationEmail(orderSnap.data()).catch(() => {});
    }

    // Mirror update to customer subcollection if userId exists
    const { userId } = orderSnap.data();
    if (userId) {
      const custOrderRef = db
        .collection("customers")
        .doc(userId)
        .collection("orders")
        .doc(externalRef);

      const custOrderSnap = await custOrderRef.get();
      if (custOrderSnap.exists) {
        await custOrderRef.update(updateData);
      }
    }

    console.log(`Order ${externalRef} updated to status: ${newStatus}`);
    res.status(200).send("OK");
  } catch (err) {
    console.error("Webhook error:", err?.message || err);
    res.status(500).send("Internal Error");
  }
});
