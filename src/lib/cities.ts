/**
 * Shared city/airport list for route datalists (InquiryPage, QuotePage).
 * Static data, not database-backed — there is no cities/destinations table
 * in Supabase (only customers/booking_requests/agents/bookings). Focused on
 * Africa and the Middle East (Dalmar's actual corridors), with extra depth
 * for Somalia and the larger/better-known countries in each region.
 * IATA codes cross-checked against current busiest-airport data — see
 * Memory.md for sources.
 */
export const CITIES = [
  // Somalia — core market, deepest coverage
  'Mogadishu (MGQ)', 'Hargeisa (HGA)', 'Bosaso (BSA)', 'Kismayo (KMU)',

  // East Africa
  'Nairobi (NBO)', 'Mombasa (MBA)', 'Addis Ababa (ADD)', 'Djibouti (JIB)',
  'Dar es Salaam (DAR)', 'Zanzibar (ZNZ)', 'Kampala (EBB)', 'Kigali (KGL)',

  // Southern Africa
  'Johannesburg (JNB)', 'Cape Town (CPT)', 'Durban (DUR)', 'Harare (HRE)', 'Lusaka (LUN)',

  // West Africa
  'Lagos (LOS)', 'Abuja (ABV)', 'Accra (ACC)', 'Dakar (DSS)',

  // North Africa
  'Cairo (CAI)', 'Hurghada (HRG)', 'Sharm El Sheikh (SSH)', 'Casablanca (CMN)',
  'Marrakesh (RAK)', 'Algiers (ALG)', 'Tunis (TUN)', 'Khartoum (KRT)',

  // Gulf / Middle East
  'Dubai (DXB)', 'Abu Dhabi (AUH)', 'Sharjah (SHJ)', 'Jeddah (JED)', 'Riyadh (RUH)',
  'Dammam (DMM)', 'Medina (MED)', 'Doha (DOH)', 'Kuwait City (KWI)', 'Muscat (MCT)',
  'Bahrain (BAH)', 'Amman (AMM)', 'Beirut (BEY)', 'Baghdad (BGW)', 'Sanaa (SAH)',

  // Other established diaspora hubs (pre-existing)
  'London (LHR)', 'Istanbul (IST)',
]
