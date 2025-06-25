import * as path from 'path';
import { Observable, of } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { fork } from 'child_process';
import { switchMap, catchError, timeout } from 'rxjs/operators';
import { AxiosResponse } from 'axios';

import { GeneratePdfDto } from '../dto/pdf.dto';
import { MessageResponse, PaylodToService } from '../interfaces/response';

const PATH_TO_PDF = '../scripts/generate-pdf.js';

@Injectable()
export class PdfService {
  constructor(private readonly httpService: HttpService) {}

  runGeneratePdf(data: GeneratePdfDto) {
    const getFile = path.resolve(__dirname, PATH_TO_PDF);

    return this.createChildProcess(getFile, { data }).pipe(
      switchMap((message: MessageResponse) => {
        if (!message.status) {
          return of({
            status: message.status,
            message: message.error || 'PDF generation failed',
          });
        }

        const payload: PaylodToService = {
          callbackUrl: data.callbackUrl,
          body: {
            orderId: data.orderId,
            path: message.path,
            status: message.status,
          },
        };

        return this.fetchCallback(payload).pipe(
          switchMap((response) => of(response.data)),
        );
      }),
      timeout(30000),
      catchError((error: unknown) => {
        if (
          error &&
          typeof error === 'object' &&
          'name' in error &&
          error.name === 'TimeoutError'
        ) {
          return of({ status: false, message: 'PDF generation timeout' });
        }

        let errorMessage = 'Unknown error';
        if (error && typeof error === 'object' && 'message' in error) {
          errorMessage = String(error.message) || 'Unknown error';
        } else if (typeof error === 'string') {
          errorMessage = error;
        }

        return of({
          status: false,
          message: errorMessage,
        });
      }),
    );
  }

  private fetchCallback(payload: PaylodToService): Observable<AxiosResponse> {
    return this.httpService.post(payload.callbackUrl, payload.body);
  }

  private createChildProcess(scriptPath: string, data) {
    return new Observable((subscriber) => {
      const child = fork(scriptPath);

      const handleMessage = (message) => {
        subscriber.next(message);
        subscriber.complete();
      };

      const handleError = (error) => {
        subscriber.error(error);
      };

      const handleExit = (code) => {
        if (code !== 0 && code !== null) {
          subscriber.error(new Error(`Process ${code}`));
        }
      };

      child.on('message', handleMessage);
      child.on('error', handleError);
      child.on('exit', handleExit);

      child.send(data);

      return () => {
        child.removeListener('message', handleMessage);
        child.removeListener('error', handleError);
        child.removeListener('exit', handleExit);
      };
    });
  }
}
