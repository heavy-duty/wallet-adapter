import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hdEncodeText',
  standalone: true,
})
export class HdEncodeTextPipe implements PipeTransform {
  transform(value?: string | null): Uint8Array {
    if (value === null || value === undefined) {
      return new Uint8Array([]);
    }

    return new TextEncoder().encode(value);
  }
}
