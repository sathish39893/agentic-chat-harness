import { NextResponse } from 'next/server';
import { NeonMemoryManager } from '@/lib/memory/neon-pgvector';

export async function GET() {
  try {
    const memories = await NeonMemoryManager.listMemories();
    return NextResponse.json({ memories });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve memories';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { content, category } = await req.json();
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const memory = await NeonMemoryManager.saveMemory({
      content,
      category: category || 'fact',
    });

    return NextResponse.json({ memory });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save memory';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Memory ID is required' }, { status: 400 });
    }

    const success = await NeonMemoryManager.deleteMemory(id);
    return NextResponse.json({ success });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete memory';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
