import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { GithubService } from 'src/app/services/github.service';
import { filter, switchMap, debounceTime, catchError, debounce, fromEvent, map, Subscription , distinct} from 'rxjs';
import { EMPTY } from 'rxjs';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-profiles',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.css']
})
export class ProfilesComponent implements OnInit {

  constructor(private githubService: GithubService) { }

  searchControl = new FormControl();
  user: User;
  error: boolean = false;
  @ViewChild('userSearchInput', {static: true}) userSearchInput: ElementRef
  userSuscription!: Subscription

  ngOnInit() {
    this.userSuscription = fromEvent<Event>(this.userSearchInput.nativeElement, 'keyup').pipe(
      map((event: Event) => {
        const searchTerm = (event.target as HTMLInputElement).value;
        return searchTerm
    }),
    filter((searchTerm: string) => searchTerm.length > 3),
    debounceTime(500),
    distinct(),
    switchMap((searchTerm: string) => this.githubService.getUser(searchTerm) )
      ).subscribe((user) => {
        this.user = user;
      }
    )
  }

  ngOnDestroy() {
    this.userSuscription.unsubscribe()
  }

}
