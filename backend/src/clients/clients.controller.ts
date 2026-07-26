import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';


@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {

  constructor(
    private clientsService: ClientsService,
  ) {}


  // Créer un client
  @Post()
create(
  @Body() createClientDto: CreateClientDto,
  @Req() req: any,
) {

  console.log('CREATION PAR:', req.user.id);

  return this.clientsService.create({
    ...createClientDto,
    userId: req.user.id,
  });

}

  // Récupérer les clients de l'utilisateur connecté
  @Get()
  findAll(
    @Req() req: any,
  ) {

    console.log('USER CONNECTE:', req.user);

    return this.clientsService.findAllByUser(
      req.user.id,
    );

  }


  // Récupérer un client par ID
  @Get(':id')
findOne(
  @Param('id') id: string,
  @Req() req: any,
) {

  return this.clientsService.findOne(
    id,
    req.user.id,
  );

}


  // Modifier un client
  @Patch(':id')
update(
  @Param('id') id: string,
  @Body() updateClientDto: UpdateClientDto,
  @Req() req: any,
) {

  return this.clientsService.update(
    id,
    req.user.id,
    updateClientDto,
  );

}


  // Supprimer un client
  @Delete(':id')
remove(
  @Param('id') id: string,
  @Req() req: any,
) {

  return this.clientsService.remove(
    id,
    req.user.id,
  );

}

}