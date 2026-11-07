/**
 * Content for the sections under the menu. Everything marked PLACEHOLDER must be replaced
 * with Sindibad's real details before launch.
 */

/** PLACEHOLDER sample reviews — replace with real customer reviews (e.g. from Google). */
export const testimonials = {
  title: 'What our customers say',
  sampleNote: 'Sample reviews — replace with real ones',
  items: [
    { quote: 'The half chicken is unreal. Crispy skin, tender inside, and that garlic sauce.', name: 'Sample guest', meta: 'Google review', rating: 5 },
    { quote: 'Best shish tawook in Kingston. Generous plates and always fresh off the grill.', name: 'Sample guest', meta: 'Google review', rating: 5 },
    { quote: 'You can smell the charcoal from the street. The kebab plate is my go-to.', name: 'Sample guest', meta: 'Google review', rating: 5 },
    { quote: 'Friendly staff, fast service and the rice is perfect every single time.', name: 'Sample guest', meta: 'Google review', rating: 5 },
    { quote: 'Catered our office lunch — everyone asked where the food was from.', name: 'Sample guest', meta: 'Google review', rating: 5 },
  ],
}

export const loyalty = {
  title: 'Join our loyalty program',
  ghost: 'Sindibad rewards',
  headline: '10th plate on us',
  copy: 'Collect a stamp with every plate. Your tenth one is on the house.',
  perks: ['A stamp with every plate', 'Birthday treat', 'Members-only offers'],
  stamps: 10,
  filled: 7,
  cta: { label: 'Join the club', href: '#loyalty' }, // PLACEHOLDER link
}

export const catering = {
  title: 'Catering & events',
  copy: 'From office lunches to weddings, we bring the charcoal grill to you — trays of skewers, chicken, rice and all the sides.',
  tags: ['Office lunches', 'Weddings', 'Family gatherings', 'Eid & celebrations'],
  cta: { label: 'Plan your event', href: 'tel:+16130000000' }, // PLACEHOLDER phone
  secondary: { label: 'Email us', href: 'mailto:hello@example.com' }, // PLACEHOLDER email
}

/** PLACEHOLDER contact details — replace with the real address and phone. */
export const contact = {
  title: 'Get in touch',
  address: '123 Street Name, Kingston, ON',
  mapsHref: 'https://www.google.com/maps/search/?api=1&query=Sindibad+BBQ+%26+Grill+Kingston+ON',
  phone: '(613) 000-0000',
  phoneHref: 'tel:+16130000000',
  social: [
    { label: 'Instagram', href: '#' },
    { label: 'Facebook', href: '#' },
  ],
}
