
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();

app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Conectado!"))
  .catch((err) => console.error("Erro de conexão:", err));

const ConsultaSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    petNome: { type: String, required: true },
    raca: { type: String, required: true },
    tipoConsulta: { type: String, required: true },
    dataDaVacina: { type: String, required: true },
    applied: { type: Boolean, default: false },
    clientMutationId: { type: String },
  },
  { timestamps: true }
);

ConsultaSchema.index(
  { userId: 1, clientMutationId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      clientMutationId: { $type: "string" },
    },
  }
);

const Consulta = mongoose.model("Consulta", ConsultaSchema);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY,
  { auth: { persistSession: false } }
);

async function auth(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Token ausente" });
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    console.log("auth error:", error?.message);

    return res.status(401).json({
      error: "Token inválido",
      detalhe: error?.message,
    });
  }

  req.userId = data.user.id;
  next();
}

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

app.get("/api/consultas", auth, async (req, res) => {
  try {
    const consultas = await Consulta.find({
      userId: req.userId,
    }).sort({
      _id: -1,
    });

    return res.json(consultas);
  } catch (err) {
    console.error("GET /api/consultas:", err);

    return res.status(500).json({
      error: "Erro ao buscar consultas",
    });
  }
});

app.post("/api/consultas", auth, async (req, res) => {
  try {
    const {
      petNome,
      raca,
      tipoConsulta,
      dataDaVacina,
      clientMutationId,
      applied,
    } = req.body;

    if (
      !petNome?.trim() ||
      !raca?.trim() ||
      !tipoConsulta?.trim() ||
      !dataDaVacina?.trim()
    ) {
      return res.status(400).json({
        error: "Preencha todos os campos obrigatórios.",
      });
    }

    if (
      clientMutationId !== undefined &&
      (typeof clientMutationId !== "string" || !clientMutationId.trim())
    ) {
      return res.status(400).json({
        error: "Identificador de operação inválido.",
      });
    }

    if (clientMutationId) {
      const existente = await Consulta.findOne({
        userId: req.userId,
        clientMutationId,
      });

      if (existente) {
        return res.status(200).json(existente);
      }
    }

    const nova = new Consulta({
      userId: req.userId,
      petNome: petNome.trim(),
      raca: raca.trim(),
      tipoConsulta: tipoConsulta.trim(),
      dataDaVacina: dataDaVacina.trim(),
      applied: applied === true,
      ...(clientMutationId ? { clientMutationId } : {}),
    });

    await nova.save();

    return res.status(201).json(nova);
  } catch (err) {
    if (err.code === 11000 && req.body.clientMutationId) {
      const existente = await Consulta.findOne({
        userId: req.userId,
        clientMutationId: req.body.clientMutationId,
      });

      if (existente) {
        return res.status(200).json(existente);
      }
    }

    console.error("POST /api/consultas:", err);

    return res.status(400).json({
      error: "Erro ao salvar consulta",
    });
  }
});

app.patch("/api/consultas/:id", auth, async (req, res) => {
  try {
    const item = await Consulta.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!item) {
      return res.status(404).json({
        error: "Não encontrada",
      });
    }

    const {
      baseUpdatedAt,
      petNome,
      raca,
      tipoConsulta,
      dataDaVacina,
      applied,
    } = req.body || {};

    if (baseUpdatedAt !== undefined && baseUpdatedAt !== null) {
      const dataBase = new Date(baseUpdatedAt);

      if (Number.isNaN(dataBase.getTime())) {
        return res.status(400).json({
          error: "Data de versão inválida",
        });
      }

      if (
        !item.updatedAt ||
        item.updatedAt.getTime() !== dataBase.getTime()
      ) {
        return res.status(409).json({
          error: "A consulta foi modificada no servidor.",
          current: item,
        });
      }
    }

    const camposTexto = {
      petNome,
      raca,
      tipoConsulta,
      dataDaVacina,
    };

    for (const [campo, valor] of Object.entries(camposTexto)) {
      if (valor !== undefined) {
        if (typeof valor !== "string" || !valor.trim()) {
          return res.status(400).json({
            error: `Campo inválido: ${campo}`,
          });
        }

        item[campo] = valor.trim();
      }
    }

    if (typeof applied === "boolean") {
      item.applied = applied;
    }

    await item.save();

    return res.json(item);
  } catch (err) {
    console.error("PATCH /api/consultas:", err);

    return res.status(400).json({
      error: "Erro ao atualizar",
    });
  }
});

app.delete("/api/consultas/:id", auth, async (req, res) => {
  try {
    const item = await Consulta.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!item) {
      return res.status(404).json({
        error: "Não encontrada",
      });
    }

    return res.json({
      message: "Removido com sucesso",
    });
  } catch (err) {
    console.error("DELETE /api/consultas:", err);

    return res.status(400).json({
      error: "Erro ao deletar",
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
