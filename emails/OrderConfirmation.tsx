import React from 'react';

interface OrderConfirmationEmailProps {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  orderDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    color?: string;
    finish?: string;
    image?: string;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  estimatedDelivery?: string;
}

export const OrderConfirmationEmail: React.FC<OrderConfirmationEmailProps> = ({
  orderNumber,
  customerName,
  customerEmail,
  orderDate,
  items,
  subtotal,
  shipping,
  total,
  shippingAddress,
  estimatedDelivery,
}) => {
  const formatPrice = (price: number) => {
    return `€${price.toFixed(2)}`;
  };

  return (
    <html lang="lt">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Užsakymo patvirtinimas - Yakiwood</title>
      </head>
      <body style={{
        margin: 0,
        padding: 0,
        backgroundColor: '#F5F5F5',
        fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>
        <table
          cellPadding="0"
          cellSpacing="0"
          border={0}
          width="100%"
          style={{
            backgroundColor: '#F5F5F5',
            padding: '40px 20px',
          }}
        >
          <tr>
            <td align="center">
              <table
                cellPadding="0"
                cellSpacing="0"
                border={0}
                width="600"
                style={{
                  maxWidth: '600px',
                  width: '100%',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
              >
                {/* Header */}
                <tr>
                  <td style={{
                    padding: '40px 40px 32px',
                    backgroundColor: '#161616',
                    textAlign: 'center',
                  }}>
                    <div style={{
                      fontSize: '28px',
                      fontWeight: '500',
                      color: '#FFFFFF',
                      letterSpacing: '-0.5px',
                    }}>
                      YAKIWOOD
                    </div>
                  </td>
                </tr>

                {/* Main Content */}
                <tr>
                  <td style={{ padding: '40px' }}>
                    {/* Thank You Message */}
                    <h1 style={{
                      margin: '0 0 16px',
                      fontSize: '28px',
                      fontWeight: '500',
                      color: '#161616',
                      letterSpacing: '-0.5px',
                    }}>
                      Ačiū už jūsų užsakymą!
                    </h1>
                    <p style={{
                      margin: '0 0 24px',
                      fontSize: '16px',
                      lineHeight: '24px',
                      color: '#535353',
                    }}>
                      Sveiki, {customerName}! Jūsų užsakymas patvirtintas ir pradėtas ruošti.
                    </p>

                    {/* Order Details Box */}
                    <table
                      cellPadding="0"
                      cellSpacing="0"
                      border={0}
                      width="100%"
                      style={{
                        marginBottom: '32px',
                        backgroundColor: '#EAEAEA',
                        borderRadius: '8px',
                      }}
                    >
                      <tr>
                        <td style={{ padding: '24px' }}>
                          <table cellPadding="0" cellSpacing="0" border={0} width="100%">
                            <tr>
                              <td style={{
                                fontSize: '14px',
                                color: '#535353',
                                paddingBottom: '8px',
                              }}>
                                Užsakymo numeris
                              </td>
                              <td align="right" style={{
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#161616',
                                paddingBottom: '8px',
                              }}>
                                #{orderNumber}
                              </td>
                            </tr>
                            <tr>
                              <td style={{
                                fontSize: '14px',
                                color: '#535353',
                                paddingBottom: '8px',
                              }}>
                                Užsakymo data
                              </td>
                              <td align="right" style={{
                                fontSize: '14px',
                                color: '#161616',
                                paddingBottom: '8px',
                              }}>
                                {orderDate}
                              </td>
                            </tr>
                            {estimatedDelivery && (
                              <tr>
                                <td style={{
                                  fontSize: '14px',
                                  color: '#535353',
                                }}>
                                  Numatoma pristatymo data
                                </td>
                                <td align="right" style={{
                                  fontSize: '14px',
                                  color: '#161616',
                                }}>
                                  {estimatedDelivery}
                                </td>
                              </tr>
                            )}
                          </table>
                        </td>
                      </tr>
                    </table>

                    {/* Items List */}
                    <h2 style={{
                      margin: '0 0 16px',
                      fontSize: '18px',
                      fontWeight: '500',
                      color: '#161616',
                    }}>
                      Užsakyti produktai
                    </h2>
                    <table
                      cellPadding="0"
                      cellSpacing="0"
                      border={0}
                      width="100%"
                      style={{
                        marginBottom: '24px',
                        borderTop: '1px solid #E1E1E1',
                      }}
                    >
                      {items.map((item, index) => (
                        <tr key={index}>
                          <td style={{
                            padding: '16px 0',
                            borderBottom: '1px solid #E1E1E1',
                          }}>
                            <table cellPadding="0" cellSpacing="0" border={0} width="100%">
                              <tr>
                                <td width="80" style={{ paddingRight: '16px' }}>
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      width="80"
                                      height="80"
                                      style={{
                                        display: 'block',
                                        borderRadius: '8px',
                                        backgroundColor: '#EAEAEA',
                                      }}
                                    />
                                  ) : (
                                    <div style={{
                                      width: '80px',
                                      height: '80px',
                                      backgroundColor: '#EAEAEA',
                                      borderRadius: '8px',
                                    }} />
                                  )}
                                </td>
                                <td style={{ verticalAlign: 'top' }}>
                                  <div style={{
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    color: '#161616',
                                    marginBottom: '4px',
                                  }}>
                                    {item.name}
                                  </div>
                                  {(item.color || item.finish) && (
                                    <div style={{
                                      fontSize: '14px',
                                      color: '#535353',
                                      marginBottom: '4px',
                                    }}>
                                      {item.color && `Spalva: ${item.color}`}
                                      {item.color && item.finish && ' • '}
                                      {item.finish && `Apdaila: ${item.finish}`}
                                    </div>
                                  )}
                                  <div style={{
                                    fontSize: '14px',
                                    color: '#535353',
                                  }}>
                                    Kiekis: {item.quantity}
                                  </div>
                                </td>
                                <td align="right" style={{ verticalAlign: 'top' }}>
                                  <div style={{
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    color: '#161616',
                                  }}>
                                    {formatPrice(item.price * item.quantity)}
                                  </div>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      ))}
                    </table>

                    {/* Totals */}
                    <table
                      cellPadding="0"
                      cellSpacing="0"
                      border={0}
                      width="100%"
                      style={{ marginBottom: '32px' }}
                    >
                      <tr>
                        <td style={{
                          fontSize: '14px',
                          color: '#535353',
                          paddingBottom: '8px',
                        }}>
                          Tarpinė suma
                        </td>
                        <td align="right" style={{
                          fontSize: '14px',
                          color: '#161616',
                          paddingBottom: '8px',
                        }}>
                          {formatPrice(subtotal)}
                        </td>
                      </tr>
                      <tr>
                        <td style={{
                          fontSize: '14px',
                          color: '#535353',
                          paddingBottom: '16px',
                        }}>
                          Pristatymas
                        </td>
                        <td align="right" style={{
                          fontSize: '14px',
                          color: '#161616',
                          paddingBottom: '16px',
                        }}>
                          {shipping === 0 ? 'Nemokamas' : formatPrice(shipping)}
                        </td>
                      </tr>
                      <tr>
                        <td style={{
                          fontSize: '18px',
                          fontWeight: '500',
                          color: '#161616',
                          paddingTop: '16px',
                          borderTop: '2px solid #161616',
                        }}>
                          Iš viso
                        </td>
                        <td align="right" style={{
                          fontSize: '18px',
                          fontWeight: '500',
                          color: '#161616',
                          paddingTop: '16px',
                          borderTop: '2px solid #161616',
                        }}>
                          {formatPrice(total)}
                        </td>
                      </tr>
                    </table>

                    {/* Shipping Address */}
                    <h2 style={{
                      margin: '0 0 16px',
                      fontSize: '18px',
                      fontWeight: '500',
                      color: '#161616',
                    }}>
                      Pristatymo adresas
                    </h2>
                    <div style={{
                      padding: '16px',
                      backgroundColor: '#EAEAEA',
                      borderRadius: '8px',
                      marginBottom: '32px',
                    }}>
                      <p style={{
                        margin: '0 0 4px',
                        fontSize: '14px',
                        lineHeight: '20px',
                        color: '#161616',
                      }}>
                        {shippingAddress.street}
                      </p>
                      <p style={{
                        margin: '0 0 4px',
                        fontSize: '14px',
                        lineHeight: '20px',
                        color: '#161616',
                      }}>
                        {shippingAddress.postalCode} {shippingAddress.city}
                      </p>
                      <p style={{
                        margin: '0',
                        fontSize: '14px',
                        lineHeight: '20px',
                        color: '#161616',
                      }}>
                        {shippingAddress.country}
                      </p>
                    </div>

                    {/* Support Info */}
                    <div style={{
                      padding: '24px',
                      backgroundColor: '#EAEAEA',
                      borderRadius: '8px',
                      textAlign: 'center',
                    }}>
                      <p style={{
                        margin: '0 0 16px',
                        fontSize: '14px',
                        lineHeight: '20px',
                        color: '#535353',
                      }}>
                        Turite klausimų apie savo užsakymą?
                      </p>
                      <p style={{
                        margin: '0',
                        fontSize: '14px',
                        lineHeight: '20px',
                        color: '#161616',
                      }}>
                        <a href="mailto:info@yakiwood.lt" style={{
                          color: '#161616',
                          textDecoration: 'underline',
                        }}>
                          info@yakiwood.lt
                        </a>
                        {' • '}
                        <a href="tel:+370XXXXXXXX" style={{
                          color: '#161616',
                          textDecoration: 'none',
                        }}>
                          +370 XXX XXXXX
                        </a>
                      </p>
                    </div>
                  </td>
                </tr>

                {/* Footer */}
                <tr>
                  <td style={{
                    padding: '32px 40px',
                    backgroundColor: '#EAEAEA',
                    textAlign: 'center',
                  }}>
                    <p style={{
                      margin: '0 0 16px',
                      fontSize: '12px',
                      lineHeight: '18px',
                      color: '#535353',
                    }}>
                      © {new Date().getFullYear()} Yakiwood. Visos teisės saugomos.
                    </p>
                    <p style={{
                      margin: '0 0 16px',
                      fontSize: '12px',
                      lineHeight: '18px',
                      color: '#535353',
                    }}>
                      Jūs gaunate šį laišką, nes užsisakėte iš Yakiwood.
                    </p>
                    <div style={{ fontSize: '12px', color: '#535353' }}>
                      <a href="https://yakiwood.lt" style={{
                        color: '#535353',
                        textDecoration: 'underline',
                        marginRight: '16px',
                      }}>
                        Svetainė
                      </a>
                      <a href="https://yakiwood.lt/kontaktai" style={{
                        color: '#535353',
                        textDecoration: 'underline',
                        marginRight: '16px',
                      }}>
                        Kontaktai
                      </a>
                      <a href="https://yakiwood.lt/policies" style={{
                        color: '#535353',
                        textDecoration: 'underline',
                      }}>
                        Privatumo politika
                      </a>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
};

export default OrderConfirmationEmail;
