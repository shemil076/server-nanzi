import { Injectable } from '@nestjs/common';
import { subscribe } from 'diagnostics_channel';
import { Observable } from 'rxjs';
import { json } from 'stream/consumers';

@Injectable()
export class ChatService {
  streamFromFastApi(message: string): Observable<MessageEvent> {
    return new Observable((subscriber) => {
      const controller = new AbortController();

      fetch('http://host.docker.internal:8000/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
        signal: controller.signal,
      })
      .then(async (response) => {
        if(!response.ok){
            subscriber.error(new Error(`FastAPI error: ${response.status}`));
            return;
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const {done, value} = await reader.read();
            if(done) break;

            const chunk = decoder.decode(value, {stream: true});

            const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));
            for(const line of lines) {
                const jsonStr = line.replace('data: ', '').trim();
                if(jsonStr === '[DONE]') {
                    subscriber.complete()
                    return
                }
                try{
                    const parsed = JSON.parse(jsonStr);
                    subscriber.next({data: parsed} as MessageEvent)
                } catch {}
            }
        } 
        subscriber.complete();
      })
      .catch((err) => {
          if (err.name !== 'AbortError') subscriber.error(err);
        });
        return () => controller.abort();
    });
  }
}
