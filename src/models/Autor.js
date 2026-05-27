const mongoose = require('mongoose');

const autorSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, trim: true },
    nacionalidade: { type: String, trim: true, default: '' },
    anoNascimento: { type: Number, min: 0, max: 9999 },
    biografia: { type: String, default: '' },
  },
  { timestamps: true }
);

autorSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
  },
});

module.exports = mongoose.model('Autor', autorSchema);
