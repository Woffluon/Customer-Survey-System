import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || 'Efe Arabacı Müşteri Anket Sistemi';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            backgroundColor: '#09090b',
            color: '#f4f4f5',
            padding: '60px 80px',
            fontFamily: 'sans-serif',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: '#27272a',
              padding: '8px 20px',
              borderRadius: '9999px',
              border: '1px solid #3f3f46',
            }}
          >
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
              }}
            />
            <span
              style={{
                fontSize: '18px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: '#a1a1aa',
                fontWeight: '600',
              }}
            >
              EFE ARABACI — SURVEY SYSTEM
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h1
              style={{
                fontSize: '56px',
                fontWeight: '800',
                lineHeight: '1.15',
                letterSpacing: '-0.02em',
                color: '#ffffff',
                margin: 0,
              }}
            >
              {title}
            </h1>
            <p
              style={{
                fontSize: '24px',
                color: '#a1a1aa',
                margin: 0,
                lineHeight: '1.4',
              }}
            >
              Full-Stack Developer & UI/UX Specialist — High Performance Editorial Experience
            </p>
          </div>

          <div
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid #27272a',
              paddingTop: '32px',
              color: '#71717a',
              fontSize: '20px',
            }}
          >
            <span>anket.efearabacı.com</span>
            <span>Client Discovery & Delivery</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : 'Unknown error';
    return new Response(`Failed to generate OG image: ${errorMsg}`, { status: 500 });
  }
}
