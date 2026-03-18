import './globals.css';
import Providers from '@/components/Providers';

export const metadata = {
  title: 'FitBro - Tu coach de fitness inteligente',
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
