import { All, Controller, Req, Res } from '@nestjs/common';
import { BetterAuthService } from './better-auth.service.js';
import type { Request, Response } from 'express';

/**
 * Convierte Express Request a Fetch API Request compatible con Better Auth
 */
function convertExpressToFetchRequest(req: Request, fullUrl: string) {
  // Crear Headers compatible con Fetch API
  const headers = new Headers(req.headers as Record<string, string>);

  // Obtener el body si existe
  let body: any = null;
  if (req.body) {
    if (typeof req.body === 'string') {
      body = req.body;
    } else {
      body = JSON.stringify(req.body);
    }
  }

  // Crear una Fetch Request simulada usando la clase Request global
  // o un polyfill si no está disponible
  try {
    return new Request(fullUrl, {
      method: req.method,
      headers,
      body: ['GET', 'HEAD'].includes(req.method) ? null : body,
    });
  } catch (error) {
    // Fallback: crear un objeto compatible si Request global no está disponible
    return {
      url: fullUrl,
      method: req.method,
      headers,
      body,
      text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
      json: async () => (typeof body === 'string' ? JSON.parse(body) : body),
    };
  }
}

@Controller('cliente-auth')
export class BetterAuthController {
  constructor(private readonly betterAuthService: BetterAuthService) {}

  @All('*')
  async handle(@Req() req: Request, @Res() res: Response) {
    try {
      const host = req.get('host') || 'localhost:3000';
      const protocol = req.protocol || 'http';
      const fullUrl = `${protocol}://${host}${req.originalUrl || req.url}`;

      console.log('Better Auth Request:', {
        method: req.method,
        url: fullUrl,
        path: req.path,
      });

      // Convertir Express Request a Fetch API Request
      const fetchRequest = convertExpressToFetchRequest(req, fullUrl);

      // Better Auth retorna una Fetch API Response
      const response = await this.betterAuthService.auth.handler(fetchRequest as any);

      if (!response) {
        return res.status(500).json({ error: 'No response from Better Auth handler' });
      }

      // Convertir Fetch Response a Express Response
      const status = response.status || 200;
      const headers = response.headers || new Headers();

      // Copiar headers de Fetch Response a Express Response
      headers.forEach((value, key) => {
        if (key.toLowerCase() !== 'content-encoding') {
          res.setHeader(key, value);
        }
      });

      // Leer el body de la Fetch Response
      const body = await response.text();

      res.status(status);
      
      // Si es un redirect (3xx), manejar redirect
      if (status >= 300 && status < 400) {
        let location = headers.get('location');
        console.log('Better Auth Redirect:', {
          status,
          location,
          originalUrl: req.originalUrl,
          path: req.path,
        });
        
        // Para otros redirects, hacer el redirect HTTP normal
        if (location && !location.startsWith('http')) {
          location = `${protocol}://${host}${location}`;
        }
        
        if (location) {
          console.log('Final redirect to:', location);
          return res.redirect(status, location);
        }
      }

      if (body) {
        try {
          // Intentar parsear como JSON
          const jsonData = JSON.parse(body);
          return res.json(jsonData);
        } catch {
          // Si no es JSON, enviar como texto
          return res.send(body);
        }
      }
      return res.send();
    } catch (error) {
      console.error('Better Auth Handler Error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
