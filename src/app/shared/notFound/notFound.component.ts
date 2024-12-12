import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-not-found',
    standalone: true,
    imports: [CommonModule, RouterLink, ButtonModule, RippleModule],
    styles: [`
    :host {
      display: block;
      min-height: 100vh;
      width: 100vw;
      margin: 0;
      padding: 0;
      background: linear-gradient(135deg, #1a237e 0%, #0288d1 100%);
      color: white;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      overflow: hidden;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }

    :host ::ng-deep * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .not-found-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      width: 100vw;
      padding: 1rem;
      text-align: center;
      position: relative;
      z-index: 1;
    }

    .error-code {
      font-size: clamp(6rem, 15vw, 8rem);
      font-weight: bold;
      margin: 0;
      line-height: 1;
      background: linear-gradient(to right, #e3f2fd 0%, #bbdefb 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: pulse 2s infinite;
    }

    .error-message {
      font-size: clamp(1.2rem, 4vw, 1.5rem);
      margin: 1rem 0 1.5rem;
      opacity: 0.9;
      text-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .home-button {
      margin-top: 1.5rem;
    }

    

    .astronaut {
      position: relative;
      animation: float 6s ease-in-out infinite;
    }

    .astronaut svg {
      width: clamp(60px, 15vw, 80px);
      height: clamp(60px, 15vw, 80px);
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }

    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
      100% { transform: translateY(0px); }
    }

    .stars {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      background: 
        radial-gradient(2px 2px at 20px 30px, #e3f2fd, rgba(0,0,0,0)),
        radial-gradient(2px 2px at 40px 70px, #e3f2fd, rgba(0,0,0,0)),
        radial-gradient(2px 2px at 50px 160px, #e3f2fd, rgba(0,0,0,0)),
        radial-gradient(2px 2px at 90px 40px, #e3f2fd, rgba(0,0,0,0)),
        radial-gradient(2px 2px at 130px 80px, #e3f2fd, rgba(0,0,0,0)),
        radial-gradient(2px 2px at 160px 120px, #e3f2fd, rgba(0,0,0,0));
      background-repeat: repeat;
      animation: twinkle 4s linear infinite;
      z-index: 0;
    }

    @keyframes twinkle {
      from { transform: translateY(0); }
      to { transform: translateY(-100px); }
    }

    /* Ajustes específicos para pantallas muy pequeñas */
    @media (max-height: 500px) {
      .astronaut svg {
        width: 50px;
        height: 50px;
      }

      .error-message {
        margin: 0.5rem 0 1rem;
      }

      .home-button {
        margin-top: 1rem;
      }
    }
  `],
    template: `
    <div class="not-found-container">
      <div class="stars"></div>
      
      <div class="astronaut">
        <svg viewBox="0 0 24 24" fill="white">
          <path d="M21.97 13.52a2 2 0 0 0-.15-.47l-2-3.46a2 2 0 0 0-1.73-1h-2.89A8.93 8.93 0 0 0 13 2.05V1a1 1 0 0 0-2 0v1.05A8.93 8.93 0 0 0 8.8 8.59H5.91a2 2 0 0 0-1.73 1l-2 3.46a2 2 0 0 0 0 2l2 3.46a2 2 0 0 0 1.73 1h2.89a8.93 8.93 0 0 0 2.2 5.54V22a1 1 0 0 0 2 0v-1.05A8.93 8.93 0 0 0 15.2 15.41h2.89a2 2 0 0 0 1.73-1l2-3.46a2 2 0 0 0 .15-.43zM12 19a7 7 0 1 1 7-7 7 7 0 0 1-7 7z"/>
          <circle cx="12" cy="12" r="4"/>
        </svg>
      </div>

      <h1 class="error-code">404</h1>
      <p class="error-message">¡Ups! Parece que te has perdido en el espacio</p>
      
      

    </div>
  `
})
export class NotFoundComponent { }