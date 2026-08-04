-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "visitorId" TEXT,
    "path" TEXT,
    "referrer" TEXT,
    "country" TEXT,
    "region" TEXT,
    "city" TEXT,
    "deviceType" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "screenResolution" TEXT,
    "language" TEXT,
    "entity" TEXT,
    "entityId" TEXT,
    "categoryId" TEXT,
    "authorId" TEXT,
    "scrollDepth" INTEGER,
    "meta" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnalyticsEvent_type_timestamp_idx" ON "AnalyticsEvent"("type", "timestamp");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_sessionId_timestamp_idx" ON "AnalyticsEvent"("sessionId", "timestamp");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_entity_entityId_timestamp_idx" ON "AnalyticsEvent"("entity", "entityId", "timestamp");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_country_timestamp_idx" ON "AnalyticsEvent"("country", "timestamp");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_visitorId_timestamp_idx" ON "AnalyticsEvent"("visitorId", "timestamp");
