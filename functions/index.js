const { onRequest } = require("firebase-functions/v2/https");
const cors = require("cors")({ origin: true });
const { MercadoPagoConfig, Preference } = require("mercadopago");
const admin = require("firebase-admin");

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

exports.createMpPreference = onRequest(async (req, res) => {
    cors(req, res, async () => {
      if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
      }

      try {
        const { items, payer, baseUrl } = req.body;

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

        const result = await preference.create({
          body: {
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
            auto_return:          "approved",
            statement_descriptor: "Vixi Maria Kids",
            external_reference:   externalRef,
          },
        });

        // Save order to Firestore (under customer's subcollection if UID provided)
        if (payer.uid) {
          const orderRef = db
            .collection("customers")
            .doc(payer.uid)
            .collection("orders")
            .doc();

          await orderRef.set({
            userId:          payer.uid,
            items:           items.map(i => ({ id: i.id, name: i.name, qty: i.qty, price: i.price })),
            total,
            status:          "pending",
            mpPreferenceId:  result.id,
            externalRef,
            payer: { email: payer.email, nome: payer.nome || "" },
            createdAt:       admin.firestore.FieldValue.serverTimestamp(),
          });
        }

        res.json({
          id:                 result.id,
          init_point:         result.init_point,
          sandbox_init_point: result.sandbox_init_point,
        });
      } catch (err) {
        console.error("MP Error:", err?.message || err);
        res.status(500).json({ error: "Erro ao criar preferência de pagamento" });
      }
    });
  }
);
