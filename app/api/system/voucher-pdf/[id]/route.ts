import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSystemUser } from "@/lib/systemApi";
import { renderVoucherPdf } from "@/lib/pdf/VoucherDocument";

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const { response } = await requireSystemUser();
  if (response) return response;

  const voucher = await prisma.employeeVoucher.findUnique({
    where: { id: params.id },
    include: { employee: true }
  });
  if (!voucher) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const buffer = await renderVoucherPdf({
    employeeName: voucher.employee.nameAr,
    amount: voucher.amount,
    reason: voucher.reason,
    date: formatDate(voucher.createdAt),
    currency: "AED"
  });

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="voucher-${voucher.id}.pdf"`
    }
  });
}
