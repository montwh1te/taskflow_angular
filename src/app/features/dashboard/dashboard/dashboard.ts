import { Component, OnInit } from '@angular/core';
// Importe os serviços e modelos necessários

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  totalProjects = 0;
  taskStatusData: any[] = []; // Para o gráfico
  upcomingTasks: any[] = [];

  constructor(/* Injetar serviços */) {}

  ngOnInit(): void {
    // 1. Buscar todos os projetos e tarefas
    // 2. Calcular o total de projetos
    // 3. Agrupar tarefas por status para o gráfico
    //    ex: this.taskStatusData = [{ name: 'A Fazer', value: 10 }, ...];
    // 4. Filtrar tarefas com vencimento próximo
  }
}