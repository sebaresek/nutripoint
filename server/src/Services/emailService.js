const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'nutripoint.ar@gmail.com',
    pass: process.env.EMAIL_PASSWORD 
  }
});

// Estilo común para los headers
// const headerStyle = `background: #1a3f5d linear-gradient(135deg, #1a3f5d 0%, #168bf9 100%); padding: 30px; text-align: center; border-bottom: 4px solid #168bf9;`;

const headerStyle = `background: linear-gradient(135deg, #2c2c2c 0%, #1a1c1f 100%); padding: 30px; text-align: center; border-bottom: 4px solid #168bf9;`;


const sendOrderNotification = async (orderData) => {
  const mailOptions = {
    from: 'NutriPoint <nutripoint.ar@gmail.com>',
    to: 'nutripoint.ar@gmail.com',
    subject: `🔥 ¡NUEVA VENTA! - ${orderData.customerName}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
        
        <div style="${headerStyle}">
            <img src="https://lh3.googleusercontent.com/d/1mZRt4krPHH9nzIGNAHl79H8ovL5IQBy8" alt="NutriPoint" style="width: 240px; height: auto; display: block; margin: 0 auto; border: 0;">
        </div>

        <div style="padding: 30px; background-color: #ffffff;">
          <h2 style="color: #333; margin-top: 0;">Detalles del Pedido</h2>
          
          <div style="background-color: #f0f7ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #dbeafe;">
            <p style="margin: 5px 0; color: #333;"><strong>Cliente:</strong> ${orderData.customerName}</p>
            <p style="margin: 5px 0; color: #333;"><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="border-bottom: 2px solid #168bf9;">
                <th style="text-align: left; padding: 10px 0; color: #1a3f5d; font-size: 13px; text-transform: uppercase;">Producto</th>
                <th style="text-align: center; padding: 10px 0; color: #1a3f5d; font-size: 13px; text-transform: uppercase;">Cant.</th>
                <th style="text-align: right; padding: 10px 0; color: #1a3f5d; font-size: 13px; text-transform: uppercase;">Precio</th>
              </tr>
            </thead>
            <tbody>
              ${orderData.items.map(item => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 15px 0;">
                    <span style="display: block; font-weight: bold; color: #333;">${item.name || item.title}</span>
                    <small style="color: #666;">${item.selectedFlavor || ''}</small>
                  </td>
                  <td style="text-align: center; color: #333;">x${item.quantity}</td>
                  <td style="text-align: right; color: #333; font-weight: bold;">$${(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="text-align: right; padding-top: 10px;">
            <p style="margin: 0; color: #666; font-size: 14px;">Total del Pedido:</p>
            <h2 style="margin: 5px 0; color: #168bf9; font-size: 28px;">$${Number(orderData.total).toLocaleString()}</h2>
          </div>

          <div style="margin-top: 30px; text-align: center;">
            <a href="https://nutripoint.site/admin" style="background-color: #222; color: #ffffff; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              GESTIONAR EN PANEL ADMIN
            </a>
          </div>
        </div>

        <div style="background-color: #f8fafc; padding: 15px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0;">
          Notificación automática NutriPoint.<br>
          © 2026 Misiones, Argentina.
        </div>
      </div>
    `
  };
  return transporter.sendMail(mailOptions);
};

const sendCustomerConfirmation = async (orderData) => {
  const mailOptions = {
    from: 'NutriPoint <nutripoint.ar@gmail.com>',
    to: orderData.customerEmail,
    subject: `✅ ¡Gracias por tu compra, ${orderData.customerName}!`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 15px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        
        <div style="${headerStyle}">
            <img src="https://lh3.googleusercontent.com/d/1mZRt4krPHH9nzIGNAHl79H8ovL5IQBy8" alt="NutriPoint" style="width: 240px; height: auto; display: block; margin: 0 auto; border: 0;">
        </div>

        <div style="padding: 30px; background-color: #ffffff;">
          <h2 style="color: #1a3f5d; margin-top: 0; font-size: 24px;">¡Hola, ${orderData.customerName}! 👋🏼</h2>
          <p style="color: #475569; line-height: 1.6; font-size: 16px;">
            Tu pedido ha sido confirmado. ¡Gracias por elegir NutriPoint para llevar tu entrenamiento al siguiente nivel!
          </p>
          
          <div style="background-color: #f0f7ff; border-left: 4px solid #168bf9; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="margin: 0 0 10px 0; color: #333; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Información de Entrega</h3>
            <p style="margin: 5px 0; color: #333;"><strong>📍 Método:</strong> ${orderData.shippingMethod}</p>
            <p style="margin: 5px 0; color: #333;"><strong>🏠 Dirección:</strong> ${orderData.address}, ${orderData.city}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="border-bottom: 2px solid #f1f5f9;">
                <th style="text-align: left; padding: 10px 0; color: #64748b; font-size: 12px; text-transform: uppercase;">Producto</th>
                <th style="text-align: center; padding: 10px 0; color: #64748b; font-size: 12px; text-transform: uppercase;">Cant.</th>
                <th style="text-align: right; padding: 10px 0; color: #64748b; font-size: 12px; text-transform: uppercase;">Precio</th>
              </tr>
            </thead>
            <tbody>
              ${orderData.items.map(item => `
                <tr style="border-bottom: 1px solid #f8fafc;">
                  <td style="padding: 15px 0;">
                    <span style="display: block; font-weight: bold; color: #1e293b;">${item.name || item.title}</span>
                    <small style="color: #64748b;">${item.selectedFlavor || ''}</small>
                  </td>
                  <td style="text-align: center; color: #334155;">x${item.quantity}</td>
                  <td style="text-align: right; color: #1e293b; font-weight: bold;">$${(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="text-align: right; padding: 20px 0; border-top: 2px solid #f1f5f9;">
            <p style="margin: 0; color: #64748b; font-size: 14px;">Total abonado:</p>
            <h2 style="margin: 5px 0; color: #168bf9; font-size: 32px;">$${Number(orderData.total).toLocaleString()}</h2>
          </div>

          <div style="margin-top: 30px; padding: 20px; border: 1px solid #e3e4e6; border-radius: 12px; text-align: center; background-color: #f8fafc;">
            <p style="margin: 0; color: #333; font-weight: bold;">🚀 ¿Qué sigue ahora?</p>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #475569; line-height: 1.5;">
                Estamos procesando tu pedido. Te enviaremos otro email con el código de seguimiento apenas sea despachado.
            </p>
          </div>
        </div>

        <div style="background-color: #f1f1f1; padding: 25px; text-align: center; color: #333;">
          <p style="margin: 0; font-size: 14px; font-weight: bold;">NutriPoint - Elevá tu rendimiento.</p>
          <p style="margin: 5px 0 0; font-size: 11px; color: #cbd5e1;">© 2026 Posadas, Misiones, Argentina.</p>
        </div>
      </div>
    `
  };
  return transporter.sendMail(mailOptions);
};

const sendShippingUpdate = async (data) => {
    const mailOptions = {
        from: 'NutriPoint <nutripoint.ar@gmail.com>',
        to: data.customerEmail,
        subject: `🚚 ¡Pedido #${data.orderId} en camino! - NutriPoint`,
        html: `
        <div style="background-color: #f8fafc; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 15px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                
                <div style="${headerStyle}">
                    <img src="https://lh3.googleusercontent.com/d/1mZRt4krPHH9nzIGNAHl79H8ovL5IQBy8" alt="NutriPoint" style="width: 240px; height: auto; display: block; margin: 0 auto; border: 0;">
                </div>

                <div style="padding: 30px;">
                    <h2 style="color: #1a3f5d; margin-top: 0;">¡Hola, ${data.customerName}! 👋🏼</h2>
                    <p style="color: #475569; line-height: 1.6; font-size: 15px;">
                        ¡Buenas noticias! Tu pedido de <strong>NutriPoint</strong> ya fue despachado.
                    </p>

                    <div style="background-color: #f0f7ff; border: 2px dashed #168bf9; border-radius: 12px; padding: 25px; text-align: center; margin: 30px 0;">
                        <span style="display: block; color: #168bf9; font-weight: bold; text-transform: uppercase; font-size: 12px; margin-bottom: 8px;">Código de Seguimiento</span>
                        <strong style="display: block; color: #1a3f5d; font-size: 26px; letter-spacing: 3px; font-family: monospace;">
                            ${data.trackingCode}
                        </strong>
                    </div>

                    <div style="background-color: #f1f5f9; border-left: 4px solid #168bf9; padding: 15px; margin-bottom: 20px;">
                        <p style="margin: 0; font-size: 13px; color: #334155;">
                            <strong>Importante:</strong> Podrás ver el estado del envío en la web del transporte una vez que el sistema se actualice (puede tardar unas horas).
                        </p>
                    </div>
                </div>

                <div style="background-color: #f1f1f1; padding: 20px; text-align: center;">
                    <p style="margin: 0; color: #333; font-size: 12px; font-weight: bold;">NutriPoint - Suplementos de Calidad</p>
                </div>
            </div>
        </div>
        `
    };
    return transporter.sendMail(mailOptions);
};

module.exports = { sendOrderNotification, sendCustomerConfirmation, sendShippingUpdate };