import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Fetch the first company record and select only the name field.
    const company = await prisma.companies.findFirst({
      select: { name: true },
    });

    if (!company) {
      return NextResponse.json({ name: 'Company not found' }, { status: 404 });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error('Error fetching company name:', error);
    return NextResponse.error();
  }
}
