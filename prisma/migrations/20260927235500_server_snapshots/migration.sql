CREATE TABLE "ServerSnapshot" (
    "id" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "playerCount" INTEGER NOT NULL,
    "maxPlayers" INTEGER NOT NULL,
    "isOnline" BOOLEAN NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ServerSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ServerSnapshot_serverId_recordedAt_key" ON "ServerSnapshot"("serverId", "recordedAt");
ALTER TABLE "ServerSnapshot" ADD CONSTRAINT "ServerSnapshot_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE CASCADE ON UPDATE CASCADE;
