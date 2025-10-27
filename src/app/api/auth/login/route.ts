
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

// Fungsi untuk mendapatkan kunci privat.
// Ini menangani pengembangan lokal (membaca file) dan produksi (membaca env var).
function getPrivateKey(): string {
  // Di Vercel/Produksi, kunci akan ada di variabel lingkungan.
  if (process.env.PRIVATE_KEY_BASE64) {
    // Bersihkan variabel lingkungan dari spasi putih (termasuk baris baru)
    // yang mungkin telah ditambahkan selama penyalinan-penempelan.
    const cleanedBase64 = process.env.PRIVATE_KEY_BASE64.replace(/\s/g, '');
    
    // Dekode string Base64 yang telah dibersihkan kembali ke format PEM
    return Buffer.from(cleanedBase64, 'base64').toString('utf-8');
  }

  // Untuk pengembangan lokal, baca file secara langsung.
  try {
    const privateKeyPath = path.resolve('./private.key');
    return fs.readFileSync(privateKeyPath, 'utf8');
  } catch (error) {
    console.error("Gagal membaca file private.key secara lokal.", error);
    throw new Error("Kunci privat tidak ditemukan. Pastikan private.key ada atau variabel lingkungan PRIVATE_KEY_BASE64 diatur.");
  }
}

export async function POST() {
  try {
    // Dapatkan kunci privat menggunakan logika baru kita
    const privateKey = getPrivateKey();

    // Kredensial Anda
    const partnerId = '569abbb4-3682-46cf-90b0-f9b9746ef150';
    const keyId = '45f8f4c0a1a4592a'; // DIPERBARUI

    if (!partnerId || !keyId) {
      throw new Error('Konfigurasi JWT tidak lengkap. partnerId atau keyId hilang.');
    }

    // Payload untuk JWT
    const payload = {
      partnerId: partnerId,
      exp: Math.floor(Date.now() / 1000) + (5 * 60), // Kedaluwarsa 5 menit
    };

    // Opsi untuk menandatangani JWT
    const signOptions: jwt.SignOptions = {
      algorithm: 'RS256',
      header: {
        alg: 'RS256',
        kid: keyId
      }
    };

    // Tandatangani JWT
    const token = jwt.sign(payload, privateKey, signOptions);

    // Kembalikan token
    return NextResponse.json({ token });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Gagal membuat token';
    console.error('Kesalahan Pembuatan JWT:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
