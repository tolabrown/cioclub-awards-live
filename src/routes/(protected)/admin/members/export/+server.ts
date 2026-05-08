import { db } from "$lib/db";
import { membershipInquiry, user as userTable, membershipPayment } from "$lib/db/schema";
import { desc, eq, sql, and, or, isNull, ne, ilike } from "drizzle-orm";
import { error } from "@sveltejs/kit";
import { format } from "date-fns";
import { Role } from "$lib/constants";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url, locals }) => {
  // Check if admin
  if (!locals.user || locals.user.role !== Role.ADMIN) {
    throw error(401, "Unauthorized");
  }

  const paymentStatus = url.searchParams.get("paymentStatus") || "all";
  const search = url.searchParams.get("search") || "";

  try {
    // Latest payment subquery
    const latestPaymentSubquery = db
      .select({
        email: membershipPayment.email,
        status: membershipPayment.status,
        amount: membershipPayment.amount,
        createdAt: membershipPayment.createdAt,
      })
      .from(membershipPayment)
      .orderBy(desc(membershipPayment.createdAt))
      .as('latest_payment');

    // Build filters
    const filterConditions = [];
    if (paymentStatus === "paid") {
      filterConditions.push(eq(latestPaymentSubquery.status, "success"));
    } else if (paymentStatus === "unpaid") {
      filterConditions.push(
        or(
          isNull(latestPaymentSubquery.status),
          ne(latestPaymentSubquery.status, "success")
        )
      );
    }
    
    if (search) {
      filterConditions.push(
        or(
          ilike(membershipInquiry.fullName, `%${search}%`),
          ilike(membershipInquiry.email, `%${search}%`),
          ilike(membershipInquiry.organization, `%${search}%`)
        )
      );
    }

    // Fetch all members (no pagination)
    const members = await db
      .select({
        inquiry: membershipInquiry,
        user: {
          subscriptionEndsAt: userTable.subscriptionEndsAt,
        },
        payment: {
          status: latestPaymentSubquery.status,
          amount: latestPaymentSubquery.amount,
          createdAt: latestPaymentSubquery.createdAt,
        }
      })
      .from(membershipInquiry)
      .leftJoin(userTable, eq(sql`lower(${membershipInquiry.email})`, sql`lower(${userTable.email})`))
      .leftJoin(latestPaymentSubquery, eq(sql`lower(${membershipInquiry.email})`, sql`lower(${latestPaymentSubquery.email})`))
      .where(filterConditions.length > 0 ? and(...filterConditions) : undefined)
      .orderBy(desc(membershipInquiry.createdAt));

    // CSV Header
    const headers = [
      "Full Name",
      "Email",
      "Phone",
      "Job Title",
      "Organization",
      "Tier",
      "Payment Status",
      "Amount Paid",
      "Subscription Ends At",
      "Created At"
    ];

    // CSV Rows
    const rows = members.map(m => {
      const paymentStatusStr = m.payment?.status === "success" ? "Paid" : (m.payment?.status === "failed" ? "Failed" : "Not Paid");
      const amount = m.payment?.amount ? (m.payment.amount / 100).toFixed(2) : "0.00";
      const subEnds = m.user?.subscriptionEndsAt ? format(new Date(m.user.subscriptionEndsAt), "yyyy-MM-dd") : "N/A";
      const createdAt = format(new Date(m.inquiry.createdAt), "yyyy-MM-dd HH:mm:ss");

      return [
        `"${m.inquiry.fullName || ""}"`,
        `"${m.inquiry.email || ""}"`,
        `"${m.inquiry.phone || ""}"`,
        `"${m.inquiry.jobTitle || ""}"`,
        `"${m.inquiry.organization || ""}"`,
        `"${m.inquiry.tier || ""}"`,
        `"${paymentStatusStr}"`,
        `"${amount}"`,
        `"${subEnds}"`,
        `"${createdAt}"`
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="members_export_${paymentStatus}_${format(new Date(), "yyyyMMdd")}.csv"`
      }
    });

  } catch (e) {
    console.error("Error exporting members:", e);
    throw error(500, "Failed to export membership inquiries");
  }
};
