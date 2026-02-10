import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContentService } from '../../../../core/services/content.service';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-page-editor',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <div>
           <h1 class="text-2xl font-bold text-gray-900">Content Pages</h1>
           <p class="text-gray-500 text-sm">Edit generic pages like Privacy Policy, Terms, etc.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <!-- Sidebar List -->
          <div class="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h3 class="font-bold text-gray-900 mb-4 uppercase text-xs">Pages</h3>
              <ul class="space-y-2">
                  @for (page of pages(); track page.id) {
                      <li>
                          <button (click)="selectPage(page)" 
                                  [class]="selectedPage()?.id === page.id ? 'bg-pink-50 text-pink-600 font-bold' : 'text-gray-600 hover:bg-gray-50'"
                                  class="w-full text-left px-3 py-2 rounded-lg text-sm transition">
                              {{ page.title }}
                          </button>
                      </li>
                  }
                  <li>
                      <button (click)="createNew()" class="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 border-t border-gray-100 mt-2">
                          <i class="fas fa-plus mr-1"></i> New Page
                      </button>
                  </li>
              </ul>
          </div>

          <!-- Editor -->
          <div class="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              @if (selectedPage(); as page) {
                  <div class="space-y-4">
                      <div class="grid grid-cols-2 gap-4">
                          <div>
                              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
                              <input [(ngModel)]="page.title" class="w-full border-gray-300 rounded-lg font-bold text-lg">
                          </div>
                          <div>
                              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Slug (URL)</label>
                              <input [(ngModel)]="page.slug" placeholder="privacy-policy" class="w-full border-gray-300 rounded-lg text-gray-600 font-mono text-sm">
                          </div>
                      </div>
                      
                      <div>
                          <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Content (HTML)</label>
                          <textarea [(ngModel)]="page.content" rows="15" class="w-full border-gray-300 rounded-lg font-mono text-sm p-4 bg-gray-50"></textarea>
                          <div class="mt-2 text-xs text-gray-500">
                              Tips: Use &lt;h1&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;ul&gt; for formatting. Tailwind classes are also supported.
                          </div>
                      </div>

                      <div class="flex justify-end pt-4 border-t border-gray-100">
                           <button (click)="savePage()" class="px-6 py-2 bg-pink-600 text-white rounded-lg font-bold hover:bg-pink-700 transition">
                              Save Changes
                           </button>
                      </div>
                  </div>
              } @else {
                  <div class="h-full flex items-center justify-center text-gray-400 italic">
                      Select a page to edit
                  </div>
              }
          </div>
      </div>
    </div>
  `
})
export class PageEditorComponent implements OnInit {
    pages = signal<any[]>([]);
    selectedPage = signal<any | null>(null);

    constructor(private contentService: ContentService) { }

    ngOnInit() {
        this.loadPages();
    }

    loadPages() {
        this.contentService.getAuthPages().subscribe(data => {
            this.pages.set(data);
            // Default selection if none
            if (!this.selectedPage() && data.length > 0) {
                this.selectedPage.set(data[0]);
            }
        });
    }

    selectPage(page: any) {
        this.selectedPage.set({ ...page }); // Copy to avoid direct mutation
    }

    createNew() {
        this.selectedPage.set({
            id: null,
            title: 'New Page',
            slug: 'new-page',
            content: '<h1>Title</h1><p>Content goes here...</p>',
            isActive: true
        });
    }

    savePage() {
        const page = this.selectedPage();
        if (!page) return;

        if (page.id) {
            this.contentService.updatePage(page.id, page).subscribe(() => {
                alert('Saved!');
                this.loadPages();
            });
        } else {
            this.contentService.createPage(page).subscribe(() => {
                alert('Created!');
                this.loadPages();
            });
        }
    }
}
