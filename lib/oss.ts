import "server-only";
import OSS from "ali-oss";

type OssConfig = {
  region: string;
  accessKeyId: string;
  accessKeySecret: string;
  bucket: string;
};

export const MAX_UPLOAD_FILE_SIZE = 1024 * 1024;

export function getOssConfig(): OssConfig | null {
  const region = process.env.ALI_OSS_REGION;
  const accessKeyId = process.env.ALI_OSS_ACCESS_KEY_ID;
  const accessKeySecret = process.env.ALI_OSS_ACCESS_KEY_SECRET;
  const bucket = process.env.ALI_OSS_BUCKET;

  if (!region || !accessKeyId || !accessKeySecret || !bucket) {
    return null;
  }

  return {
    region,
    accessKeyId,
    accessKeySecret,
    bucket,
  };
}

export function getOssClient(config?: OssConfig) {
  const ossConfig = config ?? getOssConfig();

  if (!ossConfig) {
    return null;
  }

  return new OSS({
    region: ossConfig.region,
    accessKeyId: ossConfig.accessKeyId,
    accessKeySecret: ossConfig.accessKeySecret,
    bucket: ossConfig.bucket,
  });
}

export function replaceOssUrlWithCdn(url: string) {
  const cdnHostname = process.env.ALI_OSS_CDN_DOMAIN?.trim();

  if (!cdnHostname) {
    return url;
  }

  try {
    const urlObj = new URL(url);
    urlObj.protocol = "https:";
    urlObj.hostname = cdnHostname;
    return urlObj.href;
  } catch (_error) {
    return url;
  }
}
