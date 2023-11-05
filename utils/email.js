import { createTransport } from 'nodemailer'
import { consts } from '../constants/consts'
import { renderFile } from 'pug'
import { htmlToText } from 'html-to-text'

class Email {
  constructor(user, url) {
    this.to = user.email
    this.firstName = user.name.split(' ')[0]
    this.url = url
    this.from = `Natours <${process.env.EMAIL_FROM}>`
  }

  newTransport() {
    if (process.env.NODE_ENV === consts.MODE.PROD) {
      return 1
    }
    return createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    })
  }

  async send(template, subject) {
    const html = renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    })
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    }
    await this.newTransport().sendMail(mailOptions)
  }

  async sendWelcome() {
    await this.send(
      consts.EMAIL_TEMPLATES.WELCOME,
      'Welcome to the Natours Family!'
    )
  }

  async sendPasswordReset() {
    await this.send(
      consts.EMAIL_TEMPLATES.PASSWORD_RESET,
      'Your password reset token (valid for only 10 minutes)'
    )
  }
}

export { Email }
