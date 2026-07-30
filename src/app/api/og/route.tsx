import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  try {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1a202c',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Inner Card Graphic matching Kuso styling */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#2d3748',
              borderRadius: '40px',
              padding: '60px',
              border: '4px solid #3b82f6',
              boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.4)',
              width: '80%',
              height: '75%',
              color: 'white',
            }}
          >
            {/* Logo/Icon Circle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '120px',
                height: '120px',
                borderRadius: '60px',
                backgroundColor: '#2563eb',
                color: 'white',
                fontSize: '42px',
                fontWeight: '900',
                marginBottom: '25px',
                boxShadow: '0 10px 25px rgba(37, 99, 235, 0.5)',
              }}
            >
              K
            </div>

            <div style={{ fontSize: '52px', fontWeight: '900', color: 'white', textAlign: 'center', lineHeight: '1.2' }}>
              send me anonymous messages!
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e: any) {
    return new Response('Failed to generate the image', { status: 500 });
  }
}