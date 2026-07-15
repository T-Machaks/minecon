// Canonical mapping from commercial booth tier → feature entitlements.
// Single source of truth — import getTierConfig() wherever gating is needed.

export const BOOTH_TIERS = {
  Diamond: {
    level:                'enhanced',
    adSlot:               true,
    analyticsDepth:       'full',    // full charts + source/type breakdown + guide stats
    leadExport:           true,
    sponsoredPostCredits: 3,
    virtualBooth:         'year-round',
  },
  Gold: {
    level:                'enhanced',
    adSlot:               true,
    analyticsDepth:       'full',
    leadExport:           true,
    sponsoredPostCredits: 1,
    virtualBooth:         '6-months',
  },
  Chrome: {
    level:                'standard',
    adSlot:               false,
    analyticsDepth:       'basic',   // KPIs + trend + activity; no ad performance
    leadExport:           false,
    sponsoredPostCredits: 0,
    virtualBooth:         'event-only',
  },
  Copper: {
    level:                'standard',
    adSlot:               false,
    analyticsDepth:       'view',    // KPI totals only; all charts locked
    leadExport:           false,
    sponsoredPostCredits: 0,
    virtualBooth:         'event-only',
  },
};

export function getTierConfig(tier) {
  return BOOTH_TIERS[tier] ?? BOOTH_TIERS.Copper;
}
