import { Injectable, OnModuleInit } from '@nestjs/common';
import { betterAuth } from 'better-auth';
import Database from 'better-sqlite3';
import { ClientesService } from '../clientes/clientes.service.js';

@Injectable()
export class BetterAuthService implements OnModuleInit {
  public readonly auth;
  private db: Database.Database;

  constructor(private readonly clientesService: ClientesService) {
    this.db = new Database('./lowmech.db');
    
    this.auth = betterAuth({
      database: this.db,
      secret: process.env.BETTER_AUTH_SECRET || 'lowmech-secret-change-me',
      baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
      basePath: '/api/cliente-auth',
      trustedOrigins: [process.env.FRONTEND_URL || 'http://localhost:5173'],
      advanced: {
        defaultCookieAttributes: {
          sameSite: 'none',
          secure: true,
        },
      },
      emailAndPassword: {
        enabled: true,
        autoSignIn: true,
      },
      socialProviders: {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID || '',
          clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
          prompt: 'select_account',
        },
      },
      callbacks: {
        oauth: {
          async onSuccess(user, account, profile, isNewUser) {
            return {
              user,
              account,
              profile,
            };
          },
          async onError(error) {
            console.error('OAuth error:', error);
            throw error;
          },
        },
      },
      redirects: {
        afterSignIn: 'http://localhost:5173/app1/cliente/mis-ordenes?success=true',
        afterSignUp: 'http://localhost:5173/app1/cliente/mis-ordenes?success=true',
      },
      user: { modelName: 'ba_user' },
      session: { modelName: 'ba_session' },
      account: { modelName: 'ba_account' },
      verification: { modelName: 'ba_verification' },
      databaseHooks: {
        user: {
          create: {
            after: async (user) => {
              const cliente = await this.clientesService.findByEmail(user.email);
              if (cliente) {
                if (!cliente.betterAuthUserId) {
                  await this.clientesService.update(cliente.id, {
                    betterAuthUserId: user.id,
                  } as any);
                }
              } else {
                await this.clientesService.create({
                  nombre: user.name || user.email.split('@')[0],
                  email: user.email,
                  telefono: '',
                  betterAuthUserId: user.id,
                } as any);
              }
            },
          },
        },
      },
    });
  }

  /**
   * Inicializa las tablas de Better Auth si no existen
   */
  async onModuleInit() {
    try {
      await this.initializeTables();
      console.log('✅ Better Auth tables initialized');
    } catch (error) {
      console.error('❌ Error initializing Better Auth tables:', error);
    }
  }

  /**
   * Crea las tablas de Better Auth si no existen
   */
  private async initializeTables() {
    const requiredTables = ['ba_user', 'ba_session', 'ba_account', 'ba_verification'];
    const existingTables = this.db
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all() as any[];

    const existingTableNames = existingTables.map((t) => t.name);
    const missingTables = requiredTables.filter((t) => !existingTableNames.includes(t));

    if (missingTables.length === 0) {
      return; // Todas las tablas existen
    }

    // Crear tablas usando Better Auth
    const sql = `
      -- ba_user table
      CREATE TABLE IF NOT EXISTS ba_user (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        emailVerified INTEGER NOT NULL DEFAULT 0,
        name TEXT,
        image TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      -- ba_session table
      CREATE TABLE IF NOT EXISTS ba_session (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        token TEXT NOT NULL UNIQUE,
        expiresAt TEXT NOT NULL,
        ipAddress TEXT,
        userAgent TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES ba_user(id) ON DELETE CASCADE
      );

      -- ba_account table
      CREATE TABLE IF NOT EXISTS ba_account (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        accountId TEXT NOT NULL,
        providerId TEXT NOT NULL,
        refreshToken TEXT,
        accessToken TEXT,
        accessTokenExpiresAt TEXT,
        refreshTokenExpiresAt TEXT,
        scope TEXT,
        idToken TEXT,
        password TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES ba_user(id) ON DELETE CASCADE
      );

      -- ba_verification table
      CREATE TABLE IF NOT EXISTS ba_verification (
        id TEXT PRIMARY KEY,
        identifier TEXT NOT NULL,
        value TEXT NOT NULL,
        expiresAt TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_ba_session_userId ON ba_session(userId);
      CREATE INDEX IF NOT EXISTS idx_ba_account_userId ON ba_account(userId);
      CREATE INDEX IF NOT EXISTS idx_ba_verification_identifier ON ba_verification(identifier);
    `;

    sql.split(';').forEach((statement) => {
      if (statement.trim()) {
        try {
          this.db.exec(statement);
        } catch (error) {
          console.warn('Table creation warning:', error);
        }
      }
    });
  }
}
