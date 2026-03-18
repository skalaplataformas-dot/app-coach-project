import './globals.css';
import Providers from '@/components/Providers';

export const metadata = {
  title: 'App Coach - Tu entrenador personal',
  description: 'Plataforma de coaching fitness con planes personalizados',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
