export const runtime = 'edge';
import { adminDb } from '@/lib/firebaseAdmin';
export function GET() { return Response.json({ok: true}); }
