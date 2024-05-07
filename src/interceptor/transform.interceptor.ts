import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // 컨트롤러 응답을 가로채고 수정합니다.

    return next.handle().pipe(
      map((data) => {
        // 수정할 내용을 여기에 작성합니다.
        return data;
      }),
    );
  }
}
