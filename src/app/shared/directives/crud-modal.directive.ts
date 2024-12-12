import { Directive, Input, Output, EventEmitter, HostListener } from '@angular/core';

@Directive({
  selector: '[appCrudModal]',
  standalone: true
})
export class CrudModalDirective {
  @Input() visible: boolean = false;
  @Input() modalTitle: string = '';
  @Input() isEditing: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  @HostListener('click', ['$event'])
  onClick(event: Event) {
    event.stopPropagation();
  }

  onHide() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }

  onSave() {
    this.save.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}