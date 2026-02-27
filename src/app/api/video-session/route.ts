import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const apiKey = process.env.ANAM_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANAM_KEY is not configured' },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.anam.ai/v1/auth/session-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        personaConfig: {
          personaId: '37efe645-4242-4a67-8d3e-e5bf5dc1555f',
        //   name: 'Satyam',
        //   avatarId: '336725ce-1639-45af-b42a-0af72435f685',
        //   voiceId: '8246d9f7-827e-4a5c-8697-644ce860ca02',
          llmId: '85906141-db1c-4927-b74d-3c82ebe2436e',
        //   systemPrompt:
        //     'You are Satyam Regmi, a software developer. You are on a video call with a visitor to your portfolio website. Be friendly, professional, and concise. Talk about your projects, skills, and experience. Keep responses short and conversational as this is a live video call.',
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Anam API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to get session token' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ sessionToken: data.sessionToken });
  } catch (error) {
    console.error('Error getting session token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
