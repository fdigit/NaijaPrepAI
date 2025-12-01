export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { ClassLevel } from '@prisma/client';

// GET user profile
export async function GET(request: NextRequest) {
  try {
    // Don't pass request - auth() automatically reads from request context
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        classLevel: true,
        preferredSubjects: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

// PATCH update user profile
export async function PATCH(request: NextRequest) {
  try {
    // Don't pass request - auth() automatically reads from request context
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { classLevel, preferredSubjects } = body;

    // Validate classLevel if provided
    let normalizedClassLevel: ClassLevel | undefined = undefined;
    if (classLevel) {
      const normalized = classLevel.toString().replace(/\s+/g, '').toUpperCase();
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

    // Validate preferredSubjects if provided
    if (preferredSubjects !== undefined) {
      if (!Array.isArray(preferredSubjects)) {
        return NextResponse.json(
          { error: 'preferredSubjects must be an array' },
          { status: 400 }
        );
      }
    }

    // Update user
    const updateData: any = {};
    if (normalizedClassLevel !== undefined) {
      updateData.classLevel = normalizedClassLevel;
    }
    if (preferredSubjects !== undefined) {
      updateData.preferredSubjects = preferredSubjects;
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        classLevel: true,
        preferredSubjects: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
}

