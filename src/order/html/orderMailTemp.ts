export const htmlTemplate = (order) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Order Confirmation</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');
        
        body {
          font-family: 'Poppins', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f7f7f7;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        .header {
          background: linear-gradient(135deg, #6e8efb, #a777e3);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        .content {
          padding: 30px;
        }
        .order-summary {
          background: #f9f9f9;
          border-radius: 6px;
          padding: 20px;
          margin-bottom: 25px;
        }
        .order-summary h2 {
          margin-top: 0;
          color: #444;
          font-size: 18px;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }
        .order-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 15px;
        }
        .order-details div {
          margin-bottom: 8px;
        }
        .order-details strong {
          display: block;
          color: #666;
          font-size: 14px;
          margin-bottom: 3px;
        }
        .order-details span {
          font-size: 16px;
          color: #222;
        }
        .coupon-badge {
          display: inline-block;
          background: #e3f7e8;
          color: #28a745;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 14px;
          margin-top: 5px;
        }
        .products-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        .products-table th {
          background-color: #f5f5f5;
          padding: 12px 15px;
          text-align: left;
          font-size: 14px;
          color: #555;
        }
        .products-table td {
          padding: 15px;
          border-bottom: 1px solid #eee;
          vertical-align: middle;
        }
        .product-image {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 4px;
          border: 1px solid #eee;
        }
        .footer {
          text-align: center;
          padding: 20px;
          background: #f5f5f5;
          color: #777;
          font-size: 12px;
        }
        .thank-you {
          font-size: 16px;
          color: #555;
          margin-bottom: 20px;
        }
        .total-amount {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmation</h1>
        </div>
        
        <div class="content">
          <p class="thank-you">Thank you ${order.userName} for your order!</p>
          
          <div class="order-summary">
            <h2>Order Summary</h2>
            <div class="order-details">
              <div>
                <strong>Order ID</strong>
                <span>${order.orderId}</span>
              </div>
              <div>
                <strong>Order Date</strong>
                <span>${new Date(order.createdAt).toLocaleString()}</span>
              </div>
              <div>
                <strong>Subtotal</strong>
                <span>$${order.totalAmount.toFixed(2)}</span>
              </div>
              <div>
                <strong>Discount</strong>
                <span>$${order.discount.toFixed(2)}</span>
              </div>
            </div>
            ${order.coupon ? `
              <div>
                <strong>Coupon Applied</strong>
                <span class="coupon-badge">${order.coupon.code}</span>
              </div>
            ` : ''}
            <div class="total-amount">
              <strong>Total Paid</strong>
              <span>$${order.amountPaid.toFixed(2)}</span>
            </div>
          </div>
          
          <h2>Your Items</h2>
          <table class="products-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Image</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.product.name}</td>
                  <td>$${item.price.toFixed(2)}</td>
                  <td>${item.quantity}</td>
                  <td><img src="${item.product.imageUrl}" class="product-image" alt="${item.product.name}"/></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="footer">
          <p>If you have any questions about your order, please contact our support team.</p>
          <p>© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const cancelOrderHtml = (options: {
  customerName: string;
  orderId: string;
  orderDate: string;
  cancellationReason: string;
  currentYear?: number;
}) => {
  const currentYear = options.currentYear || new Date().getFullYear();
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Cancellation Confirmation</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 1px solid #eee;
        }
        .logo {
            max-width: 150px;
        }
        .content {
            padding: 20px 0;
        }
        .order-details {
            background: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .status-badge {
            display: inline-block;
            padding: 5px 10px;
            background-color: #f44336;
            color: white;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
        .footer {
            text-align: center;
            padding: 20px 0;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="header">
        <img src="https://media.licdn.com/dms/image/v2/C4E0BAQHQRAYsiA57xw/company-logo_200_200/company-logo_200_200/0/1630623985979?e=2147483647&v=beta&t=hw6OYJ8fxliqVBp5oijGJ_zTdjRB1BinYT7Qu2hBFLA" alt="Company Logo" class="logo">
        <h1>Order Cancellation Confirmation</h1>
    </div>
    
    <div class="content">
        <p>Dear ${options.customerName},</p>
        
        <p>We've processed your request to cancel the following order:</p>
        
        <div class="order-details">
            <span class="status-badge">CANCELLED</span>
            <p><strong>Order ID:</strong> ${options.orderId}</p>
            <p><strong>Order Date:</strong> ${options.orderDate}</p>
            <p><strong>Cancellation Reason:</strong> ${options.cancellationReason}</p>
        </div>
        
        <p>If this cancellation was a mistake or you changed your mind, you can place a new order:</p>
        
        <a href='https://www.google.com' class="button">Return to Store</a>
        
        <p>If you have any questions about your cancellation, please reply to this email or contact our support team.</p>
        
        <p>Thank you for shopping with us!</p>
    </div>
    
    <div class="footer">
        <p>&copy; ${currentYear} Tech-Era. All rights reserved.</p>
  
        <p>
           GERMANY, ILMENAU,98693 MAX-PLANCK-RING 2
        </p>
    </div>
</body>
</html>`;
};