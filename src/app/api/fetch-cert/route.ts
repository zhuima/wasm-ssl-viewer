import { NextResponse } from 'next/server';
import * as https from 'https';
import * as tls from 'tls';
import { TLSSocket } from 'tls';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');

  if (!domain) {
    return NextResponse.json({ error: 'Domain parameter is required' }, { status: 400 });
  }

  try {
    const certificate = await fetchSSLCertificate(domain);
    return NextResponse.json(certificate);
  } catch (error) {
    console.error('Error fetching SSL certificate:', error);
    return NextResponse.json(
      { error: `Error fetching SSL certificate: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

async function fetchSSLCertificate(domain: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const options = {
      host: domain,
      port: 443,
      method: 'GET',
      path: '/',
      rejectUnauthorized: false, // 允许自签名证书
      timeout: 10000, // 10秒超时
    };

    const req = https.request(options, (res) => {
      // 获取证书信息
      const tlsSocket = res.socket as TLSSocket;
      const cert = tlsSocket.getPeerCertificate(true);
      
      if (!cert || Object.keys(cert).length === 0) {
        reject(new Error('No certificate found'));
        return;
      }

      // 提取关键证书信息
      const certInfo = {
        subject: cert.subject,
        issuer: cert.issuer,
        validFrom: cert.valid_from,
        validTo: cert.valid_to,
        fingerprint: cert.fingerprint,
        serialNumber: cert.serialNumber,
        pemCertificate: '',
      };

      // 将证书转换为PEM格式并添加到返回数据中
      if (cert.raw) {
        const certBuffer = Buffer.from(cert.raw);
        const pemCert = '-----BEGIN CERTIFICATE-----\n' +
          (certBuffer.toString('base64').match(/.{1,64}/g)?.join('\n') || '') +
          '\n-----END CERTIFICATE-----';
        certInfo.pemCertificate = pemCert;
      }

      resolve(certInfo);
      
      // 终止请求
      req.abort();
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });

    req.end();
  });
} 