// 💥 CRITICAL FIX: Forces Next.js to use the Node.js environment
// This must be the FIRST line (before any imports) to resolve Prisma initialization errors
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { ClassLevel } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, classLevel } = body;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Trim and validate name
    const trimmedName = name.toString().trim();
    if (trimmedName.length === 0) {
      return NextResponse.json(
        { error: 'Name cannot be empty' },
        { status: 400 }
      );
    }

    // Validate email format
    const trimmedEmail = email.toString().trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Normalize classLevel: convert "JSS 1" to "JSS1", etc.
    let normalizedClassLevel: ClassLevel | undefined = undefined;
    if (classLevel) {
      // Remove spaces and convert to uppercase to match enum values
      const normalized = classLevel.toString().replace(/\s+/g, '').toUpperCase();
      
      // Validate against allowed enum values
      const validClassLevels: ClassLevel[] = ['JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3'];
      if (validClassLevels.includes(normalized as ClassLevel)) {
        normalizedClassLevel = normalized as ClassLevel;
      } else {
        return NextResponse.json(
          { error: `Invalid class level. Must be one of: ${validClassLevels.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        name: trimmedName,
        email: trimmedEmail,
        password: hashedPassword,
        ...(normalizedClassLevel && { classLevel: normalizedClassLevel }),
      },
    });

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
    });
    return NextResponse.json(
      { 
        error: 'Failed to create user',
        message: error.message || 'Unknown error occurred',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

