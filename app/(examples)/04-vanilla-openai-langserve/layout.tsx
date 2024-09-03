import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'vanilla openai chat with langserve backend.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
