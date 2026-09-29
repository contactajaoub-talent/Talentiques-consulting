export interface AcquisitionMessageAdapter { send(input: { prospectId: string; channel: 'email'|'whatsapp'; body: string; subject?: string }): Promise<{ externalId: string; threadId?: string }> }
export interface AcquisitionEnrichmentAdapter { enrichProspect(prospectId: string): Promise<{ provider: string; fields: Record<string, unknown>; verifiedAt: string }> }
export interface AcquisitionAiAssistant { draftMessage(input: { prospectId: string; context: string }): Promise<{ draft: string }>; summarizeConversation(prospectId: string): Promise<{ summary: string }> }
export interface AcquisitionPaymentEvent { type: 'payment.completed'|'payment.refunded'; externalId: string; amount: number; currency: 'EUR'|'USD'; prospectId?: string; opportunityId?: string }
// Gmail, WhatsApp, Apollo, OpenAI and PayPal implementations intentionally remain unconnected until credentials/webhook contracts are supplied.
