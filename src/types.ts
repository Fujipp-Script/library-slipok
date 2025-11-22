export type SlipOkClientOptions = {
  /** Base URL ของ SlipOK เช่น "https://api.slipok.com" */
  baseURL?: string;
  /** API Key ของ Dev (เก็บจาก .env) */
  apiKey: string;
  /** ms เช่น 10000 = 10s */
  timeoutMs?: number;
  /** จำนวนรอบรีไทรเมื่อเจอ 5xx/429 */
  retries?: number;
  /** ช่องทาง Proxy (ไม่บังคับ) */
  proxy?: {
    host: string;
    port: number;
    auth?: { username: string; password: string };
    protocol?: "http" | "https";
  };
  /** ตั้งชื่อฟิลด์ file ตอนอัปโหลด (ค่าเริ่มต้น "file") */
  fileFieldName?: string;
  /** ตั้งชื่อฟิลด์ url ตอนส่งลิงก์ (ค่าเริ่มต้น "url") */
  urlFieldName?: string;
  /** path สำหรับ verify slip (ค่า default ดูใน client.ts) */
  verifyPath?: string;
};

export type SlipOkVerifyResponse = {
  /** ข้างล่างเป็นตัวอย่างฟิลด์ทั่วไป—ปรับตามรีสปอนส์จริงของ SlipOK ที่ Dev ใช้อยู่ */
  success: boolean;
  code?: string;
  message?: string;
  data?: any; // โครงสร้างผล OCR/ตรวจสอบสลิป
  /** debug/metadata */
  requestId?: string;
};

export type SlipOkErrorMeta = {
  status?: number;
  requestId?: string;
  endpoint?: string;
  details?: any;
};
