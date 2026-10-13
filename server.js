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

const Consulta = mongoose.model("Consulta", ConsultaSchema);

// Rotas API
// Busca consultas filtrando estritamente pelo userId recebido na query
app.get("/api/consultas", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "userId é obrigatório" });
    }
    const consultas = await Consulta.find({ userId }).sort({ _id: -1 });
    res.json(consultas);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar consultas" });
  }
});

// Cadastra a consulta associando ao userId enviado no corpo da requisição
app.post("/api/consultas", async (req, res) => {
  try {
    const { userId, petNome, raca, tipoConsulta, dataDaVacina } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "userId é obrigatório" });
    }
    const nova = new Consulta({ userId, petNome, raca, tipoConsulta, dataDaVacina });
    await nova.save();
    res.status(201).json(nova);
  } catch (error) {
    res.status(400).json({ error: "Erro ao salvar consulta" });
  }
});

app.patch("/api/consultas/:id", async (req, res) => {
  try {
    const atualizada = await Consulta.findByIdAndUpdate(
      req.params.id,
      { applied: true },
      { new: true },
    );
    res.json(atualizada);
  } catch (error) {
    res.status(400).json({ error: "Erro ao atualizar" });
  }
});

app.delete("/api/consultas/:id", async (req, res) => {
  try {
    await Consulta.findByIdAndDelete(req.params.id);
    res.json({ message: "Removido com sucesso" });
  } catch (error) {
    res.status(400).json({ error: "Erro ao deletar" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));