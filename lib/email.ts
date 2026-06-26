import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM_EMAIL ?? "Facultify <onboarding@resend.dev>";

// ─── Teacher invite ────────────────────────────────────────────────────────────

export async function sendTeacherInviteEmail({
  to,
  teacherName,
  subject,
  institutionName,
  dashboardUrl,
  magicLink,
}: {
  to: string;
  teacherName: string;
  subject: string;
  institutionName: string;
  dashboardUrl: string;
  magicLink: string;
}) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're invited to Facultify</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#2563eb;padding:32px 40px;text-align:center;">
            <div style="display:inline-flex;align-items:center;gap:10px;">
              <div style="background:rgba(255,255,255,0.2);border-radius:8px;width:36px;height:36px;display:inline-flex;align-items:center;justify-content:center;font-size:20px;">🎓</div>
              <span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">Facultify</span>
            </div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            <p style="margin:0 0 8px;font-size:13px;color:#6b7280;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;">Teacher Invitation</p>
            <h1 style="margin:0 0 20px;font-size:24px;font-weight:700;color:#0f172a;line-height:1.3;">
              Welcome to ${institutionName}, ${teacherName}!
            </h1>
            <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.7;">
              You've been added as a <strong>${subject}</strong> teacher on Facultify. Your personalised teacher dashboard is ready — create mock tests, manage your students, and track performance all in one place.
            </p>

            <!-- Feature list -->
            <table cellpadding="0" cellspacing="0" width="100%" style="background:#eff6ff;border-radius:8px;padding:20px 20px;margin-bottom:28px;">
              <tr><td>
                <p style="margin:0 0 10px;font-size:13px;font-weight:600;color:#1e40af;">What you can do on your dashboard:</p>
                <ul style="margin:0;padding-left:20px;color:#374151;font-size:14px;line-height:2;">
                  <li>Create and publish mock tests</li>
                  <li>Add &amp; organise students into batches</li>
                  <li>Review student submissions &amp; scores</li>
                  <li>Track performance analytics</li>
                </ul>
              </td></tr>
            </table>

            <!-- CTA -->
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td align="center">
                  <a href="${magicLink}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;letter-spacing:0.1px;">
                    Access My Teacher Dashboard →
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;text-align:center;">
              Or copy this link:<br/>
              <a href="${dashboardUrl}" style="color:#2563eb;font-size:12px;word-break:break-all;">${dashboardUrl}</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              This invite was sent from ${institutionName} via Facultify.<br/>
              If you weren't expecting this, you can safely ignore this email.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return resend.emails.send({
    from: FROM,
    to,
    subject: `You've been invited to ${institutionName} on Facultify`,
    html,
  });
}

// ─── Student invite ────────────────────────────────────────────────────────────

export async function sendStudentInviteEmail({
  to,
  studentName,
  teacherName,
  batchName,
  institutionName,
  dashboardUrl,
  magicLink,
}: {
  to: string;
  studentName: string;
  teacherName: string;
  batchName: string;
  institutionName: string;
  dashboardUrl: string;
  magicLink: string;
}) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your teacher added you to Facultify</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#2563eb;padding:32px 40px;text-align:center;">
            <div style="display:inline-flex;align-items:center;gap:10px;">
              <div style="background:rgba(255,255,255,0.2);border-radius:8px;width:36px;height:36px;display:inline-flex;align-items:center;justify-content:center;font-size:20px;">🎓</div>
              <span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">Facultify</span>
            </div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            <p style="margin:0 0 8px;font-size:13px;color:#6b7280;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;">From ${teacherName}</p>
            <h1 style="margin:0 0 20px;font-size:24px;font-weight:700;color:#0f172a;line-height:1.3;">
              Hi ${studentName}, you've been enrolled!
            </h1>
            <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.7;">
              <strong>${teacherName}</strong> has added you to <strong>${batchName}</strong> at ${institutionName} on Facultify. Set up your account to access your tests, track your scores, and view your progress.
            </p>

            <!-- Info card -->
            <table cellpadding="0" cellspacing="0" width="100%" style="background:#eff6ff;border-radius:8px;margin-bottom:28px;">
              <tr>
                <td style="padding:16px 20px;">
                  <table cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td style="font-size:13px;color:#6b7280;padding:4px 0;">Teacher</td>
                      <td style="font-size:13px;font-weight:600;color:#0f172a;text-align:right;padding:4px 0;">${teacherName}</td>
                    </tr>
                    <tr>
                      <td style="font-size:13px;color:#6b7280;padding:4px 0;">Batch</td>
                      <td style="font-size:13px;font-weight:600;color:#0f172a;text-align:right;padding:4px 0;">${batchName}</td>
                    </tr>
                    <tr>
                      <td style="font-size:13px;color:#6b7280;padding:4px 0;">Institution</td>
                      <td style="font-size:13px;font-weight:600;color:#0f172a;text-align:right;padding:4px 0;">${institutionName}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- CTA -->
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td align="center">
                  <a href="${magicLink}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;letter-spacing:0.1px;">
                    Set Up My Student Account →
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;text-align:center;">
              Or copy this link:<br/>
              <a href="${dashboardUrl}" style="color:#2563eb;font-size:12px;word-break:break-all;">${dashboardUrl}</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              This invite was sent by ${teacherName} from ${institutionName} via Facultify.<br/>
              If you weren't expecting this, you can safely ignore this email.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return resend.emails.send({
    from: FROM,
    to,
    subject: `${teacherName} added you to Facultify — set up your account`,
    html,
  });
}
