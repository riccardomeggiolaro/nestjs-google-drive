/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { Readable } from 'stream';
import { GoogleServiceAccount } from '../interface/google.interface';
import { DriveAbstractService } from './drive.abstract.service';

@Injectable()
export class GoogleDriveService extends DriveAbstractService {
    private readonly FOLDER_ID: string;
    private readonly SCOPE: string[];
    private readonly API_KEYS: GoogleServiceAccount;

    constructor(private readonly configService: ConfigService) {
        super();
        this.FOLDER_ID = this.configService.get<string>('FOLDER_ID');
        this.SCOPE = [this.configService.get<string>('SCOPE')];
        this.API_KEYS = JSON.parse(this.configService.get<string>('API_KEYS'))
    }

    private async authorize(): Promise<any> {
        const authClient = new google.auth.JWT(
            this.API_KEYS.client_email,
            null,
            this.API_KEYS.private_key,
            this.SCOPE
        );
        await authClient.authorize();
        const drive = google.drive({ version: 'v3', auth: authClient });
        return drive;
    }

    private async find(drive: any, fileName: string): Promise<string | null> {
        try {
            const response = await drive.files.list({
                q: `name='${fileName}' and '${this.FOLDER_ID}' in parents and trashed=false`,
                fields: 'files(id, name)',
                spaces: 'drive'
            });

            if (response.data.files.length > 0) {
                return response.data.files[0].id;
            } else {
                return null;
            }
        } catch (error) {
            throw new BadRequestException(`Failed to search for file in Google Drive: ${error.message}`);
        }
    }

    async upload(file: Express.Multer.File): Promise<string> {
        try {
            const drive = await this.authorize();
            // Check if a file with the same name already exists
            const existingFileId = await this.find(drive, file.originalname);
            if (existingFileId) {
                throw new BadRequestException('A file with the same name already exists in the specified folder');
            }

            // Create a readable stream from the buffer
            const bufferStream = new Readable();
            bufferStream.push(file.buffer);
            bufferStream.push(null);

            const response = await drive.files.create({
                requestBody: {
                    name: file.originalname,
                    parents: [this.FOLDER_ID]
                },
                media: {
                    body: bufferStream,
                    mimeType: file.mimetype
                },
                fields: 'id'
            });

            if (response.data.id) {
                return response.data.id;
            } else {
                throw new NotFoundException('File upload successful but no ID was returned');
            }
        } catch (error) {
            throw new BadRequestException(`Failed to upload file to Google Drive: ${error.message}`);
        }
    }

    async findFile(fileName: string): Promise<string> {
        const drive = await this.authorize();
        const file = await this.find(drive, fileName);
        if (!file) throw new NotFoundException();
        return file;
    }

    async existFile(fileName: string): Promise<boolean> {
        const drive = await this.authorize();
        const file = await this.find(drive, fileName);
        return file ? true : false;
    }
}