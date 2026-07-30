import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username') || 'Kuso';

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
            {/* Avatar Circle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '110px',
                height: '110px',
                borderRadius: '55px',
                backgroundColor: '#2563eb',
                color: 'white',
                fontSize: '52px',
                fontWeight: 'bold',
                marginBottom: '20px',
                boxShadow: '0 10px 25px rgba(37, 99, 235, 0.5)',
              }}
            >
              {username[0].toUpperCase()}
            </div>

            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#94a3b8', marginBottom: '15px', textTransform: 'lowercase' }}>
              @{username}
            </div>

            <div style={{ fontSize: '48px', fontWeight: '900', color: 'white', textAlign: 'center', lineHeight: '1.2' }}>
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