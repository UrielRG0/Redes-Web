import { Component, Input } from '@angular/core';
import { Feed } from '../feed/feed';

@Component({
  selector: 'app-post-card',
  imports: [Feed],
  templateUrl: './post-card.html',
  styleUrl: './post-card.css',
})


export class PostCard {
  @Input() post: any;
   liked = false;
  likesCount = 0;
  ngOnInit() {
    this.likesCount = this.post?.likes ?? 0;
  }

  toggleLike() {
    this.liked = !this.liked;
    this.likesCount += this.liked ? 1 : -1;
  }
}