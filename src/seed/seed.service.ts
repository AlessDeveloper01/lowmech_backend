import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../users/entities/user.entity.js';
import { Cliente } from '../clientes/entities/cliente.entity.js';
import { Vehiculo } from '../vehiculos/entities/vehiculo.entity.js';
import { Articulo } from '../inventario/entities/articulo.entity.js';
import { Servicio } from '../servicios/entities/servicio.entity.js';
import { ServicioItem } from '../servicios/entities/servicio-item.entity.js';
import { Promocion } from '../promociones/entities/promocion.entity.js';
import { Orden } from '../ordenes/entities/orden.entity.js';
import { OrdenLinea } from '../ordenes/entities/orden-linea.entity.js';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(Cliente)
    private readonly clientesRepo: Repository<Cliente>,
    @InjectRepository(Vehiculo)
    private readonly vehiculosRepo: Repository<Vehiculo>,
    @InjectRepository(Articulo)
    private readonly articulosRepo: Repository<Articulo>,
    @InjectRepository(Servicio)
    private readonly serviciosRepo: Repository<Servicio>,
    @InjectRepository(ServicioItem)
    private readonly servicioItemsRepo: Repository<ServicioItem>,
    @InjectRepository(Promocion)
    private readonly promocionesRepo: Repository<Promocion>,
    @InjectRepository(Orden)
    private readonly ordenesRepo: Repository<Orden>,
    @InjectRepository(OrdenLinea)
    private readonly ordenLineasRepo: Repository<OrdenLinea>,
  ) {}

  async onModuleInit() {
    const userCount = await this.usersRepo.count();
    if (userCount === 0) {
      const admin = this.usersRepo.create({
        username: 'admin',
        password: await bcrypt.hash('admin123', 10),
        nombre: 'Administrador',
        apellido: 'Sistema',
        email: 'admin@lowmech.com',
        rol: UserRole.ADMIN,
        activo: true,
      });
      await this.usersRepo.save(admin);
      this.logger.log('Usuario admin creado: admin / admin123');
    }

    const clienteCount = await this.clientesRepo.count();
    if (clienteCount === 0) {
      const clientes = this.clientesRepo.create([
        {
          nombre: 'Carlos Ramirez',
          telefono: '555-123-4567',
          email: 'carlos@email.com',
          direccion: 'Av. Reforma 123, Col. Centro',
          rfc: 'RABC850312AB1',
          notas: 'Cliente frecuente, prefiere aceite sintetico',
        },
        {
          nombre: 'Maria Lopez',
          telefono: '555-987-6543',
          email: 'maria@email.com',
          direccion: 'Calle Juarez 456, Col. Norte',
          rfc: 'LOPM900515CD2',
          notas: '',
        },
        {
          nombre: 'Ana Garcia',
          telefono: '555-456-7890',
          email: 'ana@email.com',
          direccion: 'Blvd. Insurgentes 789, Col. Sur',
          rfc: 'GAAA880720EF3',
          notas: 'Siempre pide factura',
        },
        {
          nombre: 'Jose Martinez',
          telefono: '555-321-0987',
          email: 'jose@email.com',
          direccion: 'Av. Universidad 321, Col. Del Valle',
          rfc: 'MAJM750101GH4',
          notas: 'Tiene 2 vehiculos registrados',
        },
        {
          nombre: 'Pedro Sanchez',
          telefono: '555-789-0123',
          email: 'pedro@email.com',
          direccion: 'Calle Morelos 654, Col. Industrial',
          rfc: 'SAPR920909IJ5',
          notas: '',
        },
      ]);
      await this.clientesRepo.save(clientes);
      this.logger.log('5 clientes de ejemplo creados');
    }

    const vehiculoCount = await this.vehiculosRepo.count();
    if (vehiculoCount === 0) {
      const vehiculos = this.vehiculosRepo.create([
        {
          nombre: 'Toyota Corolla 2020',
          marca: 'Toyota',
          modelo: 'Corolla',
          anio: '2020',
          placa: 'ABC-123-D',
          color: 'Blanco',
          vin: '2T1BURHE8KC123456',
          kilometraje: 45230,
          combustible: 'Gasolina',
          clienteNombre: 'Carlos Ramirez',
          clienteTelefono: '555-123-4567',
          clienteEmail: 'carlos@email.com',
          estado: 'en_taller' as const,
          notas: 'Cliente frecuente, mantener aceite sintetico',
        },
        {
          nombre: 'Honda Civic 2019',
          marca: 'Honda',
          modelo: 'Civic',
          anio: '2019',
          placa: 'XYZ-789-F',
          color: 'Negro',
          vin: '2HGFC2F59KH543210',
          kilometraje: 62000,
          combustible: 'Gasolina',
          clienteNombre: 'Maria Lopez',
          clienteTelefono: '555-987-6543',
          clienteEmail: 'maria@email.com',
          estado: 'en_taller' as const,
          notas: '',
        },
        {
          nombre: 'Nissan Sentra 2018',
          marca: 'Nissan',
          modelo: 'Sentra',
          anio: '2018',
          placa: 'GHI-321-H',
          color: 'Gris',
          vin: '3N1AB7AP8JY654321',
          kilometraje: 78000,
          combustible: 'Gasolina',
          clienteNombre: 'Ana Garcia',
          clienteTelefono: '555-456-7890',
          clienteEmail: 'ana@email.com',
          estado: 'disponible' as const,
          notas: 'Ultimo servicio: afinacion completa',
        },
        {
          nombre: 'Ford F-150 2021',
          marca: 'Ford',
          modelo: 'F-150',
          anio: '2021',
          placa: 'DEF-456-G',
          color: 'Azul',
          vin: '1FTFW1E86MFA12345',
          kilometraje: 35000,
          combustible: 'Gasolina',
          clienteNombre: 'Jose Martinez',
          clienteTelefono: '555-321-0987',
          clienteEmail: 'jose@email.com',
          estado: 'en_espera' as const,
          notas: 'Esperando refacciones de motor',
        },
        {
          nombre: 'Mazda 3 2022',
          marca: 'Mazda',
          modelo: '3',
          anio: '2022',
          placa: 'JKL-654-M',
          color: 'Rojo',
          vin: '3MZBM1M70NM789012',
          kilometraje: 18500,
          combustible: 'Gasolina',
          clienteNombre: 'Pedro Sanchez',
          clienteTelefono: '555-789-0123',
          clienteEmail: 'pedro@email.com',
          estado: 'disponible' as const,
          notas: 'Vehiculo nuevo, primer servicio pendiente',
        },
      ]);
      await this.vehiculosRepo.save(vehiculos);
      this.logger.log('5 vehiculos de ejemplo creados');
    }

    const articuloCount = await this.articulosRepo.count();
    if (articuloCount === 0) {
      const articulos = this.articulosRepo.create([
        {
          nombre: 'Aceite Sintetico 5W-30',
          sku: 'OIL-5W30-001',
          categoria: 'Aceites',
          stock: 3,
          stockMinimo: 10,
          unidad: 'Litros',
          precioCompra: 85,
          precioVenta: 120,
          proveedor: 'Lubricantes SA',
          ubicacion: 'Estante A-1',
          notas: '',
        },
        {
          nombre: 'Filtro de Aceite Premium',
          sku: 'FLT-OIL-001',
          categoria: 'Filtros',
          stock: 2,
          stockMinimo: 8,
          unidad: 'Piezas',
          precioCompra: 150,
          precioVenta: 220,
          proveedor: 'Filtros del Norte',
          ubicacion: 'Estante B-2',
          notas: 'Compatible con Toyota/Honda',
        },
        {
          nombre: 'Pastillas de Freno Delanteras',
          sku: 'BRK-FRT-001',
          categoria: 'Frenos',
          stock: 5,
          stockMinimo: 6,
          unidad: 'Pares',
          precioCompra: 280,
          precioVenta: 450,
          proveedor: 'Frenos MX',
          ubicacion: 'Estante C-1',
          notas: '',
        },
        {
          nombre: 'Bujias NGK Platinum',
          sku: 'SPK-NGK-001',
          categoria: 'Encendido',
          stock: 8,
          stockMinimo: 12,
          unidad: 'Piezas',
          precioCompra: 120,
          precioVenta: 180,
          proveedor: 'NGK Distribuidores',
          ubicacion: 'Estante D-3',
          notas: '',
        },
        {
          nombre: 'Correa de Distribucion',
          sku: 'BLT-DIS-001',
          categoria: 'Transmision',
          stock: 1,
          stockMinimo: 4,
          unidad: 'Piezas',
          precioCompra: 450,
          precioVenta: 750,
          proveedor: 'Gates Mexico',
          ubicacion: 'Estante E-1',
          notas: '',
        },
      ]);
      await this.articulosRepo.save(articulos);
      this.logger.log('5 articulos de inventario de ejemplo creados');
    }

    const servicioCount = await this.serviciosRepo.count();
    if (servicioCount === 0) {
      const allArticulos = await this.articulosRepo.find();
      if (allArticulos.length >= 5) {
        const s1 = await this.serviciosRepo.save(
          this.serviciosRepo.create({
            nombre: 'Cambio de Aceite',
            descripcion: 'Cambio de aceite sintetico con filtro incluido',
            categoria: 'Mantenimiento',
            precioManoObra: 250,
            duracionMinutos: 45,
            activo: true,
            notas: 'Servicio mas solicitado',
          }),
        );
        await this.servicioItemsRepo.save(
          this.servicioItemsRepo.create([
            { servicioId: s1.id, articuloId: allArticulos[0].id, cantidad: 4 },
            { servicioId: s1.id, articuloId: allArticulos[1].id, cantidad: 1 },
          ]),
        );

        const s2 = await this.serviciosRepo.save(
          this.serviciosRepo.create({
            nombre: 'Afinacion Mayor',
            descripcion:
              'Afinacion completa: aceite, filtro, bujias y revision general',
            categoria: 'Mantenimiento',
            precioManoObra: 800,
            duracionMinutos: 120,
            activo: true,
            notas: '',
          }),
        );
        await this.servicioItemsRepo.save(
          this.servicioItemsRepo.create([
            { servicioId: s2.id, articuloId: allArticulos[0].id, cantidad: 4 },
            { servicioId: s2.id, articuloId: allArticulos[1].id, cantidad: 1 },
            { servicioId: s2.id, articuloId: allArticulos[3].id, cantidad: 4 },
          ]),
        );

        const s3 = await this.serviciosRepo.save(
          this.serviciosRepo.create({
            nombre: 'Servicio de Frenos',
            descripcion: 'Cambio de pastillas de freno delanteras',
            categoria: 'Frenos',
            precioManoObra: 500,
            duracionMinutos: 90,
            activo: true,
            notas: '',
          }),
        );
        await this.servicioItemsRepo.save(
          this.servicioItemsRepo.create([
            { servicioId: s3.id, articuloId: allArticulos[2].id, cantidad: 1 },
          ]),
        );

        this.logger.log('3 servicios de ejemplo creados con articulos');
      }
    }

    // --- Seed mecánicos ---
    const mecanicoCount = await this.usersRepo.count({
      where: { rol: UserRole.MECANICO },
    });
    if (mecanicoCount === 0) {
      const mecanicos = this.usersRepo.create([
        {
          username: 'luis.hernandez',
          password: await bcrypt.hash('mech123', 10),
          nombre: 'Luis',
          apellido: 'Hernandez',
          email: 'luis@lowmech.com',
          rol: UserRole.MECANICO,
          activo: true,
        },
        {
          username: 'roberto.diaz',
          password: await bcrypt.hash('mech123', 10),
          nombre: 'Roberto',
          apellido: 'Diaz',
          email: 'roberto@lowmech.com',
          rol: UserRole.MECANICO,
          activo: true,
        },
        {
          username: 'manuel.torres',
          password: await bcrypt.hash('mech123', 10),
          nombre: 'Manuel',
          apellido: 'Torres',
          email: 'manuel@lowmech.com',
          rol: UserRole.MECANICO,
          activo: true,
        },
      ]);
      await this.usersRepo.save(mecanicos);
      this.logger.log('3 mecanicos de ejemplo creados');
    }

    // --- Seed promociones ---
    const promoCount = await this.promocionesRepo.count();
    if (promoCount === 0) {
      const hoy = new Date();
      const enUnMes = new Date(hoy);
      enUnMes.setMonth(enUnMes.getMonth() + 1);
      const fi = hoy.toISOString().split('T')[0];
      const ff = enUnMes.toISOString().split('T')[0];

      const promos = this.promocionesRepo.create([
        {
          nombre: 'Mantenimiento Basico 20%',
          descripcion: 'Descuento del 20% en servicios de mantenimiento basico',
          tipo: 'porcentaje',
          valor: 20,
          codigo: 'MANT20',
          fechaInicio: fi,
          fechaFin: ff,
          activa: true,
          usosMaximos: 50,
          usosActuales: 0,
          condiciones: 'Aplica solo en cambios de aceite y afinaciones',
        },
        {
          nombre: 'Cliente Frecuente 15%',
          descripcion: 'Descuento del 15% para clientes frecuentes',
          tipo: 'porcentaje',
          valor: 15,
          codigo: 'FREQ15',
          fechaInicio: fi,
          fechaFin: ff,
          activa: true,
          usosMaximos: 100,
          usosActuales: 0,
          condiciones: 'Presentar tarjeta de cliente frecuente',
        },
        {
          nombre: 'Descuento $500 Frenos',
          descripcion: '$500 de descuento en servicio de frenos',
          tipo: 'monto',
          valor: 500,
          codigo: 'FRENOS500',
          fechaInicio: fi,
          fechaFin: ff,
          activa: true,
          usosMaximos: 30,
          usosActuales: 0,
          condiciones: 'Aplica solo en servicio completo de frenos',
        },
        {
          nombre: 'Revision Gratis',
          descripcion: 'Revision diagnostica gratuita',
          tipo: 'monto',
          valor: 300,
          codigo: 'REVGRATIS',
          fechaInicio: fi,
          fechaFin: ff,
          activa: true,
          usosMaximos: 20,
          usosActuales: 0,
          condiciones: 'Solo con cita previa',
        },
      ]);
      await this.promocionesRepo.save(promos);
      this.logger.log('4 promociones de ejemplo creadas');
    }

    // --- Seed ordenes ---
    const ordenCount = await this.ordenesRepo.count();
    if (ordenCount === 0) {
      const allClientes = await this.clientesRepo.find();
      const allVehiculos = await this.vehiculosRepo.find();
      const allMecanicos = await this.usersRepo.find({
        where: { rol: UserRole.MECANICO },
      });
      const allServicios = await this.serviciosRepo.find({
        relations: ['items'],
      });
      const allArticulos = await this.articulosRepo.find();

      if (
        allClientes.length >= 3 &&
        allVehiculos.length >= 3 &&
        allMecanicos.length >= 2 &&
        allServicios.length >= 2
      ) {
        const hoy = new Date().toISOString().split('T')[0];

        const o1 = await this.ordenesRepo.save(
          this.ordenesRepo.create({
            clienteId: allClientes[0].id,
            vehiculoId: allVehiculos[0].id,
            mecanicoId: allMecanicos[0].id,
            diagnostico:
              'Cambio de aceite programado, cliente reporta ruido en frenos',
            notas: 'Cliente frecuente',
            fechaIngreso: hoy,
            fechaPromesa: hoy,
            prioridad: 'media',
            estado: 'en_progreso',
            anticipo: 500,
            descuento: 0,
          }),
        );
        await this.ordenLineasRepo.save(
          this.ordenLineasRepo.create([
            {
              ordenId: o1.id,
              tipo: 'servicio',
              servicioId: allServicios[0].id,
              descripcion: allServicios[0].nombre,
              cantidad: 1,
              precioUnitario: 730,
            },
            {
              ordenId: o1.id,
              tipo: 'refaccion',
              articuloId: allArticulos[2].id,
              descripcion: allArticulos[2].nombre,
              cantidad: 1,
              precioUnitario: allArticulos[2].precioVenta,
            },
          ]),
        );

        const o2 = await this.ordenesRepo.save(
          this.ordenesRepo.create({
            clienteId: allClientes[1].id,
            vehiculoId: allVehiculos[1].id,
            mecanicoId: allMecanicos[1].id,
            diagnostico: 'Afinacion mayor con cambio de bujias',
            notas: '',
            fechaIngreso: hoy,
            fechaPromesa: hoy,
            prioridad: 'alta',
            estado: 'recibido',
            anticipo: 0,
            descuento: 0,
          }),
        );
        await this.ordenLineasRepo.save(
          this.ordenLineasRepo.create([
            {
              ordenId: o2.id,
              tipo: 'servicio',
              servicioId: allServicios[1].id,
              descripcion: allServicios[1].nombre,
              cantidad: 1,
              precioUnitario: 1520,
            },
          ]),
        );

        const o3 = await this.ordenesRepo.save(
          this.ordenesRepo.create({
            clienteId: allClientes[2].id,
            vehiculoId: allVehiculos[2].id,
            mecanicoId: allMecanicos[2].id,
            diagnostico: 'Revision general, vehiculo presenta calentamiento',
            notas: 'Urgente - vehiculo se calienta rapido',
            fechaIngreso: hoy,
            fechaPromesa: hoy,
            prioridad: 'urgente',
            estado: 'diagnostico',
            anticipo: 1000,
            descuento: 0,
          }),
        );
        await this.ordenLineasRepo.save(
          this.ordenLineasRepo.create([
            {
              ordenId: o3.id,
              tipo: 'servicio',
              servicioId: allServicios[2].id,
              descripcion: allServicios[2].nombre,
              cantidad: 1,
              precioUnitario: 950,
            },
            {
              ordenId: o3.id,
              tipo: 'refaccion',
              articuloId: allArticulos[4].id,
              descripcion: allArticulos[4].nombre,
              cantidad: 1,
              precioUnitario: allArticulos[4].precioVenta,
            },
          ]),
        );

        this.logger.log('3 ordenes de ejemplo creadas con lineas');
      }
    }
  }
}
