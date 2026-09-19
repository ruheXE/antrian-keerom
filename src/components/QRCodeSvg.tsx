import React from 'react';

interface QRCodeProps {
  value: string;
  size?: number;
}

export const QRCodeSvg: React.FC<QRCodeProps> = ({ value, size = 110 }) => {
  // Simple deterministic pattern generator for offline printable ticket QR codes
  // Creates a clean, realistic looking 21x21 QR code matrix
  const matrixSize = 21;
  const hash = Math.abs(
    value.split('').reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) | 0, 0)
  );

  const isDark = (r: number, c: number): boolean => {
    // 3 Finder patterns (Top-left, Top-right, Bottom-left)
    const inTopLeftFinder = r < 7 && c < 7;
    const inTopRightFinder = r < 7 && c >= matrixSize - 7;
    const inBottomLeftFinder = r >= matrixSize - 7 && c < 7;

    if (inTopLeftFinder || inTopRightFinder || inBottomLeftFinder) {
      const localR = inBottomLeftFinder ? r - (matrixSize - 7) : r;
      const localC = inTopRightFinder ? c - (matrixSize - 7) : c;
      if (localR === 0 || localR === 6 || localC === 0 || localC === 6) return true;
      if (localR >= 2 && localR <= 4 && localC >= 2 && localC <= 4) return true;
      return false;
    }

    // Timing patterns
    if (r === 6 && c % 2 === 0) return true;
    if (c === 6 && r % 2 === 0) return true;

    // Data dots pseudo-generator based on hash and positions
    const dotHash = (r * 13 + c * 37 + hash) % 100;
    return dotHash > 52;
  };

  const cellSize = size / matrixSize;
  const rects: React.ReactNode[] = [];

  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (isDark(r, c)) {
        rects.push(
          <rect
            key={`${r}-${c}`}
            x={c * cellSize}
            y={r * cellSize}
            width={cellSize + 0.2}
            height={cellSize + 0.2}
            fill="#1e293b"
          />
        );
      }
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="bg-white p-1.5 rounded-lg border border-slate-200"
    >
      {rects}
    </svg>
  );
};
