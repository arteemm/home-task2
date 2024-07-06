import nodemailer from 'nodemailer';

export const emailAdapter = {
    async sendEmail (email: string, subject: string, message: string) {
        const transporter = nodemailer.createTransport({
            // service: 'mail',
            host: "smtp.mail.ru",
            port: 465,
            secure: true, // Use `true` for port 465, `false` for all other ports
            auth: {
              user: "artem.menitzky@mail.ru",
              pass: "gmR5XvdiqV9kQby66zxL",
            },
          });
          
          // async..await is not allowed in global scope, must use a wrapper
        //   async function main() {
            // send mail with defined transport object
            const info = await transporter.sendMail({
              from: '"artemka" <artem.menitzky@mail.ru>', // sender address
              to: email, // list of receivers
              subject: subject, // Subject line
              html: message, // html body
            });
            console.log("Message sent: %s", info);
        // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
        // }
    }
};