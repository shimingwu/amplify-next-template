import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = "https://api.restful-api.dev/objects";

// GET /api/objects or GET /api/objects?id=123
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  try {
    const url = id ? `${API_BASE_URL}/${id}` : API_BASE_URL;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch objects' }, 
      { status: 500 }
    );
  }
}

// POST /api/objects
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 🔒 SERVER-SIDE SECRET: Append mocked secret to demonstrate server-side processing
    const MOCKED_SECRET = "here is the mocked secret (simulated, just try to confirm that the secret is not sent to the client, by we can use backend to send this api with whatever 2lO token)";
    
    // Modify the payload to include the secret in the description
    const modifiedBody = {
      ...body,
      data: {
        ...body.data,
        description: body.data?.description 
          ? `${body.data.description} - ${MOCKED_SECRET}`
          : MOCKED_SECRET
      }
    };
    
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(modifiedBody),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create object' }, 
      { status: 500 }
    );
  }
}

// PUT /api/objects?id=123
export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json(
      { error: 'ID is required for update' }, 
      { status: 400 }
    );
  }
  
  try {
    const body = await request.json();
    
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update object' }, 
      { status: 500 }
    );
  }
}

// DELETE /api/objects?id=123
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json(
      { error: 'ID is required for delete' }, 
      { status: 400 }
    );
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete object' }, 
      { status: 500 }
    );
  }
}