import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { IssuePriority } from '@prisma/client';
import { UpdatePropertyDto } from './dto/update-property.dt0';

@Injectable()
export class PropertyService {
  constructor(readonly prisma: PrismaService) {}

  async createProperty(createPropertyDto: CreatePropertyDto) {
    try {
      const newProperty = await this.prisma.property.create({
        data: {
          ...createPropertyDto,
        },
      });

      return newProperty;
    } catch (err) {
      throw new InternalServerErrorException(
        'Failed to create a property ' + err,
      );
    }
  }

  async getPropertyByLandlord(landlordId: string) {
    try {
      const properties = await this.prisma.property.findMany({
        where: {
          landlordId: landlordId,
          status: {
            not: 'DELETED',
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (properties.length) {
        return properties;
      }

      throw new NotFoundException('Properties not found');
    } catch (err) {
      throw new InternalServerErrorException(
        'Failed to fetch properties ' + err,
      );
    }
  }

  async getPropertyById(id: string) {
    try {
      const property = await this.prisma.property.findUnique({
        where: {
          id,
        },
      });

      return property;
    } catch (err) {
      throw new InternalServerErrorException(
        'Failed to fetch the property ' + err,
      );
    }
  }

  private async getAvailablePropertyCount(userId: string) {
    try {
      return await this.prisma.property.count({
        where: {
          status: 'AVAILABLE',
          landlordId: userId,
        },
      });
    } catch (err) {
      throw new InternalServerErrorException(
        'Failed to fetch available property count ' + err,
      );
    }
  }

  private async getRentedProperties(userId: string) {
    try {
      const rentedProperties = await this.prisma.property.findMany({
        where: {
          status: 'RENTED',
          landlordId: userId,
        },
        select: {
          id: true,
        },
      });

      return rentedProperties.map((property) => property.id);
    } catch (err) {
      throw new InternalServerErrorException(
        'Failed to fetch rented properties ' + err,
      );
    }
  }

  private async getUniqueTenantCount(rentedPropertyIds: string[]) {
    try {
      const uniqueTenants = await this.prisma.booking.findMany({
        where: {
          propertyId: {
            in: rentedPropertyIds.map((property) => property),
          },
          status: 'APPROVED',
        },
        distinct: ['userId'],
        select: {
          userId: true,
        },
      });

      return uniqueTenants.length;
    } catch (err) {
      throw new InternalServerErrorException(
        'Failed to fetch tenant count ' + err,
      );
    }
  }
  private async getMonthlyRevenue(rentedPropertyIds: string[]) {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );
      const payments = await this.prisma.payment.findMany({
        where: {
          paidAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
          booking: {
            propertyId: {
              in: rentedPropertyIds.map((property) => property),
            },
          },
        },
      });

      return payments.reduce(
        (accumulator, currentValue) => accumulator + currentValue.amount,
        0,
      );
    } catch (err) {
      throw new InternalServerErrorException(
        'Failed to fetch monthly revenue ' + err,
      );
    }
  }

  private async getIssueCountsByPriority(rentedPropertyIds: string[]) {
    try {
      const pendingIssues = await this.prisma.issue.findMany({
        where: {
          propertyId: { in: rentedPropertyIds.map((property) => property) },
          OR: [{ status: 'OPEN' }, { status: 'IN_PROGRESS' }],
        },
      });

      const hightPriorityIssues = pendingIssues.filter(
        (issue) => issue.priority === IssuePriority.HIGH,
      );
      const lowPriorityIssues = pendingIssues.filter(
        (issue) => issue.priority === IssuePriority.LOW,
      );
      const mediumPriorityIssues = pendingIssues.filter(
        (issue) => issue.priority === IssuePriority.MEDIUM,
      );

      return {
        highPriorityCount: hightPriorityIssues.length,
        mediumPriorityCount: mediumPriorityIssues.length,
        lowPriorityCount: lowPriorityIssues.length,
      };
    } catch (err) {
      throw new InternalServerErrorException(
        'Failed to fetch issues count ' + err,
      );
    }
  }

  async getPropertiesSummaryByUser(userId: string) {
    try {
      const availablePropertyCount =
        (await this.getAvailablePropertyCount(userId)) || 0;
      const rentedProperties = await this.getRentedProperties(userId);

      let tenantCount = 0;
      let monthlyRevenue = 0;
      let highPriorityIssues = 0;
      let mediumPriorityIssues = 0;
      let lowPriorityIssues = 0;
      let rentedPropertyCount = 0;

      if (rentedProperties.length > 0) {
        rentedPropertyCount = rentedProperties.length;
        tenantCount = await this.getUniqueTenantCount(rentedProperties);
        monthlyRevenue = await this.getMonthlyRevenue(rentedProperties);

        const { highPriorityCount, mediumPriorityCount, lowPriorityCount } =
          await this.getIssueCountsByPriority(rentedProperties);

        highPriorityIssues = highPriorityCount;
        mediumPriorityIssues = mediumPriorityCount;
        lowPriorityIssues = lowPriorityCount;
      }

      const propertyOverview = {
        availablePropertyCount,
        rentedPropertyCount,
        tenantCount,
        monthlyRevenue,
        highPriorityIssues,
        mediumPriorityIssues,
        lowPriorityIssues,
      };
      return propertyOverview;
    } catch (err) {
      throw new InternalServerErrorException(
        'Failed to fetch the summary of properties ' + err,
      );
    }
  }

  async update(propertyId: string, updatePropertyDto: UpdatePropertyDto) {
    try {
      const updatedProperty = await this.prisma.property.update({
        where: { id: propertyId },
        data: { ...updatePropertyDto },
      });

      return updatedProperty;
    } catch (err) {
      throw new InternalServerErrorException(
        'Failed to to update property ' + err,
      );
    }
  }

  async delete(propertyId: string) {
    try {
      const deletedProperty = await this.prisma.property.update({
        where: { id: propertyId },
        data: {
          status: 'DELETED',
        },
      });

      return deletedProperty;
    } catch (err) {
      throw new InternalServerErrorException(
        'Failed to to delete the property ' + err,
      );
    }
  }
}
