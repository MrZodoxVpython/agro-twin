-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PETANI', 'KOPERASI', 'ADMIN');

-- CreateTable
CREATE TABLE "Koperasi" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "negara" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Koperasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "koperasiId" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Komoditas" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,

    CONSTRAINT "Komoditas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Produksi" (
    "id" SERIAL NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jumlahKg" DOUBLE PRECISION NOT NULL,
    "koperasiId" INTEGER NOT NULL,
    "komoditasId" INTEGER NOT NULL,

    CONSTRAINT "Produksi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stok" (
    "id" SERIAL NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jumlahKg" DOUBLE PRECISION NOT NULL,
    "koperasiId" INTEGER NOT NULL,
    "komoditasId" INTEGER NOT NULL,

    CONSTRAINT "Stok_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Harga" (
    "id" SERIAL NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "negara" TEXT NOT NULL,
    "hargaPerKg" DOUBLE PRECISION NOT NULL,
    "permintaanKg" DOUBLE PRECISION NOT NULL,
    "komoditasId" INTEGER NOT NULL,

    CONSTRAINT "Harga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Distribusi" (
    "id" SERIAL NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "koperasiId" INTEGER NOT NULL,
    "tujuan" TEXT NOT NULL,
    "tujuanLat" DOUBLE PRECISION NOT NULL,
    "tujuanLng" DOUBLE PRECISION NOT NULL,
    "jumlahKg" DOUBLE PRECISION NOT NULL,
    "biayaPerKg" DOUBLE PRECISION NOT NULL DEFAULT 3200,
    "keterlambatanHari" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DIKIRIM',

    CONSTRAINT "Distribusi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Simulasi" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nama" TEXT NOT NULL,
    "parameter" JSONB NOT NULL,
    "hasil" JSONB NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Simulasi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Komoditas_nama_key" ON "Komoditas"("nama");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_koperasiId_fkey" FOREIGN KEY ("koperasiId") REFERENCES "Koperasi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Produksi" ADD CONSTRAINT "Produksi_koperasiId_fkey" FOREIGN KEY ("koperasiId") REFERENCES "Koperasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Produksi" ADD CONSTRAINT "Produksi_komoditasId_fkey" FOREIGN KEY ("komoditasId") REFERENCES "Komoditas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stok" ADD CONSTRAINT "Stok_koperasiId_fkey" FOREIGN KEY ("koperasiId") REFERENCES "Koperasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stok" ADD CONSTRAINT "Stok_komoditasId_fkey" FOREIGN KEY ("komoditasId") REFERENCES "Komoditas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Harga" ADD CONSTRAINT "Harga_komoditasId_fkey" FOREIGN KEY ("komoditasId") REFERENCES "Komoditas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Distribusi" ADD CONSTRAINT "Distribusi_koperasiId_fkey" FOREIGN KEY ("koperasiId") REFERENCES "Koperasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Simulasi" ADD CONSTRAINT "Simulasi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;