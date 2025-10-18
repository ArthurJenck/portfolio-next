import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Tech from '@/models/Tech'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await connectDB()
    const tech = await Tech.findById(id)
    
    if (!tech) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(tech)
  } catch (error) {
    console.error('Error fetching tech:', error)
    return NextResponse.json({ error: 'Failed to fetch tech' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    await connectDB()
    const body = await request.json()
    const tech = await Tech.findByIdAndUpdate(id, body, { new: true })
    
    if (!tech) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(tech)
  } catch (error) {
    console.error('Error updating tech:', error)
    return NextResponse.json({ error: 'Failed to update tech' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    await connectDB()
    const tech = await Tech.findByIdAndDelete(id)
    
    if (!tech) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting tech:', error)
    return NextResponse.json({ error: 'Failed to delete tech' }, { status: 500 })
  }
}

