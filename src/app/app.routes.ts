import { Routes } from '@angular/router';
import { UsersComponent } from './modules/users/users.component';
import { ProvidersComponent } from './modules/providers/providers.component';
import { LayoutComponent } from './layout/main-layout/layout.component';
import { ClientsComponent } from './modules/clients/clients.component';
import { LossComponent } from './modules/loss/loss.component';
import { CategoriesComponent } from './modules/categories/categories.component';
import { ProductsComponent } from './modules/products/products.component';
import { RolesComponent } from './modules/roles/roles.component';
import { SalesComponent} from './modules/sales/sales.component';
import { ReturnProviderComponent} from './modules/return-provider/return-provider.component';
import { ReturnSaleComponent } from './modules/return-sale/return-sale.component';
import { CreditsComponent } from './modules/credits/credits.component';
import { ShoppingsComponent } from './modules/shoppingdetails/shoppingsDetails.component';
import { LoginComponent } from './Auth/login/login.component';
import { ShoppinviewComponent } from './modules/shoppings/shopping.component';
import { RecoverComponent } from './Auth/recover/recover.component';
import { RestoreComponent } from './Auth/restore/restore.component';
import { DetailSaleComponent } from './modules/detailSale/detail-sale.component';
import { AuthGuard } from './Auth/auth.guard';
import { LoadingComponent } from './shared/loading/loading.component';
import { IndexComponent } from './modules/index/index.component';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { ScannerComponent } from './modules/scanner/scanner.component';
import { RoleGuard } from './Auth/role.guard';
import { NotFoundComponent } from './shared/notFound/notFound.component';
import { LoginLoadingComponent } from './shared/loading/loginLoading.component';
import { InfoComponent } from './modules/info/info.component';

export const routes: Routes = [
  { path: 'index', component: IndexComponent},
  { path: 'loading', component: LoadingComponent },
  { path: 'LoginLoading', component: LoginLoadingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'recover', component: RecoverComponent },
  { path: 'restore', component: RestoreComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent, canActivate: [RoleGuard], data: { roles: ['Administrador']}},
      { path: 'users', component: UsersComponent, canActivate: [RoleGuard], data: { roles: ['Administrador']} },
      { path: 'roles', component: RolesComponent, canActivate: [RoleGuard], data: { roles: ['Administrador']} },

      { path: 'providers', component: ProvidersComponent },
      { path: 'categories', component: CategoriesComponent },
      { path: 'products', component: ProductsComponent },
      { path: 'shoppings', component: ShoppingsComponent },
      { path: 'shoppingview', component: ShoppinviewComponent },

      { path: 'sales', component: SalesComponent },
      { path: 'detailSales', component: DetailSaleComponent },
      { path: 'clients', component: ClientsComponent },
      { path: 'credits', component: CreditsComponent },

      { path: 'loss', component: LossComponent },
      { path: 'returnProvider', component: ReturnProviderComponent },
      { path: 'returnSale', component: ReturnSaleComponent },

      { path: 'scanner', component: ScannerComponent},
      { path: 'info', component: InfoComponent}

      
      // { path: '', redirectTo: 'index', pathMatch: 'full' },
    ]
  },
  { path: '**', component: NotFoundComponent }
];
