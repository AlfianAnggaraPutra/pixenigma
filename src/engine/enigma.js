// Domain: Z 256 (bilangan bulat 0–255, sesuai nilai RGB piksel)
// E = E⁻¹ (enkripsi dan dekripsi menggunakan prosedur identik)
// Contoh : jika E(p) = c, maka E(c) = p
 
// 5 Rotor tersedia
// Setiap rotor mengimplementasikan Affine Cipher: F(x) = A*x + B (mod 256)
// Syarat: gcd(A, 256) = 1 -> A harus bilangan ganjil mod 256
// Koefisien A dan B setiap rotor berbeda agar setiap rotor menghasilkan substitusi yang unik dan variatif
export const ROTORS = [
  { id: 1, label: 'Rotor I',   A: 129, B: 5   },
  { id: 2, label: 'Rotor II',  A: 37,  B: 28  },
  { id: 3, label: 'Rotor III', A: 213, B: 134 },
  { id: 4, label: 'Rotor IV',  A: 91,  B: 152 },
  { id: 5, label: 'Rotor V',   A: 9,   B: 213 },
]

// Fungsi Modulo mod256(x)
// Mengembalikan x mod 256, selalu positif meski x negatif.
// Contoh: mod256(-3) = 253, mod256(260) = 4
// Digunakan di semua operasi agar nilai selalu dalam rentang [0, 255].
function mod256(x) {
  return ((x % 256) + 256) % 256
}

// Fungsi Invers Modulo
// Mencari invers perkalian dari a di Z_256, yaitu nilai a⁻¹ sedemikian sehingga (a * a⁻¹) mod 256 = 1.
// Hanya ada jika gcd(a, 256) = 1 (a harus ganjil).
// Digunakan untuk membalik affine cipher saat rotor mundur.
// Contoh: modInverse(129) = 129 karena 129*129 mod 256 = 1
function modInverse(a, m = 256) {
  a = mod256(a)
  for (let x = 1; x < m; x++) {
    if ((a * x) % m === 1) return x
  }
  throw new Error(`No inverse for A=${a} mod ${m}`)
}

// Fungsi Enkripsi Affine Cipher
// affineEncrypt(x, A, B)
// Fungsi enkripsi affine cipher: E(x) = A*x + B (mod 256)
// Mengubah nilai piksel menjadi nilai terenkripsi.
// Digunakan saat nilai piksel melewati rotor dari depan (maju).
function affineEncrypt(x, A, B) {
  return mod256(A * x + B)
}

// Fungsi Dekripsi Affine Cipher
// affineDecrypt(y, A, B)
// Fungsi dekripsi affine cipher: D(y) = A⁻¹ * (y - B) (mod 256)
// Membalik enkripsi menghasilkan nilai asli piksel dari nilai terenkripsi.
// Digunakan saat nilai piksel melewati rotor dari belakang (mundur).
function affineDecrypt(y, A, B) {
  const Ainv = modInverse(A)
  return mod256(Ainv * (y - B))
}

// Fungsi Shift Operator
// Operator shift maju: ρⁿ(x) = (x + n) mod 256 
// Mensimulasikan efek rotasi rotor geser nilai input sebesar posisi rotor. Digunakan sebelum masuk ke affine cipher rotor.
// Operator shift mundur: ρ⁻ⁿ(x) = (x - n) mod 256
// Mengembalikan shift yang diterapkan oleh shift maju. Digunakan sesudah keluar dari affine cipher rotor.
function rho(x, n = 1)    { return mod256(x + n) }
function rhoInv(x, n = 1) { return mod256(x - n) }

// FUNGSI KEMANISME ROTOR

// Lintasan rotor arah maju: ρ⁻ᵖᵒˢ ∘ F ∘ ρᵖᵒˢ (x)
// Langkah:
//   1. Geser input +pos (mensimulasikan posisi rotor saat ini)
//   2. Terapkan affine cipher F(x) = A*x + B
//   3. Geser balik hasil -pos
function rotorForward(x, rotor, pos) {
  const shifted    = rho(x, pos)
  const encrypted  = affineEncrypt(shifted, rotor.A, rotor.B)
  return rhoInv(encrypted, pos)
}

// Lintasan rotor arah mundur: ρᵖᵒˢ ∘ F⁻¹ ∘ ρ⁻ᵖᵒˢ (x)
// Langkah:
//   1. Geser input +pos
//   2. Terapkan invers affine cipher F⁻¹(y) = A⁻¹*(y-B)
//    3. Geser balik hasil -pos
// Digunakan setelah melalui reflector
function rotorBackward(x, rotor, pos) {
  const shifted    = rho(x, pos)
  const decrypted  = affineDecrypt(shifted, rotor.A, rotor.B)
  return rhoInv(decrypted, pos)
}

// FUNGSI REFLEKTOR (U(U(x)) = x untuk semua x → U = U⁻¹)
// Untuk x dalam [0–9], [20–29], ..., [220–229]: U(x) = x + 10
// Untuk x dalam [10–19], [30–39], ..., [230–239]: U(x) = x - 10
// Untuk x dalam [240–248]: U(x) = x + 8
// Untuk x dalam [249–255]: U(x) = x - 8
// Reflektor membuat nilai yang masuk akan dipantulkan ke nilai berbeda sesuai pasangannya
export function reflector(x) {
  if (x >= 240 && x <= 248) return x + 8
  if (x >= 249 && x <= 255) return x - 8
  const rem = x % 20
  if (rem < 10) return x + 10
  return x - 10
}

// Fungsi Plugboard
// Setiap pasangan [a, b] berarti:
//   - P(a) = b dan P(b) = a  (saling menukar)
//   - Nilai yang tidak berpasangan dipetakan ke dirinya sendiri: P(x) = x
export function buildPlugboard(pairs) {
  const map = {}
  for (let v = 0; v < 256; v++) map[v] = v  // identity by default
  for (const [a, b] of pairs) {
    map[a] = b
    map[b] = a
  }
  return (x) => map[x]
}

// Fungsi Mekanisme Perputaran Rotor
// Pergerakan Rotor di jalankan Sekali per piksel (bukan per komponen warna R/G/B)
// Artinya: R, G, B dari satu piksel yang sama menggunakan i,j,k yang sama (Posisi rotor yang sama)
// - Setiap piksel: i bertambah 1 (mod 256)
// - Jika i mencapai 0 kembali maka j bertambah 1
// - Jika j mencapai 0 kembali maka k bertambah 1
// Setiap piksel di konfigurasi dengan kunci yang berbeda 
export function advanceRotors(i, j, k) {
  let ni = mod256(i + 1)
  let nj = j
  let nk = k
  if (ni === 0) {
    nj = mod256(j + 1)
    if (nj === 0) {
      nk = mod256(k + 1)
    }
  }
  return [ni, nj, nk]
}

// Proses Komponen Warna
// Memproses satu nilai komponen warna (R, G, atau B) melalui seluruh rangkaian mesin Enigma.
// Alur nilai:
//   Input
//     → P (Plugboard)
//     → R maju  (Rotor Kanan, posisi i)
//     → M maju  (Rotor Tengah, posisi j)
//     → L maju  (Rotor Kiri, posisi k)
//     → U       (Reflektor)
//     → L mundur (Rotor Kiri terbalik, posisi k)
//     → M mundur (Rotor Tengah terbalik, posisi j)
//     → R mundur (Rotor Kanan terbalik, posisi i)
//     → P (Plugboard, P = P⁻¹)
//   Output
export function enigmaProcessComponent(value, R, M, L, P, i, j, k) {
  let x = value

  x = P(x) // Plugboard Maju

  x = rotorForward(x, R, i) // Rotor Kanan Maju
  x = rotorForward(x, M, j) // Rotor Tengah Maju
  x = rotorForward(x, L, k) // Rotor Kiri Maju

  x = reflector(x) // Reflektor

  x = rotorBackward(x, L, k) // Rotor Kiri Mundur
  x = rotorBackward(x, M, j) // Rotor Tengah Mundur
  x = rotorBackward(x, R, i) // Rotor Kanan Mundur

  x = P(x) // Plugboard Mundur

  return x
}

// Fungsi Proses Gambar Keseluruhan
// Memproses seluruh piksel gambar menggunakan mekanisme enigma
// Fungsi ini sama untuk enkripsi maupun dekripsi (karena E = E⁻¹)
// Urutan pemrosesan:
//   Untuk setiap piksel:
//     1. Gerakkan rotor dulu (advanceRotors) lalu rotor bergerak sebelum proses
//     2. Proses R dengan (i, j, k) baru
//     3. Proses G dengan (i, j, k) yang sama
//     4. Proses B dengan (i, j, k) yang sama
//     5. Alpha (transparansi) TIDAK disentuh
export function enigmaProcessImage(imageData, settings) {
  const { rotors, positions, plugboardPairs } = settings
  const [R, M, L] = rotors
  const P = buildPlugboard(plugboardPairs)

  let [i, j, k] = positions
  const data = new Uint8ClampedArray(imageData.data)

  for (let px = 0; px < data.length; px += 4) {
    // Rotor bergerak sebelum memproses piksel
    ;[i, j, k] = advanceRotors(i, j, k)

    // R, G, B pada piksel yang sama diproses dengan posisi rotor yang sama
    data[px]     = enigmaProcessComponent(data[px],     R, M, L, P, i, j, k) // Red
    data[px + 1] = enigmaProcessComponent(data[px + 1], R, M, L, P, i, j, k) // Green
    data[px + 2] = enigmaProcessComponent(data[px + 2], R, M, L, P, i, j, k) // Blue
    // Alpha tidak diubah
  }

  return new ImageData(data, imageData.width, imageData.height)
}