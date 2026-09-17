export const trackAddToCart = (item: { id: string, name: string, price: number, quantity: number }) => {
  if (typeof window === 'undefined') return;
  if (window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency: 'GBP',
      value: item.price * item.quantity,
      items: [{ item_id: item.id, item_name: item.name, price: item.price, quantity: item.quantity }]
    });
  }
  if (window.fbq) {
    window.fbq('track', 'AddToCart', { content_ids: [item.id], content_name: item.name, value: item.price * item.quantity, currency: 'GBP' });
  }
};

export const trackInitiateCheckout = (total: number, items: any[]) => {
  if (typeof window === 'undefined') return;
  if (window.gtag) {
    window.gtag('event', 'begin_checkout', {
      currency: 'GBP', value: total,
      items: items.map(item => ({ item_id: item.id, item_name: item.name, price: item.price, quantity: item.quantity }))
    });
  }
  if (window.fbq) {
    window.fbq('track', 'InitiateCheckout', { value: total, currency: 'GBP', num_items: items.reduce((acc: number, curr: any) => acc + curr.quantity, 0) });
  }
};

export const trackBranchSelect = (branchId: string, branchName: string) => {
  if (typeof window === 'undefined') return;
  if (window.gtag) {
    window.gtag('event', 'select_content', { content_type: 'restaurant_branch', item_id: branchId, branch_name: branchName });
  }
  if (window.clarity) {
    window.clarity('set', 'branch_id', branchId);
    window.clarity('event', 'branch_selected');
  }
};

export const trackOrderPlaced = (orderId: string, total: number, items: any[]) => {
  if (typeof window === 'undefined') return;
  if (window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: orderId, value: total, currency: 'GBP',
      items: items.map(item => ({ item_id: item.id, item_name: item.name, price: item.price, quantity: item.quantity }))
    });
  }
  if (window.fbq) { window.fbq('track', 'Purchase', { value: total, currency: 'GBP' }); }
  if (window.clarity) { window.clarity('event', 'purchase_completed'); }
};

export const trackRemoveFromCart = (item: { id: string, name: string, price: number }) => {
  if (typeof window === 'undefined') return;
  if (window.gtag) {
    window.gtag('event', 'remove_from_cart', {
      currency: 'GBP',
      value: item.price,
      items: [{ item_id: item.id, item_name: item.name, price: item.price }]
    });
  }
};

export const trackClearCart = () => {
  if (typeof window === 'undefined') return;
  if (window.gtag) {
    window.gtag('event', 'remove_from_cart', { currency: 'GBP' });
  }
};

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    clarity?: (...args: any[]) => void;
  }
}
