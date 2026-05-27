const mongoose = require('mongoose');

const livroSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, trim: true },
    isbn: { type: String, trim: true, unique: true, sparse: true },
    anoPublicacao: { type: Number, min: 0, max: 9999 },
    genero: { type: String, trim: true, default: '' },
    sinopse: { type: String, default: '' },
    disponivel: { type: Boolean, default: true },
    autor: { type: mongoose.Schema.Types.ObjectId, ref: 'Autor', required: true },
  },
  { timestamps: true }
);

livroSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
  },
});

module.exports = mongoose.model('Livro', livroSchema);
