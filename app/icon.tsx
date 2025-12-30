import { ImageResponse } from 'next/og';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Dynamic favicon generator
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: '#161616',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#E1E1E1',
          fontWeight: 'bold',
          borderRadius: '4px',
        }}
      >
        Y
      </div>
    ),
    {
      ...size,
    }
  );
}
