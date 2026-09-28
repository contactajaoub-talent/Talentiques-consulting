import { ImageResponse } from 'next/og';

export const alt = 'TalentiQues — The Professional Opportunities Ecosystem';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 88, color: 'white', background: 'radial-gradient(circle at 80% 20%, #0683c9 0%, #071b2b 38%, #020b1f 78%)' }}>
      <div style={{ fontSize: 34, fontWeight: 700, color: '#7dd3fc' }}>TalentiQues</div>
      <div style={{ marginTop: 42, maxWidth: 940, fontSize: 70, lineHeight: 1.08, fontWeight: 800 }}>The Professional Opportunities Ecosystem</div>
    </div>, size
  );
}
