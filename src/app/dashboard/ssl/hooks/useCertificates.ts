'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { differenceInDays } from 'date-fns';
import { SSLCertificate } from '../types';

// 示例证书数据
const sampleCertificate: SSLCertificate = {
  id: '1',
  domain: 'chuhai.tools',
  issuer: "Let's Encrypt",
  validFrom: new Date('2024-05-11T13:54:26'),
  validTo: new Date('2025-08-09T13:54:25'),
  daysRemaining: 37,
  fingerprint: 'FA:39:2F:DF:2D:D8:FF:CC:99:5F:DE:33:11:0F:CE:B8:97:C0:B7:FE:DB:D5:1B:FF:3A:AC:B0:61:5F:F1:D6:AA',
  serialNumber: '05E3651CCD65FBA63F4F24FDF4DD4DFB8602',
};

// 批处理数据转换，避免一次性处理大量数据
function batchProcessCertificates(rawCertificates: any[], batchSize = 50): SSLCertificate[] {
  const result: SSLCertificate[] = [];
  const totalBatches = Math.ceil(rawCertificates.length / batchSize);
  
  for (let i = 0; i < totalBatches; i++) {
    const startIdx = i * batchSize;
    const endIdx = Math.min(startIdx + batchSize, rawCertificates.length);
    const batch = rawCertificates.slice(startIdx, endIdx);
    
    // 处理当前批次
    const processedBatch = batch.map(cert => ({
      ...cert,
      validFrom: new Date(cert.validFrom),
      validTo: new Date(cert.validTo),
      // 确保daysRemaining是正确计算的
      daysRemaining: differenceInDays(new Date(cert.validTo), new Date())
    }));
    
    result.push(...processedBatch);
  }
  
  return result;
}

export function useCertificates() {
  const [certificates, setCertificates] = useState<SSLCertificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // 初始化时只加载最基本的数据，延迟处理完整数据
  useEffect(() => {
    // 立即显示UI，避免阻塞渲染
    const quickInitialize = () => {
      setCertificates([sampleCertificate]);
      setIsLoading(false);
    };

    // 异步加载完整数据
    const loadFullData = async () => {
      try {
        const storedCertificates = localStorage.getItem('sslCertificates');
        if (storedCertificates) {
          try {
            // 解析JSON
            const parsedData = JSON.parse(storedCertificates);
            
            // 使用setTimeout将处理过程移到下一个事件循环
            setTimeout(() => {
              try {
                // 批处理数据转换
                const processedCertificates = batchProcessCertificates(parsedData);
                setCertificates(processedCertificates);
              } catch (error) {
                console.error('Error processing certificates:', error);
                setCertificates([sampleCertificate]);
                localStorage.setItem('sslCertificates', JSON.stringify([sampleCertificate]));
              } finally {
                setIsInitialized(true);
              }
            }, 100);
          } catch (error) {
            console.error('Error parsing certificates:', error);
            setCertificates([sampleCertificate]);
            localStorage.setItem('sslCertificates', JSON.stringify([sampleCertificate]));
            setIsInitialized(true);
          }
        } else {
          // 没有存储的数据，使用示例数据
          setCertificates([sampleCertificate]);
          localStorage.setItem('sslCertificates', JSON.stringify([sampleCertificate]));
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Error in loadFullData:', error);
        setIsInitialized(true);
      }
    };

    // 快速初始化UI
    quickInitialize();
    
    // 然后异步加载完整数据
    loadFullData();
    
    // 清理函数
    return () => {
      // 如果需要，可以在这里添加清理代码
    };
  }, []);

  // 添加证书
  const addCertificate = useCallback(async (domainInput: string) => {
    if (!domainInput) return;
    
    setIsLoading(true);
    
    try {
      // 使用requestAnimationFrame确保UI更新后再执行耗时操作
      return new Promise<boolean>(resolve => {
        requestAnimationFrame(async () => {
          try {
            // 模拟异步操作
            await new Promise(r => setTimeout(r, 100));
            
            const now = new Date();
            const validFrom = new Date();
            validFrom.setDate(now.getDate() - Math.floor(Math.random() * 30));
            
            const validTo = new Date(validFrom);
            validTo.setDate(validFrom.getDate() + 90 + Math.floor(Math.random() * 275));
            
            const daysRemaining = differenceInDays(validTo, now);
            
            // 生成指纹和序列号的函数
            const generateFingerprint = () => {
              const segments = [];
              for (let i = 0; i < 20; i++) {
                segments.push(Math.random().toString(16).slice(2, 4).toUpperCase());
              }
              return segments.join(':');
            };
            
            const generateSerialNumber = () => {
              const segments = [];
              for (let i = 0; i < 5; i++) {
                segments.push(Math.random().toString(16).slice(2, 10).toUpperCase());
              }
              return segments.join('');
            };
            
            const issuers = [
              "Let's Encrypt",
              "DigiCert Inc",
              "GlobalSign",
              "Comodo CA",
              "GeoTrust",
              "Sectigo Limited",
              "Amazon",
              "Google Trust Services"
            ];
            
            const newCertificate: SSLCertificate = {
              id: Date.now().toString(),
              domain: domainInput,
              issuer: issuers[Math.floor(Math.random() * issuers.length)],
              validFrom: validFrom,
              validTo: validTo,
              daysRemaining: daysRemaining,
              fingerprint: generateFingerprint(),
              serialNumber: generateSerialNumber(),
            };
            
            setCertificates(prevCerts => {
              const updatedCertificates = [...prevCerts, newCertificate];
              
              // 使用setTimeout将存储操作移到下一个事件循环
              setTimeout(() => {
                try {
                  localStorage.setItem('sslCertificates', JSON.stringify(updatedCertificates));
                } catch (error) {
                  console.error('Error saving to localStorage:', error);
                }
              }, 0);
              
              return updatedCertificates;
            });
            
            resolve(true);
          } catch (error) {
            console.error('Error adding certificate:', error);
            resolve(false);
          } finally {
            setIsLoading(false);
          }
        });
      });
    } catch (error) {
      setIsLoading(false);
      console.error('Error in addCertificate:', error);
      return false;
    }
  }, []);

  // 删除证书 - 优化为使用requestAnimationFrame
  const deleteCertificate = useCallback((id: string) => {
    requestAnimationFrame(() => {
      setCertificates(prevCerts => {
        const updatedCertificates = prevCerts.filter(cert => cert.id !== id);
        
        // 使用setTimeout将存储操作移到下一个事件循环
        setTimeout(() => {
          try {
            localStorage.setItem('sslCertificates', JSON.stringify(updatedCertificates));
          } catch (error) {
            console.error('Error saving to localStorage:', error);
          }
        }, 0);
        
        return updatedCertificates;
      });
    });
  }, []);

  // 导入证书 - 优化批处理
  const importCertificates = useCallback(async (jsonData: string) => {
    setIsLoading(true);
    
    try {
      const importedData = JSON.parse(jsonData);
      
      if (!Array.isArray(importedData)) {
        throw new Error('导入的文件格式不正确。请提供包含证书数组的JSON文件。');
      }
      
      // 使用requestAnimationFrame确保UI更新
      return new Promise<number>(resolve => {
        requestAnimationFrame(async () => {
          try {
            // 使用批处理处理导入的数据
            const processedCertificates = batchProcessCertificates(importedData);
            
            setCertificates(prevCerts => {
              const updatedCertificates = [...prevCerts, ...processedCertificates];
              
              // 使用setTimeout将存储操作移到下一个事件循环
              setTimeout(() => {
                try {
                  localStorage.setItem('sslCertificates', JSON.stringify(updatedCertificates));
                } catch (error) {
                  console.error('Error saving to localStorage:', error);
                }
              }, 0);
              
              return updatedCertificates;
            });
            
            resolve(processedCertificates.length);
          } catch (error) {
            console.error('Error processing imported certificates:', error);
            throw error;
          } finally {
            setIsLoading(false);
          }
        });
      });
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  }, []);

  // 计算证书统计信息 - 使用useMemo优化性能
  const certificateStats = useMemo(() => {
    // 如果证书数量过多，考虑使用批处理计算
    if (certificates.length > 1000) {
      // 简单实现，实际项目中可以更复杂
      let expired = 0;
      let expiringSoon = 0;
      let valid = 0;
      
      for (const cert of certificates) {
        if (cert.daysRemaining <= 0) {
          expired++;
        } else if (cert.daysRemaining <= 30) {
          expiringSoon++;
        } else {
          valid++;
        }
      }
      
      return {
        total: certificates.length,
        expired,
        expiringSoon,
        valid
      };
    }
    
    // 证书数量不多时，使用filter
    return {
      total: certificates.length,
      expired: certificates.filter(cert => cert.daysRemaining <= 0).length,
      expiringSoon: certificates.filter(cert => cert.daysRemaining > 0 && cert.daysRemaining <= 30).length,
      valid: certificates.filter(cert => cert.daysRemaining > 30).length,
    };
  }, [certificates]);

  return {
    certificates,
    isLoading,
    isInitialized,
    certificateStats,
    addCertificate,
    deleteCertificate,
    importCertificates
  };
} 