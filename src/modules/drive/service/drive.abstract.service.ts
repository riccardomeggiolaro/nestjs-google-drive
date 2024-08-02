/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class DriveAbstractService {
    abstract upload(file: Express.Multer.File): Promise<string>;
    abstract findFile(fileName: string): Promise<string>;
    abstract existFile(fileName: string): Promise<boolean>;
}