// Edit these values to update contact details across the whole site.
export const siteConfig = {
  name: 'Crescent Construction',
  tagline: 'Building Today, Creating Tomorrow',
  phone: '03272834501',
  phoneDisplay: '0327 2834501',
  phoneHref: 'tel:+923272834501',
  whatsapp: '03272834501',
  whatsappDisplay: '0327 2834501',
  whatsappHref:
    'https://wa.me/923272834501?text=' +
    encodeURIComponent('Hello Crescent Construction, I would like to discuss my construction project.'),
  email: 'crescentconstructionofficial@gmail.com',
  emailHref: 'mailto:crescentconstructionofficial@gmail.com',
  address: 'Gulshan-e-Iqbal Block 13 D3, Panama Centre, Office No. M-07',
  addressShort: 'Gulshan-e-Iqbal Block 13 D3, Karachi',
  directionsHref:
    'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent('Panama Centre, Block 13 D3, Gulshan-e-Iqbal, Karachi'),
  mapsEmbedSrc: 'https://maps.google.com/maps?q=Panama%20Centre,%20Block%2013%20D3,%20Gulshan-e-Iqbal,%20Karachi&t=&z=15&ie=UTF8&iwloc=&output=embed',
  social: {
    facebook: 'https://web.facebook.com/crescent.construction/',
    instagram: 'https://www.instagram.com/crescentconstruction11?stkn=b2RqM3d3MmtsYzZw',
  },
}

// Builds a wa.me link pre-filled with the given message text
export function buildWhatsAppLink(message: string) {
  return `https://wa.me/923272834501?text=${encodeURIComponent(message)}`
}
