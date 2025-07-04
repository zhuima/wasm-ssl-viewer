import { NextResponse } from 'next/server';
import * as https from 'https';
import * as tls from 'tls';

interface CertificateInfo {
  subject: tls.PeerCertificate['subject'];
  issuer: tls.PeerCertificate['issuer'];
  subjectaltname?: string;
  validFrom: string;
  validTo: string;
  fingerprint: string;
  serialNumber: string;
  pemCertificate: string;
  daysRemaining: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');

  if (!domain) {
    return NextResponse.json({ error: 'Domain parameter is required' }, { status: 400 });
  }

  try {
    // 添加重试逻辑
    let attempts = 0;
    const maxAttempts = 3;
    let lastError: Error | null = null;
    
    while (attempts < maxAttempts) {
      try {
        const certificate = await getCertificateInfoWithHttpRequest(domain);
        return NextResponse.json(certificate);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`[SSL Fetch Error] Attempt ${attempts + 1}/${maxAttempts} for domain ${domain}:`, error);
        attempts++;
        
        // 如果不是证书缺失错误，直接抛出
        if (!(error instanceof Error) || !error.message.includes('did not provide a certificate')) {
          throw error;
        }
        
        // 在重试之前稍微等待一下
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    // 如果所有尝试都失败了
    throw lastError;
  } catch (error) {
    console.error(`[SSL Fetch Error] for domain ${domain}:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Failed to fetch SSL certificate for ${domain}. Reason: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * 通过发起一个真实的HTTPS请求来获取SSL证书信息。
 * 这种方法可以绕过将简单TLS连接视为威胁的安全系统。
 * 它通过监听底层socket的 'secureConnect' 事件来可靠地获取证书，避免了竞态条件。
 * @param domain 要查询的域名
 * @returns Promise<CertificateInfo>
 */
function getCertificateInfoWithHttpRequest(domain: string): Promise<CertificateInfo> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: domain,
      port: 443,
      method: 'GET',
      path: '/',
      // 伪装成一个常见的浏览器User-Agent，进一步降低被WAF拦截的概率
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
      },
      rejectUnauthorized: false, // 允许自签名等证书
      // 如果服务器使用SNI，这个设置是隐式包含在hostname里的
    };

    const req = https.request(options);
    
    // 添加请求超时
    let isResolved = false;

    // 关键！在请求的底层socket上监听 'secureConnect' 事件
    // 'socket' 事件在socket被分配给请求时触发
    req.on('socket', (socket: tls.TLSSocket) => {
      // 监听 'secureConnect'，这是TLS握手完成的确切时机
      socket.on('secureConnect', () => {
        try {
          const cert = socket.getPeerCertificate(true);

          // 更严格地检查证书是否有效
          if (!cert || Object.keys(cert).length === 0 || !cert.valid_from || !cert.valid_to) {
            req.destroy(); // 清理请求
            return reject(new Error('Server did not provide a certificate after successful TLS handshake.'));
          }

          // 尝试获取原始证书数据，如果失败则使用备用方法
          let pemCertificate;
          try {
            pemCertificate = `-----BEGIN CERTIFICATE-----\n${socket.getPeerCertificate().raw.toString('base64').match(/.{1,64}/g)?.join('\n') || ''}\n-----END CERTIFICATE-----`;
          } catch (e) {
            // 如果无法获取raw证书数据，使用备用格式
            pemCertificate = `[Certificate data unavailable in raw format]`;
            console.warn(`Could not get raw certificate for ${domain}:`, e);
          }

          const validToDate = new Date(cert.valid_to);
          const now = new Date();
          const daysRemaining = Math.ceil((validToDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          const certInfo: CertificateInfo = {
            subject: cert.subject,
            issuer: cert.issuer,
            subjectaltname: cert.subjectaltname,
            validFrom: cert.valid_from,
            validTo: cert.valid_to,
            fingerprint: cert.fingerprint256 || cert.fingerprint,
            serialNumber: cert.serialNumber,
            pemCertificate: pemCertificate,
            daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
          };
          
          // 我们已经拿到了需要的一切，可以安全地中止请求，不再需要等待HTTP响应体
          isResolved = true;
          req.abort();
          resolve(certInfo);
        } catch (error) {
          req.destroy();
          reject(error);
        }
      });
    });

    // 标准的错误和超时处理
    req.on('error', (err) => {
      if (!isResolved) {
        reject(err);
      }
    });

    req.on('timeout', () => {
      req.destroy();
      if (!isResolved) {
        reject(new Error(`Request to ${domain} timed out after 10 seconds.`));
      }
    });

    // 设置超时
    req.setTimeout(10000);

    // 发起请求
    req.end();
  });
}