-- CreateTable
CREATE TABLE "Store" (
    "id" SERIAL NOT NULL,
    "topbarText" TEXT,
    "instagram" TEXT,
    "facebook" TEXT,
    "email" TEXT,
    "whatsapp" TEXT,
    "copyright" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreBenefit" (
    "id" SERIAL NOT NULL,
    "storeId" INTEGER NOT NULL,
    "iconName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoreBenefit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StoreBenefit" ADD CONSTRAINT "StoreBenefit_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
