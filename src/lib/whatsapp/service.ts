import crypto from "crypto";

export interface MessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
  errorCode?: number;
  isOutsideWindow?: boolean;
  isOptedOut?: boolean;
}

export interface WhatsAppService {
  sendText(to: string, text: string): Promise<MessageResult>;
  sendTemplate(
    to: string,
    templateName: string,
    languageCode?: string,
    variables?: string[],
    mediaUrl?: string,
  ): Promise<MessageResult>;
  sendMedia(
    to: string,
    mediaType: "image" | "video" | "document",
    mediaUrl: string,
    caption?: string,
  ): Promise<MessageResult>;
  validateWebhookSignature(rawBody: string, signature: string): boolean;
  verifyWebhookChallenge(token: string, challenge: string): string | null;
}

/**
 * Format phone number to WhatsApp E.164 without '+', spaces, or dashes.
 * Defaults to country code '91' (India) if a standard 10-digit number is provided.
 */
export function formatToWhatsAppE164(
  phone: string,
  defaultCountryCode = "91",
): string {
  let cleaned = phone.replace(/\D/g, "");
  cleaned = cleaned.replace(/^0+/, "");
  if (cleaned.length === 10) {
    return `${defaultCountryCode}${cleaned}`;
  }
  return cleaned;
}

export class MetaWhatsAppAdapter implements WhatsAppService {
  private accessToken: string;
  private phoneNumberId: string;
  private verifyToken: string;
  private appSecret: string;
  private apiVersion = "v20.0";

  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || "";
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
    this.verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "";
    this.appSecret = process.env.WHATSAPP_APP_SECRET || "";
  }

  private get apiUrl() {
    return `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`;
  }

  private parseMetaError(json: {
    error?: {
      code?: number;
      message?: string;
      error_data?: { details?: string };
    };
  }): {
    error: string;
    errorCode?: number;
    isOutsideWindow?: boolean;
    isOptedOut?: boolean;
  } {
    const errObj = json.error || {};
    const errorCode = errObj.code;
    const message =
      errObj.error_data?.details || errObj.message || "Meta API error";

    return {
      error: errorCode ? `[${errorCode}] ${message}` : message,
      errorCode,
      isOutsideWindow: errorCode === 131047,
      isOptedOut: errorCode === 131056,
    };
  }

  async sendText(to: string, text: string): Promise<MessageResult> {
    const formattedTo = formatToWhatsAppE164(to);

    if (!this.accessToken || !this.phoneNumberId || this.accessToken.startsWith("mock-")) {
      return { success: true, messageId: `mock_msg_${Date.now()}` };
    }

    try {
      const res = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: formattedTo,
          type: "text",
          text: { preview_url: true, body: text },
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        return {
          success: false,
          ...this.parseMetaError(json),
        };
      }

      return { success: true, messageId: json.messages?.[0]?.id };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  }

  async sendTemplate(
    to: string,
    templateName: string,
    languageCode = "en",
    variables: string[] = [],
    mediaUrl?: string,
  ): Promise<MessageResult> {
    const formattedTo = formatToWhatsAppE164(to);

    if (!this.accessToken || !this.phoneNumberId || this.accessToken.startsWith("mock-")) {
      return { success: true, messageId: `mock_tpl_${Date.now()}` };
    }

    try {
      const components: Record<string, unknown>[] = [];

      if (mediaUrl) {
        components.push({
          type: "header",
          parameters: [
            {
              type: "document",
              document: { link: mediaUrl },
            },
          ],
        });
      }

      if (variables.length > 0) {
        components.push({
          type: "body",
          parameters: variables.map((v) => ({ type: "text", text: v })),
        });
      }

      const res = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: formattedTo,
          type: "template",
          template: {
            name: templateName,
            language: { code: languageCode },
            components: components.length > 0 ? components : undefined,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        return {
          success: false,
          ...this.parseMetaError(json),
        };
      }

      return { success: true, messageId: json.messages?.[0]?.id };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  }

  async sendMedia(
    to: string,
    mediaType: "image" | "video" | "document",
    mediaUrl: string,
    caption?: string,
  ): Promise<MessageResult> {
    const formattedTo = formatToWhatsAppE164(to);

    if (!this.accessToken || !this.phoneNumberId || this.accessToken.startsWith("mock-")) {
      return { success: true, messageId: `mock_media_${Date.now()}` };
    }

    try {
      const mediaPayload: Record<string, string> = { link: mediaUrl };
      if (
        caption &&
        (mediaType === "image" ||
          mediaType === "video" ||
          mediaType === "document")
      ) {
        mediaPayload.caption = caption;
      }

      const res = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: formattedTo,
          type: mediaType,
          [mediaType]: mediaPayload,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        return {
          success: false,
          ...this.parseMetaError(json),
        };
      }

      return { success: true, messageId: json.messages?.[0]?.id };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  }

  validateWebhookSignature(rawBody: string, signature: string): boolean {
    if (!this.appSecret) return true; // Bypass in local dev when secret is not configured
    try {
      const hash = crypto
        .createHmac("sha256", this.appSecret)
        .update(rawBody)
        .digest("hex");
      const expected = `sha256=${hash}`;
      const expectedBuf = Buffer.from(expected);
      const sigBuf = Buffer.from(signature);

      if (expectedBuf.length !== sigBuf.length) return false;
      return crypto.timingSafeEqual(expectedBuf, sigBuf);
    } catch {
      return false;
    }
  }

  verifyWebhookChallenge(token: string, challenge: string): string | null {
    if (token === this.verifyToken || !this.verifyToken) {
      return challenge;
    }
    return null;
  }
}

export const whatsAppService = new MetaWhatsAppAdapter();
