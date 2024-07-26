/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { GoogleDriveService } from './google-drive.service';

@Module({
    providers: [
        GoogleDriveService
    ]
})
export class GoogleDriveModule {}