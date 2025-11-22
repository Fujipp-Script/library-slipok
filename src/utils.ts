import FormData from "form-data";
import fs from "fs";

export function buildFormFromFile(fieldName: string, filePathOrBuffer: string | Buffer) {
  const form = new FormData();
  if (typeof filePathOrBuffer === "string") {
    form.append(fieldName, fs.createReadStream(filePathOrBuffer));
  } else {
    form.append(fieldName, filePathOrBuffer, {
      filename: "slip.jpg",
      contentType: "image/jpeg"
    });
  }
  return form;
}

export function buildFormFromUrl(fieldName: string, url: string) {
  const form = new FormData();
  form.append(fieldName, url);
  return form;
}

export function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
