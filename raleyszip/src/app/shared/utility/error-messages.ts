import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class ErrorMessages {
  static msg = {
    notFound: 'Not Found.',
    alreadyExist: 'Already exist.'
  };
}
