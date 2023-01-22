import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { GithubService } from 'src/app/services/github.service';
import { filter, switchMap, debounceTime, catchError, debounce, fromEvent, map, Subscription , distinct} from 'rxjs';
import { EMPTY } from 'rxjs';
import { User } from 'src/app/models/user';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profiles',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.css']
})
export class ProfilesComponent implements OnInit {

  constructor(private githubService: GithubService) { }

  user: User;
  error: boolean = false;
  @ViewChild('userSearchInput', {static: true}) userSearchInput: ElementRef
  userSuscription!: Subscription

  ngOnInit() {
    this.getUser();
  }

  ngOnDestroy() {
    this.userSuscription.unsubscribe()
  }

  /**
   * Se implementa funcionalidad que permitirá el consumo de la api.
   * Se realiza subscrición a evento y observables
   * Se establece rango de caracteres en la busqueda y tiempo de espera
   */

  getUser() {
    this.userSuscription = fromEvent<Event>(this.userSearchInput.nativeElement, 'keyup').pipe(debounceTime(1000),
      map((event: Event) => {
        const searchTerm = (event.target as HTMLInputElement).value;
        return searchTerm
    }),
    filter((searchTerm: string) => searchTerm.length > 3),
    distinct(),
    switchMap((searchTerm: string) => this.githubService.getUser(searchTerm).pipe(
      catchError(e => {
        this.error = true;
        if(this.error == true){
          Swal.fire({
            icon: 'error',
            title: 'Oops... Lo sentimos',
            text: 'No hay usuarios que cumplan con el criterio de búsqueda'
          })
        }
        return EMPTY;
      })
    ) )
      ).subscribe((user) => {
        this.user = user;
      }
    )
  }

}
