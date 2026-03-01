import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ContentService } from '../../../../core/services/content.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
    selector: 'app-generic-page',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
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

              @if(page()?.includeContactForm) {
                <div class="mt-16 bg-gray-50 rounded-2xl p-8 md:p-12 border border-gray-100">
                    <h3 class="text-2xl font-black mb-6">Send us a message</h3>
                    
                    @if (showSuccess()) {
                        <div class="bg-green-50 border border-green-200 text-green-800 rounded-lg p-6 text-center">
                            <i class="fas fa-check-circle text-3xl mb-2"></i>
                            <h4 class="font-bold text-lg">Message Sent!</h4>
                            <p>Thank you for contacting us. We will get back to you shortly.</p>
                        </div>
                    } @else {
                        <form (ngSubmit)="submitForm()" class="space-y-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                @for(field of formFields(); track field.name) {
                                    <div [class.md:col-span-2]="field.width === 'full'">
                                        <label class="block text-xs font-bold text-gray-500 uppercase mb-1">
                                            {{ field.label }} @if(field.required){<span class="text-red-500">*</span>}
                                        </label>
                                        
                                        @if(field.type === 'textarea') {
                                            <textarea [(ngModel)]="formData[field.name]" [name]="field.name" [required]="field.required" rows="4" class="w-full rounded-lg border-gray-200 bg-white p-3 font-medium focus:ring-black focus:border-black transition"></textarea>
                                        } @else {
                                            <input [type]="field.type" [(ngModel)]="formData[field.name]" [name]="field.name" [required]="field.required" class="w-full rounded-lg border-gray-200 bg-white p-3 font-medium focus:ring-black focus:border-black transition">
                                        }
                                    </div>
                                }
                            </div>
                            
                            <button type="submit" [disabled]="isSending()" class="bg-black text-white font-black px-8 py-4 rounded-lg hover:bg-gray-800 transition-all transform hover:-translate-y-1 shadow-lg w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                @if(isSending()) { <i class="fas fa-spinner fa-spin"></i> Sending... }
                                @else { Send Message }
                            </button>
                        </form>
                    }
                </div>
              }
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

    // Form logic
    formData: any = {};
    isSending = signal(false);
    showSuccess = signal(false);

    // Default fields if none configured
    defaultFields = [
        { name: 'name', label: 'Name', type: 'text', required: true, width: 'half' },
        { name: 'email', label: 'Email', type: 'email', required: true, width: 'half' },
        { name: 'subject', label: 'Subject', type: 'text', required: true, width: 'full' },
        { name: 'message', label: 'Message', type: 'textarea', required: true, width: 'full' }
    ];

    formFields = computed(() => {
        const p = this.page();
        if (p && p.formConfig && Array.isArray(p.formConfig) && p.formConfig.length > 0) {
            return p.formConfig;
        }
        return this.defaultFields;
    });

    constructor(
        private route: ActivatedRoute,
        private contentService: ContentService,
        private sanitizer: DomSanitizer,
        private translate: TranslateService
    ) { }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            const slug = params.get('slug');
            if (slug) {
                this.loadPage(slug);
            }
        });

        // Listen for language changes
        this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
            const slug = this.route.snapshot.paramMap.get('slug');
            if (slug) {
                console.log('Language changed to:', event.lang);
                this.loadPage(slug, event.lang);
            }
        });
    }

    loadPage(slug: string, lang?: string) {
        this.isLoading.set(true);
        this.error.set(false);
        const currentLang = lang || this.translate.currentLang || this.translate.defaultLang || 'es';
        console.log(`Fetching page ${slug} for lang: ${currentLang}`);

        this.contentService.getPageBySlug(slug, currentLang).subscribe({
            next: (data) => {
                this.page.set(data);
                this.sanitizedContent.set(this.sanitizer.bypassSecurityTrustHtml(data.content));
                this.isLoading.set(false);
                this.formData = {};
                this.showSuccess.set(false);
            },
            error: (e) => {
                console.error('Error loading page:', e);
                this.error.set(true);
                this.isLoading.set(false);
            }
        });
    }

    submitForm() {
        if (this.isSending()) return;
        this.isSending.set(true);

        const slug = this.page()?.slug;
        if (!slug) return;

        this.contentService.sendContactForm(slug, this.formData).subscribe({
            next: () => {
                this.isSending.set(false);
                this.showSuccess.set(true);
                this.formData = {};
            },
            error: (err) => {
                console.error(err);
                alert('Failed to send message. Please try again.');
                this.isSending.set(false);
            }
        });
    }
}
