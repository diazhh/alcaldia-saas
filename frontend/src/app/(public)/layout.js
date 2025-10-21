import Link from 'next/link';
import { Home, FileText, Vote, Eye, MapPin } from 'lucide-react';

/**
 * Layout para rutas públicas (sin autenticación)
 */
export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen">
      {/* Barra de navegación pública */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
                SM
              </div>
              <span className="font-semibold text-gray-900 hidden sm:block">
                Sistema Municipal
              </span>
            </Link>

            {/* Enlaces públicos */}
            <div className="flex items-center gap-1">
              <Link
                href="/reportes"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Reportes</span>
              </Link>
              
              <Link
                href="/mapa-reportes"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Mapa</span>
              </Link>

              <Link
                href="/presupuesto-participativo"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              >
                <Vote className="h-4 w-4" />
                <span className="hidden sm:inline">Presupuesto</span>
              </Link>

              <Link
                href="/transparencia"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Transparencia</span>
              </Link>

              <Link
                href="/login"
                className="ml-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Ingresar
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido */}
      {children}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Alcaldía Municipal</h3>
              <p className="text-sm text-gray-400">
                Sistema Integral de Gestión Municipal
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Servicios</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/reportes" className="hover:text-white">
                    Reportes Ciudadanos
                  </Link>
                </li>
                <li>
                  <Link href="/presupuesto-participativo" className="hover:text-white">
                    Presupuesto Participativo
                  </Link>
                </li>
                <li>
                  <Link href="/transparencia" className="hover:text-white">
                    Portal de Transparencia
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Información</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/mapa-reportes" className="hover:text-white">
                    Mapa de Reportes
                  </Link>
                </li>
                <li>
                  <Link href="/reportes/seguimiento" className="hover:text-white">
                    Seguimiento de Reportes
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contacto</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>contacto@municipal.gob.ve</li>
                <li>+58 (212) 123-4567</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2024 Alcaldía Municipal. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
