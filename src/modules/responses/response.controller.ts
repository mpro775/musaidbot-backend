// src/modules/responses/response.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ResponseService } from './response.service';
import { CreateResponseDto } from './dto/create-response.dto';
import { UpdateResponseDto } from './dto/update-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequestWithUser } from '../../common/interfaces/request-with-user.interface';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ResponseResponseDto } from './dto/response-response.dto';

@ApiTags('Responses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('responses')
export class ResponseController {
  constructor(private readonly responseService: ResponseService) {}

  @Get()
  @ApiOperation({ summary: 'Get all auto-responses for current merchant' })
  @ApiOkResponse({
    description: 'List of responses returned.',
    type: ResponseResponseDto,
    isArray: true,
  })
  @ApiResponse({ status: 400, description: 'Missing merchantId in token.' })
  async findAll(
    @Request() req: RequestWithUser,
  ): Promise<ResponseResponseDto[]> {
    const merchantId = req.user.merchantId;
    if (!merchantId) {
      throw new BadRequestException('Missing merchantId in token');
    }
    const items = await this.responseService.findAll(merchantId);
    return items.map((r) => ({
      _id: r._id.toString(),
      merchantId: r.merchantId.toString(),
      keyword: r.keyword,
      replyText: r.replyText,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  @Post()
  @ApiOperation({ summary: 'Create a new auto-response' })
  @ApiCreatedResponse({
    description: 'Response created successfully.',
    type: ResponseResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid payload or keyword exists.',
  })
  async create(
    @Request() req: RequestWithUser,
    @Body() dto: CreateResponseDto,
  ): Promise<ResponseResponseDto> {
    const merchantId = req.user.merchantId;
    if (!merchantId) {
      throw new BadRequestException('Missing merchantId in token');
    }
    const r = await this.responseService.create(merchantId, dto);
    return {
      _id: r._id.toString(),
      merchantId: r.merchantId.toString(),
      keyword: r.keyword,
      replyText: r.replyText,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }

  @Patch(':id')
  @ApiParam({ name: 'id', description: 'Response ID', type: String })
  @ApiOperation({ summary: 'Update an existing auto-response (owner only)' })
  @ApiOkResponse({
    description: 'Response updated successfully.',
    type: ResponseResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden: Not owner.' })
  @ApiResponse({ status: 404, description: 'Response not found.' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateResponseDto,
    @Request() req: RequestWithUser,
  ): Promise<ResponseResponseDto> {
    const merchantId = req.user.merchantId;
    if (!merchantId) {
      throw new BadRequestException('Missing merchantId in token');
    }
    const r = await this.responseService.update(id, dto, merchantId);
    return {
      _id: r._id.toString(),
      merchantId: r.merchantId.toString(),
      keyword: r.keyword,
      replyText: r.replyText,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }

  @Delete(':id')
  @ApiParam({ name: 'id', description: 'Response ID', type: String })
  @ApiOperation({ summary: 'Delete an auto-response (owner only)' })
  @ApiOkResponse({ description: 'Response deleted successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Not owner.' })
  @ApiResponse({ status: 404, description: 'Response not found.' })
  async remove(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<{ message: string }> {
    const merchantId = req.user.merchantId;
    if (!merchantId) {
      throw new BadRequestException('Missing merchantId in token');
    }
    return this.responseService.remove(id, merchantId);
  }
}
