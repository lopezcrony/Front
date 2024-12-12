import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { SHARED_IMPORTS } from '../../shared/shared-imports'; // Archivo para las importaciones generales
import { CRUDComponent } from '../../shared/crud/crud.component';
import { CrudModalDirective } from '../../shared/directives/crud-modal.directive';
import { AlertsService } from '../../shared/alerts/alerts.service';

import { Categorie } from './categories.model';
import { CategoriesService } from './categories.service';
import { ValidationService } from '../../shared/validators/validations.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    ...SHARED_IMPORTS,
    CRUDComponent,
    CrudModalDirective,
  ],
  templateUrl: './categories.component.html',
  styleUrls:['./categories.component.css']
})

//el implement oninit es el ejecutador de todos los metodos cuando se inicia en esa pagina(modulo)
export class CategoriesComponent implements OnInit {

  //guarda la informacion del modelo en esa variable
  categories: Categorie[] = [];
  //busca relaciones de los registros
  filteredCategories: Categorie[] = [];

  //esta es la info que se muestra en el crud, y los campos (field donde se muestran(llamalos como en el modelo) ) y el (header el nombre del campo)
  columns: { field: string, header: string, type: string }[] = [
    { field: 'nombreCategoria', header: 'Nombre', type: 'text' },
    { field: 'descripcionCategoria', header: 'Descripción', type: 'text' }  
  ];

  //aqui se define la variable del formulario
  categorieForm: FormGroup;

  showModal = false;
  isEditing = false;

  //constructor para importar el service y validar campos de formulario
  constructor(
    //aqui se llama el categoria service y se le asigna a categorieService
    private categorieService: CategoriesService,
    private fb: FormBuilder,
    private alertsService: AlertsService,
    private toastr: ToastrService,
    private validationService: ValidationService,
  ) {
    //aqui se llama la variable del form :) el el categorieForm
    this.categorieForm = this.fb.group({
      //estos son los campos que van a ser validados en formulario
      idCategoria: [null],
      nombreCategoria: ['', this.validationService.getValidatorsForField('categories', 'nombreCategoria')],
      descripcionCategoria: ['', this.validationService.getValidatorsForField('categories', 'descripcionCategoria')],
      estadoCategoria: [true]
    });
  }

  loadCategories() {
    this.categorieService.getAllCategories().subscribe(data => {
      this.categories = data;
      this.filteredCategories = data;
    });
  }

  //funcion inicializadora(todo lo de aqui se inicia de una)
  ngOnInit() {
    this.loadCategories();
  }

  //esta abre la modal de crear  y diferencia si se esta creando o editando
  openCreateModal() {
    this.isEditing = false;
    this.categorieForm.reset({ estadoCategoria: true });
    this.showModal = true;
  }

  //abre la monda de editar y ya
  openEditModal(categorie: Categorie) {
    this.isEditing = true;
    this.categorieForm.patchValue(categorie);
    this.showModal = true;
  }

  //cierra la modal y ya sapo
  closeModal() {
    this.showModal = false;
    this.categorieForm.reset();
  }

  cancelModalMessage(){
    this.alertsService.menssageCancel()
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.categorieForm.get(fieldName);
    return !!(field?.invalid && (field.touched || field.dirty));
  }

  isFieldEmpty(fieldName: string): boolean {
    const field = this.categorieForm.get(fieldName);
    return !field?.value; // Retorna true si el valor es null, undefined o una cadena vacía
  }
  

  getErrorMessage(fieldName: string): string {
    const control = this.categorieForm.get(fieldName);
    if (control?.errors) {
      const errorKey = Object.keys(control.errors)[0];
      return this.validationService.getErrorMessage('categories', fieldName, errorKey);
    }
    return '';
  }

  private markFormFieldsAsTouched() {
    Object.values(this.categorieForm.controls).forEach(control => control.markAsTouched());
  }

  //funcion para guardar o actualizar una categoria
  saveCategorie() {

    // Válida el formulario antes de enviarlo
    if (this.categorieForm.invalid) {
      this.markFormFieldsAsTouched();
      return;
    }
    //categorieData guarda la información del formulario
    const categorieData = this.categorieForm.value;
    //si es editing edita y se llama esa funcion si no entonces es crear y llama crear :)
    const request = this.isEditing ?
      this.categorieService.updateCategorie(categorieData) :
      this.categorieService.createCategorie(categorieData);

    request.subscribe({
      next: () => {
        this.loadCategories();
        this.isEditing ? this.toastr.success('Categoria actualizada exitosamente.', 'Éxito') : this.toastr.success('Categoria creada exitosamente.', 'Éxito');
        this.closeModal();
      },
      error: (error) => {
        this.toastr.error(error,'Error')
      }
    });
  }

  deleteCategorie(id: number) {
    //el suscribe es un tipo de try catch
    this.categorieService.deleteCategorie(id).subscribe({
      next: () => {
        //si es exito carga las categorias 
        this.loadCategories();
        //toastr para que muestre el tipo de alertica que sale en la pantalla
        this.toastr.success('Categoria eliminada exitosamente.', 'Éxito');
      },
      //si es error muestra el error
      error: (error) => {
        this.toastr.error(error, 'Error');
      }
    });
  }

  confirmDelete(categorie: Categorie) {
    this.alertsService.confirm(
      `¿Quieres eliminar la categoria: ${categorie.nombreCategoria}?`,
      () => this.deleteCategorie(categorie.idCategoria)
    );
  }

  searchCategorie(query: string) {
    const normalizedQuery = query.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const isSearchingForTrue = normalizedQuery === 'true';
    this.filteredCategories = this.categories.filter(categorie =>
      categorie.nombreCategoria?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(normalizedQuery) ||
      categorie.descripcionCategoria?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(normalizedQuery) ||
      categorie.estadoCategoria === isSearchingForTrue
    );
  }
  

  exportCategorie() { }

  changeCategorieStatus(updatedCategorie: Categorie) {
    const estadoCategoria = updatedCategorie.estadoCategoria ?? false;
  
    this.categorieService.updateStatusCategorie(updatedCategorie.idCategoria, estadoCategoria).subscribe({
      next: () => {
        [this.categories, this.filteredCategories].forEach(list => {
          const index = list.findIndex(c => c.idCategoria === updatedCategorie.idCategoria);
          if (index !== -1) {
            list[index] = { ...list[index], ...updatedCategorie };
          }
        });
        this.toastr.success('Estado actualizado con éxito', 'Éxito');
      },
      error: () => {
        this.toastr.error('Error al go actualizar el estado', 'Error');
      }
    });
  } 

}
