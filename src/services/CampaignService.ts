import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface CampaignLead {
  id?: string;
  name: string;
  email?: string;
  phone: string;
  campaign: string;
  location: string;
  tenantId?: string;
  voucherCode?: string;
  branch?: string;
  source?: string;
  createdAt: string;
  isUsed?: boolean;
}

/**
 * CampaignService
 * 
 * Manages marketing campaigns, voucher leads, and customer capture forms
 * via Google Cloud Firestore.
 */
export class CampaignService {
  private static readonly COLLECTION_NAME = 'leads';

  /**
   * Adds a new lead directly to Firestore (pure serverless) and returns generated voucher.
   */
  static async submitVoucherLead(lead: Omit<CampaignLead, 'id' | 'createdAt'>): Promise<{ voucherCode: string }> {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const voucherCode = lead.voucherCode || `TOV50-${randomSuffix}`;

    try {
      await addDoc(collection(db, this.COLLECTION_NAME), {
        name: lead.name.trim(),
        email: (lead.email || '').trim().toLowerCase(),
        phone: lead.phone.trim(),
        campaign: lead.campaign || 'launch_50_off',
        tenantId: lead.tenantId || lead.location,
        branch: lead.branch || 'hayes',
        source: lead.source || 'web_check_in',
        voucherCode: voucherCode,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.warn('Firestore lead logging fallback:', error);
    }

    return { voucherCode };
  }

  /**
   * Fetches leads from Firestore.
   */
  static async getLeads(): Promise<CampaignLead[]> {
    const q = query(collection(db, this.COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        campaign: data.campaign,
        location: data.location || data.tenantId,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString()),
        isUsed: !!data.isUsed
      };
    });
  }
}
