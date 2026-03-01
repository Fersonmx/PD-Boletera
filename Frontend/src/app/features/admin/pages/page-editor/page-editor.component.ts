import { Component, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContentService } from '../../../../core/services/content.service';
import { ActivatedRoute } from '@angular/router';
import { QuillModule } from 'ngx-quill';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
    selector: 'app-page-editor',
    standalone: true,
    imports: [CommonModule, FormsModule, QuillModule],
    encapsulation: ViewEncapsulation.None,
    template: `
    <div class="min-h-screen bg-gray-50 flex flex-col">
        <!-- Top Bar -->
        <div class="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-20">
            <div class="flex items-center gap-4">
                <h1 class="text-xl font-bold text-gray-900">{{ selectedPage()?.id ? 'Edit Page' : 'New Page' }}</h1>
                @if(selectedPage()) {
                    <span class="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider" 
                          [class]="selectedPage()?.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'">
                        {{ selectedPage()?.isActive ? 'Published' : 'Draft' }}
                    </span>
                }
            </div>
            <div class="flex items-center gap-3">
                 <button (click)="togglePreview()" class="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-sm transition flex items-center gap-2">
                    <i class="fas" [class]="isPreviewMode() ? 'fa-edit' : 'fa-eye'"></i>
                    {{ isPreviewMode() ? 'Back to Editor' : 'Preview' }}
                 </button>
                 <button (click)="savePage()" class="px-6 py-2 bg-black text-white rounded-lg font-bold hover:bg-gray-800 transition shadow-lg flex items-center gap-2">
                    <i class="fas fa-save"></i>
                    Save Changes
                 </button>
            </div>
        </div>

        <div class="flex-1 overflow-hidden flex">
            <!-- Sidebar List -->
            <div class="w-64 bg-white border-r border-gray-200 flex flex-col h-full overflow-y-auto hidden md:flex">
                <div class="p-4 border-b border-gray-100 bg-gray-50/50">
                    <button (click)="createNew()" class="w-full py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:border-black transition text-sm shadow-sm">
                        <i class="fas fa-plus mr-1"></i> Create New Page
                    </button>
                </div>
                <div class="p-2">
                    <ul class="space-y-1">
                        @for (page of pages(); track page.id) {
                            <li>
                                <button (click)="selectPage(page)" 
                                        [class]="selectedPage()?.id === page.id ? 'bg-pink-50 text-pink-700 border-pink-100' : 'text-gray-600 hover:bg-gray-50 border-transparent'"
                                        class="w-full text-left px-3 py-3 rounded-lg text-sm transition border mb-1 group">
                                    <div class="font-bold truncate">{{ page.title }}</div>
                                    <div class="text-[10px] text-gray-400 group-hover:text-gray-500 truncate">/{{ page.slug }}</div>
                                </button>
                            </li>
                        }
                    </ul>
                </div>
            </div>

            <!-- Main Workspace -->
            <div class="flex-1 overflow-y-auto bg-gray-50 p-6 md:p-8 relative">
                @if (selectedPage(); as page) {
                    <div class="max-w-5xl mx-auto space-y-6">
                        
                        @if (isPreviewMode()) {
                            <!-- Preview Mode -->
                            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px] animate-fadeIn">
                                <div class="border-b border-gray-100 px-8 py-12 bg-gray-50">
                                    <h1 class="text-4xl md:text-5xl font-black mb-4">{{ page.title }}</h1>
                                    <div class="text-xs font-mono text-gray-400">URL: /pages/{{ page.slug }}</div>
                                </div>
                                <div class="prose prose-lg max-w-none p-8 md:p-12 text-gray-800" [innerHTML]="sanitizedContent()"></div>
                            </div>
                        } @else {
                            <!-- Editor Mode -->
                            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <!-- Main Content Area -->
                                <div class="lg:col-span-2 space-y-6">
                                     <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                        <label class="block text-xs font-bold text-gray-400 uppercase mb-2">Page Title</label>
                                        <input [(ngModel)]="page.title" 
                                               (input)="generateSlug()"
                                               class="w-full border-none p-0 text-3xl font-black placeholder:text-gray-300 focus:ring-0 text-gray-900" 
                                               placeholder="Enter title here">
                                     </div>

                                     <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[500px] quill-container">
                                        <quill-editor [(ngModel)]="page.content" 
                                                      theme="snow"
                                                      [styles]="{height: '450px'}"
                                                      [modules]="quillConfig"
                                                      placeholder="Start writing amazing content..."
                                                      class="flex-1 flex flex-col">
                                        </quill-editor>
                                     </div>

                                     <!-- Contact Form Configuration (Visible if enabled) -->
                                     @if(page.includeContactForm) {
                                        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                            <div class="flex justify-between items-center mb-4">
                                                <h3 class="font-bold text-gray-900 uppercase tracking-wider text-sm">Contact Form Fields</h3>
                                                <button (click)="addField()" class="text-xs bg-gray-900 text-white px-3 py-2 rounded-lg font-bold hover:bg-gray-700">
                                                    <i class="fas fa-plus mr-1"></i> Add Field
                                                </button>
                                            </div>
                                            
                                            <div class="space-y-3">
                                                @if(!page.formConfig || page.formConfig.length === 0) {
                                                    <div class="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-center text-sm text-gray-500">
                                                        Using default fields (Name, Email, Subject, Message). <br>
                                                        Add a field to override defaults.
                                                    </div>
                                                } @else {
                                                    @for(field of page.formConfig; track $index) {
                                                        <div class="flex gap-2 items-start bg-gray-50 p-3 rounded-lg border border-gray-200">
                                                            <div class="grid grid-cols-2 md:grid-cols-4 gap-2 flex-1">
                                                                <div>
                                                                    <label class="text-[10px] uppercase font-bold text-gray-400">Label</label>
                                                                    <input [(ngModel)]="field.label" class="w-full text-xs p-2 rounded border-gray-300">
                                                                </div>
                                                                <div>
                                                                    <label class="text-[10px] uppercase font-bold text-gray-400">Type</label>
                                                                    <select [(ngModel)]="field.type" class="w-full text-xs p-2 rounded border-gray-300 bg-white">
                                                                        <option value="text">Text Input</option>
                                                                        <option value="email">Email</option>
                                                                        <option value="textarea">Text Area</option>
                                                                        <option value="number">Number</option>
                                                                    </select>
                                                                </div>
                                                                <div>
                                                                    <label class="text-[10px] uppercase font-bold text-gray-400">Name (Key)</label>
                                                                    <input [(ngModel)]="field.name" class="w-full text-xs p-2 rounded border-gray-300">
                                                                </div>
                                                                <div>
                                                                     <label class="text-[10px] uppercase font-bold text-gray-400">Width</label>
                                                                     <select [(ngModel)]="field.width" class="w-full text-xs p-2 rounded border-gray-300 bg-white">
                                                                        <option value="full">Full Width</option>
                                                                        <option value="half">Half Width</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <div class="flex flex-col gap-1 mt-4">
                                                                <button (click)="removeField($index)" class="text-red-500 hover:bg-red-50 p-1 rounded">
                                                                    <i class="fas fa-trash"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    }
                                                }
                                            </div>
                                        </div>
                                     }
                                </div>

                                <!-- Sidebar Options -->
                                <div class="space-y-6">
                                    <!-- Publishing -->
                                    <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                                        <h3 class="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider border-b border-gray-100 pb-2">Publishing</h3>
                                        
                                        <div class="space-y-4">
                                            <div>
                                                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">ID Status</label>
                                                <div class="flex items-center gap-2">
                                                    <span class="w-2 h-2 rounded-full" [class]="page.isActive ? 'bg-green-500' : 'bg-gray-300'"></span>
                                                    <span class="text-sm font-medium">{{ page.isActive ? 'Active' : 'Draft' }}</span>
                                                </div>
                                            </div>

                                            <div>
                                                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Permalink</label>
                                                <div class="flex items-center">
                                                    <span class="text-gray-400 text-xs bg-gray-50 border border-r-0 border-gray-300 rounded-l px-2 py-2">/</span>
                                                    <input [(ngModel)]="page.slug" class="w-full border-gray-300 rounded-r text-sm py-1.5 focus:ring-black focus:border-black font-mono text-gray-600">
                                                </div>
                                            </div>

                                            <div class="pt-2">
                                                <label class="flex items-center gap-2 cursor-pointer">
                                                    <input type="checkbox" [(ngModel)]="page.isActive" class="rounded text-pink-600 focus:ring-pink-500 w-4 h-4">
                                                    <span class="text-sm font-medium text-gray-700">Page is active</span>
                                                </label>
                                            </div>

                                            <div class="pt-2 border-t border-gray-100 mt-2">
                                                <label class="flex items-center gap-2 cursor-pointer">
                                                    <input type="checkbox" [(ngModel)]="page.includeContactForm" class="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4">
                                                    <span class="text-sm font-medium text-gray-700">Include Contact Form</span>
                                                </label>
                                                <p class="text-xs text-gray-500 mt-1 ml-6 mb-2">Adds a contact form at the bottom of the page.</p>

                                                @if(page.includeContactForm) {
                                                    <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Notify Email</label>
                                                    <input [(ngModel)]="page.notifyEmail" placeholder="admin@example.com" class="w-full text-sm border-gray-300 rounded shadow-sm py-1.5">
                                                }
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Author/Meta (Placeholder) -->
                                    <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                                        <h3 class="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider border-b border-gray-100 pb-2">Attributes</h3>
                                        <div class="text-xs text-gray-500 space-y-3">
                                            <div>
                                                <label class="block font-bold text-gray-900 mb-1">Language</label>
                                                <select [(ngModel)]="page.language" class="w-full text-xs p-2 rounded border-gray-300 bg-gray-50">
                                                    <option value="es">Español (es)</option>
                                                    <option value="en">English (en)</option>
                                                </select>
                                            </div>
                                            <p>Template: <span class="font-bold text-gray-900">Default</span></p>
                                            <p>Order: <span class="font-bold text-gray-900">0</span></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                } @else {
                     <div class="h-full flex flex-col items-center justify-center text-gray-400">
                        <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <i class="fas fa-file-alt text-2xl text-gray-300"></i>
                        </div>
                        <p class="text-lg font-medium text-gray-500">Select a page to edit</p>
                        <button (click)="createNew()" class="mt-4 text-pink-600 font-bold hover:underline">Or create a new one</button>
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
    isPreviewMode = signal(false);

    quillConfig = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
            ['blockquote', 'code-block'],
            [{ 'header': 1 }, { 'header': 2 }],               // custom button values
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
            [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
            [{ 'direction': 'rtl' }],                         // text direction
            [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
            [{ 'font': [] }],
            [{ 'align': [] }],
            ['clean'],                                         // remove formatting button
            ['link', 'image', 'video']                         // link and image, video
        ]
    };

    constructor(
        private contentService: ContentService,
        private sanitizer: DomSanitizer
    ) { }

    ngOnInit() {
        this.loadPages();
    }

    loadPages() {
        this.contentService.getAuthPages().subscribe(data => {
            this.pages.set(data);
            if (!this.selectedPage() && data.length > 0) {
                this.selectPage(data[0]);
            }
        });
    }

    selectPage(page: any) {
        this.selectedPage.set({ ...page });
        this.isPreviewMode.set(false);
    }

    createNew() {
        this.selectedPage.set({
            id: null,
            title: '',
            slug: '',
            content: '',
            isActive: true,
            language: 'es',
            includeContactForm: false,
            notifyEmail: '',
            formConfig: []
        });
        this.isPreviewMode.set(false);
    }

    addField() {
        const page = this.selectedPage();
        if (!page) return;
        if (!page.formConfig) page.formConfig = [];

        page.formConfig.push({
            label: 'New Field',
            name: 'field_' + Date.now(),
            type: 'text',
            required: false,
            width: 'full'
        });
    }

    removeField(index: number) {
        const page = this.selectedPage();
        if (page && page.formConfig) {
            page.formConfig.splice(index, 1);
        }
    }

    generateSlug() {
        const page = this.selectedPage();
        if (page && !page.id && page.title) {
            page.slug = page.title.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
        }
    }

    togglePreview() {
        this.isPreviewMode.update(v => !v);
    }

    sanitizedContent(): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(this.selectedPage()?.content || '');
    }

    savePage() {
        const page = this.selectedPage();
        if (!page) return;

        if (!page.title || !page.slug) {
            alert('Please enter a title and slug');
            return;
        }

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
