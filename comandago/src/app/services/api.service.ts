import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, of, switchMap, throwError, timeout } from 'rxjs';
import { User } from '../user/user.page';
import { Product } from '../product/product.page'

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  //private apiUrl = 'http://localhost:3000';
  //private apiUrl = 'http://192.168.1.93:3000';
  private apiUrl = 'http://192.168.84.40:3000';
  //private apiUrl = 'http://192.168.100.74:3000';

  private apiConnectionStatus = new BehaviorSubject<boolean>(false);
  connectionStatus$ = this.apiConnectionStatus.asObservable();

  constructor(private http: HttpClient) {}
  
  checkApiConnection(): Observable<boolean> {
    return this.http.get(`${this.apiUrl}/users`).pipe(
      timeout(2500),
      map(() => true),
      catchError(() => of(false))
    );
  }

  getConnectionStatus(): boolean {
    return this.apiConnectionStatus.getValue();
  }

  // Método para realizar una petición GET a la API
  getData(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin':'*'
    });

    return this.http.get(this.apiUrl, { headers });
  }

  //Sercicios Usuarios
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  getUserById(id: string) {
    return this.http.get(`${this.apiUrl}/users/${id}`);
  }

  getUserByUserName(userName: string) {
    return this.http.get(`${this.apiUrl}/users/?userName=${userName}`);
  }

  getUserByFullName(fullName: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/?fullName_like=${fullName}`);
  }

  addUser(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/`, user);
  }

  editUser(user: User): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${user.id}`, user);
  }

  editUserByUsername(updatedUserData: User): Observable<any> {
    const userName = updatedUserData.userName;
    return this.getUserByUserName(userName).pipe(
      switchMap((user: any) => {
        if (user != null) {
          const updatedUser = { ...user, ...updatedUserData };
          return this.editUser(updatedUser);
        } else {
          throw new Error('Usuario no encontrado');
        }
      })
    );
  }

  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${userId}`);
  }

  // Método para hacer una petición POST
  postData(data: any): Observable<any> {
    const headers = new HttpHeaders({ 
      'Content-Type': 'application/json',
    });

    return this.http.post(this.apiUrl, data, { headers });
  }

  //Servicios Productos

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products`);
  }

  getProductById(id: string) {
    return this.http.get(`${this.apiUrl}/products/${id}`);
  }

  getProductByproductName(productName: string) {
    return this.http.get(`${this.apiUrl}/products/?productName=${productName}`);
  }

  addProduct(product: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/products/`, product);
  }

  deleteProduct(productId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${productId}`);
  }

  editProduct(product: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/products/${product.id}`, product);
  }
}
