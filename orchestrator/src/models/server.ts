import * as mongoose from 'mongoose';

export interface IServer extends mongoose.Document {
  _id: string;
  url: string;
  port: number;
  clients: number;
}

const serverSchema = new mongoose.Schema({
  _id: String,
  url: String,
  port: Number,
  clients: Number,
});

export const Server = mongoose.model<IServer>('server', serverSchema);
