/* eslint-disable prettier/prettier */
import { Controller, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileCsvPipe } from 'src/core/pipes/file-csv.pipe';
import { DriveAbstractService } from 'src/modules/drive/service/drive.abstract.service';

@Controller('drive')
export class DriveController {
    constructor(private readonly driveService: DriveAbstractService) {}

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile(new FileCsvPipe()) file: Express.Multer.File): Promise<{fileId: string}> {
        const fileId = await this.driveService.upload(file);
        return {
            fileId
        };
    }

    @Get('find/:fileName')
    async findFile(@Param('fileName') fileName: string): Promise<{fileId: string}> {
        const fileId = await this.driveService.findFile(fileName);
        return {
            fileId
        };
    }

    @Get('exist/:fileName')
    async existFile(@Param('fileName') fileName: string): Promise<{exist: boolean}> {
        const exist = await this.driveService.existFile(fileName);
        return {
            exist
        };
    }
}
