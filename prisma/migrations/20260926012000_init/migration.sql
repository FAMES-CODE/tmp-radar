-- CreateTable
CREATE TABLE "Server" (
    "id" TEXT NOT NULL,
    "externalId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "ipAddress" TEXT,
    "port" INTEGER,
    "game" TEXT,
    "playerCount" INTEGER NOT NULL DEFAULT 0,
    "maxPlayers" INTEGER NOT NULL DEFAULT 0,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "information" TEXT,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Server_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Server_externalId_key" ON "Server"("externalId");
CREATE INDEX "Server_isOnline_playerCount_idx" ON "Server"("isOnline", "playerCount");
CREATE INDEX "Server_game_idx" ON "Server"("game");
