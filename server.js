require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Conexão MongoDB Atlas
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Conectado!"))
  .catch((err) => console.error("Erro de conexão:", err));

// Schema e Model atualizados com userId
const ConsultaSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Identificador do usuário do Supabase
  petNome: { type: String, required: true },
  raca: { type: String, required: true },
  tipoConsulta: { type: String, required: true },
  dataDaVacina: { type: String, required: true },
  applied: { type: Boolean, default: false },
});

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY,
  { auth: { persistSession: false } }
);

async function auth(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Token ausente" });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return res.status(401).json({ error: "Token inválido" });
  req.userId = data.user.id;
  next();
}

app.get("/health", (_, res) => res.json({ status: "ok" }));

app.get("/api/consultas", auth, async (req, res) => {
  try {
    res.json(await Consulta.find({ userId: req.userId }).sort({ _id: -1 }));
  } catch {
    res.status(500).json({ error: "Erro ao buscar consultas" });
  }
});

app.post("/api/consultas", auth, async (req, res) => {
  try {
    const { petNome, raca, tipoConsulta, dataDaVacina } = req.body;
    const nova = new Consulta({ userId: req.userId, petNome, raca, tipoConsulta, dataDaVacina });
    await nova.save();
    res.status(201).json(nova);
  } catch {
    res.status(400).json({ error: "Erro ao salvar consulta" });
  }
});

app.patch("/api/consultas/:id", auth, async (req, res) => {
  try {
    const item = await Consulta.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { applied: true },
      { new: true }
    );
    if (!item) return res.status(404).json({ error: "Não encontrada" });
    res.json(item);
  } catch {
    res.status(400).json({ error: "Erro ao atualizar" });
  }
});

app.delete("/api/consultas/:id", auth, async (req, res) => {
  try {
    const item = await Consulta.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!item) return res.status(404).json({ error: "Não encontrada" });
    res.json({ message: "Removido com sucesso" });
  } catch {
    res.status(400).json({ error: "Erro ao deletar" });
  }
  const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
});