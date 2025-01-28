import nodemailer from 'nodemailer'

export async function getMailClient() {
  const account = nodemailer.createTestAccount()

  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: (await account).user,
      pass: (await account).pass
    }
  })

  return transporter
}
