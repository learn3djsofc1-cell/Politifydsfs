import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from './db.js';

import fs from 'fs';
import path from 'path';

function getOrCreateStableSecret(): string {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;

  const secretPath = path.join(process.cwd(), '.jwt_secret');
  try {
    const existing = fs.readFileSync(secretPath, 'utf8').trim();
    if (existing.length >= 32) return existing;
  } catch {}

  const generated = crypto.randomBytes(32).toString('hex');
  try {
    fs.writeFileSync(secretPath, generated, { mode: 0o600 });
  } catch {}
  return generated;
}

export const JWT_SECRET = getOrCreateStableSecret();
const JWT_EXPIRES_IN = '7d';
const SALT_ROUNDS = 12;

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET environment variable is required in production');
}

export function generateZKID(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  const bytes = crypto.randomBytes(8);
  for (let i = 0; i < 8; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

export async function generateUniqueZKID(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const zkid = generateZKID();
    const existing = await pool.query('SELECT 1 FROM users WHERE zkid = $1', [zkid]);
    if (existing.rows.length === 0) {
      return zkid;
    }
  }
  throw new Error('Failed to generate unique ZKID after 10 attempts');
}

export function encryptPrivateKey(privateKey: string, password: string): string {
  const salt = crypto.randomBytes(16);
  const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(privateKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return [salt.toString('hex'), iv.toString('hex'), authTag.toString('hex'), encrypted].join(':');
}

export function decryptPrivateKey(encryptedData: string, password: string): string {
  const [saltHex, ivHex, authTagHex, encrypted] = encryptedData.split(':');
  const salt = Buffer.from(saltHex, 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: { userId: number; zkid: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): { userId: number; zkid: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; zkid: string };
  } catch {
    return null;
  }
}
