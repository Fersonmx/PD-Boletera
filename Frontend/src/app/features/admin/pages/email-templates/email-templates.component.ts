import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SettingService } from '../../../../core/services/setting.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-email-templates',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule, RouterModule],
    template: `
    <div class="p-6 max-w-6xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Plantillas de Correo Electrónico</h1>
          <p class="text-gray-500">Configura los mensajes automáticos en español e inglés.</p>
        </div>
        <a routerLink="/admin/settings" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition">
            <i class="fas fa-arrow-left mr-2"></i> Settings
        </a>
      </div>

      <!-- Navigation for Templates -->
      <div class="flex space-x-2 border-b border-gray-200 mb-6">
          <button (click)="activeTemplate = 'welcome'" [class.border-pink-500]="activeTemplate === 'welcome'" [class.text-pink-600]="activeTemplate === 'welcome'" class="px-4 py-2 font-medium border-b-2 transition-colors">Registro / Bienvenida</button>
          <button (click)="activeTemplate = 'order'" [class.border-pink-500]="activeTemplate === 'order'" [class.text-pink-600]="activeTemplate === 'order'" class="px-4 py-2 font-medium border-b-2 border-transparent transition-colors hover:text-gray-700">Confirmación de Compra</button>
          <button (click)="activeTemplate = 'recovery'" [class.border-pink-500]="activeTemplate === 'recovery'" [class.text-pink-600]="activeTemplate === 'recovery'" class="px-4 py-2 font-medium border-b-2 border-transparent transition-colors hover:text-gray-700">Recuperación de Contraseña</button>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        
        <!-- Language Switcher for Current Template -->
        <div class="bg-gray-50 p-4 border-b border-gray-100 flex justify-end items-center gap-2">
           <span class="text-sm font-bold text-gray-500 mr-2">Idioma a editar:</span>
           <button (click)="activeLang = 'es'" [class.bg-pink-600]="activeLang === 'es'" [class.text-white]="activeLang === 'es'" [class.bg-white]="activeLang !== 'es'" [class.text-gray-600]="activeLang !== 'es'" class="px-3 py-1 text-sm font-bold rounded-l border border-gray-200 shadow-sm transition">ES Español</button>
           <button (click)="activeLang = 'en'" [class.bg-pink-600]="activeLang === 'en'" [class.text-white]="activeLang === 'en'" [class.bg-white]="activeLang !== 'en'" [class.text-gray-600]="activeLang !== 'en'" class="px-3 py-1 text-sm font-bold rounded-r border border-gray-200 border-l-0 shadow-sm transition">EN English</button>
        </div>

        <div class="p-6 space-y-4">
            <!-- Form Block -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Asunto del Correo ({{ activeLang.toUpperCase() }})</label>
                <input type="text" [(ngModel)]="templates[activeTemplate][activeLang].subject" placeholder="Asunto..." class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 font-medium">
            </div>

            <div class="mt-4">
                <div class="flex justify-between items-center mb-1">
                    <label class="block text-sm font-medium text-gray-700">Cuerpo del Mensaje ({{ activeLang.toUpperCase() }})</label>
                    
                    <div class="flex flex-wrap gap-2">
                        <span class="text-xs text-gray-500 mr-1 self-center">Variables:</span>
                        <button *ngIf="activeTemplate !== 'recovery'" type="button" (click)="insertVariable('{{name}}')" class="text-xs bg-indigo-50 text-pink-700 px-2 py-1 rounded border border-pink-200 hover:bg-pink-100">{{ '{name}' }}</button>
                        <button *ngIf="activeTemplate === 'welcome'" type="button" (click)="insertVariable('{{email}}')" class="text-xs bg-indigo-50 text-pink-700 px-2 py-1 rounded border border-pink-200 hover:bg-pink-100">{{ '{email}' }}</button>
                        <button *ngIf="activeTemplate === 'order'" type="button" (click)="insertVariable('{{orderId}}')" class="text-xs bg-indigo-50 text-pink-700 px-2 py-1 rounded border border-pink-200 hover:bg-pink-100">{{ '{orderId}' }}</button>
                        <button *ngIf="activeTemplate === 'order'" type="button" (click)="insertVariable('{{total}}')" class="text-xs bg-indigo-50 text-pink-700 px-2 py-1 rounded border border-pink-200 hover:bg-pink-100">{{ '{total}' }}</button>
                        <button *ngIf="activeTemplate === 'recovery'" type="button" (click)="insertVariable('{{link}}')" class="text-xs bg-indigo-50 text-pink-700 px-2 py-1 rounded border border-pink-200 hover:bg-pink-100">{{ '{link}' }}</button>
                    </div>
                </div>
                <!-- Support HTML format and use textarea -->
                <textarea #bodyInput [(ngModel)]="templates[activeTemplate][activeLang].body" rows="12" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 font-mono text-sm leading-relaxed" placeholder="<h1>Hola...</h1>"></textarea>
                <p class="text-xs text-gray-400 mt-2"><i class="fas fa-info-circle mr-1"></i> Puedes usar código HTML estructural para darle formato al correo. Las variables del sistema se reemplazarán antes de enviarse.</p>
            </div>

            <!-- Alerts -->
            @if(alertMessage) {
                <div [class]="'mt-4 p-4 rounded-lg flex items-start ' + (alertType === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800')">
                    <i [class]="'fas mt-1 mr-3 ' + (alertType === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle')"></i>
                    <div>
                        <h4 class="font-bold">{{ alertType === 'success' ? 'Guardado' : 'Error' }}</h4>
                        <p class="text-sm opacity-90">{{ alertMessage }}</p>
                    </div>
                </div>
            }

            <div class="flex justify-end pt-4 mt-6 border-t border-gray-100">
                <button (click)="saveTemplates()" [disabled]="isSaving" class="px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition disabled:opacity-50 shadow-md shadow-pink-500/20">
                    @if(isSaving) {
                        <i class="fas fa-spinner fa-spin mr-2"></i> Guardando...
                    } @else {
                        <i class="fas fa-save mr-2"></i> Guardar Plantillas
                    }
                </button>
            </div>
        </div>
      </div>
    </div>
  `
})
export class EmailTemplatesComponent implements OnInit {
    @ViewChild('bodyInput') bodyInput!: ElementRef<HTMLTextAreaElement>;

    activeTemplate: 'welcome' | 'order' | 'recovery' = 'welcome';
    activeLang: 'es' | 'en' = 'es';

    isSaving = false;
    alertMessage = '';
    alertType: 'success' | 'error' = 'success';

    templates = {
        welcome: {
            es: { subject: '', body: '' },
            en: { subject: '', body: '' }
        },
        order: {
            es: { subject: '', body: '' },
            en: { subject: '', body: '' }
        },
        recovery: {
            es: { subject: '', body: '' },
            en: { subject: '', body: '' }
        }
    };

    constructor(private settingService: SettingService) { }

    ngOnInit() {
        this.loadTemplates();
    }

    loadTemplates() {
        this.settingService.getSettings().subscribe({
            next: (settings) => {
                // Welcome
                this.templates.welcome.es.subject = settings['welcome_email_subject_es'] || settings['welcome_email_subject'] || '';
                this.templates.welcome.es.body = settings['welcome_email_body_es'] || settings['welcome_email_body'] || '';
                this.templates.welcome.en.subject = settings['welcome_email_subject_en'] || '';
                this.templates.welcome.en.body = settings['welcome_email_body_en'] || '';

                // Order
                this.templates.order.es.subject = settings['order_email_subject_es'] || 'Confirmación de Compra';
                this.templates.order.es.body = settings['order_email_body_es'] || '';
                this.templates.order.en.subject = settings['order_email_subject_en'] || 'Order Confirmation';
                this.templates.order.en.body = settings['order_email_body_en'] || '';

                // Recovery
                this.templates.recovery.es.subject = settings['recovery_email_subject_es'] || 'Recuperación de Contraseña';
                this.templates.recovery.es.body = settings['recovery_email_body_es'] || '';
                this.templates.recovery.en.subject = settings['recovery_email_subject_en'] || 'Password Recovery';
                this.templates.recovery.en.body = settings['recovery_email_body_en'] || '';
            },
            error: (err) => console.error(err)
        });
    }

    insertVariable(variable: string) {
        const el = this.bodyInput?.nativeElement;
        const bodyText = this.templates[this.activeTemplate][this.activeLang].body || '';

        if (el) {
            const start = el.selectionStart;
            const end = el.selectionEnd;
            const before = bodyText.substring(0, start);
            const after = bodyText.substring(end, bodyText.length);
            this.templates[this.activeTemplate][this.activeLang].body = before + variable + after;

            // Auto focus and set cursor position
            setTimeout(() => {
                el.focus();
                el.setSelectionRange(start + variable.length, start + variable.length);
            }, 0);
        } else {
            this.templates[this.activeTemplate][this.activeLang].body = bodyText + variable;
        }
    }

    saveTemplates() {
        this.isSaving = true;
        this.alertMessage = '';

        const payload: Record<string, string> = {
            'welcome_email_subject_es': this.templates.welcome.es.subject,
            'welcome_email_body_es': this.templates.welcome.es.body,
            'welcome_email_subject_en': this.templates.welcome.en.subject,
            'welcome_email_body_en': this.templates.welcome.en.body,

            'order_email_subject_es': this.templates.order.es.subject,
            'order_email_body_es': this.templates.order.es.body,
            'order_email_subject_en': this.templates.order.en.subject,
            'order_email_body_en': this.templates.order.en.body,

            'recovery_email_subject_es': this.templates.recovery.es.subject,
            'recovery_email_body_es': this.templates.recovery.es.body,
            'recovery_email_subject_en': this.templates.recovery.en.subject,
            'recovery_email_body_en': this.templates.recovery.en.body,
        };

        const updates = Object.entries(payload).map(([key, value]) =>
            this.settingService.updateSetting(key, String(value || '')).toPromise()
        );

        Promise.all(updates).then(() => {
            this.isSaving = false;
            this.showAlert('success', 'Plantillas guardadas correctamente.');
        }).catch(err => {
            console.error(err);
            this.isSaving = false;
            this.showAlert('error', 'Ocurrió un error al guardar o hubo límite de conexión. Por favor reintenta.');
        });
    }

    showAlert(type: 'success' | 'error', message: string) {
        this.alertType = type;
        this.alertMessage = message;
        setTimeout(() => this.alertMessage = '', 8000);
    }
}
