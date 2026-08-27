import { Resend } from 'resend'
import { ReferralStatus } from './referralStore'

const STATUS_LABELS: Record<ReferralStatus, string> = {
  submitted: 'Form Submitted',
  reviewed: 'Reviewed by Specialist',
  appointment_made: 'Appointment Made',
  prescription_prescribed: 'Medication Prescribed',
}

const STATUS_MESSAGES: Record<ReferralStatus, string> = {
  submitted: 'Your intake form has been received and is awaiting review by a specialist.',
  reviewed: 'A specialist has reviewed your intake form. You should expect to be contacted soon to arrange an appointment.',
  appointment_made: 'Your appointment with a specialist has been arranged. Please check your notes below for any details from your care team.',
  prescription_prescribed: 'Your specialist has issued a prescription. Your care journey is now complete.',
}

function getClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('Missing RESEND_API_KEY')
  return new Resend(apiKey)
}

function trackerUrl(referralId: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  return `${base}/referrals/${referralId}`
}

export async function sendIntakeConfirmation({
  to,
  patientName,
  referralId,
  specialistType,
  urgencyLevel,
}: {
  to: string
  patientName: string
  referralId: string
  specialistType: string
  urgencyLevel: string
}) {
  if (!to) return
  const resend = getClient()

  await resend.emails.send({
    from: 'CareFlow OS <onboarding@resend.dev>',
    to,
    subject: `Your referral has been submitted — ${referralId}`,
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #13212f;">
        <h2 style="margin-bottom: 4px;">Hi ${patientName},</h2>
        <p style="color: #5d6d7d;">Your intake form has been successfully submitted to CareFlow OS.</p>

        <div style="background: #fffaf3; border: 1px solid rgba(19,33,47,0.12); border-radius: 16px; padding: 20px; margin: 24px 0;">
          <p style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.2em; color: #5d6d7d;">Your Tracking ID</p>
          <p style="margin: 0; font-size: 28px; font-weight: 700; font-family: monospace; letter-spacing: 0.1em;">${referralId}</p>
          <p style="margin: 12px 0 0; font-size: 13px; color: #5d6d7d;">Save this ID — you'll need it to check your referral status.</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td style="padding: 8px 0; font-size: 13px; color: #5d6d7d; border-bottom: 1px solid rgba(19,33,47,0.08);">Specialist type</td>
            <td style="padding: 8px 0; font-size: 13px; font-weight: 600; text-align: right; border-bottom: 1px solid rgba(19,33,47,0.08);">${specialistType}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 13px; color: #5d6d7d;">Urgency</td>
            <td style="padding: 8px 0; font-size: 13px; font-weight: 600; text-align: right; text-transform: capitalize;">${urgencyLevel}</td>
          </tr>
        </table>

        <a href="${trackerUrl(referralId)}" style="display: block; text-align: center; background: #13212f; color: white; text-decoration: none; border-radius: 100px; padding: 14px 24px; font-size: 14px; font-weight: 500;">
          Track My Referral →
        </a>

        <p style="margin-top: 24px; font-size: 12px; color: #5d6d7d; text-align: center;">
          You'll receive an email each time your referral status is updated.
        </p>
      </div>
    `,
  })
}

export async function sendStatusUpdate({
  to,
  patientName,
  referralId,
  status,
  specialistNote,
}: {
  to: string
  patientName: string
  referralId: string
  status: ReferralStatus
  specialistNote?: string
}) {
  if (!to) return
  const resend = getClient()

  await resend.emails.send({
    from: 'CareFlow OS <onboarding@resend.dev>',
    to,
    subject: `Referral update: ${STATUS_LABELS[status]} — ${referralId}`,
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #13212f;">
        <h2 style="margin-bottom: 4px;">Hi ${patientName},</h2>
        <p style="color: #5d6d7d;">Your referral status has been updated.</p>

        <div style="background: #fffaf3; border: 1px solid rgba(19,33,47,0.12); border-radius: 16px; padding: 20px; margin: 24px 0;">
          <p style="margin: 0 0 4px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.2em; color: #5d6d7d;">New Status</p>
          <p style="margin: 0; font-size: 22px; font-weight: 700;">${STATUS_LABELS[status]}</p>
          <p style="margin: 12px 0 0; font-size: 13px; color: #5d6d7d; line-height: 1.6;">${STATUS_MESSAGES[status]}</p>
        </div>

        ${specialistNote ? `
        <div style="border-left: 3px solid #d97706; padding: 12px 16px; margin-bottom: 24px; background: #fef9f0; border-radius: 0 12px 12px 0;">
          <p style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #92400e;">Note from your specialist</p>
          <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #78350f;">${specialistNote}</p>
        </div>
        ` : ''}

        <a href="${trackerUrl(referralId)}" style="display: block; text-align: center; background: #13212f; color: white; text-decoration: none; border-radius: 100px; padding: 14px 24px; font-size: 14px; font-weight: 500;">
          View Full Status →
        </a>

        <p style="margin-top: 24px; font-size: 12px; color: #5d6d7d; text-align: center;">
          Referral ID: <span style="font-family: monospace;">${referralId}</span>
        </p>
      </div>
    `,
  })
}
