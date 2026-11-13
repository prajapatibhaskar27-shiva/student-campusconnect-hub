import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QrCodeCanvasProps {
  value: string;
  size?: number;
}

export const QrCodeCanvas: React.FC<QrCodeCanvasProps> = ({ value, size = 104 }) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value, {
      width: size * 2,
      margin: 2,
      color: {
        dark: '#070B14',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setDataUrl('');
      });

    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (!dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className="rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[10px] font-mono-tabular text-slate-500"
      >
        QR
      </div>
    );
  }

  return (
    <div className="inline-block rounded-xl bg-white p-1.5 border border-slate-200 shadow-2xs">
      <img
        src={dataUrl}
        alt={`QR code for pass ${value}`}
        width={size}
        height={size}
        className="block rounded-md"
      />
    </div>
  );
};
