import axios, { AxiosInstance } from "axios";
import { SlipOkClientOptions, SlipOkVerifyResponse } from "./types";
import { SlipOkError } from "./errors";
import { buildFormFromFile, buildFormFromUrl, sleep } from "./utils";

/**
 * หมายเหตุสำคัญ:
 * - บางโปรไฟล์ของ SlipOK ใช้เส้นทาง (path) แตกต่างกัน เช่น /api/line/apikey/{APIKEY}
 * - ตรงนี้ทำให้ยืดหยุ่นด้วย options.verifyPath (ค่าเริ่มต้นเป็น path สากลตัวอย่าง)
 * - ถ้า Dev ใช้ endpoint เฉพาะ ให้ set verifyPath เองเวลา new Client
 */
const DEFAULT_BASE = "https://api.slipok.com";
const DEFAULT_VERIFY_PATH = "/api/line/apikey"; // => จะประกบเป็น `${verifyPath}/${APIKEY}`

export class SlipOkClient {
  private http: AxiosInstance;
  private apiKey: string;
  private retries: number;
  private fileFieldName: string;
  private urlFieldName: string;
  private verifyPath: string;

  constructor(opts: SlipOkClientOptions) {
    this.apiKey = opts.apiKey;
    this.retries = opts.retries ?? 2;
    this.fileFieldName = opts.fileFieldName ?? "file";
    this.urlFieldName = opts.urlFieldName ?? "url";
    this.verifyPath = opts.verifyPath ?? DEFAULT_VERIFY_PATH;

    this.http = axios.create({
      baseURL: opts.baseURL ?? DEFAULT_BASE,
      timeout: opts.timeoutMs ?? 10000,
      proxy: opts.proxy
        ? {
            host: opts.proxy.host,
            port: opts.proxy.port,
            protocol: opts.proxy.protocol ?? "http",
            auth: opts.proxy.auth
          }
        : false
    });
  }

  private endpointForVerify(): string {
    // ตัวอย่าง: /api/line/apikey/<APIKEY>
    return `${this.verifyPath}/${this.apiKey}`;
  }

  private async _postWithRetry<T>(url: string, data: any, headers: Record<string, string> = {}): Promise<T> {
    let attempt = 0;
    let lastErr: any = null;

    while (attempt <= this.retries) {
      try {
        const res = await this.http.post<T>(url, data, { headers });
        return res.data;
      } catch (err: any) {
        lastErr = err;
        const status = err?.response?.status;
        const retriable = status === 429 || (status >= 500 && status < 600);

        if (!retriable || attempt === this.retries) break;

        // Exponential backoff: 500ms, 1000ms, 2000ms...
        const backoff = 500 * Math.pow(2, attempt);
        await sleep(backoff);
        attempt++;
      }
    }

    const status = lastErr?.response?.status;
    const body = lastErr?.response?.data;
    throw new SlipOkError(
      `SlipOK request failed (${status ?? "no-status"})`,
      {
        status,
        endpoint: url,
        details: body
      }
    );
  }

  /**
   * ตรวจสลิปด้วย "ไฟล์รูป" (path หรือ Buffer)
   * - fieldName ที่ใช้ส่งไปปรับได้จาก options.fileFieldName (default "file")
   */
  async verifyByFile(filePathOrBuffer: string | Buffer): Promise<SlipOkVerifyResponse> {
    const url = this.endpointForVerify();
    const form = buildFormFromFile(this.fileFieldName, filePathOrBuffer);
    const headers = form.getHeaders();

    const data = await this._postWithRetry<SlipOkVerifyResponse>(url, form, headers);
    return data;
  }

  /**
   * ตรวจสลิปด้วย "URL ของรูป"
   * - fieldName ที่ใช้ส่งไปปรับได้จาก options.urlFieldName (default "url")
   */
  async verifyByUrl(imageUrl: string): Promise<SlipOkVerifyResponse> {
    const url = this.endpointForVerify();
    const form = buildFormFromUrl(this.urlFieldName, imageUrl);
    const headers = form.getHeaders();

    const data = await this._postWithRetry<SlipOkVerifyResponse>(url, form, headers);
    return data;
  }
}
