import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username') || 'Kudus';

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
            background: 'linear-gradient(to bottom, #ec4899, #f97316)',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Inner Card Graphic matching your brand */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'white',
              borderRadius: '40px',
              padding: '60px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              width: '80%',
              height: '75%',
            }}
          >
            {/* Avatar Circle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100px',
                height: '100px',
                borderRadius: '50px',
                backgroundColor: '#18181b',
                color: 'white',
                fontSize: '48px',
                fontWeight: 'bold',
                marginBottom: '20px',
              }}
            >
              {username[0].toUpperCase()}
            </div>

            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#18181b', marginBottom: '10px' }}>
              @{username}
            </div>

            <div style={{ fontSize: '48px', fontWeight: '900', color: '#18181b', textAlign: 'center' }}>
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