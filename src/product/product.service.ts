import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    const unitCost = new Prisma.Decimal(createProductDto.unitCost);
    const quantity = createProductDto.quantity;
    const totalCost = unitCost.mul(quantity); // Calculate totalCost

    const product = await this.prisma.product.create({
      data: {
        name: createProductDto.name,
        description: createProductDto.description,
        category: createProductDto.category,
        unitCost: unitCost,
        quantity: quantity,
        totalCost: totalCost, // Add the missing totalCost field
      },
    });
    return product;
  }

  async findAll() {
    const products = await this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return products;
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException();
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException();
    }

    // Calculate new totalCost if unitCost or quantity is being updated
    const unitCost = updateProductDto.unitCost 
      ? new Prisma.Decimal(updateProductDto.unitCost) 
      : product.unitCost;
    const quantity = updateProductDto.quantity ?? product.quantity;
    const totalCost = unitCost.mul(quantity);

    const updatedData = await this.prisma.product.update({
      where: { id },
      data: {
        name: updateProductDto.name,
        description: updateProductDto.description,
        category: updateProductDto.category,
        unitCost: updateProductDto.unitCost ? new Prisma.Decimal(updateProductDto.unitCost) : undefined,
        quantity: updateProductDto.quantity,
        totalCost: totalCost, // Update totalCost as well
      },
    });
    return updatedData;
  }

  async remove(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException();
    }
    const deletedData = await this.prisma.product.delete({
      where: { id },
    });
    return deletedData;
  }
}