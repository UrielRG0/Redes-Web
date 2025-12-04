import { Component } from '@angular/core';

@Component({
  selector: 'app-feed',
  imports: [],
  templateUrl: './feed.html',
  styleUrl: './feed.css',
})
export class Feed {
    posts: any[] = [];
    page = 0;

    ngOnInit() {
      this.loadMorePosts();
    }

    loadMorePosts() {
      //  this.feedService.getPosts(this.page).subscribe(res => {
        //  this.posts.push(...res);
          //this.page++;
      // });
    }
}
