import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CustomersService } from './customers.service'
import { CreateCustomerDto, UpdateCustomerDto, CustomerResponseDto } from '../dtos/customer.dto'

@Controller('customers')
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllCustomers(@Request() req): Promise<CustomerResponseDto[]> {
    return this.customersService.findAll(req.user.organizationId)
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createCustomer(
    @Request() req,
    @Body() createCustomerDto: CreateCustomerDto,
  ): Promise<CustomerResponseDto> {
    return this.customersService.create(createCustomerDto, req.user.organizationId)
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getCustomer(@Request() req, @Param('id') id: string): Promise<CustomerResponseDto> {
    return this.customersService.findById(parseInt(id), req.user.organizationId)
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateCustomer(
    @Request() req,
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerResponseDto> {
    return this.customersService.update(parseInt(id), updateCustomerDto, req.user.organizationId)
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteCustomer(@Request() req, @Param('id') id: string): Promise<CustomerResponseDto> {
    return this.customersService.delete(parseInt(id), req.user.organizationId)
  }
}
