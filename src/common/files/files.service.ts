import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuid } from 'uuid';

@Injectable()
export class FilesService {

  getUploadsRoot() {
    return path.join(process.cwd(), 'uploads');
  }

  generatePatientVisitPath(patientId: number, visitId: number) {
    return path.join('patients', String(patientId), 'visits', String(visitId));
  }

  ensureDir(relativePath: string) {
    const fullPath = path.join(this.getUploadsRoot(), relativePath);

    fs.mkdirSync(fullPath, { recursive: true });

    return fullPath;
  }

  generateFilename(original: string) {
    return `${uuid()}-${original}`;
  }

  moveFromTemp(tempPath: string, finalRelativePath: string) {

    const finalFullPath = path.join(this.getUploadsRoot(), finalRelativePath);

    const dir = path.dirname(finalFullPath);

    fs.mkdirSync(dir, { recursive: true });

    fs.renameSync(tempPath, finalFullPath);

    return finalRelativePath;
  }

  generatePublicUrl(storagePath: string) {
    return `/nutri/uploads/${storagePath}`;
  }

}