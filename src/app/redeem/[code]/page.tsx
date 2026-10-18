import RedeemClient from './RedeemClient';

export const metadata = {
  title: 'Redeem Reward — Taste of Village',
  description: 'Staff reward redemption page',
  robots: 'noindex, nofollow',
};

export default async function RedeemPage(props: { params: Promise<{ code: string }> }) {
  const { code } = await props.params;
  return <RedeemClient code={code.toUpperCase()} />;
}
