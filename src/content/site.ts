/**
 * All marketing copy lives here so the landing page components stay purely
 * structural. Swap this file to re-skin the site for another market.
 */

export const site = {
  name: "PharmaSource Cameroun",
  tagline: "Rare medicines, sourced and cleared.",
  city: "Douala",
  phone: "+237 6 77 00 00 00",
  whatsapp: "237677000000",
  email: "sourcing@pharmasource.cm",
} as const;

export const sourcingSteps = [
  {
    step: 1,
    title: "Prescription and product verification",
    body: "Your specialist sends the prescription and the exact presentation. We confirm the INN, strength and manufacturer against the originator's catalogue before quoting.",
    duration: "24\u201348 h",
  },
  {
    step: 2,
    title: "MINSANTE import authorisation",
    body: "We file the import dossier with the Ministry of Public Health. Nothing is ordered abroad until the authorisation reference is issued.",
    duration: "5\u201310 days",
  },
  {
    step: 3,
    title: "Purchase from the licensed source",
    body: "The order is placed with a licensed wholesaler in France, Germany, Belgium or the United States. Batch and expiry are recorded at purchase.",
    duration: "2\u20134 days",
  },
  {
    step: 4,
    title: "Validated cold-chain transit",
    body: "Temperature-sensitive lines travel in qualified shippers with continuous data loggers. The log is read on arrival, not assumed.",
    duration: "3\u20135 days",
  },
  {
    step: 5,
    title: "Douala customs clearance",
    body: "We clear at Douala under the declared HS code with LANACOME quality documentation attached. Duties and handling appear on your quote up front.",
    duration: "2\u20134 days",
  },
  {
    step: 6,
    title: "Delivery to your facility",
    body: "Final-leg delivery in a cold box where required, handed over against signature with the full provenance dossier.",
    duration: "24 h",
  },
] as const;

export const compliance = [
  {
    authority: "MINSANTE",
    fullName: "Ministry of Public Health, Cameroon",
    credential: "Pharmaceutical import authorisation",
    reference: "AI/2024/DPML/0418",
  },
  {
    authority: "DPML",
    fullName: "Directorate of Pharmacy, Medicine and Laboratories",
    credential: "Wholesale distribution licence",
    reference: "LIC/DPML/2023/117",
  },
  {
    authority: "LANACOME",
    fullName: "National Laboratory for Quality Control of Medicines",
    credential: "Batch quality control on every import",
    reference: "QC protocol 2024-B",
  },
  {
    authority: "EU GDP",
    fullName: "EU Good Distribution Practice",
    credential: "Cold-chain handling certification",
    reference: "GDP/EU/2024/2291",
  },
] as const;

export const impactMetrics = [
  { value: "1,240+", label: "prescriptions fulfilled", note: "since 2021" },
  { value: "86", label: "partner clinics and hospitals", note: "across 6 regions" },
  { value: "18 days", label: "median time to delivery", note: "order to facility" },
  { value: "99.2%", label: "cold-chain integrity", note: "verified on arrival" },
] as const;

export const testimonials = [
  {
    quote:
      "We had a paediatric patient who needed an enzyme replacement that no distributor in the country stocked. PharmaSource had the import authorisation filed within a week and the vials arrived intact.",
    name: "Dr. Ang\u00E8le Mbarga",
    role: "Paediatric consultant",
    facility: "H\u00F4pital G\u00E9n\u00E9ral de Douala",
  },
  {
    quote:
      "Our laboratory runs on reagents that expire fast. What changed for us was the lead-time predictability \u2014 we plan our assay schedule around their dates and they hold.",
    name: "Pascal Njoya",
    role: "Laboratory director",
    facility: "Centre de Diagnostic Bastos, Yaound\u00E9",
  },
  {
    quote:
      "The provenance dossier matters. When an inspector asks where a vial came from, I open the folder and everything is there \u2014 batch, invoice, customs declaration, temperature log.",
    name: "Dr. Fritz Ekane",
    role: "Chief pharmacist",
    facility: "Clinique de l'Espoir, Bafoussam",
  },
] as const;
