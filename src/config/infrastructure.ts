/**
 * Taste of Village (TOV) infrastructure constants — single source of truth.
 *
 * NEVER hardcode project IDs, API keys, or endpoints elsewhere in the codebase.
 * All infrastructure config flows from here or from environment variables.
 *
 * CANONICAL Project:
 *   - 'taste-of-village-21052' (Project number: 299893522694, Parent Org: faloodaandco.co.uk)
 *
 * DEPRECATED / BANNED:
 *   - 'hootsnkeks-36451' (legacy monorepo / TekRenewed project)
 *   - 'faloodaandco' (legacy Firebase project)
 */
export const INFRA = {
  /** GCP project under faloodaandco.co.uk org */
  GCP_PROJECT: 'taste-of-village-21052',
  GCP_PROJECT_NUMBER: '299893522694',
  GCP_ORG: 'faloodaandco.co.uk',

  /** Firebase / Firestore region */
  FIREBASE_REGION: 'europe-west2',

  /** Vertex AI region for Gemini */
  VERTEX_AI_REGION: 'us-central1',

  /** Gemini model - Vertex AI production model */
  GEMINI_MODEL: 'gemini-2.5-flash',
} as const;
