import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ContentService } from '../../../../core/services/content.service';

@Component({
    selector: 'app-generic-page',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
    <div class="min-h-screen bg-white">
      <!-- Header -->
      <div class="bg-gray-50 border-b border-gray-100 py-12">
          <div class="container mx-auto px-4">
              <h1 class="text-3xl md:text-5xl font-black text-gray-900 mb-4">{{ page()?.title || 'Loading...' }}</h1>
              <nav class="text-sm text-gray-500">
                  <a routerLink="/" class="hover:text-pink-600">Home</a>
                  <span class="mx-2">/</span>
                  <span>{{ page()?.title }}</span>
              </nav>
          </div>
      </div>

      <!-- Content -->
      <div class="container mx-auto px-4 py-12 max-w-4xl">
          @if(isLoading()) {
              <div class="flex justify-center py-10">
                  <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pink-600"></div>
              </div>
          } 
          @else if (error()) {
              <div class="text-center py-20">
                  <i class="fas fa-exclamation-circle text-4xl text-gray-300 mb-4"></i>
                  <h2 class="text-xl font-bold text-gray-900">Page Not Found</h2>
                  <p class="text-gray-500 mt-2">The content you are looking for does not exist.</p>
                  <a routerLink="/" class="inline-block mt-6 px-6 py-2 bg-black text-white rounded-full font-bold">Go Home</a>
              </div>
          }
          @else {
              <div class="prose prose-lg max-w-none prose-headings:font-black prose-a:text-pink-600 hover:prose-a:text-pink-700" [innerHTML]="sanitizedContent()">
              </div>
          }
      </div>
    </div>
  `
})
export class GenericPageViewComponent implements OnInit {
    page = signal<any>(null);
    isLoading = signal(true);
    error = signal(false);
    sanitizedContent = signal<SafeHtml>('');

    constructor(
        private route: ActivatedRoute,
        private contentService: ContentService,
        private sanitizer: DomSanitizer
    ) { }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            const slug = params.get('slug');
            if (slug) {
                this.loadPage(slug);
            }
        });
    }

    loadPage(slug: string) {
        this.isLoading.set(true);
        this.error.set(false);
        this.contentService.getPageBySlug(slug).subscribe({
            next: (data) => {
                this.page.set(data);
                this.sanitizedContent.set(this.sanitizer.bypassSecurityTrustHtml(data.content));
                this.isLoading.set(false);
            },
            error: () => {
                this.error.set(true);
                this.isLoading.set(false);
            }
        });
    }
}
