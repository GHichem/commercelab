import { Resend } from 'resend'

type OrderEmailItem = {
  productName: string
  unitPriceCents: number
  quantity: number
  lineTotalCents: number
}

type SendOrderConfirmationInput = {
  email: string
  firstName: string
  orderNumber: string
  totalCents: number
  items: OrderEmailItem[]
}

export async function sendOrderConfirmation(
  input: SendOrderConfirmationInput,
) {
  const apiKey =
    process.env.RESEND_API_KEY

  const from =
    process.env.RESEND_FROM_EMAIL

  if (!apiKey || !from) {
    console.warn(
      'Order email skipped: Resend is not configured.',
    )

    return
  }

  const resend =
    new Resend(apiKey)

  const itemsHtml =
    input.items
      .map(
        (item) => `
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e6e0d8;">
              ${escapeHtml(item.productName)}
            </td>

            <td style="padding: 12px 0; border-bottom: 1px solid #e6e0d8; text-align: center;">
              ${item.quantity}
            </td>

            <td style="padding: 12px 0; border-bottom: 1px solid #e6e0d8; text-align: right;">
              €${formatMoney(item.lineTotalCents)}
            </td>
          </tr>
        `,
      )
      .join('')

  const { error } =
    await resend.emails.send({
      from,
      to: [input.email],

      subject:
        `CommerceLab order ${input.orderNumber}`,

      html: `
        <!doctype html>
        <html>
          <body style="margin: 0; padding: 0; background: #f7f4ee; font-family: Arial, sans-serif; color: #1c1c18;">
            <div style="max-width: 640px; margin: 0 auto; padding: 40px 20px;">
              <div style="background: #fbf9f5; border: 1px solid #d8d2c8; padding: 32px;">
                <p style="margin: 0 0 8px; color: #8c3b24; font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">
                  CommerceLab
                </p>

                <h1 style="margin: 0; font-size: 32px;">
                  Order confirmed
                </h1>

                <p style="margin-top: 24px; line-height: 1.6;">
                  Hi ${escapeHtml(input.firstName)},
                </p>

                <p style="line-height: 1.6;">
                  Thanks for your order. Your order number is
                  <strong>${escapeHtml(input.orderNumber)}</strong>.
                </p>

                <table style="width: 100%; border-collapse: collapse; margin-top: 28px;">
                  <thead>
                    <tr>
                      <th style="padding-bottom: 12px; text-align: left;">
                        Product
                      </th>

                      <th style="padding-bottom: 12px; text-align: center;">
                        Qty
                      </th>

                      <th style="padding-bottom: 12px; text-align: right;">
                        Total
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    ${itemsHtml}
                  </tbody>
                </table>

                <div style="margin-top: 24px; text-align: right; font-size: 18px;">
                  <strong>
                    Total: €${formatMoney(input.totalCents)}
                  </strong>
                </div>

                <p style="margin-top: 32px; color: #69655e; font-size: 13px; line-height: 1.6;">
                  This is a demo CommerceLab order confirmation.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

  if (error) {
    throw new Error(
      `Resend email failed: ${error.message}`,
    )
  }
}

function formatMoney(
  cents: number,
) {
  return (
    cents / 100
  ).toFixed(2)
}

function escapeHtml(
  value: string,
) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}