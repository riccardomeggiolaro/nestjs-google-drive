/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";

@Injectable()
export class GoogleDriveService {
    async connect(): Promise<boolean> {
        return true
    }

    async update(): Promise<boolean> {
        return true
    }
}