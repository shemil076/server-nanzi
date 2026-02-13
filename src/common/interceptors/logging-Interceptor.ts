import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import chalk from 'chalk';
import { catchError, Observable, tap, throwError } from 'rxjs';

export class LoggingInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const req = context.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const method = req.method;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const url = req.url;
    const now = Date.now();

    console.log(chalk.blue(`➡️ Request: ${method} ${url}`));

    return next.handle().pipe(
      tap(() =>
        console.log(
          chalk.green(`⬅️ Response: ${method} ${url} - ${Date.now() - now}ms`),
        ),
      ),

      catchError((error) => {
        console.log(
          chalk.red(
            `❌ Error: ${method} ${url} - ${Date.now() - now}ms`,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            error.message || error,
          ),
        );
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return throwError(() => error);
      }),
    );
  }
}
