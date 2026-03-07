export const formatPrice = (price) => {
  if (price >= 10000000) return `PKR ${(price / 10000000).toFixed(1)} Crore`;
  if (price >= 100000) return `PKR ${(price / 100000).toFixed(1)} Lac`;
  return `PKR ${price?.toLocaleString()}`;
};

export const CITIES = ['Karachi','Lahore','Islamabad','Rawalpindi','Faisalabad','Multan','Peshawar','Quetta','Sialkot','Bahawalpur','Hyderabad','Gujranwala'];

export const PROPERTY_TYPES = ['house','apartment','villa','commercial','plot'];

export const FEATURES = ['Parking','Garden','Swimming Pool','Gym','Security','Generator','Gas','Electricity','Water Supply','Furnished','Air Conditioning','Rooftop'];

export const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
};
