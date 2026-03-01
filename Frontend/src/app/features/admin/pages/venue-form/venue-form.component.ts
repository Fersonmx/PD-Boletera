import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { VenueService, Venue, VenueLayout, VenueSection } from '../../../../core/services/venue.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-venue-form',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    template: `
    <div class="px-0 sm:px-0 lg:px-0">
      <div class="mb-8 flex items-center justify-between">
        <div>
           <nav class="sm:hidden" aria-label="Back">
            <a routerLink="/admin/venues" class="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
              <i class="fas fa-arrow-left -ml-1 mr-1 flex-shrink-0 text-gray-400"></i>
              Back
            </a>
          </nav>
          <nav class="hidden sm:flex" aria-label="Breadcrumb">
            <ol role="list" class="flex items-center space-x-4">
              <li>
                <div class="flex">
                  <a routerLink="/admin/venues" class="text-sm font-medium text-gray-500 hover:text-gray-700">Venues</a>
                </div>
              </li>
              <li>
                <div class="flex items-center">
                  <i class="fas fa-chevron-right flex-shrink-0 h-5 w-5 text-gray-400"></i>
                  <a class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700" aria-current="page">{{ isEditMode ? 'Edit Venue' : 'Create Venue' }}</a>
                </div>
              </li>
            </ol>
          </nav>
          <h1 class="mt-2 text-3xl font-black text-gray-900 uppercase tracking-tight">{{ isEditMode ? 'Edit Venue' : 'Create New Venue' }}</h1>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <!-- Form Column -->
        <div class="lg:col-span-1 space-y-8 h-fit overflow-y-auto max-h-[calc(100vh-200px)]">
            <!-- Basic Info -->
            <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                <div class="px-4 py-6 sm:p-8">
                    <h2 class="text-base font-semibold leading-7 text-gray-900 mb-6">Venue Details</h2>
                    <div class="grid grid-cols-1 gap-x-6 gap-y-4">
                        <div>
                            <label class="block text-sm font-medium leading-6 text-gray-900">Venue Name</label>
                            <input type="text" [(ngModel)]="venue.name" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-pink-600 sm:text-sm sm:leading-6">
                        </div>
                        <div>
                             <label class="block text-sm font-medium leading-6 text-gray-900">City</label>
                             <input type="text" [(ngModel)]="venue.city" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-pink-600 sm:text-sm sm:leading-6">
                        </div>
                        <div>
                             <label class="block text-sm font-medium leading-6 text-gray-900">Address</label>
                             <input type="text" [(ngModel)]="venue.address" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-pink-600 sm:text-sm sm:leading-6">
                        </div>
                        <div>
                             <label class="block text-sm font-medium leading-6 text-gray-900">Total Capacity</label>
                             <input type="number" [(ngModel)]="venue.capacity" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-pink-600 sm:text-sm sm:leading-6">
                        </div>
                    </div>
                </div>
            </div>

            <!-- Layouts Manager -->
            <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                <div class="px-4 py-6 sm:p-8">
                     <div class="flex items-center justify-between mb-6">
                        <h2 class="text-base font-semibold leading-7 text-gray-900">Layouts</h2>
                        <button type="button" (click)="addLayout()" class="rounded-md bg-white px-3 py-2 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Add</button>
                     </div>

                     <div class="space-y-4">
                        @for (layout of venue.layouts; track $index; let lIndex = $index) {
                            <div class="border rounded-xl p-3 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all cursor-pointer" 
                                 [class.ring-2]="activeLayout === layout"
                                 [class.ring-pink-500]="activeLayout === layout"
                                 (click)="selectLayout(layout)">
                                <div class="flex items-center justify-between gap-2 mb-2">
                                     <input type="text" [(ngModel)]="layout.name" placeholder="Layout Name" class="block w-full font-bold text-sm border-0 bg-transparent focus:ring-0 p-0 placeholder-gray-400">
                                     <div class="flex items-center gap-2">
                                         <button (click)="duplicateLayout(layout); $event.stopPropagation()" class="text-gray-400 hover:text-blue-500" title="Duplicate Layout">
                                            <i class="fas fa-copy"></i>
                                         </button>
                                         <button (click)="removeLayout(lIndex); $event.stopPropagation()" class="text-gray-400 hover:text-red-500" title="Delete Layout">
                                            <i class="fas fa-trash"></i>
                                         </button>
                                     </div>
                                </div>
                                <div class="flex items-center gap-2 mb-2">
                                    <input type="text" [(ngModel)]="layout.imageUrl" placeholder="Image URL (http...)" class="block w-full text-[10px] text-gray-500 border border-gray-200 rounded p-1">
                                    <label class="cursor-pointer bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-700 px-3 py-1.5 rounded-lg flex items-center font-bold text-[10px] uppercase tracking-wide transition-colors whitespace-nowrap shadow-sm" title="Upload Image or SVG">
                                        <i class="fas fa-cloud-upload-alt text-sm mr-2"></i> Subir Mapa (.svg, .png)
                                        <input type="file" class="hidden" accept=".svg,.png,.jpg,.jpeg,.webp" (change)="uploadImage($event, layout)">
                                    </label>
                                </div>
                                
                                <div class="text-xs text-gray-400 font-medium">
                                    {{ layout.sections?.length || 0 }} Sections Defined
                                </div>
                            </div>
                        }
                     </div>
                </div>
            </div>
            
            <div class="flex items-center justify-end gap-x-6">
                <button (click)="saveVenue()" class="rounded-md bg-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-pink-500 w-full transform hover:scale-105 transition-transform">Save All Changes</button>
             </div>
        </div>

        <!-- Visual Editor Column -->
        <div class="lg:col-span-2">
            <div class="sticky top-8 bg-white shadow-xl ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden flex flex-col h-[calc(100vh-100px)]">
                <!-- Editor Toolbar -->
                <div class="bg-gray-900 text-white px-4 py-3 flex items-center justify-between z-20 shadow-md">
                    <div class="flex items-center gap-4">
                        <h3 class="font-bold text-sm uppercase tracking-wider"><i class="fas fa-map-marked-alt mr-2"></i> Visual Editor</h3>
                        <span class="text-xs text-gray-400 border-l border-gray-700 pl-4">{{ activeLayout?.name || 'No Layout Selected' }}</span>
                    </div>
                    
                    <div class="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
                        <button (click)="tool = 'pan'" [class.bg-pink-600]="tool === 'pan'" class="p-2 rounded hover:bg-gray-700 transition" title="Pan Mode (Space)">
                            <i class="fas fa-hand-paper"></i>
                        </button>
                        <button (click)="tool = 'draw'" [class.bg-pink-600]="tool === 'draw'" class="p-2 rounded hover:bg-gray-700 transition" title="Draw Mode (P)">
                            <i class="fas fa-draw-polygon"></i>
                        </button>
                        <div class="h-4 w-px bg-gray-700 mx-1"></div>
                        <button (click)="zoomIn()" class="p-2 rounded hover:bg-gray-700 transition" title="Zoom In"><i class="fas fa-search-plus"></i></button>
                        <span class="text-xs font-mono w-12 text-center">{{ (zoomLevel * 100).toFixed(0) }}%</span>
                        <button (click)="zoomOut()" class="p-2 rounded hover:bg-gray-700 transition" title="Zoom Out"><i class="fas fa-search-minus"></i></button>
                        <button (click)="resetView()" class="p-2 rounded hover:bg-gray-700 transition" title="Reset View"><i class="fas fa-compress"></i></button>
                    </div>
                </div>

                <!-- Canvas Area -->
                <div #canvasContainer class="flex-1 bg-gray-100 overflow-hidden relative cursor-crosshair relative group"
                     (mousedown)="onMouseDown($event)" 
                     (mousemove)="onMouseMove($event)" 
                     (mouseup)="onMouseUp($event)"
                     (wheel)="onWheel($event)"
                     (contextmenu)="$event.preventDefault()">
                    
                    <!-- Grid Background -->
                    <div class="absolute inset-0 pointer-events-none opacity-10" 
                         style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 20px 20px;">
                    </div>

                    @if (tool === 'draw') {
                    <div class="absolute top-6 left-1/2 transform -translate-x-1/2 bg-gray-900/80 text-white px-5 py-2.5 rounded-full text-[11px] uppercase tracking-wide font-bold flex items-center shadow-lg z-30 pointer-events-none animate-fadeIn">
                        <i class="fas fa-info-circle mr-2 text-pink-400 text-sm"></i>
                        Click for corners. Hold <kbd class="mx-1.5 px-1.5 py-0.5 bg-gray-700 rounded border border-gray-600 shadow-sm text-pink-300">Option / Alt</kbd> to add curve points. Dbl-Click to close.
                    </div>
                    }

                    @if (!activeLayout) {
                        <div class="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none bg-gray-50">
                            Select a layout to start editing
                        </div>
                    } @else if (!activeLayout.imageUrl) {
                        <div class="absolute inset-0 flex flex-col items-center justify-center p-8 bg-gray-50 z-10 w-full h-full overflow-y-auto pointer-events-auto"
                             (mousedown)="$event.stopPropagation()"
                             (wheel)="$event.stopPropagation()">
                            <div class="text-center mb-8 max-w-md">
                                <div class="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                                    <i class="fas fa-layer-group text-2xl text-gray-400"></i>
                                </div>
                                <h3 class="text-xl font-black text-gray-900 mb-2 tracking-tight">Manual Layout Mode</h3>
                                <p class="text-sm text-gray-500">Provide an Image URL on the left to activate the Visual Editor, or create sections manually below.</p>
                            </div>

                            <div class="w-full max-w-2xl bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                                <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
                                    <div>
                                         <h4 class="font-bold text-gray-900 text-lg uppercase tracking-tight">Sections</h4>
                                         <p class="text-xs text-gray-400 font-medium">Define sections and capacities for this layout</p>
                                    </div>
                                    <button (click)="addManualSection()" class="px-5 py-2.5 bg-black text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-all hover:shadow-lg transform hover:-translate-y-0.5">
                                        <i class="fas fa-plus mr-2"></i> Add Section
                                    </button>
                                </div>

                                <div class="space-y-3">
                                    @for (section of activeLayout.sections; track $index; let i = $index) {
                                        <div class="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-200/60 focus-within:ring-2 focus-within:ring-pink-500/20 focus-within:border-pink-500 transition-all">
                                            <div class="flex-1 bg-white rounded-lg p-2 border border-gray-100 shadow-sm">
                                                <label class="block text-[10px] uppercase font-bold text-gray-400 mb-0.5 px-1">Section Name</label>
                                                <input [(ngModel)]="section.name" placeholder="E.g. VIP, General" class="w-full text-sm font-bold border-0 bg-transparent focus:ring-0 p-1 text-gray-900">
                                            </div>
                                            <div class="w-32 bg-white rounded-lg p-2 border border-gray-100 shadow-sm">
                                                <label class="block text-[10px] uppercase font-bold text-gray-400 mb-0.5 px-1">Capacity</label>
                                                <input [(ngModel)]="section.capacity" type="number" placeholder="0" class="w-full text-sm font-bold border-0 bg-transparent focus:ring-0 p-1 text-gray-900 text-right">
                                            </div>
                                            <button (click)="removeManualSection(i)" class="text-gray-400 hover:text-red-500 p-3 bg-white border border-gray-100 shadow-sm rounded-lg hover:bg-red-50 transition-colors">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    }
                                    @if (!activeLayout.sections || activeLayout.sections.length === 0) {
                                        <div class="text-center py-12 text-sm text-gray-400 italic bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                                            No sections defined yet. Click "Add Section" to begin.
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    }

                    <!-- Map Layer -->
                    <div [style.transform]="'translate(' + panX + 'px, ' + panY + 'px) scale(' + zoomLevel + ')'" 
                         class="origin-top-left transition-transform duration-75 ease-linear will-change-transform">
                        
                         @if (activeLayout?.imageUrl) {
                            <img [src]="activeLayout!.imageUrl" class="pointer-events-none select-none max-w-none shadow-2xl" id="mapImage">
                         }

                         <!-- SVG Overlay -->
                         <svg class="absolute inset-0 w-full h-full overflow-visible pointer-events-none z-10">
                             <!-- Existing Sections -->
                             @if (activeLayout) {
                                 @for (section of activeLayout.sections; track $index) {
                                    @if (section.visualData) {
                                        <path [attr.d]="section.visualData" 
                                              [class.fill-pink-500]="selectedSection === section"
                                              class="fill-pink-500/30 stroke-pink-600 stroke-2 hover:fill-pink-500/60 cursor-pointer pointer-events-auto transition-colors"
                                              (click)="selectSection(section); $event.stopPropagation()">
                                              <title>{{ section.name }} ({{ section.capacity }})</title>
                                        </path>
                                        <!-- Centered Label -->
                                        <!-- Only show label if zoomed enough? -->
                                    }
                                 }
                             }

                             <!-- Drawing Draft -->
                             @if (isDrawing && currentPoints.length > 0) {
                                <path [attr.d]="getCurrentPathString()" class="fill-pink-500/20 stroke-pink-500 stroke-2 pointer-events-none" [class.dashed]="!isDrawingClosed"></path>
                                @for (p of currentPoints; track $index) {
                                    <circle [attr.cx]="p.x" [attr.cy]="p.y" r="4" 
                                            class="stroke-pink-600 stroke-2 pointer-events-none"
                                            [class.fill-yellow-400]="p.isControl" 
                                            [class.fill-white]="!p.isControl"></circle>
                                }
                             }
                         </svg>
                    </div>
                </div>

                <!-- Sections List Panel (Floating left) -->
                @if (activeLayout?.imageUrl) {
                    <div class="absolute top-16 left-4 bg-white rounded-xl shadow-lg border border-gray-200 w-64 z-30 max-h-[calc(100vh-250px)] flex flex-col pointer-events-auto">
                        <div class="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                            <h4 class="font-bold text-xs uppercase text-gray-900 tracking-wider">Sections</h4>
                            <button (click)="addManualSection()" class="text-[10px] bg-black text-white px-2 py-1 rounded hover:bg-gray-800"><i class="fas fa-plus mr-1"></i> Add</button>
                        </div>
                        <div class="overflow-y-auto p-2 space-y-2">
                            @for (section of activeLayout?.sections; track $index) {
                                <div class="p-2 rounded-lg border text-sm cursor-pointer transition-colors flex justify-between items-center"
                                     [class.bg-pink-50]="selectedSection === section"
                                     [class.border-pink-200]="selectedSection === section"
                                     [class.border-gray-100]="selectedSection !== section"
                                     (click)="selectSection(section)">
                                     <div>
                                         <div class="font-bold text-gray-900 leading-none mb-1 text-xs">{{ section.name }}</div>
                                         <div class="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full inline-flex items-center"
                                              [class.bg-green-100]="section.visualData"
                                              [class.text-green-700]="section.visualData"
                                              [class.bg-yellow-100]="!section.visualData"
                                              [class.text-yellow-700]="!section.visualData">
                                             <i class="fas text-[8px] mr-1" [class.fa-check]="section.visualData" [class.fa-exclamation-triangle]="!section.visualData"></i>
                                             {{ section.visualData ? 'Mapped' : 'No Area' }}
                                         </div>
                                     </div>
                                     <div class="text-[10px] font-bold text-gray-400">
                                        <i class="fas fa-users mr-1"></i> {{ section.capacity }}
                                     </div>
                                </div>
                            }
                            @if (!activeLayout?.sections || activeLayout?.sections?.length === 0) {
                                <div class="text-center p-4 text-xs text-gray-400">No sections added</div>
                            }
                        </div>
                    </div>
                }

                <!-- Section Properties Panel (Floating) -->
                @if (selectedSection) {
                    <div class="absolute bottom-4 right-4 bg-white p-4 rounded-xl shadow-2xl border border-gray-200 w-64 z-30 animate-in slide-in-from-bottom-4">
                        <div class="flex justify-between items-center mb-3">
                            <h4 class="font-bold text-sm uppercase text-gray-900">Section Properties</h4>
                            <button (click)="selectedSection = null" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="space-y-3">
                            <div>
                                <label class="block text-xs font-bold text-gray-500 mb-1">Name</label>
                                <input [(ngModel)]="selectedSection.name" class="w-full text-sm border-gray-300 rounded p-1.5 bg-gray-50 from-input">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-gray-500 mb-1">Capacity</label>
                                <input [(ngModel)]="selectedSection.capacity" type="number" class="w-full text-sm border-gray-300 rounded p-1.5 bg-gray-50 from-input">
                            </div>
                            <div class="flex items-center justify-between pt-2">
                                <button (click)="deleteSelectedSection()" class="text-xs text-red-600 font-bold hover:text-red-800">
                                    <i class="fas fa-trash mr-1"></i> Delete Section
                                </button>
                            </div>
                        </div>
                    </div>
                }
            </div>
        </div>
      </div>
    </div>
    `,
    styles: [`
        .cursor-crosshair { cursor: crosshair; }
        .stroke-dasharray-4 { stroke-dasharray: 4; }
    `]
})
export class VenueFormComponent implements OnInit {
    venue: Venue = { id: 0, name: '', address: '', city: '', capacity: 0, layouts: [] };
    isEditMode = false;
    activeLayout: VenueLayout | null = null;

    // Editor State
    tool: 'pan' | 'draw' = 'pan';
    zoomLevel = 1;
    panX = 0;
    panY = 0;
    isDragging = false;
    lastMouseX = 0;
    lastMouseY = 0;

    // Drawing State
    isDrawing = false;
    isDrawingClosed = false;
    currentPoints: { x: number, y: number, isControl?: boolean }[] = [];
    cursorPos: { x: number, y: number } | null = null;

    // Selection State
    selectedSection: VenueSection | null = null;

    constructor(
        private venueService: VenueService,
        private route: ActivatedRoute,
        private router: Router,
        private http: HttpClient
    ) { }

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.isEditMode = true;
            this.venueService.getVenueById(+id).subscribe(v => {
                this.venue = v;
                if (!this.venue.layouts) this.venue.layouts = [];
                if (this.venue.layouts.length > 0) this.selectLayout(this.venue.layouts[0]);
            });
        }
    }

    addLayout() {
        if (!this.venue.layouts) this.venue.layouts = [];
        const newLayout: VenueLayout = { name: 'New Layout', sections: [], imageUrl: '' };
        this.venue.layouts.push(newLayout);
        this.selectLayout(newLayout);
    }

    duplicateLayout(layout: VenueLayout) {
        if (!this.venue.layouts) this.venue.layouts = [];
        // Deep clone layout and sections, removing IDs to treat as new inserts
        const clonedSections: VenueSection[] = (layout.sections || []).map(s => {
            const { id, layoutId, ...rest } = s;
            return { ...rest };
        });

        const clonedLayout: VenueLayout = {
            name: layout.name + ' (Copy)',
            imageUrl: layout.imageUrl,
            sections: clonedSections
        };

        this.venue.layouts.push(clonedLayout);
        this.selectLayout(clonedLayout);
    }

    uploadImage(event: any, layout: VenueLayout) {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('image', file);

            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            this.http.post<any>(`${environment.apiUrl}/upload`, formData, { headers }).subscribe({
                next: (res) => {
                    const baseUrl = environment.apiUrl.replace('/api', '');
                    layout.imageUrl = baseUrl + res.filePath;
                },
                error: (err) => {
                    console.error('Upload failed', err);
                    alert('Failed to upload image');
                }
            });
        }
    }

    removeLayout(index: number) {
        if (this.venue.layouts && this.venue.layouts[index] === this.activeLayout) {
            this.activeLayout = null;
        }
        this.venue.layouts?.splice(index, 1);
        if (this.venue.layouts && this.venue.layouts.length > 0 && !this.activeLayout) {
            this.selectLayout(this.venue.layouts[0]);
        }
    }

    selectLayout(layout: VenueLayout) {
        this.activeLayout = layout;
        this.selectedSection = null;
        this.resetView();
    }

    // --- Visual Editor Logic ---

    // Coordinate Conversion used for drawing points relative to image origin
    getMapCoordinates(event: MouseEvent): { x: number, y: number } {
        // We need to subtract pan and divide by zoom to get "Image Space" coordinates
        // Mouse Event is relative to 'canvasContainer' due to (mousedown) binding? 
        // No, event.offsetX/Y gives coord relative to target. If target is SVG or Div, it helps.
        // Better: use clientX/Y and bounding rect of container.

        const container = (event.currentTarget as HTMLElement).getBoundingClientRect();
        const mouseX = event.clientX - container.left;
        const mouseY = event.clientY - container.top;

        // Inverse transform
        const x = (mouseX - this.panX) / this.zoomLevel;
        const y = (mouseY - this.panY) / this.zoomLevel;

        return { x, y };
    }

    onMouseDown(event: MouseEvent) {
        if (!this.activeLayout) return; // Prevent interaction if no layout

        if (this.tool === 'pan' || (event.buttons === 4) || (event.ctrlKey)) { // Middle mouse or Ctrl+Click triggers pan
            this.isDragging = true;
            this.lastMouseX = event.clientX;
            this.lastMouseY = event.clientY;
            event.preventDefault(); // Stop text selection
        } else if (this.tool === 'draw') {
            // Add Point
            const coords = this.getMapCoordinates(event);
            const isControl = event.altKey;

            if (!this.isDrawing) {
                this.isDrawing = true;
                this.isDrawingClosed = false;
                this.currentPoints = [{ ...coords, isControl: false }]; // First point is always anchor
                this.selectedSection = null; // Deselect while drawing
            } else {
                // Check if clicking near start point to close
                const startPoint = this.currentPoints[0];
                const distance = Math.sqrt(Math.pow(coords.x - startPoint.x, 2) + Math.pow(coords.y - startPoint.y, 2));

                if (distance < 10 / this.zoomLevel && this.currentPoints.length >= 2) {
                    this.finishPolygon();
                } else {
                    this.currentPoints.push({ ...coords, isControl });
                }
            }
        }
    }

    onMouseMove(event: MouseEvent) {
        if (this.isDragging) {
            const dx = event.clientX - this.lastMouseX;
            const dy = event.clientY - this.lastMouseY;
            this.panX += dx;
            this.panY += dy;
            this.lastMouseX = event.clientX;
            this.lastMouseY = event.clientY;
        }

        if (this.isDrawing) {
            this.cursorPos = this.getMapCoordinates(event);
        }
    }

    onMouseUp(event: MouseEvent) {
        this.isDragging = false;
    }

    onWheel(event: WheelEvent) {
        event.preventDefault();
        const zoomDelta = event.deltaY > 0 ? 0.9 : 1.1;
        this.applyZoom(zoomDelta);
    }

    // Listen for Double Click to Close Polygon
    @HostListener('dblclick', ['$event'])
    onDoubleClick(event: MouseEvent) {
        if (this.tool === 'draw' && this.isDrawing && this.currentPoints.length >= 3) {
            this.finishPolygon();
        }
    }

    applyZoom(factor: number) {
        const newZoom = this.zoomLevel * factor;
        if (newZoom > 0.1 && newZoom < 10) {
            this.zoomLevel = newZoom;
        }
    }

    zoomIn() { this.applyZoom(1.2); }
    zoomOut() { this.applyZoom(0.8); }
    resetView() {
        this.zoomLevel = 1;
        this.panX = 0;
        this.panY = 0;
    }

    getMixedPathString(pts: { x: number, y: number, isControl?: boolean }[], closed: boolean, cursor: { x: number, y: number } | null = null): string {
        if (pts.length === 0) return '';
        let d = `M ${pts[0].x} ${pts[0].y}`;

        let i = 1;
        while (i < pts.length) {
            const p = pts[i];
            if (p.isControl) {
                const nextP = pts[i + 1];
                if (nextP) {
                    // P is control, nextP is end
                    d += ` Q ${p.x} ${p.y}, ${nextP.x} ${nextP.y}`;
                    i += 2;
                } else {
                    // P is control, but no next point.
                    if (closed) {
                        d += ` Q ${p.x} ${p.y}, ${pts[0].x} ${pts[0].y}`;
                    } else if (cursor) {
                        d += ` Q ${p.x} ${p.y}, ${cursor.x} ${cursor.y}`;
                    }
                    i++;
                }
            } else {
                d += ` L ${p.x} ${p.y}`;
                i++;
            }
        }

        // Draw rubber band line from the last anchor point to the cursor
        if (!closed && cursor && pts.length > 0 && !pts[pts.length - 1].isControl) {
            d += ` L ${cursor.x} ${cursor.y}`;
        }

        if (closed) {
            d += ' Z';
        }

        return d;
    }

    getCurrentPathString(): string {
        return this.getMixedPathString(this.currentPoints, this.isDrawingClosed, this.isDrawingClosed ? null : this.cursorPos);
    }

    finishPolygon() {
        if (!this.activeLayout) return;

        this.isDrawingClosed = true;

        // Finalize Path
        const d = this.getCurrentPathString();

        if (this.selectedSection) {
            // Assign to existing selected section
            this.selectedSection.visualData = d;
        } else {
            // Add new Section
            if (!this.activeLayout.sections) this.activeLayout.sections = [];
            const newSection: VenueSection = {
                name: 'Section ' + (this.activeLayout.sections.length + 1),
                capacity: 100,
                visualData: d,
                layoutId: this.activeLayout.id
            };
            this.activeLayout.sections.push(newSection);
            this.selectSection(newSection);
        }

        // Reset
        this.isDrawing = false;
        this.currentPoints = [];
        this.tool = 'pan'; // Switch back to pan for easier adjustments
    }

    selectSection(section: VenueSection) {
        if (this.isDrawing) return; // Don't select while drawing
        this.selectedSection = section;
    }

    deleteSelectedSection() {
        if (this.selectedSection && this.activeLayout?.sections) {
            const idx = this.activeLayout.sections.indexOf(this.selectedSection);
            if (idx !== -1) this.activeLayout.sections.splice(idx, 1);
            this.selectedSection = null;
        }
    }

    addManualSection() {
        if (!this.activeLayout) return;
        if (!this.activeLayout.sections) this.activeLayout.sections = [];
        this.activeLayout.sections.push({
            name: 'New Section ' + (this.activeLayout.sections.length + 1),
            capacity: 100,
            layoutId: this.activeLayout.id
        });
    }

    removeManualSection(index: number) {
        if (!this.activeLayout || !this.activeLayout.sections) return;
        this.activeLayout.sections.splice(index, 1);
    }

    saveVenue() {
        if (this.isEditMode) {
            this.venueService.updateVenue(this.venue.id, this.venue).subscribe({
                next: () => alert('Venue Updated!'),
                error: (err) => {
                    const msg = err.error?.message || 'Error updating venue';
                    alert(msg);
                }
            });
        } else {
            this.venueService.createVenue(this.venue).subscribe({
                next: () => this.router.navigate(['/admin/venues']),
                error: (err) => {
                    const msg = err.error?.message || 'Error creating venue';
                    alert(msg);
                }
            });
        }
    }
}

