import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rudimentary openai agent with Langchain',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
