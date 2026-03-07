// ============================================================
// helpers.js — Reusable utility functions and constants
// ============================================================


// -------------------------------------------------------
// formatPrice
// Converts a number to a readable Pakistani price format
// Example: 5000000 → "PKR 50.0 Lac"
// Example: 15000000 → "PKR 1.5 Crore"
// -------------------------------------------------------
export function formatPrice(price) {
  // If no price given, show a placeholder
  if (!price && price !== 0) {
    return 'PKR --';
  }

  if (price >= 10000000) {
    // 1 Crore = 10,000,000
    const crores = (price / 10000000).toFixed(1);
    return `PKR ${crores} Crore`;
  }

  if (price >= 100000) {
    // 1 Lac = 100,000
    const lacs = (price / 100000).toFixed(1);
    return `PKR ${lacs} Lac`;
  }

  // For smaller numbers, show with commas
  return `PKR ${price.toLocaleString()}`;
}


// -------------------------------------------------------
// timeAgo
// Converts a date into a human-readable "time ago" string
// Example: 5 minutes ago → "5m ago"
// -------------------------------------------------------
export function timeAgo(date) {
  if (!date) return '';

  const now = Date.now();
  const then = new Date(date).getTime();
  const diffInMs = now - then;

  const minutes = Math.floor(diffInMs / (1000 * 60));
  const hours = Math.floor(diffInMs / (1000 * 60 * 60));
  const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  if (months < 12) return `${months}mo ago`;
  return `${years}y ago`;
}


// -------------------------------------------------------
// List of Pakistani cities for dropdowns
// -------------------------------------------------------
export const CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Bahawalpur',
  'Hyderabad',
  'Gujranwala',
];


// -------------------------------------------------------
// Property type options for dropdowns
// -------------------------------------------------------
export const PROPERTY_TYPES = [
  'house',
  'apartment',
  'villa',
  'commercial',
  'plot',
];


// -------------------------------------------------------
// Common property features for checkboxes
// -------------------------------------------------------
export const FEATURES = [
  'Parking',
  'Garden',
  'Swimming Pool',
  'Gym',
  'Security',
  'Generator',
  'Gas',
  'Electricity',
  'Water Supply',
  'Furnished',
  'Air Conditioning',
  'Rooftop',
];
