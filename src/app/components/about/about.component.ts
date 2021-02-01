import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {
  ngOnInit(): void { }

  downloadWork(work: number): void {
    const link = document.createElement('a');
    link.setAttribute('target', '_blank');
    link.setAttribute('href', `../../../reports/work${work}.pdf`);
    link.setAttribute('download', `work${work}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}
